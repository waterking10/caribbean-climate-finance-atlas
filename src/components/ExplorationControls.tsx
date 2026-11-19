import type { ExplorationIndex, ExplorationMode, RelationshipDepth } from '../exploration'

export function ExplorationControls({ index, mode, root, pathwayId, depth, onMode, onRoot, onPathway, onDepth }: {
  index: ExplorationIndex; mode: ExplorationMode; root: string; pathwayId: string; depth: RelationshipDepth
  onMode: (mode: ExplorationMode) => void; onRoot: (id: string) => void; onPathway: (id: string) => void; onDepth: (depth: RelationshipDepth) => void
}) {
  return <section className="exploration-controls panel" aria-label="Exploration controls">
    <div className="exploration-modes" aria-label="Exploration mode">
      {([['pathways', 'Explore pathways'], ['institutions', 'Explore institutions'], ['ecosystem', 'Explore ecosystem']] as const).map(([id, label]) =>
        <button type="button" key={id} aria-pressed={mode === id} onClick={() => onMode(id)}>{label}</button>)}
    </div>
    <div className="exploration-inputs">
      {mode === 'pathways' && <label>Financing mechanism<select aria-label="Financing mechanism" value={pathwayId} onChange={event => onPathway(event.target.value)}>
        {index.research.pathways.map(path => <option key={path.id} value={path.id}>{path.name}</option>)}
      </select></label>}
      {mode === 'institutions' && <label>Starting institution or actor<select aria-label="Starting institution or actor" value={root} onChange={event => onRoot(event.target.value)}>
        <option value="">Choose an institution</option>
        {[...index.nodes.values()].sort((a,b) => a.name.localeCompare(b.name)).map(node => <option key={node.id} value={node.id}>{node.name}{!node.entity ? ' (research actor)' : ''}</option>)}
      </select></label>}
      {mode !== 'ecosystem' && <label>Relationship depth<select aria-label="Relationship depth" value={depth} onChange={event => onDepth(event.target.value as RelationshipDepth)}>
        <option value="direct">Direct relationships</option><option value="two">Two-hop connections</option><option value="full">Full documented pathway</option>
      </select></label>}
    </div>
    <p>{mode === 'ecosystem' ? 'Registry overview. Use Full network to include the wider registry; use a pathway or institution to inspect additional documented research connections.' :
      'Connections can be followed in either direction. Arrows retain their documented meaning; a connected route is not necessarily a capital flow. Only verified links appear on the graph.'}
      {mode === 'pathways' && ' Geographic scope and theme use the selected case; full depth includes its documented parallel branches.'}</p>
  </section>
}
