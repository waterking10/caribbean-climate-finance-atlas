import { beforeAll, describe, expect, it } from 'vitest'
import { localRepository } from '../src/repository'
import { loadCapitalResearch } from '../src/capital-research'
import { pathwayRelationshipGroups } from '../src/capital-research-model'
import { relationshipTypes } from '../src/model'
import { createIndex, emptyFilters, edgeWeights } from '../src/selectors'
import { createExplorationIndex, reachableIds, selectExploration } from '../src/exploration'
import type { ExplorationIndex, ExplorationSettings } from '../src/exploration'
import { relationshipFamilies, relationshipFamily, relationshipFamilyByType } from '../src/relationship-taxonomy'
import type { RelationshipFamily } from '../src/relationship-taxonomy'

let index: ExplorationIndex
beforeAll(async () => {
  const atlas = await localRepository.load()
  index = createExplorationIndex(createIndex(atlas), loadCapitalResearch(atlas))
})
const defaults: ExplorationSettings = {
  mode: 'pathways', root: 'energy-smart-ii', pathwayId: 'energy-smart-ii', depth: 'full',
  fullNetwork: false, showAllMatching: false, groups: Object.keys(relationshipFamilies) as RelationshipFamily[],
}
const select = (settings: Partial<ExplorationSettings> = {}, filters = emptyFilters) => selectExploration(index, filters, { ...defaults, ...settings })

describe('relationship taxonomy and documented traversal', () => {
  it('classifies every registry and research type and preserves explicit exceptions', () => {
    for (const type of [...relationshipTypes, ...Object.keys(pathwayRelationshipGroups)]) expect(relationshipFamilyByType).toHaveProperty(type)
    expect(relationshipFamily('MANAGES')).toBe('management')
    expect(relationshipFamily('ADMINISTERS')).toBe('management')
    expect(relationshipFamily('APPROVES_FINANCING_FOR')).toBe('decision')
    expect(relationshipFamily('GUARANTEES')).toBe('risk')
    expect(relationshipFamily('TARGETS')).toBe('review')
    expect(relationshipFamily('STRATEGIC_PARTNER')).toBe('review')
  })
  it('retains the original ecosystem and full registry views', () => {
    const core = select({ mode: 'ecosystem' })
    expect(core.nodes).toHaveLength(76); expect(core.edges).toHaveLength(87)
    const full = select({ mode: 'ecosystem', fullNetwork: true })
    expect(full.nodes).toHaveLength(93); expect(full.edges).toHaveLength(102)
    expect(full.nodes.every(node => node.entity)).toBe(true)
  })
  it('bounds direct and two-hop discovery and includes documented parallel branches at full depth', () => {
    const direct = select({ depth: 'direct' })
    const two = select({ depth: 'two' })
    expect(direct.edges.every(edge => edge.source === 'energy-smart-ii' || edge.target === 'energy-smart-ii')).toBe(true)
    expect(direct.nodes.some(node => node.id === 'idb')).toBe(true) // documented oversight link
    expect(two.nodes.length).toBeGreaterThan(direct.nodes.length)
    expect(two.nodes.some(node => node.id === 'eu')).toBe(true)
    const full = select({ pathwayId: 'surge', root: 'surge' })
    expect(full.edges.some(edge => edge.claims.some(claim => claim.link.id === 'surge.gcf-parallel'))).toBe(true)
    const star = index.edges.filter(edge => edge.source === 'energy-smart-ii' || edge.target === 'energy-smart-ii')
    expect(reachableIds(star, 'energy-smart-ii', 'direct').has('eu')).toBe(false)
  })
  it('combines OR within a dimension with AND between dimensions without duplicate identities', () => {
    const view = select({}, { ...emptyFilters, family: ['management', 'decision'], theme: ['energy_transition', 'climate_mitigation'], geography: ['barbados'] })
    expect(view.edges.length).toBeGreaterThan(0)
    expect(view.edges.every(edge => ['management', 'decision'].includes(relationshipFamily(edge.type)))).toBe(true)
    expect(new Set(view.nodes.map(node => node.id)).size).toBe(view.nodes.length)
    const roles = select({ mode: 'institutions', root: 'cdb' }, { ...emptyFilters, role: ['fund_manager', 'capital_provider'] })
    expect(roles.matches.filter(node => node.id === 'cdb')).toHaveLength(1)
    expect(select({}, { ...emptyFilters, geography: 'jamaica' }).nodes).toEqual([])
  })
  it('prunes orphans after filters and legend gates but retains inventory and the opt-in override', () => {
    const view = select({ mode: 'ecosystem' }, { ...emptyFilters, search: 'Energy Smart' })
    expect(view.matches.map(node => node.id)).toEqual(['energy-smart-ii'])
    expect(view.nodes).toEqual([]); expect(view.hiddenCount).toBe(1)
    expect(select({ mode: 'ecosystem', showAllMatching: true }, { ...emptyFilters, search: 'Energy Smart' }).nodes).toHaveLength(1)
    const hidden = select({ groups: ['risk'] })
    expect(hidden.nodes).toEqual([])
  })
  it('deduplicates explicitly linked claims and exposes only verified research links', () => {
    const view = select()
    expect(view.edges.filter(edge => edge.id === 'rel-egfl-energy-smart-ii')).toHaveLength(1)
    for (const edge of index.edges) for (const claim of edge.claims) expect(claim.link.status).toBe('verified')
    for (const edge of index.edges.filter(edge => !edge.atlas)) {
      expect(edge.claims).toHaveLength(1)
      expect(edge.source).toBe(edge.claims[0].link.source); expect(edge.target).toBe(edge.claims[0].link.target)
    }
    const research = structuredClone(index.research)
    const firstLink = research.pathways[0].links[0]
    firstLink.status = 'reported'
    const restricted = createExplorationIndex(index.atlas, research)
    expect(restricted.edges.some(edge => edge.claims.some(claim => claim.link.id === firstLink.id))).toBe(false)
    expect(research.pathways[0].links[0].status).toBe('reported')
  })
  it.each(['energy-smart-ii', 'surge', 'barbados-blue-loan'])('exposes original capital, administration, authority and evidence for %s', id => {
    const path = index.research.pathways.find(path => path.id === id)!
    const view = select({ pathwayId: id, root: path.mechanismId })
    const claims = view.edges.flatMap(edge => edge.claims.filter(claim => claim.path.id === id))
    for (const origin of path.origins) expect(claims.some(claim => claim.link.id === origin.linkId)).toBe(true)
    expect(claims.some(claim => relationshipFamily(claim.link.type) === 'management')).toBe(true)
    expect(claims.some(claim => relationshipFamily(claim.link.type) === 'decision')).toBe(true)
    for (const claim of claims) expect(claim.link.evidenceIds.length).toBeGreaterThan(0)
    expect(path.gaps.length).toBeGreaterThan(0)
    // Following a provider keeps the same documented case, including its evidence.
    const next = select({ pathwayId: id, root: path.origins[0].providerId, depth: 'direct' })
    expect(next.path?.id).toBe(id)
    expect(next.edges.length).toBeGreaterThan(0)
  })
  it('preserves Blue Loan risk beneficiaries and separates risk from amount weighting', () => {
    const view = select({ pathwayId: 'barbados-blue-loan', root: 'barbados-blue-loan' })
    const risk = view.edges.filter(edge => relationshipFamily(edge.type) === 'risk')
    expect(risk.some(edge => edge.claims.some(claim => claim.link.beneficiaryIds?.includes('bb-blue-dac')))).toBe(true)
    expect(edgeWeights(risk, 'USD · Commitment').size).toBe(0)
    expect(view.nodes.some(node => node.id === 'blue-investors' && !node.entity)).toBe(true)
    const capital = select({ pathwayId: 'barbados-blue-loan', root: 'barbados-blue-loan' }, { ...emptyFilters, capitalType: ['bond_investor', 'commercial_bank'] })
    expect(capital.matches.map(node => node.id)).toEqual(expect.arrayContaining(['blue-investors', 'cibc-barbados-bank']))
    expect(capital.matches.some(node => node.id === 'tnc')).toBe(false)
    expect(capital.edges.some(edge => edge.type === 'SUBSCRIBES_TO')).toBe(true)
    expect(capital.nodes.some(node => node.id === 'bb-blue-dac')).toBe(true)
    // CDB is a provider elsewhere, but is not an origin for this Canadian SuRGE capital.
    expect(select({ pathwayId: 'surge', root: 'surge' }, { ...emptyFilters, capitalType: 'multilateral' }).matches.some(node => node.id === 'cdb')).toBe(false)
  })
  it('does not mutate any registry, pathway, observation, evidence or question while exploring', () => {
    const before = JSON.stringify([index.atlas.entities, index.atlas.relationshipList, index.research])
    for (const depth of ['direct', 'two', 'full'] as const) for (const mode of ['pathways', 'institutions', 'ecosystem'] as const) select({ depth, mode })
    expect(JSON.stringify([index.atlas.entities, index.atlas.relationshipList, index.research])).toBe(before)
  })
})
