import rawResearch from './data/capital-pathways.json'
import {
  capitalOriginGeographies, capitalSourceTypes, financingInstruments, pathwayAmountDateBases,
  pathwayAmountMeasures, pathwayAmountStages, pathwayRelationshipGroups, recipientRoles, researchActorKinds,
} from './capital-research-model'
import type { CapitalPathway, CapitalResearch, PathwayAmount } from './capital-research-model'
import { themes } from './model'
import type { AtlasData, Relationship } from './model'
import { normalize } from './selectors'
import type { AtlasIndex } from './selectors'
import { isCalendarDate, isWebUrl } from './validation'

const linkStatuses = ['verified', 'reported', 'conflicting']
const evidenceStatuses = ['verified', 'reported', 'unverified', 'conflicting']
const atlasStages = {
  fund_target: 'target',
  capital_raised: 'received',
  commitment: 'committed',
  approval: 'approved',
  financial_close: 'closed',
  disbursement: 'disbursed',
  guarantee_limit: undefined,
  insurance_limit: undefined,
} as const

function isReportingDate(value: string | null) {
  return typeof value === 'string' && (isCalendarDate(value) || /^\d{4}(-(?:0[1-9]|1[0-2]))?$/.test(value))
}

export function resolvePathwayAmount(amount: PathwayAmount, relationships: ReadonlyMap<string, Relationship>) {
  if (amount.value !== undefined) return { value: amount.value, currency: amount.currency }
  return relationships.get(amount.atlasRelationshipId)?.amount
}

export function validateCapitalResearch(research: CapitalResearch, atlas: AtlasData): string[] {
  const errors: string[] = []
  const entities = [...atlas.institutions, ...atlas.vehicles]
  const entityIds = new Set(entities.map(entity => entity.id))
  const names = new Set(entities.map(entity => normalize(entity.name)))
  for (const alias of atlas.aliases) names.add(normalize(alias.name))
  const actors = new Set(entityIds)
  const geographies = new Set(atlas.geographies.map(place => place.id))
  const relationships = new Map(atlas.relationships.map(edge => [edge.id, edge]))
  const sources = new Map(atlas.sources.map(source => [source.id, source]))
  const pathwayIds = new Set<string>()
  const referencedAmounts = new Set<string>()
  const amountReferences = new Set([...relationships.keys(), ...research.pathways.flatMap(path => path.amounts.map(amount => amount.id))])

  function checkEvidence(label: string, ids: string[], status?: string) {
    if (status && !ids.length) errors.push(label + ' needs evidence.')
    for (const id of ids) if (!sources.has(id)) errors.push(label + ' references unknown evidence ' + id + '.')
    if (status === 'verified' && !ids.some(id => sources.get(id)?.status === 'verified')) {
      errors.push(label + ' needs verified evidence.')
    }
  }

  function addId(id: string, seen: Set<string>) {
    if (!id.trim() || seen.has(id)) errors.push('Missing or duplicate ID ' + id + '.')
    seen.add(id)
  }

  if (!isCalendarDate(research.reviewedOn)) errors.push('Invalid capital research review date.')
  for (const geography of research.geographies) {
    addId(geography.id, geographies)
    if (!geography.label.trim()) errors.push(geography.id + ' needs a geography label.')
  }
  for (const actor of research.actors) {
    addId(actor.id, actors)
    const name = normalize(actor.name)
    if (!name || names.has(name) || !researchActorKinds.includes(actor.kind)) errors.push(actor.id + ' has a duplicate or invalid identity.')
    names.add(name)
  }
  for (const source of research.sources) {
    if (!source.id.trim() || sources.has(source.id)) errors.push('Missing or duplicate evidence ID ' + source.id + '.')
    if (!source.title.trim() || !source.publisher.trim() || !source.reference.trim() || !isWebUrl(source.url) ||
        !evidenceStatuses.includes(source.status) || !isCalendarDate(source.accessedOn) ||
        (source.publishedOn !== undefined && !isCalendarDate(source.publishedOn))) {
      errors.push(source.id + ' has invalid evidence metadata.')
    }
    sources.set(source.id, source)
  }

  for (const path of research.pathways) {
    addId(path.id, pathwayIds)
    if (!path.name.trim() || !actors.has(path.mechanismId) ||
        !path.geographies.length || !path.themes.length || !path.instruments.length ||
        path.geographies.some(place => !geographies.has(place)) || path.themes.some(theme => !Object.hasOwn(themes, theme)) ||
        path.instruments.some(instrument => !financingInstruments.includes(instrument))) {
      errors.push(path.id + ' has invalid coverage or mechanism references.')
    }
    const missingOrigins = path.upstreamCoverage === 'unknown' ? path.origins.length > 0 : path.origins.length === 0
    if (!['traced', 'partially_traced'].includes(path.reviewStatus) ||
        !['documented', 'partial', 'unknown'].includes(path.upstreamCoverage) ||
        missingOrigins ||
        (path.reviewStatus === 'partially_traced' && !path.gaps.length)) {
      errors.push(path.id + ' has inconsistent research coverage.')
    }
    const links = new Map(path.links.map(link => [link.id, link]))
    const amounts = new Map(path.amounts.map(amount => [amount.id, amount]))
    const linkIds = new Set<string>()
    const amountIds = new Set<string>()
    for (const link of path.links) {
      addId(link.id, linkIds)
      if (!actors.has(link.source) || !actors.has(link.target) || link.source === link.target ||
          !Object.hasOwn(pathwayRelationshipGroups, link.type) || !linkStatuses.includes(link.status) ||
          (link.instrument && !path.instruments.includes(link.instrument)) || !link.description.trim()) {
        errors.push(link.id + ' has invalid parties, relationship type, instrument or status.')
      }
      if (link.fundingScope && !['institution_balance_sheet', 'global_pool_context'].includes(link.fundingScope)) {
        errors.push(link.id + ' has invalid funding scope.')
      }
      checkEvidence(link.id, link.evidenceIds, link.status)
      if (link.beneficiaryIds && (pathwayRelationshipGroups[link.type] !== 'risk' ||
          link.beneficiaryIds.some(id => !actors.has(id) || id === link.source))) {
        errors.push(link.id + ' has invalid risk beneficiaries.')
      }
      if (link.atlasRelationshipId) {
        const edge = relationships.get(link.atlasRelationshipId)
        const compatibleType = edge?.type === link.type || (edge?.type === 'MANAGES' && link.type === 'ADMINISTERS')
        if (!compatibleType || edge?.source !== link.source || edge.target !== link.target) {
          errors.push(link.id + ' does not match its linked atlas relationship.')
        }
      }
    }
    for (const origin of path.origins) {
      const link = links.get(origin.linkId)
      if (!link || link.source !== origin.providerId || link.status !== 'verified' ||
          pathwayRelationshipGroups[link.type] !== 'finance' ||
          !capitalSourceTypes.includes(origin.capitalType) || !capitalOriginGeographies.includes(origin.geography) || !origin.note.trim()) {
        errors.push(path.id + ' traces an origin without a verified financing link.')
      }
    }
    for (const recipient of path.recipients) {
      const link = links.get(recipient.linkId)
      if (!link || !recipientRoles.includes(recipient.role) || link.target !== recipient.actorId ||
          (pathwayRelationshipGroups[link.type] !== 'finance' && !(recipient.role === 'intended' && link.type === 'TARGETS') &&
            !(recipient.role === 'contingent' && pathwayRelationshipGroups[link.type] === 'risk'))) {
        errors.push(path.id + ' has a recipient without a matching financing or eligibility link.')
      }
    }
    for (const amount of path.amounts) {
      addId(amount.id, amountIds)
      checkEvidence(amount.id, amount.evidenceIds, 'verified')
      const value = resolvePathwayAmount(amount, relationships)
      const link = amount.linkId ? links.get(amount.linkId) : undefined
      const riskType = amount.measure === 'guarantee_coverage' ? 'GUARANTEES' :
        amount.measure === 'insurance_coverage' ? 'INSURES' : undefined
      const validDate = amount.reportedOn === null ? amount.dateBasis === 'undated_source_snapshot' &&
        Boolean(amount.observedOn && isCalendarDate(amount.observedOn)) :
        amount.dateBasis !== 'undated_source_snapshot' && isReportingDate(amount.reportedOn)
      if (!value || value.value === undefined || !Number.isFinite(value.value) || value.value <= 0 || !/^[A-Z]{3}$/.test(value.currency ?? '') ||
          !pathwayAmountMeasures.includes(amount.measure) || !pathwayAmountStages.includes(amount.stage) ||
          !pathwayAmountDateBases.includes(amount.dateBasis) || !validDate ||
          !amount.scope.trim() || (amount.linkId && !link)) {
        errors.push(amount.id + ' has invalid amount, date or scope.')
      }
      if (amount.observedOn && !isCalendarDate(amount.observedOn)) errors.push(amount.id + ' has an invalid source inspection date.')
      if (amount.fundingScope && !['institution_balance_sheet', 'global_pool_context'].includes(amount.fundingScope)) {
        errors.push(amount.id + ' has invalid funding scope.')
      }
      if (amount.alternativeToAmountId && (amount.alternativeToAmountId === amount.id || !amounts.has(amount.alternativeToAmountId))) {
        errors.push(amount.id + ' has an invalid alternative observation.')
      }
      if (amount.doNotAggregateWith?.some(id => id === amount.id || !amountReferences.has(id))) {
        errors.push(amount.id + ' has an invalid overlapping observation reference.')
      }
      if (riskType ? link?.type !== riskType || !['signed', 'closed', 'approved', 'reported', 'committed'].includes(amount.stage) :
        link && pathwayRelationshipGroups[link.type] !== 'finance') {
        errors.push(amount.id + ' mixes financial flows with risk or authority.')
      }
      if (amount.partOfAmountId) {
        const parent = amounts.get(amount.partOfAmountId)
        const parentValue = parent && resolvePathwayAmount(parent, relationships)
        if (!parent || parent.partOfAmountId || parent.stage !== amount.stage || !parentValue ||
            parentValue.currency !== value?.currency || (parentValue.value ?? 0) < (value?.value ?? 0)) {
          errors.push(amount.id + ' has an incompatible amount total.')
        }
      }
      if (amount.atlasRelationshipId) {
        const originalStatus = relationships.get(amount.atlasRelationshipId)?.amount?.status
        const originalStage = originalStatus && atlasStages[originalStatus]
        if (link?.atlasRelationshipId !== amount.atlasRelationshipId || amount.value !== undefined || amount.currency !== undefined ||
            referencedAmounts.has(amount.atlasRelationshipId) ||
            (originalStage !== undefined && originalStage !== amount.stage) ||
            (originalStatus === 'guarantee_limit') !== (amount.measure === 'guarantee_coverage') ||
            (originalStatus === 'insurance_limit') !== (amount.measure === 'insurance_coverage')) {
          errors.push(amount.id + ' has an inconsistent or duplicate canonical amount reference.')
        }
        referencedAmounts.add(amount.atlasRelationshipId)
      }
    }
    for (const gap of path.gaps) {
      if (!gap.field.trim() || !gap.description.trim() || !['unknown', 'conflicting'].includes(gap.status) ||
          (gap.status === 'conflicting' && gap.evidenceIds.length < 2)) errors.push(path.id + ' has an invalid research gap.')
      checkEvidence(path.id + ' gap', gap.evidenceIds)
    }
  }
  return errors
}

export function loadCapitalResearch(atlas: AtlasData): CapitalResearch {
  const research = rawResearch as CapitalResearch
  const errors = validateCapitalResearch(research, atlas)
  if (errors.length) throw new Error('The capital research failed validation. ' + errors.join(' '))
  return research
}

export function indexCapitalPathways(research: CapitalResearch, atlas: AtlasIndex) {
  const relationships = new Map(atlas.relationshipList.map(edge => [edge.id, edge]))
  const byRelationship = new Map<string, CapitalPathway[]>()
  for (const path of research.pathways) {
    const ids = new Set(atlas.direct.get(path.mechanismId)?.map(edge => edge.id))
    for (const link of path.links) {
      if (link.atlasRelationshipId) ids.add(link.atlasRelationshipId)
    }
    for (const id of ids) {
      if (relationships.has(id)) byRelationship.set(id, [...(byRelationship.get(id) ?? []), path])
    }
  }
  return {
    byRelationship,
    relationships,
    actorNames: new Map([
      ...[...atlas.entityById.values()].map(actor => [actor.id, actor.name] as const),
      ...research.actors.map(actor => [actor.id, actor.name] as const),
    ]),
    evidence: new Map([...atlas.evidence, ...research.sources.map(source => [source.id, source] as const)]),
  }
}

export type CapitalPathwayIndex = ReturnType<typeof indexCapitalPathways>
