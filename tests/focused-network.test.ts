import { beforeAll, describe, expect, it } from 'vitest'
import { localRepository } from '../src/repository'
import { loadCapitalResearch } from '../src/capital-research'
import { createIndex } from '../src/selectors'
import { createFocusedIndex, focusedEmptyFilters, groupConnections, isInstitutionNode, memberInstruments, observationsFor, pathwayManagers, searchFocused, selectFocusedNetwork } from '../src/focused-network'
import type { FocusedIndex } from '../src/focused-network'
import type { AtlasData } from '../src/model'
import type { ExplorationEdge } from '../src/exploration'
import { readAtlasRoute } from '../src/App'
import { extendFocusedPositions, layoutFocusedGraph } from '../src/components/FocusedNetworkGraph'

let atlas:AtlasData
let index:FocusedIndex
beforeAll(async()=>{atlas=await localRepository.load();index=createFocusedIndex(createIndex(atlas),loadCapitalResearch(atlas))})
const select=(filters=focusedEmptyFilters,roots:string[]=[],two=false,path='')=>selectFocusedNetwork(index,filters,roots,two,path)

describe('focused relationship explorer',()=>{
  it('starts with at most twelve connected institutional participants and no case-mechanism canvas inventory',()=>{
    const view=select()
    expect(view.nodes.length).toBeGreaterThan(3);expect(view.nodes.length).toBeLessThanOrEqual(12)
    expect(view.nodes.every(node=>isInstitutionNode(node,index.research))).toBe(true)
    for(const node of view.nodes)expect(view.connections.some(edge=>edge.source===node.id||edge.target===node.id)).toBe(true)
    for(const id of ['energy-smart-ii','surge','barbados-blue-loan'])expect(view.nodes.some(node=>node.id===id)).toBe(false)
    expect(view.nodes.some(node=>node.id==='cdb')).toBe(true)
  })
  it('has a deterministic default selection independent of registry ordering',()=>{
    const reverse={...atlas,institutions:[...atlas.institutions].reverse(),vehicles:[...atlas.vehicles].reverse(),relationships:[...atlas.relationships].reverse()}
    const other=createFocusedIndex(createIndex(reverse),loadCapitalResearch(reverse))
    expect(other.defaultIds).toEqual(index.defaultIds)
    expect(other.rank).toEqual(index.rank)
  })
  it('does not boost relevance using arbitrary generic institutional relationships',()=>{
    const extra=structuredClone(atlas)
    for(let n=0;n<100;n++)extra.relationships.push({...atlas.relationships[0],id:'generic-'+n,type:'OWNS',source:'cdb',target:'idb',themes:['energy_transition']})
    const other=createFocusedIndex(createIndex(extra),loadCapitalResearch(extra))
    expect(other.rank.find(row=>row.id==='cdb')).toEqual(index.rank.find(row=>row.id==='cdb'))
    expect(other.defaultIds).toEqual(index.defaultIds)
  })
  it('never projects an indirect mechanism connection into bilateral financing',()=>{
    for(const group of index.connections)for(const member of group.members){
      expect([member.source,member.target].sort()).toEqual([group.source,group.target].sort())
      expect(index.edges.some(edge=>edge.id===member.id&&edge.source===member.source&&edge.target===member.target)).toBe(true)
    }
    expect(index.connections.some(edge=>edge.source==='idb'&&edge.target==='egfl')).toBe(false)
  })
  it('groups compatible direction and families but preserves exact types and original records',()=>{
    const group=index.connections.find(edge=>edge.source==='gac'&&edge.target==='cdb'&&edge.family==='capital')!
    expect(group.types).toEqual(['GRANTS_TO','LENDS_TO'])
    expect(group.arrangementCount).toBe(1)
    expect(group.members).toHaveLength(2)
    expect(group.pathwayIds).toEqual(['surge'])
    const template=group.members[0]
    const risk={...template,id:'risk-only',type:'GUARANTEES'}
    const reverse={...template,id:'reverse-only',source:template.target,target:template.source}
    expect(groupConnections([template,risk,reverse])).toHaveLength(3)
  })
  it('counts distinct cases rather than counting duplicate research references as arrangements',()=>{
    const edge=index.edges.find(edge=>edge.id==='rel-cdb-surge')!
    expect(index.edges.filter(item=>item.id===edge.id)).toHaveLength(1)
    expect(groupConnections([edge])[0].arrangementCount).toBe(1)
    expect(groupConnections([edge])[0].types).toEqual(['ADMINISTERS','MANAGES'])
  })
  it('reveals complete original cases only on expansion, including parallel branches',()=>{
    for(const id of ['energy-smart-ii','surge','barbados-blue-loan']){
      const path=index.pathById.get(id)!
      const view=select(focusedEmptyFilters,[],false,id)
      for(const link of path.links.filter(link=>link.status==='verified'))expect(view.connections.some(connection=>connection.members.some(member=>member.claims.some(claim=>claim.path.id===id&&claim.link.id===link.id)))).toBe(true)
      expect(new Set(view.nodes.map(node=>node.id)).size).toBe(view.nodes.length)
    }
    expect(select(focusedEmptyFilters,[],false,'surge').connections.some(edge=>edge.members.some(member=>member.claims.some(claim=>claim.link.id==='surge.gcf-parallel')))).toBe(true)
  })
  it('finds institutions, aliases, research actors and mechanisms outside the default view',()=>{
    expect(searchFocused(index,'CDB').some(record=>record.id==='cdb')).toBe(true)
    expect(searchFocused(index,'FirstCaribbean').some(record=>record.id==='cibc')).toBe(true)
    for(const [query,id] of [['Energy Smart','energy-smart-ii'],['SuRGE','surge'],['Barbados Blue Loan','barbados-blue-loan']])expect(searchFocused(index,query).some(record=>record.pathwayId===id)).toBe(true)
    expect(searchFocused(index,'BB Blue Financing').some(record=>record.id==='bb-blue-dac')).toBe(true)
  })
  it('defaults to direct links and supports one bounded two-hop expansion',()=>{
    const direct=select(focusedEmptyFilters,['cdb'])
    expect(direct.connections.every(edge=>edge.source==='cdb'||edge.target==='cdb')).toBe(true)
    const two=select(focusedEmptyFilters,['cdb'],true)
    expect(two.nodes.length).toBeGreaterThan(direct.nodes.length)
    const neighbors=new Set(['cdb',...direct.nodes.map(node=>node.id)])
    expect(two.connections.every(edge=>neighbors.has(edge.source)||neighbors.has(edge.target))).toBe(true)
  })
  it('combines supported primary and advanced filters and prunes all isolated nodes',()=>{
    const filters={...focusedEmptyFilters,family:'capital',geography:'barbados',theme:'energy_transition',institutionType:'development_finance',ownership:'Multilateral',instrument:'loan'}
    const view=select(filters,[],false,'energy-smart-ii')
    expect(view.connections.length).toBeGreaterThan(0)
    expect(view.connections.every(edge=>edge.family==='capital')).toBe(true)
    for(const node of view.nodes)expect(view.connections.some(edge=>edge.source===node.id||edge.target===node.id)).toBe(true)
    expect(select({...filters,geography:'jamaica'},[],false,'energy-smart-ii').nodes).toEqual([])
    expect(select({...focusedEmptyFilters,family:'risk'},[],false,'surge').nodes).toEqual([])
  })
  it('provides instruments only from documented links/amounts and normalizes duplicate labels',()=>{
    const instruments=index.relevant.flatMap(memberInstruments)
    expect(instruments).toContain('loan');expect(instruments).toContain('guarantee')
    expect(instruments).not.toContain('Loan')
  })
  it('retains separate loan and grant measures without an invented sum',()=>{
    const group=index.connections.find(edge=>edge.source==='gac'&&edge.target==='cdb'&&edge.family==='capital')!
    const observations=observationsFor(index,group.members)
    expect(observations.map(row=>row.value)).toEqual(expect.arrayContaining([53000000,5500000]))
    expect(observations.some(row=>row.value===58500000)).toBe(false)
    expect(new Set(observations.map(row=>row.id)).size).toBe(observations.length)
    expect(observationsFor(index,[],index.pathById.get('barbados-blue-loan')).some(row=>row.measure==='Guarantee coverage')).toBe(true)
  })
  it('keeps verified research nodes tied to original claims without creating verified actor profiles',()=>{
    const view=select(focusedEmptyFilters,[],false,'barbados-blue-loan')
    expect(view.nodes.find(node=>node.id==='bb-blue-dac')?.entity).toBeUndefined()
    expect(view.connections.flatMap(edge=>edge.members).flatMap(edge=>edge.claims).every(claim=>claim.link.status==='verified')).toBe(true)
  })
  it('does not promote downstream fund administration to administration of the parent financing mechanism',()=>{
    expect(pathwayManagers(index.pathById.get('energy-smart-ii')!)).toEqual(['egfl'])
    expect(pathwayManagers(index.pathById.get('surge')!)).toEqual(['cdb'])
    expect(pathwayManagers(index.pathById.get('barbados-blue-loan')!)).toEqual([])
    expect(index.pathById.get('barbados-blue-loan')!.links.some(link=>link.type==='ADMINISTERS'&&link.source==='besf-secretariat'&&link.target==='besf')).toBe(true)
    expect(searchFocused(index,'Eligible CDB water')[0].type).toBe('Research actor · recipient group')
  })
  it('preserves all research JSON objects through indexing, aggregation, filtering and observation selection',()=>{
    const before=JSON.stringify([atlas,index.research])
    for(const path of index.research.pathways){select(focusedEmptyFilters,[],false,path.id);observationsFor(index,[],path)}
    searchFocused(index,'climate');select({...focusedEmptyFilters,family:'risk'})
    expect(JSON.stringify([atlas,index.research])).toBe(before)
  })
  it('uses stable finite nonoverlapping layout coordinates',()=>{
    const view=select()
    const first=layoutFocusedGraph(view.nodes,view.connections)
    expect(layoutFocusedGraph(view.nodes,view.connections)).toEqual(first)
    for(const [id,position] of first){expect(Number.isFinite(position.x)&&Number.isFinite(position.y)).toBe(true);for(const [otherId,other]of first)if(id!==otherId)expect(Math.abs(position.x-other.x)>100||Math.abs(position.y-other.y)>50).toBe(true)}
  })
  it('retains existing positions while placing new participants clear of existing labels',()=>{
    const preserved=new Map([['cdb',{x:200,y:200}]])
    const proposed=new Map([['cdb',{x:20,y:20}],['new-bank',{x:200,y:200}],['another-bank',{x:200,y:200}]])
    const positioned=extendFocusedPositions(proposed,preserved)
    expect(positioned.get('cdb')).toEqual({x:200,y:200})
    for(const [id,p]of positioned)for(const [otherId,q]of positioned)if(id!==otherId)expect(Math.abs(p.x-q.x)>=135||Math.abs(p.y-q.y)>=100).toBe(true)
  })
  it('parses shareable profiles and preserves legacy public pages safely',()=>{
    for(const page of ['network','compare','about'])expect(readAtlasRoute('#'+page)).toEqual({kind:page})
    expect(readAtlasRoute('#institution/cdb')).toEqual({kind:'institution',id:'cdb'})
    const group=index.connections[0]
    expect(readAtlasRoute('#relationship/'+encodeURIComponent(group.id))).toEqual({kind:'relationship',id:group.id})
    expect(readAtlasRoute('#mechanism/energy-smart-ii')).toEqual({kind:'mechanism',id:'energy-smart-ii'})
    expect(readAtlasRoute('#institution/%E0%A4%A')).toEqual({kind:'network'})
  })
})
