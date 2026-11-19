import { useState } from 'react'
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, Building2, ChartNoAxesColumn, ChevronDown, GitBranch, Globe2, Link2, Plus } from 'lucide-react'
import type { CapitalPathwayIndex } from '../capital-research'
import type { CapitalPathway } from '../capital-research-model'
import { accessRoutes, categories, financialRoles, scopes, themes } from '../model'
import type { Entity, Relationship } from '../model'
import { displayName, edgeGroup } from '../selectors'
import type { AtlasIndex } from '../selectors'
import { VerificationBadge } from './NetworkPanel'
import { PathwayInspector } from './PathwayInspector'
import { Sources } from './Sources'

function Amount({ edge, pathwayAmounts }: { edge: Relationship; pathwayAmounts?: boolean }) {
  if (!edge.amount) return <p className="muted">{pathwayAmounts ? 'See dated financial observations in the capital pathway below.' : 'Amount unavailable in the atlas.'}</p>
  const amount = edge.amount
  return <div className="edge-amount">
    <span>{displayName(amount.status)}</span>
    <strong>{amount.currency} {new Intl.NumberFormat('en').format(amount.value)}</strong>
    {amount.instrument && <small>{amount.instrument}</small>}
    {amount.asOf && <small>As of {amount.asOf}</small>}
  </div>
}

export function EdgeInspector({ edge, index, capital, onEntity, onBack }: {
  edge: Relationship; index: AtlasIndex; capital: CapitalPathwayIndex; onEntity: (id: string) => void; onBack: () => void;
}) {
  const pathways = capital.byRelationship.get(edge.id)
  return <aside className="inspector panel" aria-label="Relationship details">
    <div className="inspector-label">
      <button className="text-button" onClick={onBack} type="button"><ArrowLeft size={15}/> Entity profile</button>
    </div>
    <div className="inspector-scroll">
      <div className="profile-head">
        <div className="profile-icon"><Link2 size={23}/></div>
        <div className="profile-meta"><VerificationBadge status={edge.status}/>{pathways && <span className="pathway-marker">Capital pathway</span>}</div>
        <h2>{displayName(edge.type)}</h2>
        <div className="edge-endpoints">
          <button type="button" onClick={() => onEntity(edge.source)}>{index.entityById.get(edge.source)?.shortName}</button>
          {edge.direction === 'mutual' ? <Link2 size={16}/> : <ArrowRight size={16}/>}
          <button type="button" onClick={() => onEntity(edge.target)}>{index.entityById.get(edge.target)?.shortName}</button>
        </div>
        <p className="muted">{edge.description}</p>
        {edge.period && <p className="muted">Effective period · {edge.period}</p>}
      </div>
      <div className="profile-content">
        {edge.themes.length > 0 && <div className="tags">{edge.themes.map(theme => <span key={theme}>{themes[theme]}</span>)}</div>}
        <h3>Scope assessment</h3><p>{edge.scopeRationale}</p>
        <h3>Roles in this relationship</h3>
        <dl className="facts">
          <div><dt>{index.entityById.get(edge.source)?.shortName}</dt><dd>{edge.participantRoles.source}</dd></div>
          <div><dt>{index.entityById.get(edge.target)?.shortName}</dt><dd>{edge.participantRoles.target}</dd></div>
        </dl>
        {edgeGroup(edge) !== 'institutional' && <Amount edge={edge} pathwayAmounts={pathways?.some(path => path.amounts.length > 0)}/>}
        {pathways && <PathwayInspector edgeId={edge.id} pathways={pathways} capital={capital}/>}
        <h3>Supporting evidence</h3>
        <Sources ids={[...new Set([...edge.evidenceIds, ...(edge.scopeEvidenceIds ?? [])])]} evidence={index.evidence}/>
      </div>
    </div>
  </aside>
}

export function Inspector({ entity, index, pathways, onEntity, onEdge, compared, compareFull, onCompare }: {
  entity?: Entity; index: AtlasIndex; onEntity: (id: string) => void; onEdge: (id: string) => void;
  pathways: ReadonlyMap<string, CapitalPathway[]>;
  compared: boolean; compareFull: boolean; onCompare: () => void;
}) {
  const [tab, setTab] = useState('Overview')
  if (!entity) return <aside className="inspector panel" aria-label="Entity profile">
    <div className="inspector-label">Entity profile</div>
    <div className="profile-empty"><Building2 size={27}/><h2>Select an entity</h2><p>Choose a node or a search result to inspect its profile and evidence.</p></div>
  </aside>
  const aliases = index.aliases.get(entity.id) ?? []
  const otherEvidence = entity.evidenceIds.filter(id => !entity.scope.evidenceIds.includes(id))
  const links = index.direct.get(entity.id) ?? []
  const parentId = entity.kind === 'institution' ? entity.parentId : entity.managerId
  const fields = [
    entity.headquarters, entity.capitalOrigins?.length, entity.geographies.length, entity.sectors.length,
    entity.instruments?.length, entity.capitalSources, entity.access && entity.access.route !== 'unknown',
  ]
  const filled = fields.filter(Boolean).length
  const joinLabels = (ids: string[], entries: Map<string, string>) => ids.map(id => entries.get(id) ?? id).join(', ')
  const geographicLabels = joinLabels(entity.geographies, index.geography)
  return <aside className="inspector panel" aria-label="Entity profile">
    <div className="inspector-label"><span>Entity profile</span><button type="button" className="text-button" aria-pressed={compared} disabled={compareFull && !compared} onClick={onCompare}>
      {compared ? <ChartNoAxesColumn size={15}/> : <Plus size={15}/>} {compared ? 'In comparison' : 'Compare'}
    </button></div>
    <div className="inspector-scroll">
      <div className="profile-head">
        <div className="profile-meta">
          <div className="profile-icon" style={{ '--entity-color': categories[entity.category].color } as React.CSSProperties}><Building2 size={24}/></div>
          <VerificationBadge status={entity.status}/>
        </div>
        <h2>{entity.name}</h2>
        <p className="profile-alias">{[...new Set([entity.shortName, ...aliases])].filter(name => name !== entity.name).join(' · ') || entity.type}</p>
        <div className="tags"><span>{entity.type}</span><span>{entity.ownership}</span><span>{scopes[entity.scope.status]}</span></div>
        <a className="official-link" href={entity.website} target="_blank" rel="noreferrer"><Globe2 size={15}/> Official website <ArrowUpRight size={15}/></a>
      </div>
      <div className="profile-tabs" aria-label="Profile sections">
        {['Overview', 'Relationships', 'Evidence'].map(value => <button key={value} className={tab === value ? 'active' : ''} aria-pressed={tab === value}
          type="button" onClick={() => setTab(value)}>{value}{value === 'Evidence' && <small>{entity.scope.evidenceIds.length + otherEvidence.length}</small>}</button>)}
      </div>
      {tab === 'Overview' && <div className="profile-content">
        <h3>Mandate</h3>
        <p>{entity.mandate}</p>
        <details className="explanation"><summary>What does this institution actually do?<ChevronDown size={15}/></summary><p>{entity.plainLanguage}</p></details>
        <dl className="facts">
          <div><dt>Headquarters</dt><dd>{entity.headquarters ?? 'Not yet researched'}</dd></div>
          <div><dt>Geographic mandate</dt><dd>{entity.geographies.length > 5 ? <details className="geo-details">
            <summary>{index.geography.get(entity.geographies[0])} + {entity.geographies.length - 1} locations</summary>
            <span>{geographicLabels}</span>
          </details> : geographicLabels}</dd></div>
          <div><dt>Sectors</dt><dd>{joinLabels(entity.sectors, index.sector)}</dd></div>
          <div><dt>Instruments</dt><dd>{entity.instruments?.join(', ') ?? 'Not yet researched'}</dd></div>
          <div><dt>Capital sources</dt><dd>{Array.isArray(entity.capitalSources) ? entity.capitalSources.join(', ') : entity.capitalSources === 'not_publicly_disclosed' ? 'Not publicly disclosed' : 'Not yet researched'}</dd></div>
          <div><dt>Capital origin</dt><dd>{entity.capitalOrigins?.join(', ') ?? 'Not yet researched'}</dd></div>
          {parentId && <div><dt>{entity.kind === 'institution' ? 'Parent institution' : 'Fund manager'}</dt><dd><button className="text-button" type="button" onClick={() => onEntity(parentId)}>{index.entityById.get(parentId)?.name}</button></dd></div>}
        </dl>
        <h3>Core activities</h3><p>{entity.activities}</p>
        <h3>Scope assessment</h3><p>{entity.scope.rationale}</p>
        {entity.themes.length > 0 && <><h3>Themes</h3><div className="tags">{entity.themes.map(theme => <span key={theme}>{themes[theme]}</span>)}</div></>}
        {entity.roles.length > 0 && <><h3>Institutional financial roles</h3><div className="tags">{entity.roles.map(role => <span key={role}>{financialRoles[role]}</span>)}</div></>}
        {entity.access && <><h3>How to engage</h3><p className="route-label">{accessRoutes[entity.access.route]}</p><p>{entity.access.details}</p></>}
        <div className="profile-quality"><span>Data completeness</span><strong>{filled}/{fields.length} tracked fields</strong><progress max={fields.length} value={filled} aria-label="Data completeness"/>
          <span>Last verified</span><strong>{entity.verifiedOn ?? 'Pending'}</strong></div>
      </div>}
      {tab === 'Relationships' && <div className="profile-content">
        <h3>Documented relationships <span className="inline-count">{links.length}</span></h3>
        {links.length === 0 && <p className="muted">No verified relationships in this release.</p>}
        <ul className="relationship-list">
          {links.map(edge => {
            const outgoing = edge.source === entity.id
            const other = index.entityById.get(outgoing ? edge.target : edge.source)
            const Icon = edge.direction === 'mutual' ? Link2 : outgoing ? ArrowUpRight : ArrowDownLeft
            return <li key={edge.id}><button type="button" onClick={() => onEdge(edge.id)}>
              <Icon size={15}/><span><strong>{other?.shortName}</strong><small>{displayName(edge.type)}</small></span>
              {pathways.has(edge.id) ? <span className="pathway-marker">Capital pathway</span> : <GitBranch size={14}/>}
            </button></li>
          })}
        </ul>
      </div>}
      {tab === 'Evidence' && <div className="profile-content">
        <h3>Scope evidence</h3><Sources ids={entity.scope.evidenceIds} evidence={index.evidence}/>
        {otherEvidence.length > 0 && <><h3>Additional profile evidence</h3><Sources ids={otherEvidence} evidence={index.evidence}/></>}
      </div>}
    </div>
  </aside>
}

