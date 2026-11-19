import { beforeAll, describe, expect, it } from 'vitest'
import { localRepository } from '../src/repository'
import { createIndex, emptyFilters, filterOptions, selectEntities } from '../src/selectors'
import type { AtlasIndex } from '../src/selectors'
import { entityCategories, entityCategory, institutionTypeGroup, institutionTypeGroups } from '../src/entity-taxonomy'
import { createExplorationIndex, selectExploration } from '../src/exploration'
import { loadCapitalResearch } from '../src/capital-research'
import { relationshipFamilies } from '../src/relationship-taxonomy'
import type { RelationshipFamily } from '../src/relationship-taxonomy'

let index:AtlasIndex
beforeAll(async () => {index=createIndex(await localRepository.load())})
describe('entity-form display taxonomy', () => {
  it('covers the whole preserved registry once and reduces detailed types to ten groups', () => {
    expect(index.entities).toHaveLength(93)
    const rawTypes=Object.values(institutionTypeGroups).flatMap(group => [...group.types])
    expect(new Set(rawTypes).size).toBe(rawTypes.length)
    for (const entity of index.entities) expect(institutionTypeGroup(entity.type),entity.id).toBeDefined()
    expect(filterOptions(index).type).toHaveLength(10)
  })
  it('uses entity forms rather than climate themes for all former climate-category records', () => {
    expect(entityCategories).not.toHaveProperty('climate')
    for (const [id,category] of [['gcf','funds'],['energy-smart-ii','funds'],['surge','funds'],
      ['barbados-blue-loan','funds'],['ccccc','public'],['tnc','nonprofit'],['cbf','nonprofit'],['ccsa','nonprofit']] as const)
      expect(entityCategory(index.entityById.get(id)!)).toBe(category)
    expect(index.entityById.get('ccsa')!.ownership).toBe('Unknown')
    expect(index.entityById.get('gcf')!.type).toBe('Multilateral climate fund')
  })
  it('matches different development-bank descriptions through one filter while retaining exact-type compatibility', () => {
    const ids=selectEntities(index,{...emptyFilters,type:['development_finance']}).map(entity=>entity.id)
    for (const id of ['cdb','idb','world-bank','eib','dbj','findev','fmo','kfw','dfc']) expect(ids).toContain(id)
    expect(ids).not.toContain('gcf'); expect(ids).not.toContain('rbc')
    expect(selectEntities(index,{...emptyFilters,type:'Development bank'}).map(entity=>entity.id)).toEqual(expect.arrayContaining(['cdb','idb','eib']))
  })
  it('combines type groups with OR and sectors with AND without duplicating identities', () => {
    const result=selectEntities(index,{...emptyFilters,type:['development_finance','commercial_bank'],sector:['energy']})
    // Sector IDs are explicit dataset tags; arbitrary or absent tags must never widen results.
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(entity=>entity.sectors.includes('energy'))).toBe(true)
    expect(selectEntities(index,{...emptyFilters,type:['fund_trust'],sector:['nonexistent-sector']})).toEqual([])
    const broad=selectEntities(index,{...emptyFilters,type:['development_finance','commercial_bank']})
    expect(broad.map(entity=>entity.id)).toEqual(expect.arrayContaining(['cdb','rbc','cibc']))
    expect(new Set(broad.map(entity=>entity.id)).size).toBe(broad.length)
  })
  it('applies the consolidated type in focused exploration while preserving documented counterparties', async () => {
    const atlas=await localRepository.load()
    const exploration=createExplorationIndex(index,loadCapitalResearch(atlas))
    const view=selectExploration(exploration,{...emptyFilters,type:['fund_manager']},{mode:'pathways',root:'energy-smart-ii',
      pathwayId:'energy-smart-ii',depth:'full',fullNetwork:false,showAllMatching:false,
      groups:Object.keys(relationshipFamilies) as RelationshipFamily[]})
    expect(view.matches.map(node=>node.id)).toEqual(['egfl'])
    expect(view.nodes.map(node=>node.id)).toContain('energy-smart-ii')
    expect(view.edges.some(edge=>edge.type==='MANAGES' && edge.source==='egfl')).toBe(true)
  })
})
