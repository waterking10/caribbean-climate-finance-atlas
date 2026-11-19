import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { CircleHelp, Columns3, Moon, Network, Sun } from 'lucide-react'
import { indexCapitalPathways, loadCapitalResearch } from './capital-research'
import { About } from './components/About'
import { Compare } from './components/Compare'
import { FocusedExplorer } from './components/FocusedExplorer'
import type { FocusRequest } from './components/FocusedExplorer'
import type { ProfileKind } from './components/FullProfiles'
import { atlasName } from './model'
import type { AtlasData } from './model'
import { localRepository } from './repository'
import { createIndex } from './selectors'
import { createFocusedIndex } from './focused-network'
const FullProfiles = lazy(() => import('./components/FullProfiles').then(module => ({default: module.FullProfiles})))

const pages = [
  { id: 'network', label: 'Explore', icon: Network },
  { id: 'compare', label: 'Compare', icon: Columns3 },
  { id: 'about', label: 'About & Methodology', icon: CircleHelp },
] as const
export type AtlasRoute = { kind: 'network' | 'compare' | 'about' } | { kind: ProfileKind; id: string }
export function readAtlasRoute(hash: string): AtlasRoute {
  const profile = /^#(institution|mechanism|relationship)\/(.+)$/.exec(hash)
  if (profile) {
    try { return { kind: profile[1] as ProfileKind, id: decodeURIComponent(profile[2]) } } catch { return { kind: 'network' } }
  }
  return { kind: hash === '#compare' ? 'compare' : hash === '#about' ? 'about' : 'network' }
}
type Theme = 'light' | 'dark'
function initialTheme(): Theme {
  try { return localStorage.getItem('caribbean-capital-atlas.theme') === 'dark' ? 'dark' : 'light' }
  catch { return 'light' }
}
function Atlas({ data }: { data: AtlasData }) {
  const index = useMemo(() => createIndex(data), [data])
  const research = useMemo(() => loadCapitalResearch(data), [data])
  const capital = useMemo(() => indexCapitalPathways(research, index), [research, index])
  const focused = useMemo(() => createFocusedIndex(index, research), [index, research])
  const [route, setRoute] = useState(() => readAtlasRoute(window.location.hash))
  const [theme, setTheme] = useState(initialTheme)
  const [picked, setPicked] = useState<string[]>([])
  const [request, setRequest] = useState<FocusRequest | undefined>(() => route.kind === 'institution' ? {id: route.id, token: 1} : route.kind === 'mechanism' ? {pathwayId: route.id, token: 1} : undefined)
  useEffect(() => {
    function onHash() {
      if (/^#\/?research(?:-desk)?\/?$/i.test(window.location.hash)) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + '#network')
      }
      setRoute(readAtlasRoute(window.location.hash))
      window.scrollTo({top: 0})
    }
    onHash()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('caribbean-capital-atlas.theme', theme) } catch { /* Theme still applies to this session. */ }
  }, [theme])
  function toggleComparison(id: string) {
    setPicked(previous => previous.includes(id) ? previous.filter(value => value !== id) : previous.length < 3 ? [...previous, id] : previous)
  }
  function explore(id: string, pathwayId?: string) {
    setRequest(previous => ({id,pathwayId,token:(previous?.token??0)+1}))
    window.location.hash='network'
  }
  const navigationPage = route.kind === 'compare' || route.kind === 'about' ? route.kind : 'network'
  return <>
    <a href="#main" className="skip-link" onClick={event => {
      event.preventDefault()
      const main = document.getElementById(route.kind === 'network' ? 'explore-main' : 'main')
      main?.setAttribute('tabindex', '-1'); main?.focus()
    }}>Skip to content</a>
    <header className="app-header"><div className="header-inner">
      <a href="#about" className="brand" aria-label={atlasName+' home'}><span className="brand-icon"><Network size={24} strokeWidth={1.7}/></span><span className="brand-text"><small>CARIBBEAN</small><strong>Climate &amp; Transition Finance Atlas</strong></span></a>
      <nav aria-label="Main navigation">{pages.map(({id,label,icon:Icon})=><a key={id} href={'#'+id} aria-current={navigationPage===id?'page':undefined}><Icon size={16} strokeWidth={1.7}/><span>{label}</span>{id==='compare'&&picked.length>0&&<small>{picked.length}</small>}</a>)}</nav>
      <div className="header-end"><button type="button" className="icon-button" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label={theme==='dark'?'Switch to light theme':'Switch to dark theme'} title={theme==='dark'?'Switch to light theme':'Switch to dark theme'}>{theme==='dark'?<Sun size={19}/>:<Moon size={18}/>}</button></div>
    </div></header>
    <FocusedExplorer index={focused} hidden={route.kind!=='network'} request={request} picked={picked} onCompare={toggleComparison}/>
    {route.kind==='compare'&&<Compare index={index} picked={picked} onToggle={toggleComparison} onEntity={id=>{window.location.hash='institution/'+encodeURIComponent(id)}}/>}
    {route.kind==='about'&&<About index={index} focused={focused}/>}
    {(route.kind==='institution'||route.kind==='mechanism'||route.kind==='relationship')&&<Suspense fallback={<main id="main" className="secondary-page"><p role="status">Loading full profile…</p></main>}><FullProfiles key={route.kind+route.id} kind={route.kind} id={route.id} index={focused} capital={capital} picked={picked} onCompare={toggleComparison} onExplore={explore} onReturn={()=>{window.location.hash='network'}}/></Suspense>}
    <footer className="site-footer"><a href="https://github.com/waterking10/caribbean-climate-finance-atlas/issues/new?template=correction-or-missing-mechanism.yml" target="_blank" rel="noreferrer">Suggest a correction or missing mechanism</a></footer>
  </>
}
export function App() {
  const [result,setResult]=useState<{data?:AtlasData;error?:string}>({})
  const [attempt,setAttempt]=useState(0)
  useEffect(()=>{
    let active=true
    localRepository.load().then(data=>{if(active)setResult({data})}).catch((error:unknown)=>{if(active)setResult({error:error instanceof Error?error.message:String(error)})})
    return ()=>{active=false}
  },[attempt])
  if(result.data)return <Atlas data={result.data}/>
  return <main className="startup"><h1>{atlasName}</h1>{result.error?<><p role="alert">{result.error}</p><button className="primary-button" type="button" onClick={()=>{setResult({});setAttempt(attempt+1)}}>Try again</button></>:<p role="status">Loading the climate finance research…</p>}</main>
}
