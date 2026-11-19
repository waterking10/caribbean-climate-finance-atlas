import cytoscape from 'cytoscape'
import type { Core, StylesheetStyle, Position } from 'cytoscape'
import { graphlib, layout } from '@dagrejs/dagre'
import { useEffect, useRef, useState } from 'react'
import { Crosshair, Minus, Plus } from 'lucide-react'
import type { Connection } from '../focused-network'
import { nodeFunction } from '../focused-network'
import type { ExplorationNode } from '../exploration'

export const connectionColors: Record<string,string> = { capital: '#71d5b8', management: '#91bff1', decision: '#f1ca8b', risk: '#dfb9f4', support: '#bbd8d1', review: '#a9b8b2' }
const style: StylesheetStyle[] = [
  { selector: 'node', style: { width: 27, height: 27, 'background-color': '#b6d8ca', 'border-width': 2, 'border-color': '#31574b',
    label: 'data(label)', 'font-family': 'Inter Variable, sans-serif', 'font-size': 13, 'font-weight': 550, color: '#edf7f2',
    'text-wrap': 'wrap', 'text-max-width': '110px', 'text-valign': 'bottom', 'text-margin-y': 9,
    'text-outline-color': '#162b25', 'text-outline-width': 3, 'overlay-opacity': 0 } },
  { selector: 'node.mechanism', style: { shape: 'round-rectangle' } },
  { selector: 'node.chosen', style: { 'border-color': '#f0fff8', 'border-width': 3, 'underlay-color': '#7be1bb', 'underlay-opacity': .2, 'underlay-padding': 7 } },
  { selector: 'edge', style: { width: 1.8, 'line-color': 'data(color)', 'target-arrow-color': 'data(color)', 'target-arrow-shape': 'triangle',
    'curve-style': 'bezier', 'control-point-step-size': 32, opacity: .8, 'arrow-scale': .8, 'overlay-opacity': 0,
    label: 'data(countLabel)', color: '#dceee5', 'font-size': 9, 'text-background-color': '#162b25', 'text-background-opacity': 1, 'text-background-padding': '3px' } },
  { selector: 'edge.management', style: { 'line-style': 'dashed', 'line-dash-pattern': [7,4] } },
  { selector: 'edge.decision', style: { 'line-style': 'dashed', 'line-dash-pattern': [3,4] } },
  { selector: 'edge.risk', style: { 'line-style': 'dotted', 'target-arrow-shape': 'diamond' } },
  { selector: 'edge.support, edge.review', style: { 'line-style': 'dotted' } },
  { selector: 'edge.mutual', style: { 'target-arrow-shape': 'none' } },
  { selector: 'edge.chosen', style: { width: 3.3, opacity: 1 } },
  { selector: '.dim', style: { opacity: .16 } },
  { selector: '.quiet-label', style: { label: '' } },
  { selector: 'node.quiet-label.chosen', style: { label: 'data(label)' } },
]

export function layoutFocusedGraph(nodes: ExplorationNode[], connections: Connection[]): Map<string,Position> {
  const graph = new graphlib.Graph({ multigraph: true })
  graph.setDefaultEdgeLabel(() => ({}))
  for (const node of [...nodes].sort((a,b) => a.id.localeCompare(b.id))) graph.setNode(node.id, { width: 110, height: 55 })
  for (const edge of [...connections].sort((a,b) => a.id.localeCompare(b.id))) graph.setEdge(edge.source, edge.target, {}, edge.id)
  // Pack real connected components, including single institutions, instead of
  // letting Dagre stack all mechanism-only participants into one long column.
  const blocks=graphlib.alg.components(graph).map(ids=>{
    const component=new graphlib.Graph({multigraph:true})
    component.setGraph({rankdir:'LR',nodesep:58,ranksep:75,marginx:0,marginy:0})
    component.setDefaultEdgeLabel(()=>({}))
    for(const id of [...ids].sort())component.setNode(id,graph.node(id))
    const members=new Set(ids)
    for(const edge of [...connections].sort((a,b)=>a.id.localeCompare(b.id)))if(members.has(edge.source))component.setEdge(edge.source,edge.target,{},edge.id)
    layout(component)
    return {ids:ids.sort(),graph:component,width:component.graph().width??110,height:component.graph().height??55}
  }).sort((a,b)=>b.ids.length-a.ids.length||a.ids[0].localeCompare(b.ids[0]))
  const targetWidth=Math.max(0,...blocks.map(block=>block.width),Math.sqrt(blocks.reduce((area,block)=>area+(block.width+60)*(block.height+60),0)*1.8))
  const positions=new Map<string,Position>()
  let x=0,y=0,rowHeight=0
  for(const block of blocks){
    if(x>0&&x+block.width>targetWidth){x=0;y+=rowHeight+60;rowHeight=0}
    for(const id of block.ids){const point=block.graph.node(id);positions.set(id,{x:point.x+x+70,y:point.y+y+70})}
    x+=block.width+60;rowHeight=Math.max(rowHeight,block.height)
  }
  return positions
}
export function extendFocusedPositions(proposed:Map<string,Position>,preserved:Map<string,Position>):Map<string,Position> {
  const placed=new Map([...preserved].filter(([id])=>proposed.has(id)))
  for(const [id,original] of proposed) if(!placed.has(id)) {
    let point={...original},attempt=0
    while([...placed.values()].some(other=>Math.abs(other.x-point.x)<135&&Math.abs(other.y-point.y)<100)) {
      attempt++
      const row=attempt%12
      point={x:original.x+Math.floor(attempt/12)*165,y:original.y+(row%2?Math.ceil(row/2)*113:-row/2*113)}
    }
    placed.set(id,point)
  }
  return placed
}
interface Props {
  nodes: ExplorationNode[]; connections: Connection[]; selectedNode: string; selectedConnection: string; scopeKey: string; hidden?: boolean
  onNode: (id: string) => void; onConnection: (id: string) => void; onBackground: () => void
}
export function FocusedNetworkGraph(props: Props) {
  const host = useRef<HTMLDivElement>(null)
  const graph = useRef<Core | null>(null)
  const callbacks = useRef(props); callbacks.current = props
  const cache = useRef(new Map<string,{ positions: Map<string,Position>; zoom?: number; pan?: Position }>())
  const scope = useRef('')
  const pendingFit = useRef(false)
  const [hovered,setHovered] = useState<{node:ExplorationNode;x:number;y:number}|null>(null)
  useEffect(() => {
    const cy = cytoscape({ container: host.current, elements: [], style, layout: {name:'preset'}, minZoom: .02, maxZoom: 3,
      autounselectify: true, boxSelectionEnabled: false, wheelSensitivity: .18 })
    graph.current = cy
    cy.on('tap','node', event => { setHovered(null); callbacks.current.onNode(event.target.id()) })
    cy.on('tap','edge', event => { setHovered(null); callbacks.current.onConnection(event.target.id()) })
    cy.on('tap', event => { if (event.target === cy) callbacks.current.onBackground() })
    cy.on('mouseover','node', event => {
      const node = callbacks.current.nodes.find(node => node.id === event.target.id())
      if (node) { const point=event.target.renderedPosition(); setHovered({node,x:point.x,y:point.y}) }
    })
    cy.on('mouseout','node',() => setHovered(null))
    cy.on('pan zoom drag',() => setHovered(null))
    function updateLabels(){
      // Keep every node visible at overview scale; reveal captions as space permits.
      cy.elements().toggleClass('quiet-label',cy.zoom()<.5)
      cy.nodes().style({'width':Math.max(27,6/cy.zoom()),'height':Math.max(27,6/cy.zoom()),'font-size':Math.max(13,9/cy.zoom()),'text-max-width':Math.max(110,64/cy.zoom())})
    }
    cy.on('zoom add',updateLabels)
    const resize = new ResizeObserver(() => { if (host.current?.clientWidth && host.current?.clientHeight) {
      cy.resize()
      if(pendingFit.current&&cy.nodes().length){pendingFit.current=false;cy.fit(undefined,45)}
    } })
    if (host.current) resize.observe(host.current)
    return () => { resize.disconnect(); cy.destroy(); graph.current=null }
  },[])
  useEffect(() => {
    const cy = graph.current
    if (!cy) return
    const changedScope=scope.current !== props.scopeKey
    if (changedScope && scope.current) cache.current.set(scope.current, { positions: new Map(cy.nodes().map(node => [node.id(),{...node.position()}])), zoom:cy.zoom(), pan:{...cy.pan()} })
    const remembered=cache.current.get(props.scopeKey)
    const proposed=layoutFocusedGraph(props.nodes,props.connections)
    const preserved=changedScope?remembered?.positions??new Map<string,Position>():new Map(cy.nodes().map(node=>[node.id(),{...node.position()}]))
    const positions=extendFocusedPositions(proposed,preserved)
    const first=cy.nodes().empty()
    const removedMany=cy.nodes().length > props.nodes.length * 1.5
    const addedMany=props.nodes.length > cy.nodes().length * 1.5
    const ids=new Set([...props.nodes.map(node=>node.id),...props.connections.map(edge=>edge.id)])
    cy.batch(() => {
      cy.elements().filter(element=>!ids.has(element.id())).remove()
      for(const node of props.nodes) {
        const data={id:node.id,label:node.shortName.length>32?node.shortName.slice(0,29)+'…':node.shortName}
        const existing=cy.getElementById(node.id)
        const mechanism=Boolean(node.entity && node.entity.kind !== 'institution' && !['Multilateral climate fund','Multilateral environment facility','Concessional climate fund','Regional development fund','Multilateral adaptation fund'].includes(node.type)) || node.type.includes('vehicle')
        if(existing.empty()) cy.add({group:'nodes',data,position:positions.get(node.id),classes:mechanism?'mechanism':''})
        else { existing.data(data); if(changedScope) existing.position(positions.get(node.id)!); existing.toggleClass('mechanism',mechanism) }
      }
      for(const edge of props.connections) {
        const data={id:edge.id,source:edge.source,target:edge.target,color:connectionColors[edge.family],countLabel:edge.arrangementCount>1?`${edge.arrangementCount} arrangements`:''}
        const existing=cy.getElementById(edge.id)
        if(existing.empty()) cy.add({group:'edges',data,classes:[edge.family,edge.direction==='mutual'?'mutual':''].join(' ')})
        else existing.data(data)
      }
    })
    scope.current=props.scopeKey
    cy.resize()
    if(changedScope && remembered?.zoom && remembered.pan) {cy.zoom(remembered.zoom);cy.pan(remembered.pan)}
    else if((first || changedScope || removedMany || addedMany) && props.nodes.length) {
      if(host.current?.clientWidth)cy.fit(undefined,45)
      else pendingFit.current=true
    }
  },[props.nodes,props.connections,props.scopeKey])
  useEffect(()=>{
    const cy=graph.current
    if(!cy) return
    cy.batch(()=>{
      cy.elements().removeClass('chosen dim')
      const selected=cy.getElementById(props.selectedConnection || props.selectedNode)
      if(selected.nonempty()) {
        const focus=props.selectedConnection?selected.union(selected.connectedNodes()):cy.nodes().filter(item=>item.id()===props.selectedNode).closedNeighborhood()
        cy.elements().difference(focus).addClass('dim'); selected.addClass('chosen')
      }
    })
  },[props.nodes,props.connections,props.selectedNode,props.selectedConnection])
  useEffect(()=>{if(!props.hidden){graph.current?.resize();if(pendingFit.current&&host.current?.clientWidth){pendingFit.current=false;graph.current?.fit(undefined,45)}}},[props.hidden])
  function zoom(factor:number){const cy=graph.current;if(cy)cy.zoom({level:cy.zoom()*factor,renderedPosition:{x:cy.width()/2,y:cy.height()/2}})}
  return <div className="focused-graph-wrap">
    <div className="focused-graph" ref={host} data-testid="focused-graph" role="img" aria-label="Documented climate finance network. Use the institution and connection lists for keyboard access."/>
    {props.nodes.length===0 && <div className="focused-empty"><strong>No matching connections</strong><p>Try another filter or reset filters. Search can still find institutions and mechanisms outside this view.</p></div>}
    {hovered && <div className="focused-tooltip" role="tooltip" style={{left:Math.min(Math.max(8,hovered.x),Math.max(8,(host.current?.clientWidth??300)-280)),top:Math.max(8,Math.min(hovered.y+22,(host.current?.clientHeight??400)-160))}}>
      <strong>{hovered.node.name}</strong><span>{hovered.node.type}</span><p>{nodeFunction(hovered.node)}</p>
    </div>}
    <div className="focused-zoom" aria-label="Graph navigation"><button type="button" aria-label="Zoom in" onClick={()=>zoom(1.2)}><Plus size={17}/></button><button type="button" aria-label="Zoom out" onClick={()=>zoom(.8)}><Minus size={17}/></button><button type="button" aria-label="Fit network" onClick={()=>graph.current?.fit(undefined,45)}><Crosshair size={17}/></button></div>
  </div>
}
