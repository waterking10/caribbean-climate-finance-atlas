import type { ExplorationEdge, ExplorationIndex, ExplorationNode } from '../exploration'
import type { CapitalPathwayIndex } from '../capital-research'
import { classificationNotes, relationshipFamily, relationshipFamilies } from '../relationship-taxonomy'
import { displayName } from '../selectors'
import { PathwayInspector } from './PathwayInspector'

export function ResearchConnectionInspector({ node, edge, exploration, capital, pathwayId, onEntity, onEdge, onBack }: {
  node?: ExplorationNode; edge?: ExplorationEdge; exploration: ExplorationIndex; capital: CapitalPathwayIndex; pathwayId: string
  onEntity: (id: string) => void; onEdge: (id: string) => void; onBack: () => void
}) {
  const claims = edge?.claims ?? []
  const paths = edge ? [...new Map(claims.map(claim => [claim.path.id, claim.path])).values()] :
    exploration.research.pathways.filter(path => path.id === pathwayId || path.links.some(link => link.source === node?.id || link.target === node?.id))
  const links = exploration.edges.filter(item => item.source === node?.id || item.target === node?.id)
  return <aside className="inspector panel" aria-label={edge ? 'Relationship details' : 'Entity profile'}>
    <div className="inspector-label"><button type="button" className="text-button" onClick={onBack}>Entity profile</button></div>
    <div className="inspector-scroll"><div className="profile-head">
      <p className="muted">{edge ? 'Verified research connection' : node?.entity ? 'Documented pathway' : 'Research actor · not a registry profile'}</p>
      <h2>{edge ? displayName(edge.type) : node?.name}</h2>
      {edge && <><p className="classification-note">{relationshipFamilies[relationshipFamily(edge.type)]}</p>
        {classificationNotes[edge.type as keyof typeof classificationNotes] && <p>{classificationNotes[edge.type as keyof typeof classificationNotes]}</p>}
        <div className="edge-endpoints"><button type="button" onClick={() => onEntity(edge.source)}>{capital.actorNames.get(edge.source)}</button><span>→</span>
          <button type="button" onClick={() => onEntity(edge.target)}>{capital.actorNames.get(edge.target)}</button></div>
      </>}
    </div><div className="profile-content">
      {!edge && <><h3>Documented relationships</h3><ul className="relationship-list">{links.map(link => <li key={link.id}><button type="button" onClick={() => onEdge(link.id)}>
        {displayName(link.type)} · {capital.actorNames.get(link.source === node?.id ? link.target : link.source)}
      </button></li>)}</ul></>}
      <PathwayInspector edgeId={claims[0]?.link.id ?? ''} pathways={paths} capital={capital} onEntity={onEntity}/>
    </div></div>
  </aside>
}
