import type { CapitalPathway, CapitalResearch } from './capital-research-model'
import { createExplorationIndex } from './exploration'
import type { ExplorationEdge, ExplorationNode } from './exploration'
import { institutionTypeGroup } from './entity-taxonomy'
import { resolvePathwayAmount } from './capital-research'
import { relationshipFamily, relationshipFamilies } from './relationship-taxonomy'
import type { RelationshipFamily } from './relationship-taxonomy'
import { displayName, normalize } from './selectors'
import type { AtlasIndex } from './selectors'
import { themes } from './model'

export const primaryFamilies = Object.entries(relationshipFamilies).filter(([id]) => id !== 'review') as [RelationshipFamily, string][]
export const focusedEmptyFilters = { family: '', geography: '', theme: '', institutionType: '', ownership: '', instrument: '' }
export type FocusedFilters = typeof focusedEmptyFilters
const poolTypes = new Set(['Multilateral climate fund', 'Multilateral environment facility', 'Concessional climate fund', 'Multilateral adaptation fund', 'Regional development fund'])
const genericTypes = new Set(['OWNS', 'SUBSIDIARY_OF', 'ESTABLISHED_BY', 'ACCREDITED_BY', 'SUB_FUND_OF', 'STRATEGIC_PARTNER', 'TARGETS'])
const regionIds = new Set(['caribbean', 'eastern-caribbean', 'lac'])
const nonCountryIds = new Set([...regionIds, 'global', 'central-america', 'north-america'])
const supportedThemes = new Set<string>(Object.keys(themes))
export const oneSentence = (text: string) => text.split(/(?<=[.!?])\s+/)[0]
export function nodeFunction(node: ExplorationNode) {
  return node.entity ? oneSentence(node.entity.plainLanguage) : 'Documented participant in the cited financing arrangement; a full institutional profile is not yet available.'
}
export function isInstitutionNode(node: ExplorationNode, research: CapitalResearch): boolean {
  if (node.entity) return node.entity.kind === 'institution' || poolTypes.has(node.entity.type)
  return research.actors.find(actor => actor.id === node.id)?.kind === 'institution'
}
export function edgePathIds(edge: ExplorationEdge): string[] { return [...new Set(edge.claims.map(claim => claim.path.id))] }
export function edgeEvidence(edge: ExplorationEdge): string[] {
  return [...new Set([...(edge.atlas?.evidenceIds ?? []), ...(edge.atlas?.scopeEvidenceIds ?? []), ...edge.claims.flatMap(claim => claim.link.evidenceIds)])]
}
export interface Connection {
  id: string; source: string; target: string; direction: 'directed' | 'mutual'; family: RelationshipFamily
  members: ExplorationEdge[]; types: string[]; pathwayIds: string[]; arrangementCount: number; evidenceIds: string[]
}
export function groupConnections(edges: ExplorationEdge[]): Connection[] {
  const groups = new Map<string, Connection>()
  for (const edge of [...edges].sort((a,b) => a.id.localeCompare(b.id))) {
    const family = relationshipFamily(edge.type)
    const endpoints = edge.direction === 'mutual' ? [edge.source, edge.target].sort() : [edge.source, edge.target]
    const id = 'connection:' + [endpoints[0], endpoints[1], edge.direction, family].map(encodeURIComponent).join('|')
    const group = groups.get(id) ?? { id, source: endpoints[0], target: endpoints[1], direction: edge.direction, family, members: [], types: [], pathwayIds: [], arrangementCount: 0, evidenceIds: [] }
    group.members.push(edge)
    groups.set(id, group)
  }
  for (const group of groups.values()) {
    group.types = [...new Set(group.members.flatMap(edge => [edge.type,...edge.claims.map(claim=>claim.link.type)]))].sort()
    group.pathwayIds = [...new Set(group.members.flatMap(edgePathIds))].sort()
    // A registry relationship with no case mapping is its own documented arrangement.
    group.arrangementCount = group.pathwayIds.length + group.members.filter(edge => !edgePathIds(edge).length).length
    group.evidenceIds = [...new Set(group.members.flatMap(edgeEvidence))]
  }
  return [...groups.values()].sort((a,b) => a.id.localeCompare(b.id))
}
export function createFocusedIndex(atlas: AtlasIndex, research: CapitalResearch) {
  const base = createExplorationIndex(atlas, research)
  const relevant = base.edges.filter(edge => !genericTypes.has(edge.type) && relationshipFamily(edge.type) !== 'review' &&
    [...(edge.atlas?.themes ?? []), ...edge.claims.flatMap(claim => claim.path.themes)].some(theme => supportedThemes.has(theme)))
  const institutional = relevant.filter(edge => isInstitutionNode(base.nodes.get(edge.source)!, research) && isInstitutionNode(base.nodes.get(edge.target)!, research))
  const connections = groupConnections(institutional)
  const pathById = new Map(research.pathways.map(path => [path.id, path]))
  const rank = atlas.entities.filter(entity => isInstitutionNode(base.nodes.get(entity.id)!, research)).map(entity => {
    const incident = relevant.filter(edge => edge.source === entity.id || edge.target === entity.id)
    const paths = new Set(incident.flatMap(edgePathIds))
    const capital = incident.filter(edge => edge.source === entity.id && relationshipFamily(edge.type) === 'capital').length
    const intermediary = incident.filter(edge => relationshipFamily(edge.type) === 'management').length
    const evidence = new Set(incident.flatMap(edgeEvidence).filter(id => atlas.evidence.get(id)?.status === 'verified' || research.sources.some(source => source.id === id && source.status === 'verified')))
    const completeness = [entity.plainLanguage, entity.website, entity.verifiedOn].filter(Boolean).length
    return { id: entity.id, score: 4 * incident.length + 6 * paths.size + 5 * capital + 3 * intermediary + Math.min(5, evidence.size) + completeness,
      relevantLinks: incident.length, pathways: paths.size, capitalLinks: capital, managementLinks: intermediary, evidence: Math.min(5, evidence.size), completeness }
  }).filter(row => connections.some(edge => edge.source === row.id || edge.target === row.id))
    .sort((a,b) => b.score - a.score || a.id.localeCompare(b.id))
  // Include every documented institutional endpoint, without a rank cutoff.
  // Mechanism-only participants and profile-only institutions stay in search.
  const defaultIds = [...new Set(connections.flatMap(edge => [edge.source, edge.target]))].sort()
  const countries = [...atlas.geography].filter(([id]) => !nonCountryIds.has(id)).sort((a,b) => a[1].localeCompare(b[1]))
  return { ...base, relevant, connections, pathById, rank, defaultIds, countries }
}
export type FocusedIndex = ReturnType<typeof createFocusedIndex>
export function hasFinancingParticipation(index: FocusedIndex, id: string): boolean {
  return index.relevant.some(edge => edge.source === id || edge.target === id)
}
export function pathPurpose(index: FocusedIndex, path: CapitalPathway) {
  const entity = index.atlas.entityById.get(path.mechanismId)
  return entity ? oneSentence(entity.plainLanguage) : 'A documented financing arrangement covering ' + path.geographies.map(id => index.atlas.geography.get(id) ?? id).join(', ') + '.'
}
export function pathwayManagers(path: CapitalPathway): string[] {
  return [...new Set(path.links.filter(link => link.status === 'verified' && link.target === path.mechanismId && ['MANAGES','ADMINISTERS'].includes(link.type)).map(link => link.source))]
}
export function associatedPaths(index: FocusedIndex, actorId: string): CapitalPathway[] {
  return index.research.pathways.filter(path => path.mechanismId === actorId || path.links.some(link => link.source === actorId || link.target === actorId || link.beneficiaryIds?.includes(actorId)))
}
export function connectionCoverage(index: FocusedIndex, edge: ExplorationEdge): string[] {
  if (edge.claims.length) return [...new Set(edge.claims.flatMap(claim => claim.path.geographies))]
  const source = index.nodes.get(edge.source)?.entity?.geographies ?? []
  const target = index.nodes.get(edge.target)?.entity?.geographies ?? []
  return source.filter(id => target.includes(id))
}
export function memberInstruments(edge: ExplorationEdge): string[] {
  const instruments = edge.claims.flatMap(claim => claim.link.instrument ?? []) as string[]
  const raw = edge.atlas?.amount?.instrument?.toLowerCase()
  if (raw) {
    const canonical = /\bguarantee\b/.test(raw) ? 'guarantee' : /\bloan\b/.test(raw) ? 'loan' : /\bgrant\b/.test(raw) ? 'grant' : edge.type === 'INSURES' ? 'insurance' : raw.replaceAll(/\W+/g,'_')
    instruments.push(canonical)
  }
  return [...new Set(instruments)]
}
export function memberMatches(index: FocusedIndex, edge: ExplorationEdge, filters: FocusedFilters) {
  const nodes = [index.nodes.get(edge.source)!, index.nodes.get(edge.target)!]
  const geographies = connectionCoverage(index, edge)
  const regional = geographies.some(id => regionIds.has(id)) || geographies.filter(id => index.countries.some(([country]) => country === id)).length > 1
  const themes = [...(edge.atlas?.themes ?? []), ...edge.claims.flatMap(claim => claim.path.themes)]
  const instruments = memberInstruments(edge)
  return (!filters.family || relationshipFamily(edge.type) === filters.family) &&
    (!filters.geography || (filters.geography === 'regional' ? regional : geographies.includes(filters.geography))) &&
    (!filters.theme || themes.includes(filters.theme as never)) &&
    (!filters.institutionType || nodes.some(node => node.entity && institutionTypeGroup(node.entity.type) === filters.institutionType)) &&
    (!filters.ownership || nodes.some(node => node.entity?.ownership === filters.ownership)) &&
    (!filters.instrument || instruments.includes(filters.instrument as never))
}
export function selectFocusedNetwork(index: FocusedIndex, filters: FocusedFilters, roots: string[], twoHops: boolean, pathwayId = '') {
  const path = index.pathById.get(pathwayId)
  const pool = path ? index.edges.filter(edge => edge.claims.some(claim => claim.path.id === path.id) ||
    Boolean(edge.atlas && (edge.source === path.mechanismId || edge.target === path.mechanismId))) :
      roots.some(id => index.nodes.has(id) && !isInstitutionNode(index.nodes.get(id)!,index.research)) ? index.relevant : index.connections.flatMap(group => group.members)
  const eligible = pool.filter(edge => memberMatches(index, edge, filters))
  const hasFilters = Object.values(filters).some(Boolean)
  let edges: ExplorationEdge[]
  if (path) edges = eligible
  else if (roots.length) {
    const rootIds = new Set(roots)
    const direct = eligible.filter(edge => rootIds.has(edge.source) || rootIds.has(edge.target))
    const neighbors = new Set([...roots, ...direct.flatMap(edge => [edge.source, edge.target])])
    edges = twoHops ? eligible.filter(edge => neighbors.has(edge.source) || neighbors.has(edge.target)) : direct
  } else if (hasFilters) edges = index.connections.flatMap(group => group.members).filter(edge => memberMatches(index, edge, filters))
  else {
    const defaults = new Set(index.defaultIds)
    edges = index.connections.filter(edge => defaults.has(edge.source) && defaults.has(edge.target)).flatMap(group => group.members)
  }
  const groups = groupConnections(edges)
  const ids = new Set(groups.flatMap(edge => [edge.source, edge.target]))
  if (!hasFilters && !groups.length && roots.length === 1 && index.nodes.has(roots[0]) &&
    !isInstitutionNode(index.nodes.get(roots[0])!, index.research)) ids.add(roots[0])
  const nodes = [...ids].sort().map(id => index.nodes.get(id)!).filter(Boolean)
  return { nodes, connections: groups, path, totalConnections: groups.length, totalRecords: edges.length }
}
export interface SearchRecord { id: string; name: string; label: string; type: string; pathwayId?: string }
export function searchFocused(index: FocusedIndex, query: string): SearchRecord[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  const results = new Map<string, SearchRecord>()
  for (const node of index.nodes.values()) {
    const paths = index.research.pathways.filter(path => path.mechanismId === node.id)
    const text = normalize([node.name, node.shortName, ...(index.atlas.aliases.get(node.id) ?? []), ...paths.map(path => path.name)].join(' '))
    if (terms.every(term => text.includes(term))) results.set(node.id, { id: node.id, name: node.name, label: node.shortName,
      type: isInstitutionNode(node,index.research) ? (hasFinancingParticipation(index,node.id)?'Institution · ':'Institution profile only · ') + node.type : node.entity ? 'Financing mechanism · ' + node.type : paths.length ? 'Financing arrangement · ' + node.type : node.type, pathwayId: paths[0]?.id })
  }
  for (const path of index.research.pathways) if (terms.every(term => normalize(path.name).includes(term)) && !results.has(path.mechanismId)) {
    results.set(path.mechanismId, { id: path.mechanismId, name: path.name, label: path.name, type: 'Financing mechanism', pathwayId: path.id })
  }
  return [...results.values()].sort((a,b) => Number(normalize(b.label) === normalize(query)) - Number(normalize(a.label) === normalize(query)) || a.name.localeCompare(b.name))
}
export interface FinancialObservation {
  id: string; value: number; currency: string; measure: string; stage: string; scope: string; date?: string | null; evidenceIds: string[]; limitation?: string
}
export function observationsFor(index: FocusedIndex, edges: ExplorationEdge[], pathway?: CapitalPathway): FinancialObservation[] {
  const observations = new Map<string, FinancialObservation>()
  for (const edge of edges) if (edge.atlas?.amount) {
    const amount = edge.atlas.amount
    observations.set('atlas:' + edge.atlas.id, { id: 'atlas:' + edge.atlas.id, value: amount.value, currency: amount.currency,
      measure: displayName(amount.status), stage: amount.asOf ?? 'Date not recorded', date: amount.asOf,
      scope: edge.atlas.description, evidenceIds: edge.atlas.evidenceIds })
  }
  const paths = pathway ? [pathway] : [...new Map(edges.flatMap(edge => edge.claims.map(claim => [claim.path.id, claim.path] as const))).values()]
  for (const path of paths) for (const amount of path.amounts) {
    if (!pathway && !edges.some(edge => edge.claims.some(claim => claim.path.id === path.id && (claim.link.id === amount.linkId || Boolean(amount.atlasRelationshipId && claim.link.atlasRelationshipId === amount.atlasRelationshipId))))) continue
    const resolved = resolvePathwayAmount(amount, new Map(index.atlas.relationshipList.map(edge => [edge.id, edge])))
    if (!resolved) continue
    const id = amount.atlasRelationshipId ? 'atlas:' + amount.atlasRelationshipId : path.id + ':' + amount.id
    observations.set(id, { id, value: resolved.value, currency: resolved.currency, measure: displayName(amount.measure), stage: displayName(amount.stage),
      scope: amount.scope, date: amount.reportedOn, evidenceIds: amount.evidenceIds,
      limitation: [amount.fundingScope, amount.aggregationStatus, amount.partOfAmountId ? 'Included in another reported amount' : '', amount.alternativeToAmountId ? 'Alternative financial observation' : '', amount.doNotAggregateWith?.length ? 'Overlapping observations: do not aggregate' : ''].filter((value):value is string=>Boolean(value)).map(displayName).join(' · ') })
  }
  return [...observations.values()]
}
