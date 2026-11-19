import { accessRoutes, categories, financialRoles, themes } from './model'
import type { AtlasData, Entity, Relationship } from './model'
import { financialTypes } from './validation'

export const filterFields = [
  ['category', 'Institution category'], ['type', 'Institution type'], ['ownership', 'Ownership'],
  ['origin', 'Capital origin'], ['geography', 'Country or mandate'], ['sector', 'Financing sector'],
  ['theme', 'Theme'], ['instrument', 'Financial instrument'], ['relationship', 'Relationship type'],
] as const
export type FilterField = typeof filterFields[number][0]
export type Filters = Record<FilterField | 'search', string>
export const emptyFilters: Filters = {
  search: '', category: '', type: '', ownership: '', origin: '', geography: '', sector: '', theme: '', instrument: '', relationship: '',
}

export const displayName = (value: string) =>
  value.toLowerCase().replaceAll('_', ' ').replace(/^./, letter => letter.toUpperCase())

export const comparisonRows = [
  'Mandate', 'Ownership', 'Capital sources', 'Geographic coverage', 'Sectors', 'Instruments', 'Themes', 'Financial roles', 'Access routes', 'Relationships',
] as const
export type ComparisonRow = typeof comparisonRows[number]

export function createIndex(data: AtlasData) {
  const entityById = new Map([...data.institutions, ...data.vehicles].map(entity => [entity.id, entity]))
  const entities = [...entityById.values()].filter(entity => entity.status === 'verified')
  const verified = new Set(entities.map(entity => entity.id))
  const relationshipList = data.relationships.filter(row => row.status === 'verified' && verified.has(row.source) && verified.has(row.target))
  const aliases = new Map<string, string[]>()
  const direct = new Map<string, Relationship[]>()
  for (const alias of data.aliases) aliases.set(alias.entityId, [...(aliases.get(alias.entityId) ?? []), alias.name])
  for (const edge of relationshipList) {
    for (const id of [edge.source, edge.target]) direct.set(id, [...(direct.get(id) ?? []), edge])
  }
  return {
    entities, entityById, relationshipList, aliases, direct,
    evidence: new Map(data.sources.map(source => [source.id, source])),
    geography: new Map(data.geographies.map(x => [x.id, x.label])),
    sector: new Map(data.sectors.map(x => [x.id, x.label])),
  }
}
export type AtlasIndex = ReturnType<typeof createIndex>

export function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function selectEntities(index: AtlasIndex, filters: Filters): Entity[] {
  return selectNetwork(index, filters, true).entities
}

export function selectNetwork(index: AtlasIndex, filters: Filters, fullNetwork = false) {
  const eligibleEdges = index.relationshipList.filter(edge =>
    (fullNetwork || edge.themes.length > 0) &&
    (!filters.theme || edge.themes.some(theme => theme === filters.theme)) &&
    (!filters.relationship || edge.type === filters.relationship))
  const endpoints = new Set(eligibleEdges.flatMap(edge => [edge.source, edge.target]))
  const query = normalize(filters.search).split(/\s+/).filter(Boolean)
  const entities = index.entities.filter(entity => {
    const searchable = normalize([entity.shortName, entity.name, ...(index.aliases.get(entity.id) ?? [])].join(' '))
    return (fullNetwork || entity.scope.status === 'CORE' || (entity.scope.status === 'SUPPORTING' && endpoints.has(entity.id))) &&
      query.every(term => searchable.includes(term)) &&
      (!filters.category || entity.category === filters.category) &&
      (!filters.type || entity.type === filters.type) &&
      (!filters.ownership || entity.ownership === filters.ownership) &&
      (!filters.origin || entity.capitalOrigins?.includes(filters.origin)) &&
      (!filters.geography || entity.geographies.includes(filters.geography)) &&
      (!filters.sector || entity.sectors.includes(filters.sector)) &&
      (!filters.theme || endpoints.has(entity.id) || entity.themes.some(theme => theme === filters.theme)) &&
      (!filters.instrument || entity.instruments?.includes(filters.instrument)) &&
      (!filters.relationship || endpoints.has(entity.id))
  })
  const ids = new Set(entities.map(entity => entity.id))
  const edges = eligibleEdges.filter(edge => ids.has(edge.source) && ids.has(edge.target))
  return { entities, edges }
}

export function filterOptions(index: AtlasIndex): Record<FilterField, [string, string][]> {
  const unique = (values: string[]): [string, string][] => [...new Set(values)].sort().map(value => [value, value])
  return {
    category: Object.entries(categories).map(([id, { label }]) => [id, label]),
    type: unique(index.entities.map(entity => entity.type)),
    ownership: unique(index.entities.map(entity => entity.ownership)),
    origin: unique(index.entities.flatMap(entity => entity.capitalOrigins ?? [])),
    geography: [...index.geography.entries()].sort((a, b) => a[1].localeCompare(b[1])),
    sector: [...index.sector.entries()].sort((a, b) => a[1].localeCompare(b[1])),
    theme: Object.entries(themes),
    instrument: unique(index.entities.flatMap(entity => entity.instruments ?? [])),
    relationship: [...new Set(index.relationshipList.map(row => row.type))].sort().map(type => [type, displayName(type)]),
  }
}

export function edgeGroup(edge: Relationship): 'finance' | 'risk' | 'institutional' {
  if (edge.type === 'GUARANTEES' || edge.type === 'INSURES') return 'risk'
  return financialTypes.includes(edge.type) ? 'finance' : 'institutional'
}
export function metricKey(edge: Relationship): string | undefined {
  const amount = edge.amount
  if (!amount || edgeGroup(edge) !== 'finance' || !['approval', 'commitment', 'financial_close', 'disbursement'].includes(amount.status)) return
  return amount.currency + ' · ' + displayName(amount.status)
}
export function edgeWeights(edges: Relationship[], metric: string): Map<string, number> {
  const matching = edges.filter(edge => metric && metricKey(edge) === metric && edge.amount)
  const max = Math.max(0, ...matching.map(edge => edge.amount!.value))
  return new Map(matching.map(edge => [edge.id, 2 + 4 * Math.sqrt(edge.amount!.value / max)]))
}

export function comparisonValues(entity: Entity, field: ComparisonRow, index: AtlasIndex): string[] {
  switch (field) {
    case 'Mandate': return [entity.mandate]
    case 'Ownership': return entity.ownership === 'Unknown' ? [] : [entity.ownership]
    case 'Capital sources': return Array.isArray(entity.capitalSources) ? entity.capitalSources : []
    case 'Geographic coverage': return entity.geographies.map(id => index.geography.get(id) ?? id)
    case 'Sectors': return entity.sectors.map(id => index.sector.get(id) ?? id)
    case 'Instruments': return entity.instruments ?? []
    case 'Themes': return entity.themes.map(theme => themes[theme])
    case 'Financial roles': return entity.roles.map(role => financialRoles[role])
    case 'Access routes': return entity.access && entity.access.route !== 'unknown' ? [accessRoutes[entity.access.route]] : []
    case 'Relationships': return (index.direct.get(entity.id) ?? []).map(edge => {
      const other = edge.source === entity.id ? edge.target : edge.source
      const direction = edge.direction === 'mutual' ? '↔' : edge.source === entity.id ? '→' : '←'
      return displayName(edge.type) + ' ' + direction + ' ' + (index.entityById.get(other)?.shortName ?? other)
    })
  }
}

export function sharedValues(values: string[][]): Set<string> {
  const counts = new Map<string, number>()
  for (const list of values) {
    for (const value of new Set(list)) counts.set(value, 1 + (counts.get(value) ?? 0))
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([value]) => value))
}

