import type { CapitalPathway, CapitalResearch, PathwayLink } from './capital-research-model'
import type { Category, Entity, Relationship } from './model'
import { relationshipFamily } from './relationship-taxonomy'
import type { RelationshipFamily } from './relationship-taxonomy'
import { matchesFilter, normalize, selectedValues } from './selectors'
import type { AtlasIndex, Filters } from './selectors'
import { entityCategory, institutionTypeValues } from './entity-taxonomy'

export type ExplorationMode = 'pathways' | 'institutions' | 'ecosystem'
export type RelationshipDepth = 'direct' | 'two' | 'full'
export interface ExplorationNode {
  id: string; name: string; shortName: string; type: string; category?: Category
  entity?: Entity
}
export interface ExplorationEdge {
  id: string; source: string; target: string; type: string; direction: Relationship['direction']
  amount?: Relationship['amount']; atlas?: Relationship
  claims: { path: CapitalPathway; link: PathwayLink }[]
}

export function createExplorationIndex(atlas: AtlasIndex, research: CapitalResearch) {
  const nodes = new Map<string, ExplorationNode>(atlas.entities.map(entity => [entity.id, { ...entity, entity }]))
  for (const actor of research.actors) nodes.set(actor.id, {
    id: actor.id, name: actor.name, shortName: actor.name, type: 'Research actor · ' + actor.kind.replaceAll('_', ' '),
  })
  const edges = new Map<string, ExplorationEdge>(atlas.relationshipList.map(edge => [edge.id, { ...edge, atlas: edge, claims: [] }]))
  for (const path of research.pathways) for (const link of path.links) {
    // Reported/conflicting records remain in the evidence inspector, never become verified graph links.
    if (link.status !== 'verified') continue
    const id = link.atlasRelationshipId ?? 'research:' + path.id + ':' + link.id
    const existing = edges.get(id)
    if (existing) existing.claims.push({ path, link })
    else edges.set(id, { id, source: link.source, target: link.target, type: link.type, direction: 'directed', claims: [{ path, link }] })
  }
  return { nodes, edges: [...edges.values()], research, atlas }
}
export type ExplorationIndex = ReturnType<typeof createExplorationIndex>

// Discovery follows either endpoint; the rendered arrows always retain the documented direction.
export function reachableIds(edges: ExplorationEdge[], root: string, depth: RelationshipDepth): Set<string> {
  const adjacency = new Map<string, Set<string>>()
  for (const edge of edges) for (const [from, to] of [[edge.source, edge.target], [edge.target, edge.source]]) {
    if (!adjacency.has(from)) adjacency.set(from, new Set())
    adjacency.get(from)!.add(to)
  }
  const seen = new Set(root ? [root] : [])
  let frontier = [...seen]
  const limit = depth === 'direct' ? 1 : depth === 'two' ? 2 : Infinity
  for (let hop = 0; hop < limit && frontier.length; hop++) {
    const next: string[] = []
    for (const id of frontier) for (const other of adjacency.get(id) ?? []) if (!seen.has(other)) {
      seen.add(other); next.push(other)
    }
    frontier = next
  }
  return seen
}

export interface ExplorationSettings {
  mode: ExplorationMode; root: string; pathwayId: string; depth: RelationshipDepth
  fullNetwork: boolean; showAllMatching: boolean; groups: RelationshipFamily[]
}

export function selectExploration(index: ExplorationIndex, filters: Filters, settings: ExplorationSettings) {
  const { atlas } = index
  const path = index.research.pathways.find(item => item.id === settings.pathwayId)
  let pool = index.edges.filter(edge => settings.mode === 'ecosystem' ? Boolean(edge.atlas) :
    settings.mode === 'pathways' ? edge.claims.some(claim => claim.path.id === path?.id) ||
      Boolean(edge.atlas && (edge.source === path?.mechanismId || edge.target === path?.mechanismId)) : true)
  if (settings.mode === 'ecosystem' && !settings.fullNetwork) {
    pool = pool.filter(edge => edge.atlas!.themes.length > 0)
  }
  const endpoints = new Set(pool.flatMap(edge => [edge.source, edge.target]))
  const reachable = settings.mode === 'ecosystem' || (settings.mode === 'pathways' && settings.depth === 'full') ? undefined :
    reachableIds(pool, settings.root, settings.depth)
  if (reachable) pool = pool.filter(edge => reachable.has(edge.source) && reachable.has(edge.target) &&
    (settings.depth !== 'direct' || edge.source === settings.root || edge.target === settings.root))
  const inScope = [...index.nodes.values()].filter(node => {
    if (settings.mode === 'ecosystem') return node.entity && (settings.fullNetwork || node.entity.scope.status === 'CORE' ||
      (node.entity.scope.status === 'SUPPORTING' && endpoints.has(node.id)))
    return reachable ? reachable.has(node.id) : endpoints.has(node.id) || node.id === settings.root
  })
  const query = normalize(filters.search).split(/\s+/).filter(Boolean)
  const matches = inScope.filter(node => {
    const entity = node.entity
    const relatedPaths = settings.mode === 'pathways' && path ? [path] : index.research.pathways.filter(item =>
      item.links.some(link => link.source === node.id || link.target === node.id) || item.mechanismId === node.id)
    const capitalTypes = relatedPaths.flatMap(item => item.origins.filter(origin => origin.providerId === node.id).map(origin => origin.capitalType))
    const geography = settings.mode === 'pathways' && path ? path.geographies : entity?.geographies ?? []
    const nodeThemes = settings.mode === 'pathways' && path ? path.themes : entity?.themes ?? []
    return query.every(term => normalize([node.name, node.shortName, ...(atlas.aliases.get(node.id) ?? [])].join(' ')).includes(term)) &&
      matchesFilter(filters.category, entity ? [entity.category, entityCategory(entity) ?? ''] : []) && matchesFilter(filters.type, entity ? institutionTypeValues(entity.type) : []) &&
      matchesFilter(filters.kind, entity ? [entity.kind] : []) && matchesFilter(filters.role, entity?.roles ?? []) &&
      matchesFilter(filters.ownership, entity ? [entity.ownership] : []) && matchesFilter(filters.origin, entity?.capitalOrigins ?? []) &&
      matchesFilter(filters.capitalType, capitalTypes) && matchesFilter(filters.geography, geography) &&
      matchesFilter(filters.sector, entity?.sectors ?? []) && matchesFilter(filters.instrument, entity?.instruments ?? []) &&
      (matchesFilter(filters.theme, nodeThemes) || pool.some(edge => (edge.source === node.id || edge.target === node.id) &&
        matchesFilter(filters.theme, [...(edge.atlas?.themes ?? []), ...edge.claims.flatMap(claim => claim.path.themes)])))
  })
  const matchingIds = new Set(matches.map(node => node.id))
  // In focused exploration, actor attributes identify anchors. Keep the documented
  // counterpart instead of erasing a financing link because the recipient is not
  // itself a bank, a donor, or another selected provider class.
  const keepCounterparties = settings.mode !== 'ecosystem' &&
    ['category', 'type', 'kind', 'role', 'ownership', 'origin', 'capitalType', 'sector', 'instrument'].some(key =>
      selectedValues(filters[key as keyof Omit<Filters, 'search'>]).length > 0)
  const edges = pool.filter(edge => (keepCounterparties ? matchingIds.has(edge.source) || matchingIds.has(edge.target) :
    matchingIds.has(edge.source) && matchingIds.has(edge.target)) &&
    settings.groups.includes(relationshipFamily(edge.type)) && matchesFilter(filters.family, [relationshipFamily(edge.type)]) &&
    matchesFilter(filters.relationship, [edge.type]) && matchesFilter(filters.theme,
      [...(edge.atlas?.themes ?? []), ...edge.claims.flatMap(claim => claim.path.themes)]))
  const connected = new Set(edges.flatMap(edge => [edge.source, edge.target]))
  const active = Object.values(filters).some(value => selectedValues(value).length > 0) || settings.groups.length < 6
  const nodes = inScope.filter(node => (matchingIds.has(node.id) && (settings.showAllMatching || !active)) || connected.has(node.id))
  return { nodes, edges, matches, hiddenCount: matches.filter(node => !nodes.some(visible => visible.id === node.id)).length, path }
}
