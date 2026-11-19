import { beforeAll, describe, expect, it } from 'vitest'
import { indexCapitalPathways, loadCapitalResearch, resolvePathwayAmount, validateCapitalResearch } from '../src/capital-research'
import type { CapitalResearch } from '../src/capital-research-model'
import type { AtlasData } from '../src/model'
import { localRepository } from '../src/repository'
import { createIndex } from '../src/selectors'

let atlas: AtlasData
let research: CapitalResearch
beforeAll(async () => {
  atlas = await localRepository.load()
  research = loadCapitalResearch(atlas)
})

describe('capital pathway research', () => {
  it('opens verified research against the current registry and keeps staged mechanisms outside the live graph', () => {
    expect(validateCapitalResearch(research, atlas)).toEqual([])
    expect(research.pathways).toHaveLength(24)
    expect([...atlas.institutions, ...atlas.vehicles]).toHaveLength(93)
    expect(atlas.relationships).toHaveLength(102)
    expect(atlas.vehicles.some(vehicle => vehicle.id === 'ace-facility')).toBe(false)
    expect(research.pathways.find(path => path.id === 'cbf-ace')?.mechanismId).toBe('ace-facility')
  })

  it('separates commercial lenders, investor origin, guarantee exposure and award approval in the Blue Loan', () => {
    const path = research.pathways.find(item => item.id === 'barbados-blue-loan')!
    const guarantees = path.links.filter(link => link.type === 'GUARANTEES' && link.target === path.mechanismId)
    expect(guarantees.map(link => link.source)).toEqual(['idb', 'tnc'])
    expect(guarantees[0].beneficiaryIds).toEqual(['bb-blue-dac', 'cibc-barbados-bank'])
    expect(path.origins.map(origin => origin.providerId)).toEqual(['blue-investors', 'cibc-barbados-bank', 'barbados-gov'])
    expect(path.links).toContainEqual(expect.objectContaining({
      source: 'besf-board', target: 'besf', type: 'APPROVES_FINANCING_FOR',
    }))
    const coverage = path.amounts.find(amount => amount.atlasRelationshipId === 'rel-idb-barbados-blue')!
    const original = atlas.relationships.find(edge => edge.id === coverage.atlasRelationshipId)!
    expect(resolvePathwayAmount(coverage, new Map([[original.id, original]]))).toBe(original.amount)
    expect(coverage.value).toBeUndefined()
  })

  it('attaches research through explicit references and through links incident to a published mechanism', () => {
    const registry = createIndex(atlas)
    const index = indexCapitalPathways(research, registry)
    expect(index.relationships.size).toBe(registry.relationshipList.length)
    for (const [edgeId, pathId] of [
      ['rel-egfl-energy-smart-ii', 'energy-smart-ii'],
      ['rel-gac-surge', 'surge'],
      ['rel-cibc-barbados-blue', 'barbados-blue-loan'],
      ['rel-idb-cdb-sef', 'sef'],
    ]) {
      expect(index.byRelationship.get(edgeId)?.map(path => path.id)).toContain(pathId)
    }
    const contextual = index.byRelationship.get('rel-cibc-barbados-blue')?.[0]
    expect(contextual?.links.some(link => link.atlasRelationshipId === 'rel-cibc-barbados-blue')).toBe(false)
    expect(new Set([...index.byRelationship.values()].flat().map(path => path.id))).toHaveProperty('size', 21)
    expect(index.actorNames.get('besf-board')).toBeTruthy()
    expect(index.evidence.get('src-capital-esf-loan-agreement')).toBeTruthy()
  })

  it('rejects financing origins, amounts or beneficiaries linked to the wrong kind of assertion', () => {
    const data = structuredClone(research)
    const path = data.pathways.find(item => item.id === 'barbados-blue-loan')!
    const exposure = path.amounts.find(amount => amount.measure === 'guarantee_coverage')!
    const guarantee = path.links.find(link => link.id === exposure.linkId)!
    path.origins[0].providerId = guarantee.source
    path.origins[0].linkId = guarantee.id
    exposure.stage = 'disbursed'
    guarantee.beneficiaryIds = ['missing-lender']
    const errors = validateCapitalResearch(data, atlas)
    expect(errors.join(' ')).toMatch(/origin without a verified financing link/)
    expect(errors.join(' ')).toMatch(/mixes financial flows with risk or authority/)
    expect(errors.join(' ')).toMatch(/invalid risk beneficiaries/)
  })

  it('requires valid evidence and consistent dates and totals for nested observations', () => {
    const data = structuredClone(research)
    const path = data.pathways.find(item => item.id === 'surge')!
    const component = path.amounts.find(amount => amount.partOfAmountId)!
    component.partOfAmountId = 'missing-total'
    component.reportedOn = '2025-13'
    path.links[0].evidenceIds = ['missing-source']
    const originalApproval = data.pathways.find(item => item.id === 'sef')!.amounts.find(amount => amount.atlasRelationshipId === 'rel-idb-cdb-sef')!
    originalApproval.stage = 'disbursed'
    const errors = validateCapitalResearch(data, atlas)
    expect(errors.join(' ')).toMatch(/incompatible amount total/)
    expect(errors.join(' ')).toMatch(/invalid amount, date or scope/)
    expect(errors.join(' ')).toMatch(/references unknown evidence/)
    expect(errors.join(' ')).toMatch(/inconsistent or duplicate canonical amount reference/)
  })
})
