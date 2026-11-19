import { beforeAll, describe, expect, it } from 'vitest'
import type { AtlasData, Relationship, RelationshipType } from '../src/model'
import institutions from '../src/data/institutions.json'
import vehicles from '../src/data/vehicles.json'
import relationships from '../src/data/relationships.json'
import sources from '../src/data/sources.json'
import { localRepository } from '../src/repository'
import { candidateKey, candidateReviews, duplicateName, readCandidates, seedCandidates } from '../src/research'
import rawCandidates from '../src/data/candidates.json'
import { comparisonValues, createIndex, edgeWeights, emptyFilters, selectEntities, selectNetwork, sharedValues } from '../src/selectors'
import { validateAtlas } from '../src/validation'

let seed: AtlasData
beforeAll(async () => { seed = await localRepository.load() })

describe('dataset validation', () => {
  it('loads the registry with all references resolved', () => {
    expect(validateAtlas(seed)).toEqual([])
    expect(createIndex(seed).entities.length).toBeGreaterThanOrEqual(30)
  })
  it('rejects broken relationship endpoints', () => {
    const data = structuredClone(seed)
    data.relationships[0].target = 'missing-entity'
    expect(validateAtlas(data)).toContainEqual(expect.stringContaining('invalid entity reference'))
  })
  it('rejects duplicate record IDs', () => {
    const data = structuredClone(seed)
    data.vehicles[0].id = data.institutions[0].id
    expect(validateAtlas(data)).toContainEqual(expect.stringContaining('Duplicate ID'))
  })
  it('rejects verified claims without sources and missing source references', () => {
    const data = structuredClone(seed)
    data.relationships[0].evidenceIds = []
    data.relationships[1].evidenceIds = ['missing-source']
    expect(validateAtlas(data)).toContainEqual(expect.stringContaining('missing source evidence'))
    expect(validateAtlas(data)).toContainEqual(expect.stringContaining('references missing source'))
  })
  it('rejects reported-only support for a verified relationship', () => {
    const data = structuredClone(seed)
    const id = data.relationships[0].evidenceIds[0]
    data.sources.find(source => source.id === id)!.status = 'reported'
    expect(validateAtlas(data)).toContainEqual(expect.stringContaining('requires verified supporting evidence'))
  })
  it('rejects malformed relationship types', () => {
    const data = structuredClone(seed)
    data.relationships[0].type = 'INTERESTED_IN' as RelationshipType
    expect(validateAtlas(data)).toContainEqual(expect.stringContaining('invalid relationship type'))
  })
  it('rejects amounts with missing currencies', () => {
    const data = structuredClone(seed)
    const loan = data.relationships.find(edge => edge.amount)!
    loan.amount!.currency = ''
    expect(validateAtlas(data)).toContainEqual(expect.stringContaining('requires a three-letter currency code'))
  })
  it('rejects fund targets on loans and disbursements on insurance edges', () => {
    const data = structuredClone(seed)
    const loan = data.relationships.find(edge => edge.type === 'LENDS_TO' && edge.amount)!
    loan.amount!.status = 'fund_target'
    const cover = data.relationships.find(edge => edge.type === 'INSURES')!
    cover.amount = { currency: 'USD', status: 'disbursement', value: 1 }
    expect(validateAtlas(data).filter(error => error.includes('invalid financial status'))).toHaveLength(2)
  })
})

describe('atlas selectors', () => {
  it('finds aliases and applies filters together', () => {
    const index = createIndex(seed)
    expect(selectEntities(index, { ...emptyFilters, search: 'firstcaribbean', ownership: 'Private', geography: 'barbados' }).map(row => row.id)).toEqual(['cibc'])
    expect(selectEntities(index, { ...emptyFilters, search: 'firstcaribbean', ownership: 'Public' })).toEqual([])
    expect(selectEntities(index, { ...emptyFilters, instrument: 'Parametric insurance', relationship: 'INSURES' }).map(row => row.id)).toEqual(['ccrif', 'jamaica-gov'])
  })
  it('keeps unverified entities and relationships out of the index', () => {
    const data = structuredClone(seed)
    data.relationships[0].status = 'reported'
    data.institutions[0].status = 'unverified'
    const index = createIndex(data)
    expect(index.entities.find(entity => entity.id === 'cdb')).toBeUndefined()
    expect(index.relationshipList.some(edge => edge.source === 'cdb' || edge.target === 'cdb')).toBe(false)
  })
  it('compares exact documented values and ignores missing values', () => {
    const index = createIndex(seed)
    const entities = ['cdb', 'idb', 'world-bank'].map(id => index.entityById.get(id)!)
    expect(sharedValues(entities.map(entity => comparisonValues(entity, 'Ownership', index)))).toEqual(new Set(['Multilateral']))
    expect(sharedValues(entities.map(entity => comparisonValues(entity, 'Capital sources', index))))
      .toEqual(new Set(['Member country capital', 'Capital market borrowing']))
    expect(sharedValues([[], []])).toEqual(new Set())
    expect(comparisonValues(entities[0], 'Relationships', index)).toContain('Accredited by → GCF')
  })
  it('scales comparable amounts and omits other currencies, statuses and risk coverage', () => {
    const edges: Relationship[] = [
      ...seed.relationships,
      { ...seed.relationships[0], id: 'test-insurance', type: 'INSURES',
        amount: { currency: 'USD', status: 'insurance_limit', value: 100000000 } },
    ]
    expect(edgeWeights(edges, '').size).toBe(0)
    const weighted = edgeWeights(edges, 'USD · Commitment')
    expect(weighted.size).toBe(3)
    expect(weighted.get('rel-ctf-cdb-sef')).toBeGreaterThan(weighted.get('rel-gef-cdb-sef')!)
    expect(weighted.has('rel-idb-cdb-sef')).toBe(false)
    expect(weighted.has('rel-eib-cdb')).toBe(false)
    expect(weighted.has('test-insurance')).toBe(false)
  })
  it('detects registry aliases and candidate names before intake', () => {
    const index = createIndex(seed)
    expect(duplicateName('FirstCaribbean International Bank', index, seedCandidates)).toBe(true)
    expect(duplicateName('  nrstor caribbean  ', index, seedCandidates)).toBe(true)
    expect(duplicateName('Test candidate only', index, seedCandidates)).toBe(false)
  })
})

describe('climate scope', () => {
  it('classifies all existing entities and relationships with grounded assessments', () => {
    const index = createIndex(seed)
    expect(index.entities.filter(entity => entity.scope.status === 'CORE')).toHaveLength(71)
    expect(index.entities.filter(entity => entity.scope.status === 'SUPPORTING')).toHaveLength(10)
    expect(index.entities.filter(entity => entity.scope.status === 'OUT_OF_SCOPE')).toHaveLength(12)
    for (const entity of index.entities) {
      expect(entity.scope.rationale).toBeTruthy()
      expect(entity.scope.evidenceIds.some(id => index.evidence.get(id)?.status === 'verified')).toBe(true)
    }
    for (const edge of index.relationshipList) expect(edge.scopeRationale).toBeTruthy()
    expect(index.entityById.get('guardian')?.scope.status).toBe('OUT_OF_SCOPE')
    expect(index.entityById.get('cibc')?.scope.status).toBe('CORE')
  })

  it('validates scope evidence, theme tags and thematic relationship endpoints', () => {
    const data = structuredClone(seed)
    const core = data.institutions.find(entity => entity.id === 'cdb')!
    core.scope.evidenceIds = ['missing-scope-source']
    core.themes = ['energy_transition', 'energy_transition']
    data.relationships.find(edge => edge.id === 'rel-sagicor-life')!.themes = ['climate_adaptation']
    const errors = validateAtlas(data)
    expect(errors).toContainEqual(expect.stringContaining('cdb scope references missing source'))
    expect(errors).toContainEqual(expect.stringContaining('cdb has missing, unknown or duplicate theme tags'))
    expect(errors).toContainEqual(expect.stringContaining('rel-sagicor-life requires a core endpoint'))
  })

  it('combines multi-value thematic tags with relationship types and name search', () => {
    const index = createIndex(seed)
    const energy = selectNetwork(index, { ...emptyFilters, theme: 'energy_transition' })
    const mitigation = selectNetwork(index, { ...emptyFilters, theme: 'climate_mitigation' })
    expect(energy.edges.every(edge => edge.themes.includes('energy_transition'))).toBe(true)
    expect(energy.edges).toHaveLength(25)
    expect(energy.entities.some(entity => entity.id === 'enertur')).toBe(true)
    expect(energy.entities.some(entity => entity.id === 'ccrif')).toBe(false)
    expect(mitigation.entities.some(entity => entity.id === 'enertur')).toBe(true)
    const filtered = selectNetwork(index, { ...emptyFilters, theme: 'climate_adaptation', relationship: 'LENDS_TO', search: 'EIB' })
    expect(filtered.entities.map(entity => entity.id)).toEqual(['eib'])
    expect(filtered.edges).toEqual([])
  })

  it('keeps institution roles distinct from what its participants do in an edge', () => {
    const index = createIndex(seed)
    const cdb = index.entityById.get('cdb')!
    expect(cdb.roles).toEqual(expect.arrayContaining(['fund_manager', 'financial_intermediary', 'diversified_financier']))
    expect(comparisonValues(cdb, 'Financial roles', index)).toContain('Fund manager')
    expect(index.direct.get(cdb.id)?.find(edge => edge.id === 'rel-idb-cdb-sef')?.participantRoles.target)
      .toBe('Borrower and downstream lender')
  })

  it('shows core entities and only the supporting nodes attached by relevant edges by default', () => {
    const index = createIndex(seed)
    const focused = selectNetwork(index, emptyFilters)
    expect(focused.entities).toHaveLength(76)
    expect(focused.edges).toHaveLength(87)
    const supporting = focused.entities.filter(entity => entity.scope.status === 'SUPPORTING')
    expect(supporting.map(entity => entity.id)).toEqual(['caricom', 'enertur', 'jamaica-gov', 'edc', 'barbados-water-authority'])
    expect(focused.entities.every(entity => entity.scope.status !== 'OUT_OF_SCOPE')).toBe(true)
    expect(focused.edges.every(edge => edge.themes.length > 0)).toBe(true)
  })

  it('expands to all registry entities and relationships with their original record fields', () => {
    const index = createIndex(seed)
    const full = selectNetwork(index, emptyFilters, true)
    expect(full.entities).toHaveLength(93)
    expect(full.edges).toHaveLength(102)
    expect(full.entities).toMatchObject([...institutions, ...vehicles])
    expect(full.edges).toMatchObject(relationships)
    expect([...index.evidence.values()].slice(0, sources.length)).toEqual(sources)
    expect(full.entities.find(entity => entity.id === 'ppp')?.scope.status).toBe('SUPPORTING')
    expect(full.edges.some(edge => edge.id === 'rel-cdb-ppp')).toBe(true)
  })

  it('adds new research candidates to existing queues and preserves saved reviews', () => {
    const saved = { ...seedCandidates.find(candidate => candidate.id === 'candidate-nrstor-caribbean')!, decision: 'rejected' }
    const queue = readCandidates({ getItem: (key: string) => key === candidateKey ? JSON.stringify([saved]) : null } as Storage)
    expect(queue[0]).toEqual(saved)
    expect(queue.filter(candidate => candidate.id === saved.id)).toHaveLength(1)
    expect(queue.find(candidate => candidate.id === 'candidate-ccrf')?.decision).toBe('approved')
  })

  it('promotes published candidates even when an older browser cached the untouched queue', () => {
    const storage = { getItem: () => JSON.stringify(rawCandidates) } as unknown as Storage
    const queue = readCandidates(storage)
    const index = createIndex(seed)
    const published = Object.values(candidateReviews).flatMap(review => review?.publishedEntityId ?? [])
    expect(published).toHaveLength(15)
    expect(published.every(id => index.entityById.get(id)?.scope.status === 'CORE')).toBe(true)
    expect(queue.filter(candidate => candidate.decision === 'rejected').map(candidate => candidate.id)).toEqual(['candidate-mpc-capital'])
    expect(queue.filter(candidate => candidate.decision === 'pending')).toHaveLength(2)
  })

  it('keeps sleeve-level investment and risk coverage attached to the documented counterpart', () => {
    const index = createIndex(seed)
    const edge = (id: string) => index.relationshipList.find(relationship => relationship.id === id)
    expect(edge('rel-ifc-ccrf-debt')?.target).toBe('ccrf-debt')
    expect(edge('rel-idbi-ccrf-equity')?.target).toBe('ccrf-equity')
    expect(edge('rel-world-bank-jamaica-cover')?.amount?.status).toBe('insurance_limit')
    expect(edge('rel-cibc-barbados-blue')?.amount).toBeUndefined()
    expect(edge('rel-idb-barbados-blue')?.amount?.status).toBe('guarantee_limit')
  })
})

