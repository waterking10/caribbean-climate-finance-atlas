import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react'
import type { FocusedFilters, FocusedIndex } from '../focused-network'
import { focusedEmptyFilters, hasFinancingParticipation, isInstitutionNode, memberInstruments, primaryFamilies, searchFocused, selectFocusedNetwork } from '../focused-network'
import { institutionTypeGroups } from '../entity-taxonomy'
import { themes } from '../model'
import { displayName } from '../selectors'
import { CompactConnection, CompactInstitution, CompactPathway, profileHref } from './CompactPanels'
import { connectionColors, FocusedNetworkGraph } from './FocusedNetworkGraph'

export interface FocusRequest { id?:string; pathwayId?:string; token:number }
interface Props { index:FocusedIndex; hidden:boolean; request?:FocusRequest; picked:string[]; onCompare:(id:string)=>void }
export function FocusedExplorer({index,hidden,request,picked,onCompare}:Props) {
  const [query,setQuery]=useState('')
  const [allResults,setAllResults]=useState(false)
  const [mobileNodes,setMobileNodes]=useState(false)
  const [filters,setFilters]=useState<FocusedFilters>(focusedEmptyFilters)
  const [roots,setRoots]=useState<string[]>([])
  const [twoHops,setTwoHops]=useState(false)
  const [selectedNode,setSelectedNode]=useState('')
  const [selectedConnection,setSelectedConnection]=useState('')
  const [arrangement,setArrangement]=useState('')
  const [expandedPath,setExpandedPath]=useState('')
  const previous=useRef<{roots:string[];twoHops:boolean;selectedNode:string;selectedConnection:string;arrangement:string;query:string;filters:FocusedFilters}|null>(null)
  const view=useMemo(()=>selectFocusedNetwork(index,filters,roots,twoHops,expandedPath),[index,filters,roots,twoHops,expandedPath])
  const searchResults=useMemo(()=>searchFocused(index,query),[index,query])
  const connection=view.connections.find(edge=>edge.id===selectedConnection)
  const node=index.nodes.get(selectedNode)
  const path=index.pathById.get(arrangement)
  const activeCount=Object.values(filters).filter(Boolean).length
  const instruments=[...new Set(index.relevant.flatMap(memberInstruments))].sort()
  function chooseNode(id:string) {setSelectedNode(id);setSelectedConnection('');setArrangement(id===view.path?.mechanismId?expandedPath:'')}
  function chooseConnection(id:string){setSelectedConnection(id);setSelectedNode('');setArrangement('')}
  function expandPath(id:string) {
    if(!expandedPath) previous.current={roots,twoHops,selectedNode,selectedConnection,arrangement,query,filters}
    setExpandedPath(id);setArrangement(id);setSelectedNode('');setSelectedConnection('');setQuery('')
  }
  function focusInstitution(id:string) {
    const institution=index.nodes.get(id)
    if(institution&&isInstitutionNode(institution,index.research)&&!hasFinancingParticipation(index,id)) {
      window.location.hash=profileHref('institution',id);return
    }
    setExpandedPath('');setArrangement('');setRoots(institution&&isInstitutionNode(institution,index.research)&&!index.defaultIds.includes(id)?[]:[id]);setSelectedNode(id);setSelectedConnection('');setQuery('');setTwoHops(false)
  }
  function returnToNetwork(){
    const prior=previous.current
    if(prior){setRoots(prior.roots);setTwoHops(prior.twoHops);setSelectedNode(prior.selectedNode);setSelectedConnection(prior.selectedConnection);setArrangement(prior.arrangement);setQuery(prior.query);setFilters(prior.filters)}
    else {setRoots([]);setSelectedNode('');setSelectedConnection('');setArrangement('')}
    setExpandedPath('');previous.current=null
  }
  useEffect(()=>{
    if(!request) return
    if(request.pathwayId) expandPath(request.pathwayId)
    else if(request.id) focusInstitution(request.id)
  },[request?.token])
  useEffect(()=>{
    if(!hidden && (selectedNode||selectedConnection||arrangement) && window.matchMedia('(max-width: 660px)').matches) {
      const frame=requestAnimationFrame(()=>document.querySelector('.focused-explore .compact-panel')?.scrollIntoView({block:'start',behavior:'auto'}))
      return ()=>cancelAnimationFrame(frame)
    }
  },[selectedNode,selectedConnection,arrangement,hidden])
  useEffect(()=>{
    if(!hidden&&expandedPath){
      const frame=requestAnimationFrame(()=>document.querySelector('.focused-explore .focused-network')?.scrollIntoView({block:'start',behavior:'auto'}))
      return ()=>cancelAnimationFrame(frame)
    }
  },[expandedPath,hidden])
  function filterControl(key:keyof FocusedFilters,label:string,options:[string,string][],all:string){
    return <label className="focused-filter" key={key}><span>{label}</span><select aria-label={label} value={filters[key]} onChange={event=>{setFilters({...filters,[key]:event.target.value});setSelectedConnection('')}}>
      <option value="">{all}</option>{options.map(([id,name])=><option value={id} key={id}>{name}</option>)}
    </select></label>
  }
  return <main className="atlas-page focused-explore" id="explore-main" hidden={hidden}>
    <header className="focused-intro"><div><h1>Network explorer</h1><p>Discover the institutions and arrangements financing the Caribbean’s climate transition.</p></div><a href="#about" className="methodology-link">About the research <ArrowRight size={14}/></a></header>
    <div className="focused-search-area">
      <label className="focused-search"><Search size={20}/><input type="search" aria-label="Search institutions, funds and mechanisms" placeholder="Search an institution, fund or mechanism…" value={query} onChange={event=>{setQuery(event.target.value);setAllResults(false)}}/>{query&&<button type="button" aria-label="Clear search" onClick={()=>setQuery('')}><X size={18}/></button>}</label>
      {query&&<div className="focused-search-results panel" role="region" aria-label="Search results"><p aria-live="polite">{searchResults.length} matching records · searches the full research registry</p>
        <ul>{searchResults.slice(0,allResults?undefined:12).map(result=><li key={result.id}><button type="button" onClick={()=>result.pathwayId?expandPath(result.pathwayId):focusInstitution(result.id)}><strong>{result.name}</strong><small>{result.type}</small></button></li>)}</ul>
        {searchResults.length>12&&!allResults&&<button className="text-button" type="button" onClick={()=>setAllResults(true)}>Show all {searchResults.length} results</button>}
        {searchResults.length===0&&<p>Try an official name, acronym or alias.</p>}
      </div>}
    </div>
    <div className="focused-layout">
      <aside className="focused-filters panel" aria-label="Network filters"><div className="focused-filter-heading"><h2>Filter connections</h2>{activeCount>0&&<span>{activeCount} active</span>}</div>
        <div className="focused-primary-filters">
          {filterControl('family','Relationship type',primaryFamilies.map(([id,label])=>[id,id==='support'?'Technical & project preparation support':label]),'All financing relationships')}
          {filterControl('geography','Geography',[['regional','Regional / multi-country arrangements'],...index.countries],'All Caribbean')}
          {filterControl('theme','Financing theme',Object.entries(themes).filter(([id])=>index.relevant.some(edge=>edge.atlas?.themes.includes(id as keyof typeof themes)||edge.claims.some(claim=>claim.path.themes.includes(id as keyof typeof themes)))),'All financing themes')}
        </div>
        <details className="focused-advanced"><summary>Advanced filters</summary>
          {filterControl('institutionType','Institution type',Object.entries(institutionTypeGroups).filter(([id])=>index.atlas.entities.some(entity=>institutionTypeGroups[id as keyof typeof institutionTypeGroups].types.some(type=>type===entity.type))).map(([id,group])=>[id,group.label]),'All institution types')}
          {filterControl('ownership','Ownership',[...new Set(index.atlas.entities.map(entity=>entity.ownership))].sort().map(value=>[value,value]),'All ownership classes')}
          {filterControl('instrument','Financing instrument',instruments.map(value=>[value,displayName(value)]),'All documented instruments')}
        </details>
        <button className="focused-reset" type="button" onClick={()=>setFilters({...focusedEmptyFilters})} disabled={activeCount===0}>Reset filters</button>
        <div className="focused-node-list" data-mobile-open={mobileNodes}><h3>{expandedPath?'Participants':'Institutions in view'} <small>{view.nodes.length}</small></h3><button className="focused-mobile-nodes" type="button" aria-expanded={mobileNodes} aria-controls="visible-institutions" onClick={()=>setMobileNodes(!mobileNodes)}>{mobileNodes?'Hide institutions':'Show institutions'}</button><ul id="visible-institutions" aria-label="Visible institutions">{view.nodes.map(item=><li key={item.id}><button type="button" aria-pressed={selectedNode===item.id} onClick={()=>chooseNode(item.id)} title={item.name}><strong>{item.shortName}</strong><small>{item.type}</small></button></li>)}</ul></div>
      </aside>
      <section className="focused-network" aria-label="Climate finance network">
        <div className="focused-network-heading"><div><h2>{view.path?index.nodes.get(view.path.mechanismId)?.shortName??view.path.name:roots.length?roots.map(id=>index.nodes.get(id)?.shortName).join(' + '):'Institutions & capital providers'}</h2><p aria-live="polite">{view.nodes.length} {expandedPath?'participants':'institutions'} · {view.connections.length} connections</p></div>
          {expandedPath?<button type="button" className="on-dark" onClick={returnToNetwork}><ArrowLeft size={14}/> Back to network</button>:<label className="focused-depth"><input type="checkbox" checked={twoHops} disabled={!roots.length&&!index.defaultIds.includes(selectedNode)} onChange={event=>{if(!roots.length&&selectedNode)setRoots([selectedNode]);setTwoHops(event.target.checked)}}/> Include two-hop connections</label>}
        </div>
        {!expandedPath&&roots.length>0&&<button className="focused-overview" type="button" onClick={()=>{setRoots([]);setSelectedNode('');setSelectedConnection('');setArrangement('');setTwoHops(false)}}><ArrowLeft size={12}/> Return to starting view</button>}
        <FocusedNetworkGraph nodes={view.nodes} connections={view.connections} selectedNode={selectedNode} selectedConnection={selectedConnection} scopeKey={expandedPath?'path:'+expandedPath:'network:'+(roots[0]??'overview')} hidden={hidden} onNode={chooseNode} onConnection={chooseConnection} onBackground={()=>{setSelectedNode('');setSelectedConnection('');setArrangement(expandedPath)}}/>
        <div className="focused-legend" aria-label="Relationship legend">{primaryFamilies.map(([id,label])=><span key={id}><i style={{borderColor:connectionColors[id],borderTopStyle:id==='capital'?'solid':id==='risk'||id==='support'?'dotted':'dashed'}}/>{label}</span>)}</div>
        <div className="focused-network-foot"><p>{expandedPath?'Verified documented links; direction describes each relationship. Targeting and oversight do not establish a capital transfer.':roots.length?'Direct documented institutional links. Mechanisms are available in the selection panel.':'All documented direct institutional connections in the Atlas’s climate finance coverage. Expand a mechanism to reveal its other participants. Additional institution profiles remain searchable; this is not a complete regional inventory.'}</p>
          <details><summary>Connections in this view ({view.connections.length})</summary><ul aria-label="Documented connections">{view.connections.map(edge=><li key={edge.id}><button type="button" onClick={()=>chooseConnection(edge.id)}>{index.nodes.get(edge.source)?.shortName} {edge.direction==='mutual'?'↔':'→'} {index.nodes.get(edge.target)?.shortName}<span>{edge.types.map(displayName).join(' · ')} · {edge.arrangementCount} arrangement{edge.arrangementCount===1?'':'s'}</span></button></li>)}</ul></details>
        </div>
      </section>
      {path?<CompactPathway path={path} index={index} expanded={expandedPath===path.id} onExpand={()=>expandPath(path.id)} onNode={chooseNode}/>:connection?<CompactConnection connection={connection} index={index} onNode={chooseNode} onPathway={setArrangement}/>:node?<CompactInstitution node={node} index={index} connections={view.connections} path={view.path} onNode={chooseNode} onConnection={chooseConnection} onExpand={()=>{if(expandedPath){setExpandedPath('');setArrangement('');previous.current=null}setRoots(current=>[...new Set([...current,node.id])]);setTwoHops(false)}} onPathway={setArrangement} onCompare={()=>onCompare(node.id)} compared={picked.includes(node.id)}/>:<aside className="compact-panel panel compact-welcome" aria-label="Selection summary"><div className="compact-eyebrow">Start with a connection</div><h2>Who finances what?</h2><p>Select an institution to see its connections, or select a line to discover the financing arrangements behind it.</p><p className="compact-muted">All qualifying institutions are included. Search also finds funds, mechanisms and other registry records. Zoom in for labels or use the institution list.</p><a className="compact-full" href="#about">Scope & methodology <ArrowRight size={14}/></a></aside>}
    </div>
  </main>
}
