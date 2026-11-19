import { ArrowLeft, Columns3, Plus, X } from 'lucide-react'
import { entityColor } from '../entity-taxonomy'
import type { Entity } from '../model'
import { comparisonRows, comparisonValues, sharedValues } from '../selectors'
import type { AtlasIndex } from '../selectors'

function CellValues({ values, shared }: { values: string[]; shared: Set<string> }) {
  const ordered = [...new Set(values)].sort((a, b) => Number(shared.has(b)) - Number(shared.has(a)))
  const visibleCount = ordered.length > 6 ? 5 : ordered.length
  const item = (value: string) => <li key={value} className={shared.has(value) ? 'shared' : ''}>{value}</li>
  return <>
    <ul>{ordered.slice(0, visibleCount).map(item)}</ul>
    {ordered.length > visibleCount && <details className="table-details">
      <summary>Show {ordered.length - visibleCount} more</summary>
      <ul>{ordered.slice(visibleCount).map(item)}</ul>
    </details>}
  </>
}

export function Compare({ index, picked, onToggle, onEntity }: {
  index: AtlasIndex; picked: string[]; onToggle: (id: string) => void; onEntity: (id: string) => void;
}) {
  const selected = picked.map(id => index.entityById.get(id)).filter((entity): entity is Entity => Boolean(entity))
  const options = index.entities.filter(entity => !picked.includes(entity.id)).sort((a, b) => a.name.localeCompare(b.name))
  return <main className="secondary-page" id="main">
    <a href="#network" className="back-link"><ArrowLeft size={15}/> Explore</a>
    <header className="secondary-heading"><h1>Compare entities</h1><p>Compare evidence-backed characteristics across up to three institutions, funds or facilities.</p></header>
    <section className="panel comparison-panel">
      <div className="compare-controls">
        <div className="picked">
          {selected.map(entity => <div className="picked-chip" key={entity.id}>
            <span className="category-dot" style={{ background: entityColor(entity) }}/>
            {entity.shortName}
            <button type="button" aria-label={'Remove ' + entity.shortName} onClick={() => onToggle(entity.id)}><X size={15}/></button>
          </div>)}
          {selected.length < 3 && <label className="add-select"><Plus size={16}/>
            <select aria-label="Add entity to comparison" value="" onChange={event => { if (event.target.value) onToggle(event.target.value) }}>
              <option value="">Add an entity</option>
              {options.map(entity => <option key={entity.id} value={entity.id}>{entity.shortName} — {entity.name}</option>)}
            </select>
          </label>}
        </div>
        <span className="muted">{selected.length} of 3 selected</span>
      </div>
      {selected.length < 2 ? <div className="comparison-empty"><Columns3 size={32}/><h2>Select {selected.length === 0 ? 'two or three entities' : 'one more entity'}</h2>
        <p>Choose entities here or add them from their network profiles.</p>
      </div> : <div className="table-scroll" tabIndex={0} aria-label="Comparison table, scroll horizontally on small screens">
        <table className="compare-table">
          <thead><tr><th scope="col">Profile field</th>{selected.map(entity =>
            <th scope="col" key={entity.id}><button type="button" className="text-button" onClick={() => onEntity(entity.id)}>{entity.name}</button></th>
          )}</tr></thead>
          <tbody>{comparisonRows.map(field => {
            const comparison = selected.map(entity => comparisonValues(entity, field, index))
            const shared = sharedValues(comparison)
            return <tr key={field}><th scope="row">{field}</th>
              {comparison.map((values, i) => <td key={selected[i].id}>
                {values.length > 0 ? <CellValues values={values} shared={shared}/> : <span className="muted">{field === 'Relationships' ? 'No verified links recorded' : field === 'Capital sources' && selected[i].capitalSources === 'not_publicly_disclosed' ? 'Not publicly disclosed' : 'Not yet researched'}</span>}
              </td>)}
            </tr>
          })}</tbody>
        </table>
        <p className="table-key"><i/> Highlighted values appear in two or more selected profiles.</p>
      </div>}
    </section>
  </main>
}

