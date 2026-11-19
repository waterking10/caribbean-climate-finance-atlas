import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, CircleHelp, Columns3, FlaskConical, Moon, Network, Sun } from 'lucide-react'
import { indexCapitalPathways, loadCapitalResearch } from './capital-research'
import { About } from './components/About'
import { Compare } from './components/Compare'
import { EdgeInspector, Inspector } from './components/Inspector'
import { NetworkPanel, lineGroups } from './components/NetworkPanel'
import type { LineGroup } from './components/NetworkPanel'
import { Research } from './components/Research'
import { Sidebar } from './components/Sidebar'
import { atlasName, atlasSubtitle } from './model'
import type { AtlasData } from './model'
import { localRepository } from './repository'
import { createIndex, edgeGroup, emptyFilters, filterOptions, selectNetwork } from './selectors'
import type { Filters } from './selectors'

const pages = [
  { id: 'network', label: 'Network', icon: Network },
  { id: 'compare', label: 'Compare', icon: Columns3 },
  { id: 'research', label: 'Research', icon: FlaskConical },
  { id: 'about', label: 'About', icon: CircleHelp },
] as const
type Page = typeof pages[number]['id']
type Theme = 'light' | 'dark'
function currentPage(): Page {
  return pages.find(page => '#' + page.id === window.location.hash)?.id ?? 'network'
}
function initialTheme(): Theme {
  try { return localStorage.getItem('caribbean-capital-atlas.theme') === 'dark' ? 'dark' : 'light' }
  catch { return 'light' }
}

function Atlas({ data }: { data: AtlasData }) {
  const index = useMemo(() => createIndex(data), [data])
  const capital = useMemo(() => indexCapitalPathways(loadCapitalResearch(data), index), [data, index])
  const options = useMemo(() => filterOptions(index), [index])
  const [page, setPage] = useState(currentPage)
  const [theme, setTheme] = useState(initialTheme)
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [fullNetwork, setFullNetwork] = useState(false)
  const [selected, setSelected] = useState(index.entityById.has('cdb') ? 'cdb' : index.entities[0]?.id ?? '')
  const [selectedEdge, setSelectedEdge] = useState('')
  const [focus, setFocus] = useState(false)
  const [isolated, setIsolated] = useState(false)
  const [groups, setGroups] = useState<LineGroup[]>(lineGroups.map(([id]) => id))
  const [picked, setPicked] = useState<string[]>([])
  const focusedNetwork = useMemo(() => selectNetwork(index, emptyFilters), [index])
  const { entities: results, edges: matchingEdges } = useMemo(() => selectNetwork(index, filters, fullNetwork), [index, filters, fullNetwork])
  const selectedEntity = index.entityById.get(selected)
  const liveRoot = results.some(entity => entity.id === selected)
  const isIsolated = isolated && liveRoot
  const edges = useMemo(() => matchingEdges.filter(edge => groups.includes(edgeGroup(edge)) &&
    (!isIsolated || edge.source === selected || edge.target === selected)), [matchingEdges, groups, isIsolated, selected])
  const entities = useMemo(() => {
    if (!isIsolated) return results
    const neighbourhood = new Set([selected, ...edges.flatMap(edge => [edge.source, edge.target])])
    return results.filter(entity => neighbourhood.has(entity.id))
  }, [edges, isIsolated, results, selected])
  const inspectedEdge = index.relationshipList.find(edge => edge.id === selectedEdge)

  useEffect(() => {
    function onHash() { setPage(currentPage()); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('caribbean-capital-atlas.theme', theme) } catch { /* Theme still applies to the current session. */ }
  }, [theme])

  function choose(id: string) {
    setSelected(id)
    setSelectedEdge('')
    setFocus(true)
    if (!results.some(entity => entity.id === id)) {
      if (!focusedNetwork.entities.some(entity => entity.id === id)) setFullNetwork(true)
      setFilters(emptyFilters)
      setGroups(lineGroups.map(([group]) => group))
    }
  }

  function updateView(next: Filters, expanded = fullNetwork) {
    setSelectedEdge('')
    setIsolated(false)
    setFilters(next)
    setFullNetwork(expanded)
    const matching = selectNetwork(index, next, expanded).entities
    if (!matching.some(entity => entity.id === selected)) {
      setSelected(matching.length === 1 ? matching[0].id : '')
      setFocus(false)
    }
  }

  function toggleComparison(id: string) {
    setPicked(previous => previous.includes(id) ? previous.filter(value => value !== id) : previous.length < 3 ? [...previous, id] : previous)
  }

  function toggleGroup(group: LineGroup) {
    setGroups(previous => previous.includes(group) ? previous.filter(value => value !== group) : [...previous, group])
    if (inspectedEdge && edgeGroup(inspectedEdge) === group) setSelectedEdge('')
  }

  function viewProfile(id: string) {
    setIsolated(false)
    choose(id)
    window.location.hash = 'network'
  }

  return <>
    <a href="#main" className="skip-link" onClick={event => {
      event.preventDefault()
      const main = document.getElementById('main')
      main?.setAttribute('tabindex', '-1')
      main?.focus()
    }}>Skip to content</a>
    <header className="app-header">
      <div className="header-inner">
        <a href="#about" className="brand" aria-label={atlasName + ' home'}>
          <span className="brand-icon"><Network size={24} strokeWidth={1.7}/></span>
          <span className="brand-text"><small>CARIBBEAN</small><strong>Climate &amp; Transition Finance Atlas</strong></span>
        </a>
        <nav aria-label="Main navigation">
          {pages.map(({ id, label, icon: Icon }) => <a key={id} href={'#' + id} aria-current={page === id ? 'page' : undefined}>
            <Icon size={16} strokeWidth={1.7}/><span>{label}</span>{id === 'compare' && picked.length > 0 && <small>{picked.length}</small>}
          </a>)}
        </nav>
        <div className="header-end">
          <button type="button" className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            {theme === 'dark' ? <Sun size={19}/> : <Moon size={18}/>}
          </button>
        </div>
      </div>
    </header>
    {page === 'network' && <main className="atlas-page" id="main">
      <section className="atlas-intro" aria-labelledby="page-title">
        <div><h1 id="page-title">Network explorer</h1><p>{atlasSubtitle}</p></div>
        <a href="#about" className="methodology-link"><CircleHelp size={16}/> About the atlas <ArrowUpRight size={14}/></a>
      </section>
      <div className="atlas-grid">
        <Sidebar filters={filters} options={options} results={results} selected={selected} onChange={updateView} onSelect={choose}/>
        <NetworkPanel entities={entities} edges={edges} allEdges={fullNetwork ? index.relationshipList : focusedNetwork.edges} pathways={capital.byRelationship}
          selected={liveRoot ? selected : ''} selectedEdge={selectedEdge} focus={focus}
          fullNetwork={fullNetwork} onToggleScope={() => updateView(filters, !fullNetwork)}
          isolated={isIsolated} groups={groups} onToggleGroup={toggleGroup} onIsolate={() => {
            setSelectedEdge(''); setIsolated(!isIsolated); setFocus(!isIsolated)
          }} onEntity={choose} onEdge={setSelectedEdge} onBackground={() => { setSelectedEdge(''); setFocus(false) }}/>
        {inspectedEdge ? <EdgeInspector key={inspectedEdge.id} edge={inspectedEdge} index={index} capital={capital} onEntity={choose} onBack={() => setSelectedEdge('')}/> :
          <Inspector key={selected} entity={selectedEntity} index={index} pathways={capital.byRelationship} onEntity={choose} onEdge={setSelectedEdge} compared={picked.includes(selected)} compareFull={picked.length >= 3} onCompare={() => toggleComparison(selected)}/>}
      </div>
      <div className="atlas-foot"><span>{atlasName} <b>·</b> v0.1</span><span>Source coverage varies by institution and market.</span></div>
    </main>}
    {page === 'compare' && <Compare index={index} picked={picked} onToggle={toggleComparison} onEntity={viewProfile}/>}
    {page === 'research' && <Research index={index} onEntity={viewProfile}/>}
    {page === 'about' && <About index={index}/>}
  </>
}

export function App() {
  const [result, setResult] = useState<{ data?: AtlasData; error?: string }>({})
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    localRepository.load().then(data => { if (active) setResult({ data }) })
      .catch((error: unknown) => { if (active) setResult({ error: error instanceof Error ? error.message : String(error) }) })
    return () => { active = false }
  }, [attempt])

  if (result.data) return <Atlas data={result.data}/>
  return <main className="startup">
    <h1>{atlasName}</h1>
    {result.error ? <><p role="alert">{result.error}</p><button className="primary-button" type="button" onClick={() => { setResult({}); setAttempt(attempt + 1) }}>Try again</button></> : <p role="status">Loading the institutional registry…</p>}
  </main>
}

