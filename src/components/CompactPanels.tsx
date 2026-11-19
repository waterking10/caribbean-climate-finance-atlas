import { ArrowRight, Building2, Link2 } from 'lucide-react'
import type { CapitalPathway } from '../capital-research-model'
import type { ExplorationNode } from '../exploration'
import type { Connection, FinancialObservation, FocusedIndex } from '../focused-network'
import { associatedPaths, edgeEvidence, isInstitutionNode, nodeFunction, observationsFor, oneSentence, pathPurpose, pathwayManagers } from '../focused-network'
import { displayName } from '../selectors'
import { relationshipFamilies } from '../relationship-taxonomy'

export const profileHref = (kind:'institution'|'mechanism'|'relationship',id:string) => '#'+kind+'/'+encodeURIComponent(id)
export function ObservationSummary({ observations }: { observations: FinancialObservation[] }) {
  if(observations.length===0) return <p className="compact-muted">Amount not documented for this connection.</p>
  if(observations.length>1) return <p className="compact-muted">{observations.length} financial observations, recorded separately. See details for measures and dates.</p>
  const amount=observations[0]
  return <div className="compact-amount"><strong>{amount.currency} {new Intl.NumberFormat('en').format(amount.value)}</strong><span>{amount.measure} · {amount.stage}</span></div>
}
function SourcesIndicator({ count, href }: {count:number;href:string}) {
  return <a className="compact-evidence" href={href}>{count} supporting source{count===1?'':'s'} <ArrowRight size={12}/></a>
}
export function CompactInstitution({ node,index,connections,path,onNode,onConnection,onExpand,onPathway,onCompare,compared }: {
  node:ExplorationNode;index:FocusedIndex;connections:Connection[];path?:CapitalPathway
  onNode:(id:string)=>void;onConnection:(id:string)=>void;onExpand:()=>void;onPathway:(id:string)=>void;onCompare:()=>void;compared:boolean
}) {
  const priority=(edge:Connection)=>(edge.family==='capital'?10:edge.family==='decision'?6:edge.family==='management'?4:2)+(edge.target===node.id?2:0)
  const immediate=connections.filter(edge=>edge.source===node.id||edge.target===node.id).sort((a,b)=>priority(b)-priority(a)||a.id.localeCompare(b.id))
  const paths=associatedPaths(index,node.id)
  const canExpand=!isInstitutionNode(node,index.research)||index.defaultIds.includes(node.id)
  const claims=path?.links.filter(link=>link.source===node.id||link.target===node.id)??[]
  const roleLabels=[...new Set(claims.map(link=>(link.source===node.id?'':'Recipient / subject of ')+displayName(link.type)))]
  const selectedEdges=index.edges.filter(edge=>edge.claims.some(claim=>claim.path.id===path?.id)&&(edge.source===node.id||edge.target===node.id))
    .map(edge=>({...edge,claims:edge.claims.filter(claim=>claim.path.id===path?.id)}))
  const evidenceIds=new Set([...(node.entity?.evidenceIds??[]),...index.edges.filter(edge=>edge.source===node.id||edge.target===node.id).flatMap(edgeEvidence)])
  return <aside className="compact-panel panel" aria-label="Institution summary">
    <div className="compact-eyebrow"><Building2 size={15}/> {node.entity?'Institution profile':'Research participant'}</div>
    <h2>{node.name}</h2><p className="compact-type">{node.type}</p><p className="compact-function">{nodeFunction(node)}</p>
    {path && <section><h3>Role in this arrangement</h3><p>{roleLabels.length?roleLabels.join(' · '):'Not documented in this arrangement.'}</p>
      {selectedEdges.some(edge=>['capital','risk'].includes(connections.find(connection=>connection.members.some(member=>member.id===edge.id))?.family??'')) && <ObservationSummary observations={observationsFor(index,selectedEdges)}/>}</section>}
    <div className="compact-actions">{canExpand&&<button type="button" className="primary-button" onClick={onExpand}>Expand connections <ArrowRight size={14}/></button>}
      {node.entity&&<button className="text-button" type="button" onClick={onCompare}>{compared?'Remove from comparison':'Compare'}</button>}</div>
    <section><h3>Immediate connections <small>{immediate.length}</small></h3>
      {immediate.length===0?<p className="compact-muted">No direct institutional connection matches this view. Explore an associated mechanism below.</p>:<ul className="compact-list">{immediate.slice(0,5).map(edge=>{
        const other=edge.source===node.id?edge.target:edge.source
        return <li key={edge.id}><button type="button" onClick={()=>onConnection(edge.id)}><strong>{index.nodes.get(other)?.shortName}</strong><span>{edge.types.map(displayName).join(' · ')}</span></button></li>
      })}</ul>}
    </section>
    {paths.length>0&&<section><h3>Associated mechanisms</h3><ul className="compact-list">{paths.slice(0,3).map(item=><li key={item.id}><button type="button" onClick={()=>onPathway(item.id)}>{index.nodes.get(item.mechanismId)?.shortName??item.name}<ArrowRight size={13}/></button></li>)}</ul>{paths.length>3&&<p className="compact-muted">{paths.length-3} more in the full profile.</p>}</section>}
    <SourcesIndicator count={evidenceIds.size} href={profileHref('institution',node.id)}/>
    <a className="compact-full" href={profileHref('institution',node.id)}>See full profile <ArrowRight size={14}/></a>
  </aside>
}
export function CompactConnection({ connection,index,onNode,onPathway }: {connection:Connection;index:FocusedIndex;onNode:(id:string)=>void;onPathway:(id:string)=>void}) {
  const paths=connection.pathwayIds.map(id=>index.pathById.get(id)!).filter(Boolean)
  const description=connection.members[0].atlas?.description??connection.members[0].claims[0]?.link.description??'Documented relationship.'
  return <aside className="compact-panel panel" aria-label="Connection summary">
    <div className="compact-eyebrow"><Link2 size={15}/> Documented connection</div>
    <h2>{index.nodes.get(connection.source)?.shortName} {connection.direction==='mutual'?'↔':'→'} {index.nodes.get(connection.target)?.shortName}</h2>
    <div className="compact-parties"><button type="button" onClick={()=>onNode(connection.source)}>{index.nodes.get(connection.source)?.name}</button><button type="button" onClick={()=>onNode(connection.target)}>{index.nodes.get(connection.target)?.name}</button></div>
    <p className="compact-type">{relationshipFamilies[connection.family]}</p>
    <p className="compact-function">{connection.types.map(displayName).join(' · ')}</p><p>{connection.members.length===1?oneSentence(description):'These records document the listed relationships between these participants. Each arrangement retains its own terms and evidence.'}</p>
    <p className="compact-muted">{connection.arrangementCount} documented arrangement{connection.arrangementCount===1?'':'s'} · {connection.members.length} relationship record{connection.members.length===1?'':'s'}</p>
    {['capital','risk'].includes(connection.family)&&<ObservationSummary observations={observationsFor(index,connection.members)}/>}
    {connection.family==='risk'&&<p className="compact-caution">Risk coverage is contingent protection. It is not a capital transfer.</p>}
    <section><h3>Financing arrangements</h3>{paths.length?<ul className="compact-list">{paths.map(path=><li key={path.id}><button type="button" onClick={()=>onPathway(path.id)}>{index.nodes.get(path.mechanismId)?.shortName??path.name}<span>Inspect arrangement <ArrowRight size={12}/></span></button></li>)}</ul>:<p className="compact-muted">The relationship is documented directly. No separate mechanism profile is linked in the research.</p>}</section>
    <SourcesIndicator count={connection.evidenceIds.length} href={profileHref('relationship',connection.id)}/>
    <a className="compact-full" href={profileHref('relationship',connection.id)}>See relationship details <ArrowRight size={14}/></a>
  </aside>
}
export function CompactPathway({ path,index,onExpand,onNode,expanded=false }: {path:CapitalPathway;index:FocusedIndex;onExpand:()=>void;onNode:(id:string)=>void;expanded?:boolean}) {
  const name=(id:string)=>index.nodes.get(id)?.name??id
  const origins=[...new Set(path.origins.map(origin=>origin.providerId))]
  const managers=pathwayManagers(path)
  const participants=[...new Set(path.links.flatMap(link=>[link.source,link.target]))].filter(id=>id!==path.mechanismId)
  const evidence=new Set(path.links.flatMap(link=>link.evidenceIds))
  return <aside className="compact-panel panel" aria-label="Arrangement summary">
    <div className="compact-eyebrow">Financing mechanism</div><h2>{index.nodes.get(path.mechanismId)?.name??path.name}</h2><p className="compact-function">{pathPurpose(index,path)}</p>
    <dl className="compact-facts"><div><dt>Documented capital providers</dt><dd>{origins.length?origins.map(id=>name(id)+' — '+[...new Set(path.origins.filter(origin=>origin.providerId===id).map(origin=>displayName(origin.capitalType)))].join(', ')).join('; '):'Unknown in the reviewed sources'}</dd></div>
      <div><dt>Manager / administrator</dt><dd>{managers.length?managers.map(name).join('; '):'Not established in the reviewed sources'}</dd></div>
      <div><dt>Geographic coverage</dt><dd>{path.geographies.map(id=>index.atlas.geography.get(id)??id).join(', ')}</dd></div></dl>
    <ObservationSummary observations={observationsFor(index,[],path)}/>
    {expanded?<p className="compact-muted">Pathway expanded on the network.</p>:<button className="primary-button" type="button" onClick={onExpand}>Expand arrangement <ArrowRight size={14}/></button>}
    <section><h3>Key participants</h3><ul className="compact-list">{participants.slice(0,5).map(id=><li key={id}><button type="button" onClick={()=>onNode(id)}>{name(id)}</button></li>)}</ul>{participants.length>5&&<p className="compact-muted">{participants.length-5} additional participants in the full pathway.</p>}</section>
    <SourcesIndicator count={evidence.size} href={profileHref('mechanism',path.id)}/><a className="compact-full" href={profileHref('mechanism',path.id)}>See full pathway <ArrowRight size={14}/></a>
  </aside>
}
