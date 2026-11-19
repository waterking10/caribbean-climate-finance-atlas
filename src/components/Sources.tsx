import { ExternalLink, FileText } from 'lucide-react'
import type { Evidence } from '../model'
import { VerificationBadge } from './NetworkPanel'
import { displayName } from '../selectors'

export function Sources({ ids, evidence }: { ids: string[]; evidence: ReadonlyMap<string, Evidence> }) {
  return <div className="evidence-stack">
    {ids.map(id => evidence.get(id)).filter((source): source is Evidence => Boolean(source)).map(source =>
      <article key={source.id} className="evidence-card">
        <div className="evidence-top"><FileText size={16}/><VerificationBadge status={source.status}/></div>
        <a href={source.url} target="_blank" rel="noreferrer">{source.title} <ExternalLink size={13}/></a>
        <p>{source.publisher}{source.publishedOn && ' · ' + source.publishedOn}</p>
        <p>{source.reference}</p>
        {source.confidence && <small>Evidence basis · {displayName(source.confidence)}</small>}
        {source.ambiguity && <p>{source.ambiguity}</p>}
        <small>Accessed {source.accessedOn}</small>
      </article>
    )}
  </div>
}
