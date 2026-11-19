import cytoscape from 'cytoscape'
import type { Core, ElementDefinition, Position, StylesheetStyle } from 'cytoscape'
import { useEffect, useMemo, useRef } from 'react'
import { Crosshair, Minus, Plus } from 'lucide-react'
import type { CapitalPathway } from '../capital-research-model'
import { entityColor } from '../entity-taxonomy'
import type { ExplorationNode, ExplorationEdge } from '../exploration'
import { relationshipFamily } from '../relationship-taxonomy'
import { edgeGroup, edgeWeights } from '../selectors'

const seedPositions: Record<string, [number, number]> = {
  'cdb': [408, 307], 'idb': [269, 219], 'idbi': [177, 238], 'idb-lab': [201, 135],
  'world-bank': [422, 149], wbg: [453, 49], ifc: [287, 71], eib: [180, 360], dbj: [651, 622],
  gcf: [375, 222], gef: [306, 156], 'gef-trust': [476, 244], 'adaptation-fund': [516, 149],
  cif: [553, 65], ctf: [301, 328], ccccc: [484, 94], ccsa: [683, 64], ccrif: [609, 123],
  sef: [368, 413], seec: [467, 397], caricom: [635, 197], cdf: [715, 156],
  'caribbean-export': [677, 395], rpsdp: [728, 472], eu: [561, 447], fcdo: [138, 477],
  lacif: [596, 535], ukcif: [246, 425], sdf: [535, 325], ppp: [350, 112],
  rfhl: [100, 243], 'republic-bb': [73, 318], cibc: [88, 150], rbc: [76, 403],
  sagicor: [585, 264], 'sagicor-life': [693, 265], guardian: [742, 339],
  nis: [121, 570], 'nis-fund': [233, 579], nibtt: [330, 585],
  sygnus: [430, 526], sci: [375, 634], deneb: [497, 615], jnfm: [184, 675],
  'jn-mutual': [292, 675], fundaccess: [737, 573], 'barbados-gov': [733, 96],
  findev: [180, 59], enertur: [94, 74], interenergy: [74, 18],
  fmo: [66, 123],
  ccrf: [540, 583], 'ccrf-debt': [578, 654], 'ccrf-equity': [667, 607], craf: [824, 189],
  cbf: [753, 711], 'cbf-endowment': [648, 752], 'cbf-eba': [843, 760],
  'barbados-blue-loan': [774, 56], tnc: [839, 24],
  'jamaica-gov': [611, 17], 'jamaica-cat-2026': [513, 19],
  egfl: [837, 335], 'energy-smart-ii': [838, 249],
  'mpc-caribbean-fund': [84, 680], 'mpc-caribbean-listed': [70, 540],
  gac: [497, 751], surge: [571, 472],
  'gcf-ppf': [342, 59], 'cdb-ccppf': [319, 476], gbff: [327, 19], sccf: [389, 49],
  'bridge-green': [751, 446],
  'ccrif-mdtf-2014': [702, 185], 'us-treasury': [765, 145], 'germany-bmz': [711, 343],
  kfw: [800, 608], edc: [205, 105], 'standard-chartered-bank': [113, 190],
  'bahamas-gov': [152, 307], 'bahamas-debt-conversion-2024': [187, 185],
  'bahamas-protected-areas-fund': [117, 120], 'germany-environment-ministry': [705, 700],
  pioj: [470, 206], 'barbados-water-authority': [544, 221], unep: [460, 703], giz: [783, 530],
  'crew-plus': [734, 652], 'eib-caribbean-water-programme': [180, 430], dfc: [313, 491],
  'belize-gov': [227, 318], 'belize-blue-investment-company': [266, 362], 'belize-blue-loan-2021': [220, 415],
}

const graphStyle: StylesheetStyle[] = [
  {
    selector: 'node',
    style: {
      width: 'data(size)', height: 'data(size)', 'background-color': 'data(color)', 'background-opacity': 0.96,
      'border-width': 3, 'border-color': '#1e3430', 'border-opacity': 0.95,
      label: 'data(label)', color: '#e3eee8', 'font-size': 13.5, 'font-weight': 500,
      'font-family': 'Inter Variable, Inter, sans-serif', 'text-valign': 'bottom', 'text-margin-y': 7,
      'text-wrap': 'wrap', 'text-max-width': '105px', 'text-outline-width': 3, 'text-outline-color': '#152522',
      'overlay-opacity': 0, 'min-zoomed-font-size': 5,
    },
  },
  {
    selector: 'node.current',
    style: {
      'border-color': '#cefff1', 'border-width': 2.5, 'underlay-color': '#50c5ac',
      'underlay-opacity': 0.24, 'underlay-padding': 7, color: '#ffffff', 'font-weight': 700,
    },
  },
  {
    selector: 'node.hovered',
    style: { 'underlay-color': '#c6f5e8', 'underlay-padding': 6, 'underlay-opacity': 0.28, color: '#ffffff' },
  },
  {
    selector: 'edge',
    style: {
      width: 'data(stroke)', 'line-color': '#78948a', opacity: 0.7, 'line-opacity': 0.85,
      'target-arrow-color': '#89a79d', 'target-arrow-shape': 'triangle', 'arrow-scale': 0.85,
      'curve-style': 'bezier', 'control-point-step-size': 32, 'line-style': 'dashed',
      'line-dash-pattern': [4, 4], 'overlay-opacity': 0,
    },
  },
  {
    selector: 'edge.finance',
    style: { 'line-color': '#64ccae', 'target-arrow-color': '#64ccae', 'line-style': 'solid' },
  },
  {
    selector: 'edge.risk',
    style: { 'line-color': '#dbb6f3', 'target-arrow-color': '#dbb6f3', 'line-style': 'dotted' },
  },
  { selector: 'edge.mutual', style: { 'target-arrow-shape': 'none' } },
  { selector: 'edge.capital', style: { 'line-color': '#64ccae', 'target-arrow-color': '#64ccae', 'line-style': 'solid' } },
  { selector: 'edge.decision', style: { 'line-color': '#efbb70', 'target-arrow-color': '#efbb70', 'line-style': 'dashed', 'line-dash-pattern': [8, 3] } },
  { selector: 'edge.support', style: { 'line-color': '#7dabfd', 'target-arrow-color': '#7dabfd', 'line-style': 'dotted' } },
  { selector: 'edge.review', style: { 'line-color': '#aab8b1', 'target-arrow-color': '#aab8b1', 'line-style': 'dashed', 'line-dash-pattern': [2, 6] } },
  { selector: 'node.research', style: { shape: 'round-rectangle', 'font-size': 11, 'text-max-width': '140px' } },
  { selector: 'edge.active-path', style: { 'underlay-color': '#efc987', 'underlay-opacity': 0.5, 'underlay-padding': 3, opacity: 1 } },
  { selector: 'edge.pathway', style: { 'underlay-color': '#efc987', 'underlay-opacity': 0.38, 'underlay-padding': 3 } },
  { selector: 'edge.connected', style: { opacity: 0.98 } },
  {
    selector: 'edge.current, edge.hovered',
    style: { 'line-color': '#e2fdf4', 'target-arrow-color': '#e2fdf4', opacity: 1, 'overlay-opacity': 0.12 },
  },
  { selector: '.faded', style: { opacity: 0.18 } },
  { selector: 'node.no-label', style: { label: '' } },
]

interface Props {
  entities: ExplorationNode[]
  edges: ExplorationEdge[]
  highlighted: string[]
  compact: boolean
  matchingCount: number
  pathways: ReadonlyMap<string, CapitalPathway[]>
  selected: string
  selectedEdge: string
  focus: boolean
  labels: boolean
  metric: string
  onEntity: (id: string) => void
  onEdge: (id: string) => void
  onBackground: () => void
}
export function NetworkGraph(props: Props) {
  const { entities, edges, pathways, selected, selectedEdge, focus, labels, metric } = props
  const container = useRef<HTMLDivElement>(null)
  const graph = useRef<Core | null>(null)
  const remembered = useRef(new Map<string, Position>())
  const callbacks = useRef(props)
  callbacks.current = props
  const elements = useMemo(() => {
    const degrees = new Map<string, number>()
    const widths = edgeWeights(edges, metric)
    for (const edge of edges) {
      for (const id of [edge.source, edge.target]) degrees.set(id, (degrees.get(id) ?? 0) + 1)
    }
    return [
      ...entities.map((entity, index): ElementDefinition => {
        const [x, y] = seedPositions[entity.id] ?? [100 + (index % 9) * 85, 810 + Math.floor(index / 9) * 85]
        return {
          group: 'nodes',
          classes: entity.entity ? [] : ['research'],
          data: { id: entity.id, label: entity.shortName, color: entityColor(entity),
            size: Math.min(42, 20 + 2.4 * (degrees.get(entity.id) ?? 0)) },
          position: remembered.current.get(entity.id) ?? { x: x * 1.14, y: y * 0.94 },
        }
      }),
      ...edges.map((edge): ElementDefinition => ({
        group: 'edges', data: { id: edge.id, source: edge.source, target: edge.target, stroke: widths.get(edge.id) ?? 1.5 },
        classes: [edgeGroup(edge), relationshipFamily(edge.type), ...(edge.direction === 'mutual' || edge.type === 'CO_INVESTS_WITH' ? ['mutual'] : []), ...(pathways.has(edge.id) ? ['pathway'] : [])],
      })),
    ]
  }, [entities, edges, metric, pathways])

  useEffect(() => {
    const cy = cytoscape({
      container: container.current, elements: [], style: graphStyle, layout: { name: 'preset' },
      minZoom: 0.12, maxZoom: 3.5, autounselectify: true, boxSelectionEnabled: false,
    })
    graph.current = cy
    cy.on('tap', 'node', event => callbacks.current.onEntity(event.target.id()))
    cy.on('tap', 'edge', event => callbacks.current.onEdge(event.target.id()))
    cy.on('tap', event => { if (event.target === cy) callbacks.current.onBackground() })
    cy.on('dragfree', 'node', event => remembered.current.set(event.target.id(), event.target.position()))
    cy.on('mouseover', 'node, edge', event => {
      event.target.addClass('hovered')
      cy.container()!.style.cursor = 'pointer'
    })
    cy.on('mouseout', 'node, edge', event => {
      event.target.removeClass('hovered')
      cy.container()!.style.cursor = 'grab'
    })
    const observer = new ResizeObserver(() => {
      cy.resize()
      if (cy.elements().length) cy.fit(cy.elements(), 27)
    })
    if (container.current) observer.observe(container.current)
    return () => {
      observer.disconnect()
      cy.destroy()
      graph.current = null
    }
  }, [])

  useEffect(() => {
    const cy = graph.current
    if (!cy) return
    const ids = new Set(elements.map(element => element.data.id))
    const geometryChanged = cy.elements().length !== elements.length || elements.some(el => cy.getElementById(el.data.id!).empty())
    cy.batch(() => {
      cy.elements().filter(el => !ids.has(el.id())).remove()
      for (const element of elements) {
        const existing = cy.getElementById(element.data.id!)
        if (existing.empty()) cy.add(element)
        else {
          existing.data(element.data)
          existing.toggleClass('pathway', pathways.has(existing.id()))
        }
      }
    })
    if (geometryChanged && entities.length) {
      if (props.compact) cy.layout({
        name: 'concentric', fit: true, padding: 65, minNodeSpacing: 100,
        concentric: node => node.id() === selected ? 100 : node.degree(),
        levelWidth: () => 100,
      }).run()
      else cy.fit(cy.elements(), 27)
    }
  }, [elements, entities.length, pathways, props.compact, selected])

  useEffect(() => {
    const cy = graph.current
    if (!cy) return
    const root = cy.getElementById(selected)
    const edge = cy.getElementById(selectedEdge)
    cy.batch(() => {
      cy.elements().removeClass('current faded connected active-path')
      cy.nodes().toggleClass('no-label', !labels)
      root.addClass('current')
      if (edge.nonempty()) {
        cy.elements().difference(edge.union(edge.connectedNodes())).addClass('faded')
        edge.addClass('current')
      } else if (props.highlighted.length) {
        const highlighted = cy.edges().filter(item => props.highlighted.includes(item.id()))
        highlighted.addClass('active-path')
        cy.elements().difference(highlighted.union(highlighted.connectedNodes())).addClass('faded')
      } else if (focus && root.nonempty()) {
        const neighbours = root.closedNeighborhood()
        neighbours.edges().addClass('connected')
        cy.elements().difference(neighbours).addClass('faded')
      }
    })
  }, [elements, selected, selectedEdge, labels, focus, props.highlighted])

  function zoom(factor: number) {
    const cy = graph.current
    if (cy) cy.zoom({ level: cy.zoom() * factor, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } })
  }
  return <div className="graph-area">
    <div className="graph-surface" ref={container} role="img" aria-label="Interactive institutional network. An accessible list of entities and relationships is available in the adjacent panels." data-testid="graph-surface" />
    {entities.length === 0 && <div className="graph-empty"><strong>{props.matchingCount ? 'No matching connections' : 'No matching entities'}</strong><span>{props.matchingCount ? 'Matching entities remain in the list. Broaden filters or display all matching entities.' : 'Broaden your search or reset the filters.'}</span></div>}
    <div className="graph-hint">Drag to pan <span>·</span> <b className="desktop-zoom">Scroll to zoom</b><b className="touch-zoom">Pinch to zoom</b></div>
    <div className="zoom-tools" aria-label="Graph navigation">
      <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => zoom(1.25)}><Plus size={17}/></button>
      <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => zoom(0.8)}><Minus size={17}/></button>
      <button type="button" title="Fit network" aria-label="Fit network" onClick={() => graph.current?.fit(undefined, 27)}><Crosshair size={16}/></button>
    </div>
  </div>
}

