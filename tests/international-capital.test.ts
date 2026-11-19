import { createHash } from 'node:crypto'
import { beforeAll, describe, expect, it } from 'vitest'
import { indexCapitalPathways, loadCapitalResearch, resolvePathwayAmount, validateCapitalResearch } from '../src/capital-research'
import type { CapitalResearch } from '../src/capital-research-model'
import type { AtlasData } from '../src/model'
import publication from '../research/international-capital-publication.json'
import { localRepository } from '../src/repository'
import { createIndex, emptyFilters, selectNetwork } from '../src/selectors'

let atlas: AtlasData
let research: CapitalResearch

beforeAll(async () => {
  atlas = await localRepository.load()
  research = loadCapitalResearch(atlas)
})

describe('approved international capital publication', () => {
  it('preserves every earlier registry and research record through the identity promotions', () => {
    const entities = [...atlas.institutions, ...atlas.vehicles]
    const collections: Record<string, { id: string }[]> = {
      institutions: atlas.institutions,
      vehicles: atlas.vehicles,
      relationships: atlas.relationships,
      sources: atlas.sources,
      'scope-sources': atlas.sources,
      geographies: atlas.geographies,
      'entity-scope': entities.map(entity => ({ id: entity.id, scope: entity.scope, themes: entity.themes, roles: entity.roles })),
      'relationship-scope': atlas.relationships.map(edge => ({ id: edge.id, themes: edge.themes, scopeRationale: edge.scopeRationale, scopeEvidenceIds: edge.scopeEvidenceIds, participantRoles: edge.participantRoles })),
      'capitalResearch.pathways': research.pathways,
      'capitalResearch.actors': research.actors,
      'capitalResearch.geographies': research.geographies,
      'capitalResearch.sources': research.sources,
    }
    for (const original of publication.baselineRecords) {
      const record = collections[original.targetCollection].find(row => row.id === original.id)
      expect(record, original.collection + '/' + original.id).toBeDefined()
      const selected = Object.fromEntries(original.keys.map(key => [key, (record as unknown as Record<string, unknown>)[key]]))
      expect(createHash('sha256').update(JSON.stringify(selected)).digest('hex'), original.id).toBe(original.sha256)
    }
  })

  it('publishes the approved profiles and makes all ten new cases reachable from documented network links', () => {
    const index = createIndex(atlas)
    const capital = indexCapitalPathways(research, index)
    const visible = selectNetwork(index, emptyFilters)
    expect(publication.newEntityIds.every(id => visible.entities.some(entity => entity.id === id))).toBe(true)
    expect(publication.newRelationshipIds.every(id => visible.edges.some(edge => edge.id === id))).toBe(true)
    const reachable = new Set([...capital.byRelationship.values()].flat().map(path => path.id))
    expect(publication.pathwayIds.every(id => reachable.has(id))).toBe(true)
    for (const id of publication.promotedActorIds) {
      expect(index.entityById.has(id)).toBe(true)
      expect(research.actors.some(actor => actor.id === id)).toBe(false)
    }
    for (const id of ['credit-suisse-ag', 'builders-vision', 'axa-xl']) {
      expect(index.entityById.has(id)).toBe(false)
      expect(research.actors.some(actor => actor.id === id)).toBe(true)
    }
  })

  it('keeps FinDev institutional funding separate from the original providers of the Enertur loan', () => {
    const path = research.pathways.find(path => path.id === 'intl-enertur')!
    expect(path.origins.map(origin => origin.providerId)).toEqual(['findev', 'idbi', 'fmo'])
    const upstream = path.links.filter(link => link.source === 'edc')
    expect(upstream).toHaveLength(2)
    expect(upstream.every(link => link.fundingScope === 'institution_balance_sheet')).toBe(true)
    const capital = path.amounts.find(amount => amount.id.endsWith('.edc-equity'))!
    expect(capital.fundingScope).toBe('institution_balance_sheet')
    const facility = path.amounts.find(amount => amount.id.endsWith('.facility'))!
    expect(path.amounts.filter(amount => amount.partOfAmountId === facility.id)).toHaveLength(3)
    expect(capital.partOfAmountId).toBeUndefined()
    expect(path.amounts.find(amount => amount.id.endsWith('.fmo-precise'))?.alternativeToAmountId).toBe('intl-enertur.amount.fmo')
  })

  it('preserves unknown reporting dates, their access dates and alternative financial bases', () => {
    const path = research.pathways.find(path => path.id === 'intl-cbf-eba')!
    const budget = path.amounts.find(amount => amount.id.endsWith('.cbf-budget'))!
    expect(budget.reportedOn).toBeNull()
    expect(budget.dateBasis).toBe('undated_source_snapshot')
    expect(budget.observedOn).toBe('2026-11-18')
    const data = structuredClone(research)
    const amount = data.pathways.find(path => path.id === 'intl-cbf-eba')!.amounts[0]
    amount.dateBasis = 'event'
    amount.alternativeToAmountId = 'missing-observation'
    amount.doNotAggregateWith = ['missing-overlap']
    const errors = validateCapitalResearch(data, atlas).join(' ')
    expect(errors).toMatch(/invalid amount, date or scope/)
    expect(errors).toMatch(/invalid alternative observation/)
    expect(errors).toMatch(/invalid overlapping observation/)
  })

  it('keeps catastrophe note capital and insurance exposure distinct, with contingent sovereign recipients', () => {
    const path = research.pathways.find(path => path.id === 'intl-jamaica-cat-2026')!
    expect(path.origins[0].providerId).toBe('jamaica-cat-investors')
    expect(path.links.find(link => link.type === 'SUBSCRIBES_TO')?.target).toBe('world-bank')
    expect(path.recipients).toContainEqual(expect.objectContaining({ actorId: 'jamaica-gov', role: 'contingent' }))
    const cover = path.amounts.find(amount => amount.measure === 'insurance_coverage')!
    const edges = new Map(atlas.relationships.map(edge => [edge.id, edge]))
    expect(resolvePathwayAmount(cover, edges)).toBe(edges.get('rel-world-bank-jamaica-cover')?.amount)
    expect(path.gaps.some(gap => gap.status === 'conflicting')).toBe(true)
    const belize = research.pathways.find(path => path.id === 'intl-belize-blue-2021')!
    expect(belize.amounts.find(amount => amount.measure === 'insurance_coverage')?.doNotAggregateWith).toContain('intl-belize-blue-2021.amount.loan')
    expect(belize.links.find(link => link.source === 'credit-suisse-ag')?.limitation).toMatch(/signing entity/)
  })
})
