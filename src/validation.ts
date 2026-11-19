import { accessRoutes, amountStatuses, categories, financialRoles, relationshipTypes, scopes, themes } from './model'
import type { AtlasData, FinancialAmount, RelationshipType, Verification } from './model'

export const financialTypes: RelationshipType[] = [
  'CAPITALIZES', 'FUNDS', 'LENDS_TO', 'INVESTS_IN', 'CO_INVESTS_WITH', 'GUARANTEES', 'INSURES',
  'CONTRIBUTES_TO', 'GRANTS_TO', 'COMMITS_SAVINGS_TO',
]
const verifications: Verification[] = ['verified', 'reported', 'unverified', 'conflicting']
const flows = ['commitment', 'approval', 'financial_close', 'disbursement']
const allowedStatuses: Partial<Record<RelationshipType, readonly string[]>> = {
  CAPITALIZES: ['fund_target', 'capital_raised', ...flows],
  FUNDS: flows,
  LENDS_TO: flows,
  INVESTS_IN: flows,
  CO_INVESTS_WITH: flows,
  GUARANTEES: ['guarantee_limit'],
  INSURES: ['insurance_limit'],
  CONTRIBUTES_TO: flows,
  GRANTS_TO: flows,
  COMMITS_SAVINGS_TO: ['commitment', 'approval'],
}

export function isWebUrl(value: string): boolean {
  try {
    return ['https:', 'http:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00Z')
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function validateAtlas(data: AtlasData): string[] {
  const errors: string[] = []
  const globalIds = new Set<string>()
  const entities = [...data.institutions, ...data.vehicles]
  const entityMap = new Map(entities.map(entity => [entity.id, entity]))
  const sourceMap = new Map(data.sources.map(source => [source.id, source]))
  const relationshipMap = new Map(data.relationships.map(row => [row.id, row]))
  const geographyIds = new Set(data.geographies.map(entry => entry.id))
  const sectorIds = new Set(data.sectors.map(entry => entry.id))
  const projectIds = new Set(data.projects.map(entry => entry.id))

  for (const row of [...entities, ...data.sources, ...data.relationships, ...data.projects, ...data.transactions]) {
    if (!row.id?.trim()) errors.push('A record is missing its ID.')
    if (globalIds.has(row.id)) errors.push('Duplicate ID ' + row.id + '.')
    globalIds.add(row.id)
    if (!verifications.includes(row.status)) errors.push(row.id + ' has an invalid verification status.')
  }
  for (const entries of [data.geographies, data.sectors]) {
    const ids = new Set<string>()
    for (const entry of entries) {
      if (ids.has(entry.id)) errors.push('Duplicate classification ID ' + entry.id + '.')
      if (!entry.id.trim() || !entry.label.trim()) errors.push('A classification is missing its ID or label.')
      ids.add(entry.id)
    }
  }

  function checkEvidence(row: { id: string; status: Verification; evidenceIds: string[] }, required = row.status !== 'unverified') {
    if (!row.evidenceIds?.length) {
      if (required) errors.push(row.id + ' is missing source evidence.')
      return
    }
    for (const id of row.evidenceIds) {
      if (!sourceMap.has(id)) errors.push(row.id + ' references missing source ' + id + '.')
    }
    if (row.status === 'verified' && !row.evidenceIds.some(id => sourceMap.get(id)?.status === 'verified')) {
      errors.push(row.id + ' requires verified supporting evidence.')
    }
  }

  function checkClassification(row: { id: string; geographies: string[]; sectors: string[] }) {
    for (const id of row.geographies) if (!geographyIds.has(id)) errors.push(row.id + ' references an unknown geography.')
    for (const id of row.sectors) if (!sectorIds.has(id)) errors.push(row.id + ' references an unknown sector.')
  }

  function checkTags(id: string, values: string[], vocabulary: object, label: string) {
    if (!Array.isArray(values) || values.some(value => !Object.hasOwn(vocabulary, value)) || new Set(values).size !== values.length) {
      errors.push(id + ' has missing, unknown or duplicate ' + label + '.')
    }
  }

  function checkAmount(id: string, type: RelationshipType | undefined, amount: FinancialAmount) {
    if (!/^[A-Z]{3}$/.test(amount.currency ?? '')) errors.push(id + ' requires a three-letter currency code.')
    if (!Number.isFinite(amount.value) || amount.value <= 0) errors.push(id + ' requires a positive financial amount.')
    if (!amountStatuses.includes(amount.status) || !type || !allowedStatuses[type]?.includes(amount.status)) {
      errors.push(id + ' has an invalid financial status for its relationship type.')
    }
    if (amount.asOf && !isCalendarDate(amount.asOf)) errors.push(id + ' has an invalid amount date.')
  }

  for (const entity of entities) {
    checkEvidence(entity)
    checkClassification(entity)
    checkTags(entity.id, entity.themes, themes, 'theme tags')
    checkTags(entity.id, entity.roles, financialRoles, 'financial roles')
    const scope = entity.scope
    if (!scope || !Object.hasOwn(scopes, scope.status) || !scope.rationale?.trim()) {
      errors.push(entity.id + ' requires a scope classification and rationale.')
    } else {
      checkEvidence({ id: entity.id + ' scope', status: entity.status, evidenceIds: scope.evidenceIds }, true)
      if (scope.status === 'CORE' && (!entity.themes?.length || !entity.roles?.length)) {
        errors.push(entity.id + ' requires a core theme and financial role.')
      }
      if (scope.status === 'OUT_OF_SCOPE' && entity.themes?.length) errors.push(entity.id + ' has out-of-scope theme tags.')
    }
    if (!Object.hasOwn(categories, entity.category) || !['Public', 'Private', 'Multilateral', 'Unknown'].includes(entity.ownership)) {
      errors.push(entity.id + ' has an invalid category or ownership.')
    }
    const parent = entity.kind === 'institution' ? entity.parentId : entity.managerId
    if (parent && (entityMap.get(parent)?.kind !== 'institution' || parent === entity.id)) {
      errors.push(entity.id + ' references an invalid parent or manager.')
    }
    if (!isWebUrl(entity.website)) errors.push(entity.id + ' has an invalid official website.')
    if (entity.status === 'verified' && (!entity.verifiedOn || !isCalendarDate(entity.verifiedOn))) {
      errors.push(entity.id + ' requires a valid verification date.')
    }
    if (entity.access && (!Object.hasOwn(accessRoutes, entity.access.route) || !entity.evidenceIds.includes(entity.access.evidenceId))) {
      errors.push(entity.id + ' has an access route without valid classification or evidence.')
    }
  }
  for (const source of data.sources) {
    if (!source.title?.trim() || !source.publisher?.trim() || !source.reference?.trim() || !isWebUrl(source.url)) {
      errors.push(source.id + ' is missing usable source evidence.')
    }
    if (!isCalendarDate(source.accessedOn) || (source.publishedOn && !isCalendarDate(source.publishedOn))) {
      errors.push(source.id + ' has an invalid source date.')
    }
  }
  for (const alias of data.aliases) {
    if (!entityMap.has(alias.entityId) || !alias.name.trim()) errors.push('Alias has an invalid entity reference or name.')
  }
  for (const relationship of data.relationships) {
    if (!entityMap.has(relationship.source) || !entityMap.has(relationship.target) || relationship.source === relationship.target) {
      errors.push(relationship.id + ' has an invalid entity reference.')
    }
    if (!relationshipTypes.includes(relationship.type)) errors.push(relationship.id + ' has an invalid relationship type.')
    if (!['directed', 'mutual'].includes(relationship.direction)) errors.push(relationship.id + ' has an invalid direction.')
    if (!relationship.description.trim()) errors.push(relationship.id + ' requires a relationship description.')
    checkEvidence(relationship, true)
    if (relationship.scopeEvidenceIds) {
      checkEvidence({ id: relationship.id + ' scope', status: relationship.status, evidenceIds: relationship.scopeEvidenceIds }, true)
    }
    checkTags(relationship.id, relationship.themes, themes, 'theme tags')
    if (!relationship.scopeRationale?.trim() || !relationship.participantRoles?.source?.trim() || !relationship.participantRoles?.target?.trim()) {
      errors.push(relationship.id + ' requires a scope rationale and roles for both participants.')
    }
    if (relationship.themes?.length) {
      const endpointScopes = [entityMap.get(relationship.source)?.scope?.status, entityMap.get(relationship.target)?.scope?.status]
      if (!endpointScopes.includes('CORE') || endpointScopes.includes('OUT_OF_SCOPE')) {
        errors.push(relationship.id + ' requires a core endpoint and in-scope participants for a thematic relationship.')
      }
    }
    if (relationship.amount) checkAmount(relationship.id, relationship.type, relationship.amount)
  }
  for (const project of data.projects) {
    checkEvidence(project)
    checkClassification(project)
  }
  for (const transaction of data.transactions) {
    const relationship = relationshipMap.get(transaction.relationshipId)
    if (!relationship) errors.push(transaction.id + ' references an unknown relationship.')
    if (transaction.projectId && !projectIds.has(transaction.projectId)) errors.push(transaction.id + ' references an unknown project.')
    if (!transaction.amounts.length) errors.push(transaction.id + ' requires at least one amount.')
    for (const amount of transaction.amounts) checkAmount(transaction.id, relationship?.type, amount)
    checkEvidence(transaction)
  }
  return errors
}


