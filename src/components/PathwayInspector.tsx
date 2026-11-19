import { resolvePathwayAmount } from '../capital-research'
import type { CapitalPathwayIndex } from '../capital-research'
import { pathwayRelationshipGroups } from '../capital-research-model'
import type { CapitalPathway, PathwayLink } from '../capital-research-model'
import { displayName } from '../selectors'
import { VerificationBadge } from './NetworkPanel'
import { Sources } from './Sources'
import { classificationNotes, relationshipFamily, relationshipFamilies } from '../relationship-taxonomy'

const sections = [
  ['finance', 'Capital sources and financing'],
  ['institutional', 'Management and administration'],
  ['decision', 'Decision-making authority'],
  ['risk', 'Guarantees and risk'],
] as const

const numberFormat = new Intl.NumberFormat('en')
const observationNotes: Record<string, string> = {
  scope_reconciliation_hold: 'Funding scope requires reconciliation.',
  approval_basis_reconciliation_hold: 'Reported financial bases require reconciliation.',
  hold: 'Financial amount requires review.',
  institutional_context_only: 'Amount applies to the institution as a whole.',
  estimate_only: 'Estimate over the stated period.',
  wider_region_programme_only: 'Amount covers the wider regional programme.',
}

function ClaimSources({ ids, capital }: { ids: string[]; capital: CapitalPathwayIndex }) {
  return ids.length > 0 && <details className="pathway-sources"><summary>Evidence ({ids.length})</summary>
    <Sources ids={ids} evidence={capital.evidence}/>
  </details>
}

function PathwayClaim({ link, path, capital, onEntity }: { link: PathwayLink; path: CapitalPathway; capital: CapitalPathwayIndex; onEntity?: (id: string) => void }) {
  const origins = path.origins.filter(origin => origin.linkId === link.id)
  const recipients = path.recipients.filter(recipient => recipient.linkId === link.id)
  return <li>
    <strong>{displayName(link.type)}{link.instrument && ' · ' + displayName(link.instrument)}</strong>
    <div className="pathway-parties">{onEntity ? <button className="text-button" type="button" onClick={() => onEntity(link.source)}>{capital.actorNames.get(link.source)}</button> : capital.actorNames.get(link.source)} → {onEntity ? <button className="text-button" type="button" onClick={() => onEntity(link.target)}>{capital.actorNames.get(link.target)}</button> : capital.actorNames.get(link.target)}</div>
    {link.status !== 'verified' && <VerificationBadge status={link.status}/>}
    <p>{link.description}</p>
    {classificationNotes[link.type] && <p className="classification-note">{classificationNotes[link.type]}</p>}
    {link.stage && <small>Documented stage · {displayName(link.stage)}</small>}
    {link.fundingScope && <p>{displayName(link.fundingScope)}</p>}
    {link.limitation && <p>{link.limitation}</p>}
    {origins.map(origin => <p key={origin.providerId}><strong>Capital origin · {displayName(origin.geography)} · {displayName(origin.capitalType)}</strong> {origin.note}</p>)}
    {recipients.map(recipient => <p key={recipient.actorId}><strong>{displayName(recipient.role)} recipient</strong> · {capital.actorNames.get(recipient.actorId)}</p>)}
    {link.beneficiaryIds && link.beneficiaryIds.length > 0 && <p><strong>Protected parties</strong> · {link.beneficiaryIds.map(id => capital.actorNames.get(id)).join(', ')}</p>}
    <ClaimSources ids={link.evidenceIds} capital={capital}/>
  </li>
}

export function PathwayInspector({ edgeId, pathways, capital, onEntity }: { edgeId: string; pathways: CapitalPathway[]; capital: CapitalPathwayIndex; onEntity?: (id: string) => void }) {
  return <section className="pathway-inspector" aria-label="Capital pathway research">
    <h3>Capital pathway</h3>
    {pathways.map((path, index) => {
      const matching = path.links.filter(link => link.atlasRelationshipId === edgeId || link.id === edgeId)
      const contextual = path.links.filter(link => !matching.includes(link))
      return <details className="pathway-mechanism" key={path.id} open={index === 0}>
        <summary>{path.name}</summary>
        <div className="pathway-body">
          <p>Upstream capital coverage · {displayName(path.upstreamCoverage)}</p>
          {path.upstreamNote && <p>{path.upstreamNote}</p>}
          {matching.length > 0 && <details className="pathway-section" open>
            <summary>Research on this relationship</summary>
            <ul>{matching.map(link => <PathwayClaim key={link.id} link={link} path={path} capital={capital} onEntity={onEntity}/>)}</ul>
          </details>}
          <p className="pathway-label">Wider financing pathway</p>
          {sections.map(([group, title]) => {
            const claims = contextual.filter(link => pathwayRelationshipGroups[link.type] === group && !['support', 'review'].includes(relationshipFamily(link.type)))
            return claims.length > 0 && <details className="pathway-section" key={group}>
              <summary>{title}</summary>
              <ul>{claims.map(link => <PathwayClaim key={link.id} link={link} path={path} capital={capital} onEntity={onEntity}/>)}</ul>
            </details>
          })}
          {(['support', 'review'] as const).map(group => {
            const claims = contextual.filter(link => relationshipFamily(link.type) === group)
            return claims.length > 0 && <details className="pathway-section" key={group}><summary>{relationshipFamilies[group]}</summary>
              <ul>{claims.map(link => <PathwayClaim key={link.id} link={link} path={path} capital={capital} onEntity={onEntity}/>)}</ul>
            </details>
          })}
          {path.amounts.length > 0 && <details className="pathway-section">
            <summary>Reported amounts</summary>
            <ul>{path.amounts.map(amount => {
              const resolved = resolvePathwayAmount(amount, capital.relationships)
              const currentAmount = amount.atlasRelationshipId === edgeId
              const parent = path.amounts.find(item => item.id === amount.partOfAmountId)
              const alternative = path.amounts.find(item => item.id === amount.alternativeToAmountId)
              return <li key={amount.id}>
                <strong>{displayName(amount.measure)} · {displayName(amount.stage)}</strong>
                {currentAmount ? <div>See the relationship amount above.</div> :
                  resolved && <div className="pathway-parties">{resolved.currency} {numberFormat.format(resolved.value)}</div>}
                <small>{amount.reportedOn ? displayName(amount.dateBasis) + ' · ' + amount.reportedOn : 'Reporting date unknown'}</small>
                {amount.observedOn && <small>Source inspected · {amount.observedOn}</small>}
                <p>{amount.scope}</p>
                {amount.fundingScope && <p>{displayName(amount.fundingScope)}</p>}
                {amount.precision && <p>Precision · {displayName(amount.precision)}</p>}
                {alternative && <p>Alternative observation · {displayName(alternative.measure)} · {alternative.reportedOn ?? 'Reporting date unknown'}</p>}
                {amount.aggregationStatus && <p>{observationNotes[amount.aggregationStatus] ?? displayName(amount.aggregationStatus)}</p>}
                {amount.doNotAggregateWith?.length ? <p>Overlapping financial observations are recorded separately.</p> : null}
                {parent && <p>Included in the {displayName(parent.stage).toLowerCase()} {displayName(parent.measure).toLowerCase()} reported on {parent.reportedOn}.</p>}
                <ClaimSources ids={amount.evidenceIds} capital={capital}/>
              </li>
            })}</ul>
          </details>}
          {path.gaps.length > 0 && <details className="pathway-section">
            <summary>Open research questions ({path.gaps.length})</summary>
            <ul>{path.gaps.map(gap => <li key={gap.field}>
              <strong>{gap.field} · {displayName(gap.status)}</strong>
              <p>{gap.description}</p>
              <ClaimSources ids={gap.evidenceIds} capital={capital}/>
            </li>)}</ul>
          </details>}
        </div>
      </details>
    })}
  </section>
}
