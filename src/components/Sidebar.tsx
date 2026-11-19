import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { entityColor } from '../entity-taxonomy'
import type { ExplorationNode } from '../exploration'
import { emptyFilters, filterFields, selectedValues } from '../selectors'
import type { FilterField, Filters, filterOptions } from '../selectors'

interface Props {
  filters: Filters; options: ReturnType<typeof filterOptions>; results: ExplorationNode[]; selected: string
  hiddenCount: number; showAllMatching: boolean; onShowAllMatching: (show: boolean) => void
  onChange: (filters: Filters) => void; onSelect: (id: string) => void
}
export function Sidebar({ filters, options, results, selected, hiddenCount, showAllMatching, onShowAllMatching, onChange, onSelect }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  function field(key: FilterField) {
    const label = filterFields.find(([id]) => id === key)![1]
    const values = selectedValues(filters[key])
    return <div className="filter" key={key}>
      <label htmlFor={'filter-' + key}>{label}</label>
      <span className="select-shell">
        <select id={'filter-' + key} value="" onChange={event => onChange({ ...filters, [key]: event.target.value ? [...new Set([...values, event.target.value])] : [] })}>
          <option value="">{values.length ? 'Add another value…' : 'All · choose to filter'}</option>
          {options[key].filter(([id]) => !values.includes(id)).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select><ChevronDown size={14} aria-hidden="true"/>
      </span>
      {values.length > 0 && <div className="filter-chips">{values.map(id => <button key={id} type="button" aria-label={'Remove ' + (options[key].find(([value]) => id === value)?.[1] ?? id)}
        onClick={() => onChange({ ...filters, [key]: values.filter(value => value !== id) })}>{options[key].find(([value]) => id === value)?.[1] ?? id}<X size={12}/></button>)}</div>}
    </div>
  }
  return <aside className={mobileOpen ? 'sidebar panel mobile-open' : 'sidebar panel'} aria-label="Search and filters">
    <div className="sidebar-head">
      <h2><SlidersHorizontal size={15}/> Filters</h2>
      <button className="text-button reset-desktop" type="button" onClick={() => onChange(emptyFilters)}>Reset</button>
      <button className="text-button show-filters" aria-expanded={mobileOpen} type="button" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? 'Hide filters' : 'Show filters'} <ChevronDown size={14}/>
      </button>
    </div>
    <label className="search-field"><Search size={17} aria-hidden="true"/>
      <input type="search" aria-label="Search institutions and funds" placeholder="Search names or aliases…" value={filters.search}
        onChange={event => onChange({ ...filters, search: event.target.value })}/>
      {filters.search && <button type="button" aria-label="Clear search" onClick={() => onChange({ ...filters, search: '' })}><X size={15}/></button>}
    </label>
    <div className="sidebar-filters">
      {field('family')}{field('geography')}{field('theme')}{field('sector')}
      <p className="filter-help">Add multiple values to match any. Groups combine together.</p>
      <details className="advanced-filters"><summary>Advanced filters</summary>
        <fieldset><legend>Entity type & role</legend>{field('kind')}{field('type')}{field('role')}</fieldset>
        <fieldset><legend>Ownership/capital type</legend>{field('ownership')}{field('capitalType')}{field('origin')}</fieldset>
        <fieldset><legend>Further refinements</legend>{field('instrument')}{field('relationship')}</fieldset>
        <p className="filter-help">In pathway and institution modes, attribute filters select matching actors and retain their documented counterparties. The list below contains matching actors. Capital type describes a provider in a specific pathway; ownership and profile instruments do not prove a transaction’s source or form.</p>
      </details>
      <label className="matching-toggle"><input type="checkbox" checked={showAllMatching} onChange={event => onShowAllMatching(event.target.checked)}/> Display all matching entities</label>
      <p className="filter-help" role="status">{hiddenCount > 0 ? `${hiddenCount} disconnected matching entities hidden from the graph.` : 'Disconnected nodes are hidden when filters are active.'}</p>
      <button className="text-button reset-mobile" type="button" onClick={() => onChange(emptyFilters)}>Reset filters</button>
    </div>
    <div className="results">
      <div className="results-heading"><h3>Entities</h3><span aria-live="polite">{results.length}</span></div>
      <ul aria-label="Matching entities">{results.map(entity => <li key={entity.id}>
        <button className={selected === entity.id ? 'result selected' : 'result'} type="button" aria-pressed={selected === entity.id} onClick={() => onSelect(entity.id)} title={entity.name}>
          <span className="category-dot" style={{ background: entityColor(entity) }}/>
          <span>{entity.shortName}<small>{entity.type}</small></span>
        </button>
      </li>)}</ul>
      {results.length === 0 && <p className="muted no-results">No entities match your filters.</p>}
    </div>
  </aside>
}
