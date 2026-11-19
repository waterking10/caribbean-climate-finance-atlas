import { useState } from 'react'
import { Check, ChevronDown, CircleDot, Focus, Network, Settings2 } from 'lucide-react'
import type { CapitalPathway } from '../capital-research-model'
import { entityCategories } from '../entity-taxonomy'
import type { ExplorationNode, ExplorationEdge } from '../exploration'
import { relationshipFamilies } from '../relationship-taxonomy'
import type { RelationshipFamily } from '../relationship-taxonomy'
import { NetworkGraph } from './NetworkGraph'
import { displayName, metricKey } from '../selectors'

export const lineGroups = Object.entries(relationshipFamilies) as [RelationshipFamily, string][]
export type LineGroup = RelationshipFamily

interface Props {
  entities: ExplorationNode[]
  edges: ExplorationEdge[]
  allEdges: ExplorationEdge[]
  highlighted: string[]
  ecosystem: boolean
  matchingCount: number
  pathways: ReadonlyMap<string, CapitalPathway[]>
  selected: string
  selectedEdge: string
  focus: boolean
  isolated: boolean
  fullNetwork: boolean
  onToggleScope: () => void
  groups: LineGroup[]
  onToggleGroup: (group: LineGroup) => void
  onIsolate: () => void
  onEntity: (id: string) => void
  onEdge: (id: string) => void
  onBackground: () => void
}

export function NetworkPanel(props: Props) {
  const [labels, setLabels] = useState(true)
  const [settings, setSettings] = useState(false)
  const [metric, setMetric] = useState('')
  const metrics = [...new Set(props.allEdges.flatMap(edge => metricKey(edge) ?? []))]
  return <section className="network-panel" aria-label="Institutional network">
    <div className="network-head">
      <div className="network-heading">
        <div className="network-glyph"><Network size={16}/></div>
        <div><h2>Institutional network</h2><p aria-live="polite">{props.entities.length} entities <span>·</span> {props.edges.length} relationships</p></div>
      </div>
      <div className="network-actions">
        {props.ecosystem && <button className="on-dark" type="button" aria-pressed={props.fullNetwork} onClick={props.onToggleScope}>Full network</button>}
        {props.selected && <button className="on-dark" type="button" aria-pressed={props.isolated} title={props.isolated ? 'Exit isolation' : 'Isolate selected network'} onClick={props.onIsolate}><Focus size={15}/><span>{props.isolated ? 'Show all' : 'Isolate'}</span></button>}
        <div className="setting-anchor">
          <button className="on-dark" type="button" aria-expanded={settings} aria-controls="graph-settings" onClick={() => setSettings(!settings)}><Settings2 size={15}/><span>View</span><ChevronDown size={12}/></button>
          {settings && <div id="graph-settings" className="graph-settings">
            <label><input type="checkbox" checked={labels} onChange={event => setLabels(event.target.checked)}/> Show node labels</label>
            <label className="weight-label">Edge weighting
              <select value={metric} onChange={event => setMetric(event.target.value)}>
                <option value="">Off</option>
                {metrics.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <p>Only financing edges with a disclosed amount in the selected currency and financial status are weighted.</p>
          </div>}
        </div>
      </div>
    </div>
    <NetworkGraph entities={props.entities} edges={props.edges} matchingCount={props.matchingCount} compact={!props.ecosystem} highlighted={props.highlighted} pathways={props.pathways} selected={props.selected} selectedEdge={props.selectedEdge}
      focus={props.focus} labels={labels} metric={metric} onEntity={props.onEntity} onEdge={props.onEdge} onBackground={props.onBackground}/>
    <div className="legend">
      <div className="legend-categories" aria-label="Entity categories">
        {Object.entries(entityCategories).map(([id, category]) => <span key={id}><i style={{ background: category.color }}/>{category.label}</span>)}
      </div>
      <div className="legend-relationships" aria-label="Toggle relationship categories">
        {lineGroups.map(([key, label]) => <button key={key} type="button" aria-pressed={props.groups.includes(key)} onClick={() => props.onToggleGroup(key)}><i className={'edge-sample ' + key}/>{label}</button>)}
        {props.edges.some(edge => props.pathways.has(edge.id)) && <span className="pathway-key"><i aria-hidden="true"/>Capital pathway</span>}
      </div>
      {metric && <p className="weight-note"><CircleDot size={13}/> Thicker edges indicate larger disclosed amounts within {metric}. Other edges stay thin.</p>}
      <p className="relationship-note">Arrows describe the named relationship. Guarantees, management, approval and support are not capital transfers. Rectangular nodes are research actors.</p>
      <details className="visible-connections"><summary>Visible relationships ({props.edges.length})</summary>
        <ul>{props.edges.map(edge => <li key={edge.id}><button type="button" onClick={() => props.onEdge(edge.id)}>
          {props.entities.find(node => node.id === edge.source)?.shortName} {edge.direction === 'mutual' ? '↔' : '→'} {props.entities.find(node => node.id === edge.target)?.shortName} · {displayName(edge.type)}
        </button></li>)}</ul>
      </details>
    </div>
  </section>
}

export function VerificationBadge({ status = 'verified' }: { status?: string }) {
  return <span className={'verification ' + status}>{status === 'verified' && <Check size={12}/>} {displayName(status)}</span>
}

