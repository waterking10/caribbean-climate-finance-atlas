import { useMemo } from 'react'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import type { CapitalPathwayIndex } from '../capital-research'
import { accessRoutes, financialRoles, themes } from '../model'
import type { Connection, FinancialObservation, FocusedIndex } from '../focused-network'
import { associatedPaths, edgeEvidence, groupConnections, hasFinancingParticipation, isInstitutionNode, nodeFunction, observationsFor, pathPurpose, pathwayManagers, selectFocusedNetwork, focusedEmptyFilters } from '../focused-network'
import { displayName } from '../selectors'
import { classificationNotes, relationshipFamilies } from '../relationship-taxonomy'
import { profileHref } from './CompactPanels'
import { FocusedNetworkGraph } from './FocusedNetworkGraph'
import { PathwayInspector } from './PathwayInspector'
import { Sources } from './Sources'

export type ProfileKind='institution'|'mechanism'|'relationship'
export function FinancialObservations({observations,evidence}:{observations:FinancialObservation[];evidence:CapitalPathwayIndex['evidence']}) {
  return <section className="full-section"><h2>Financial observations</h2>{observations.length?<><p className="muted">Each observation retains its original financial measure and scope. These values are not added together.</p><ul className="observation-list">{observations.map(amount=><li key={amount.id}><strong>{amount.currency} {new Intl.NumberFormat('en').format(amount.value)}</strong><p>{amount.measure} · {amount.stage} · {amount.date??'Reporting date unknown'}</p><p>{amount.scope}</p>{amount.limitation&&<p className="classification-note">{amount.limitation}</p>}<details><summary>Supporting evidence ({amount.evidenceIds.length})</summary><Sources ids={amount.evidenceIds} evidence={evidence}/></details></li>)}</ul></>:<p>No amount is established in the reviewed records. This is not evidence of zero financing.</p>}</section>
}
export function FullProfiles({kind,id,index,capital,onReturn,onExplore,onCompare,picked}:{
  kind:ProfileKind;id:string;index:FocusedIndex;capital:CapitalPathwayIndex;onReturn:()=>void;onExplore:(id:string,pathwayId?:string)=>void;onCompare:(id:string)=>void;picked:string[]
}) {
  const path=index.pathById.get(id)
  const node=index.nodes.get(kind==='mechanism'?path?.mechanismId??id:id)
  const allConnections=useMemo(()=>groupConnections(index.edges),[index])
  const connection=allConnections.find(edge=>edge.id===id)
  const missing=(kind==='institution'&&!node)||(kind==='mechanism'&&!path)||(kind==='relationship'&&!connection)
  const heading=kind==='institution'?node?.name:kind==='mechanism'?path?.name:connection?`${index.nodes.get(connection.source)?.name} → ${index.nodes.get(connection.target)?.name}`:''
  const links=kind==='institution'?index.edges.filter(edge=>edge.source===id||edge.target===id):connection?.members??[]
  const paths=kind==='institution'?associatedPaths(index,id):kind==='mechanism'&&path?[path]:connection?.pathwayIds.map(pathId=>index.pathById.get(pathId)!).filter(Boolean)??[]
  const evidenceIds=[...new Set([...(node?.entity?.evidenceIds??[]),...(node?.entity?.scope.evidenceIds??[]),...links.flatMap(edgeEvidence),...(path?.links.flatMap(link=>link.evidenceIds)??[])])]
  const canExplore=kind!=='institution'||Boolean(node&&(!isInstitutionNode(node,index.research)||hasFinancingParticipation(index,id)))
  return <main className="secondary-page full-profile" id="main">
    <button className="back-link" type="button" onClick={onReturn}><ArrowLeft size={15}/> Back to network</button>
    {missing?<section className="panel full-profile-body"><h1>Profile not found</h1><p>This URL does not match a published record. Return to Explore to search the registry.</p></section>:<>
      <header className="full-profile-heading"><p>{kind==='mechanism'?'Financing mechanism':kind==='relationship'?'Relationship details':node?.entity?.kind==='institution'?'Institution profile':node?.entity?'Fund / mechanism profile':'Research participant profile'}</p><h1>{heading}</h1>
        <div className="full-profile-actions">{kind!=='relationship'&&canExplore&&<button className="primary-button" type="button" onClick={()=>onExplore(path?.mechanismId??id,path?.id)}>Show in network <ArrowRight size={14}/></button>}
          {node?.entity&&<button type="button" className="text-button" onClick={()=>onCompare(node.id)}>{picked.includes(node.id)?'Remove from comparison':'Add to comparison'}</button>}
          {node?.entity?.website&&<a href={node.entity.website} target="_blank" rel="noreferrer">Official website <ExternalLink size={13}/></a>}
        </div>
      </header>
      <div className="panel full-profile-body">
        {kind==='institution'&&node&&<>
          <section className="full-section"><h2>Institutional overview</h2><p className="full-lead">{nodeFunction(node)}</p><dl className="full-facts"><div><dt>Institution / entity type</dt><dd>{node.type}</dd></div><div><dt>Ownership</dt><dd>{node.entity?.ownership??'Not researched'}</dd></div><div><dt>Geographic mandate</dt><dd>{node.entity?.geographies.map(place=>index.atlas.geography.get(place)??place).join(', ')||'Not researched'}</dd></div><div><dt>Last verified</dt><dd>{node.entity?.verifiedOn??'Link evidence is recorded separately; profile verification is not established'}</dd></div></dl>
            {node.entity&&<><h3>Mandate</h3><p>{node.entity.mandate}</p><h3>Activities</h3><p>{node.entity.activities}</p><h3>Research inclusion rationale</h3><p>{node.entity.scope.rationale}</p></>}
          </section>
          <section className="full-section"><h2>Financing roles and instruments</h2><p>{node.entity?.roles.map(role=>financialRoles[role]).join(' · ')||'Institution-wide roles not established. Refer to the arrangement-specific links below.'}</p><p>{node.entity?.instruments?.join(', ')||'Institution-wide instruments not researched.'}</p><p>These profile capabilities do not establish a transaction role or approval authority for every arrangement.</p>
            {node.entity?.themes.length?<p>{node.entity.themes.map(theme=>themes[theme]).join(' · ')}</p>:null}
            {node.entity?.access&&<><h3>Eligibility and access</h3><p>{accessRoutes[node.entity.access.route]}</p><p>{node.entity.access.details}</p><Sources ids={[node.entity.access.evidenceId]} evidence={capital.evidence}/></>}
          </section>
          <section className="full-section"><h2>Associated financing mechanisms</h2>{paths.length?<ul className="full-mechanism-list">{paths.map(item=><li key={item.id}><a href={profileHref('mechanism',item.id)}>{item.name} <ArrowRight size={13}/></a></li>)}</ul>:<p>No separate capital-pathway case is linked to this entity in the published research.</p>}</section>
          <FinancialObservations observations={observationsFor(index,links)} evidence={capital.evidence}/>
          <section className="full-section"><h2>Documented relationships</h2><p>Original records include supporting institutional context that is intentionally excluded from the starting network.</p><RelationshipRecords connections={groupConnections(links)} index={index}/></section>
          <section className="full-section"><h2>Research limitations and unresolved questions</h2>{paths.length?paths.map(item=><details key={item.id}><summary>{item.name} — {item.gaps.length} recorded questions</summary><ul>{item.gaps.map(gap=><li key={gap.field}><strong>{gap.field} · {displayName(gap.status)}</strong><p>{gap.description}</p><Sources ids={gap.evidenceIds} evidence={capital.evidence}/></li>)}</ul></details>):<p>The profile may be incomplete. An absent amount, role or relationship does not establish that none exists.</p>}</section>
        </>}
        {kind==='relationship'&&connection&&<>
          <section className="full-section"><h2>{relationshipFamilies[connection.family]}</h2><p>{connection.arrangementCount} distinct documented arrangements · {connection.members.length} original relationship records. No financial amounts have been aggregated.</p><p>Exact relationship types: {connection.types.map(displayName).join(' · ')}.</p>
            {connection.family==='risk'&&<p className="classification-note">Guarantees, insurance and risk-bearing obligations are contingent protection, not disbursements.</p>}
            <ul className="full-party-list">{[connection.source,connection.target].map(actorId=><li key={actorId}><a href={profileHref('institution',actorId)}>{index.nodes.get(actorId)?.name}</a></li>)}</ul>
          </section>
          <section className="full-section"><h2>Original relationship records</h2>{connection.members.map(edge=><article className="original-relationship" key={edge.id}><h3>{displayName(edge.type)}</h3><p>{edge.atlas?.description??edge.claims[0]?.link.description}</p>
            {edge.atlas&&<dl className="full-facts"><div><dt>Source's documented role</dt><dd>{edge.atlas.participantRoles.source}</dd></div><div><dt>Target's documented role</dt><dd>{edge.atlas.participantRoles.target}</dd></div><div><dt>Period</dt><dd>{edge.atlas.period??'Not recorded'}</dd></div></dl>}
            {classificationNotes[edge.type as keyof typeof classificationNotes]&&<p className="classification-note">{classificationNotes[edge.type as keyof typeof classificationNotes]}</p>}
            <details><summary>Evidence and record identifiers</summary><p>Registry / graph record: {edge.atlas?.id??edge.id}</p>{edge.claims.map(claim=><p key={claim.path.id+claim.link.id}>Research link: {claim.link.id} · {claim.link.status}{claim.link.limitation&&' · '+claim.link.limitation}{claim.link.fundingScope&&' · '+displayName(claim.link.fundingScope)}</p>)}<Sources ids={edgeEvidence(edge)} evidence={capital.evidence}/></details>
          </article>)}</section>
          <FinancialObservations observations={observationsFor(index,connection.members)} evidence={capital.evidence}/>
          {paths.length>0&&<section className="full-section"><h2>Associated financing arrangements</h2><ul className="full-mechanism-list">{paths.map(item=><li key={item.id}><a href={profileHref('mechanism',item.id)}>{item.name}</a></li>)}</ul><PathwayInspector edgeId={connection.members[0].atlas?.id??connection.members[0].claims[0]?.link.id??''} pathways={paths} capital={capital} onEntity={actorId=>{window.location.hash=profileHref('institution',actorId).slice(1)}}/></section>}
        </>}
        {kind==='mechanism'&&path&&<MechanismProfile pathId={path.id} index={index} capital={capital} onExplore={onExplore}/>}
        <section className="full-section" id="profile-sources"><h2>Supporting sources</h2><Sources ids={evidenceIds} evidence={capital.evidence}/></section>
      </div>
    </>}
  </main>
}
function RelationshipRecords({connections,index}:{connections:Connection[];index:FocusedIndex}) {
  return <ul className="full-relationship-list">{connections.map(connection=><li key={connection.id}><a href={profileHref('relationship',connection.id)}>{index.nodes.get(connection.source)?.shortName} {connection.direction==='mutual'?'↔':'→'} {index.nodes.get(connection.target)?.shortName}<span>{connection.types.map(displayName).join(' · ')} · {connection.arrangementCount} arrangements</span></a></li>)}</ul>
}
function MechanismProfile({pathId,index,capital,onExplore}:{pathId:string;index:FocusedIndex;capital:CapitalPathwayIndex;onExplore:(id:string,pathwayId?:string)=>void}) {
  const path=index.pathById.get(pathId)!
  const entity=index.atlas.entityById.get(path.mechanismId)
  const view=useMemo(()=>selectFocusedNetwork(index,focusedEmptyFilters,[],false,pathId),[index,pathId])
  const unique=(values:string[])=>[...new Set(values)]
  const name=(id:string)=>index.nodes.get(id)?.name??id
  const managers=pathwayManagers(path)
  const intermediaries=unique(path.links.filter(link=>link.status==='verified'&&['ON_LENDS_TO','DISBURSES_TO'].includes(link.type)).map(link=>link.source))
  const decision=path.links.filter(link=>['SETS_INVESTMENT_POLICY_FOR','SETS_GRANT_POLICY_FOR','SETS_ELIGIBILITY_FOR','APPRAISES','APPROVES_FINANCING_FOR','AUTHORIZES_DISBURSEMENT_FOR','OVERSEES','OVERSEES_IMPLEMENTATION_OF'].includes(link.type))
  return <>
    <section className="full-section"><h2>Purpose and geographic scope</h2><p className="full-lead">{pathPurpose(index,path)}</p><p>{path.geographies.map(id=>index.atlas.geography.get(id)??id).join(', ')}</p>
      <dl className="full-facts"><div><dt>Documented capital providers</dt><dd>{path.origins.length?unique(path.origins.map(origin=>name(origin.providerId))).join('; '):'Unknown in reviewed sources'}</dd></div><div><dt>Financial intermediaries</dt><dd>{intermediaries.map(name).join('; ')||'Not established by an explicit on-lending or disbursement link'}</dd></div><div><dt>Management / administration</dt><dd>{managers.map(name).join('; ')||'Unknown in reviewed sources'}</dd></div><div><dt>Financing instruments</dt><dd>{path.instruments.map(displayName).join(', ')}</dd></div></dl>
      <h3>Eligibility and access</h3><p>{entity?.access?.details??'No complete public application or eligibility route is established in this record. See any documented eligibility/targeting claims below.'}</p>
      {path.origins.length>0&&<><h3>Capital origin and scope</h3><ul>{path.origins.map(origin=><li key={origin.linkId}><strong>{name(origin.providerId)} · {displayName(origin.capitalType)} · {displayName(origin.geography)}</strong><p>{origin.note}</p></li>)}</ul></>}
    </section>
    <section className="full-section"><h2>Full documented pathway</h2><p>Each connection retains its documented parties and direction. Parallel financing branches are shown separately; connected lines are not proof of an uninterrupted money flow.</p><div className="full-pathway-graph"><FocusedNetworkGraph nodes={view.nodes} connections={view.connections} selectedNode="" selectedConnection="" scopeKey={'profile:'+pathId} onNode={id=>{window.location.hash=profileHref('institution',id).slice(1)}} onConnection={id=>{window.location.hash=profileHref('relationship',id).slice(1)}} onBackground={()=>{}}/></div>
      <RelationshipRecords connections={view.connections} index={index}/>
    </section>
    <section className="full-section"><h2>Decision-making authorities</h2>{decision.length?<ul>{decision.map(link=><li key={link.id}><strong>{name(link.source)} · {displayName(link.type)}</strong><p>{link.description}</p><p>{displayName(link.status)}</p><Sources ids={link.evidenceIds} evidence={capital.evidence}/></li>)}</ul>:<p>No decision authority is established in the reviewed sources. Management does not imply approval authority.</p>}</section>
    <section className="full-section"><h2>Guarantees and risk sharing</h2>{path.links.filter(link=>['GUARANTEES','INSURES','BEARS_RISK_FOR'].includes(link.type)).length?<ul>{path.links.filter(link=>['GUARANTEES','INSURES','BEARS_RISK_FOR'].includes(link.type)).map(link=><li key={link.id}><strong>{name(link.source)} · {displayName(link.type)}</strong><p>{link.description}</p>{link.beneficiaryIds&&<p>Protected parties: {link.beneficiaryIds.map(name).join('; ')}</p>}<Sources ids={link.evidenceIds} evidence={capital.evidence}/></li>)}</ul>:<p>No guarantee or risk-sharing link is recorded for this arrangement. This does not establish an absence of all risk allocation.</p>}</section>
    <FinancialObservations observations={observationsFor(index,[],path)} evidence={capital.evidence}/>
    <section className="full-section"><h2>Research evidence and limitations</h2><PathwayInspector edgeId="" pathways={[path]} capital={capital} onEntity={id=>{window.location.hash=profileHref('institution',id).slice(1)}}/></section>
  </>
}
