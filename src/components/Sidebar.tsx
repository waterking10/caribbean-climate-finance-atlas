import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { categories } from '../model'
import type { Entity } from '../model'
import { emptyFilters, filterFields } from '../selectors'
import type { Filters, filterOptions } from '../selectors'

interface Props {
  filters: Filters
  options: ReturnType<typeof filterOptions>
  results: Entity[]
  selected: string
  onChange: (filters: Filters) => void
  onSelect: (id: string) => void
}

export function Sidebar({ filters, options, results, selected, onChange, onSelect }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return <aside className={mobileOpen ? 'sidebar panel mobile-open' : 'sidebar panel'} aria-label="Search and filters">
    <div className="sidebar-head">
      <h2><SlidersHorizontal size={15}/> Filters</h2>
      <button className="text-button reset-desktop" type="button" onClick={() => onChange(emptyFilters)}>Reset</button>
      <button className="text-button show-filters" aria-expanded={mobileOpen} type="button" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? 'Hide filters' : 'Show filters'} <ChevronDown size={14}/>
      </button>
    </div>
    <label className="search-field">
      <Search size={17} aria-hidden="true"/>
      <input type="search" aria-label="Search institutions and funds" placeholder="Search institutions…" value={filters.search}
        onChange={event => onChange({ ...filters, search: event.target.value })}/>
      {filters.search && <button type="button" aria-label="Clear search" onClick={() => onChange({ ...filters, search: '' })}><X size={15}/></button>}
    </label>
    <div className="sidebar-filters">
      {filterFields.map(([key, label]) => <label className="filter" key={key}>
        <span>{label}</span>
        <span className="select-shell">
          <select aria-label={label} value={filters[key]} onChange={event => onChange({ ...filters, [key]: event.target.value })}>
            <option value="">All {key === 'ownership' ? 'ownership classes' : key === 'geography' ? 'locations' : key === 'origin' ? 'origins' : key === 'relationship' ? 'relationships' : key === 'category' ? 'categories' : key + 's'}</option>
            {options[key].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <ChevronDown size={14} aria-hidden="true"/>
        </span>
      </label>)}
      <button className="text-button reset-mobile" type="button" onClick={() => onChange(emptyFilters)}>Reset filters</button>
    </div>
    <div className="results">
      <div className="results-heading"><h3>Entities</h3><span aria-live="polite">{results.length}</span></div>
      <ul aria-label="Matching entities">
        {results.map(entity => <li key={entity.id}>
          <button className={selected === entity.id ? 'result selected' : 'result'} type="button" aria-pressed={selected === entity.id} onClick={() => onSelect(entity.id)} title={entity.name}>
            <span className="category-dot" style={{ background: categories[entity.category].color }}/>
            <span>{entity.shortName}<small>{entity.type}</small></span>
          </button>
        </li>)}
      </ul>
      {results.length === 0 && <p className="muted no-results">No entities match your filters.</p>}
    </div>
  </aside>
}

