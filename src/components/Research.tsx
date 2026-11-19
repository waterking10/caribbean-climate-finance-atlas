import { ClipboardCheck, ExternalLink, FilePlus2, FlaskConical } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { EntityKind, ResearchCandidate, ReviewDecision } from '../model'
import { candidateKey, candidateReviews, duplicateName, readCandidates, seedCandidates } from '../research'
import { displayName } from '../selectors'
import type { AtlasIndex } from '../selectors'
import { isWebUrl } from '../validation'

export function Research({ index, onEntity }: { index: AtlasIndex; onEntity: (id: string) => void }) {
  const [initial] = useState(() => {
    try { return { entries: readCandidates(localStorage), readable: true } }
    catch { return { entries: seedCandidates, readable: false } }
  })
  const [entries, setEntries] = useState(initial.entries)
  const [selected, setSelected] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [queueFilter, setQueueFilter] = useState<ReviewDecision | ''>('')
  const current = entries.find(candidate => candidate.id === selected)
  const atlasReview = current && candidateReviews[current.id]
  const published = atlasReview?.publishedEntityId
  const listed = entries.filter(candidate => !queueFilter || candidate.decision === queueFilter)

  function save(next: ResearchCandidate[], status: string) {
    setError('')
    setMessage('')
    try {
      if (!initial.readable) throw new Error('Storage unavailable.')
      localStorage.setItem(candidateKey, JSON.stringify(next))
      setEntries(next)
      setMessage(status)
      return true
    } catch {
      setError('The browser could not save research records. Check site storage before continuing.')
      return false
    }
  }

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    const form = event.currentTarget
    const values = new FormData(form)
    const name = String(values.get('name')).trim()
    const website = String(values.get('website')).trim()
    const notes = String(values.get('notes')).trim()
    if (!name) return setError('Enter an institution, fund or facility name.')
    if (website && !isWebUrl(website)) return setError('Enter an HTTP or HTTPS website URL.')
    if (duplicateName(name, index, entries)) return setError('An entity or candidate already uses that name or alias.')
    const candidate: ResearchCandidate = {
      id: crypto.randomUUID(), name, kind: values.get('kind') as EntityKind, website: website || undefined, notes,
      decision: 'pending', createdOn: new Date().toISOString(),
    }
    if (save([candidate, ...entries], 'Candidate added to the review queue.')) {
      form.reset()
      setQueueFilter('')
      setSelected(candidate.id)
    }
  }

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!current) return
    setMessage('')
    setError('')
    const values = new FormData(event.currentTarget)
    const read = (key: string) => String(values.get(key) ?? '').trim()
    const evidenceUrl = read('evidenceUrl')
    const sourceTitle = read('sourceTitle')
    const sourcePublisher = read('sourcePublisher')
    const sourcePublishedOn = read('sourcePublishedOn')
    const sourceAccessedOn = read('sourceAccessedOn')
    const evidenceNote = read('evidenceNote')
    const reviewNote = read('reviewNote')
    const decision = read('decision') as ReviewDecision
    if (evidenceUrl && !isWebUrl(evidenceUrl)) return setError('Enter an HTTP or HTTPS source URL.')
    if (decision === 'approved' && (!evidenceUrl || !sourceTitle || !sourcePublisher || !sourceAccessedOn || !evidenceNote)) {
      return setError('Approval requires a source URL, title, publisher, access date and evidence note.')
    }
    if (decision === 'rejected' && !reviewNote) return setError('Add a review note explaining the rejection.')
    const updated: ResearchCandidate = {
      ...current, evidenceUrl: evidenceUrl || undefined, sourceTitle: sourceTitle || undefined,
      sourcePublisher: sourcePublisher || undefined, sourcePublishedOn: sourcePublishedOn || undefined,
      sourceAccessedOn: sourceAccessedOn || undefined,
      evidenceNote: evidenceNote || undefined, reviewNote: reviewNote || undefined, decision,
      reviewedOn: decision === 'pending' ? undefined : new Date().toISOString(),
    }
    if (save(entries.map(entry => entry.id === updated.id ? updated : entry), 'Review saved.')) setQueueFilter('')
  }

  return <main className="secondary-page" id="main">
    <header className="secondary-heading"><h1>Research desk</h1><p>Review candidates for Caribbean climate and transition finance. Published entries link to their atlas profiles. Your review edits are saved in this browser.</p></header>
    {!initial.readable && <p className="form-error" role="alert">Saved research could not be loaded. Browser storage or the saved records may be unavailable.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {message && <p className="form-success" role="status">{message}</p>}
    <div className="research-grid">
      <section className="panel form-card">
        <h2><FilePlus2 size={19}/> New candidate</h2>
        <form onSubmit={create}>
          <label>Name<input name="name" required maxLength={150} placeholder="Institution, fund or facility name"/></label>
          <label>Type<select name="kind"><option value="institution">Institution</option><option value="fund">Fund or investment vehicle</option><option value="facility">Facility</option><option value="programme">Programme</option></select></label>
          <label>Official website <small>Optional</small><input type="url" name="website" placeholder="https://"/></label>
          <label>Intake notes <small>Optional</small><textarea name="notes" rows={4} maxLength={3000} placeholder="What needs to be verified?"/></label>
          <button type="submit" className="primary-button">Add candidate</button>
        </form>
      </section>
      <section className="panel form-card">
        <div className="queue-header"><h2><ClipboardCheck size={19}/> Review queue</h2>
          <select aria-label="Filter review queue" value={queueFilter} onChange={event => setQueueFilter(event.target.value as ReviewDecision | '')}>
            <option value="">All decisions</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
        </div>
        {listed.length ? <ul className="queue-list">{listed.map(candidate => <li key={candidate.id}>
          <button type="button" aria-pressed={selected === candidate.id} onClick={() => { setError(''); setMessage(''); setSelected(candidate.id) }}>
            <span><strong>{candidate.name}</strong><small>{displayName(candidate.kind)}</small></span>
            <span className={'decision ' + candidate.decision}>{candidateReviews[candidate.id]?.publishedEntityId ? 'Published' : displayName(candidate.decision)}</span>
          </button>
        </li>)}</ul> : <p className="muted">No candidates match this queue filter.</p>}
        {current ? <form key={current.id + (current.reviewedOn ?? '')} className="review-form" onSubmit={review}>
          <h3>Review {current.name}</h3>
          <p className="muted">{current.notes}</p>
          {published && <button className="text-button" type="button" onClick={() => onEntity(published)}>View atlas profile</button>}
          {atlasReview?.reviewNote && atlasReview.reviewNote !== current.reviewNote && <p className="muted">{atlasReview.reviewNote}</p>}
          {current.website && <a className="official-link" href={current.website} target="_blank" rel="noreferrer">Candidate website <ExternalLink size={14}/></a>}
          {current.evidenceUrl && <a className="official-link" href={current.evidenceUrl} target="_blank" rel="noreferrer">Open saved source <ExternalLink size={14}/></a>}
          <label>Source URL<input name="evidenceUrl" type="url" placeholder="https://" defaultValue={current.evidenceUrl}/></label>
          <label>Source title<input name="sourceTitle" maxLength={200} defaultValue={current.sourceTitle}/></label>
          <label>Source publisher<input name="sourcePublisher" maxLength={200} defaultValue={current.sourcePublisher}/></label>
          <div className="source-dates">
            <label>Source accessed on<input name="sourceAccessedOn" type="date" defaultValue={current.sourceAccessedOn}/></label>
            <label>Source published on <small>Optional</small><input name="sourcePublishedOn" type="date" defaultValue={current.sourcePublishedOn}/></label>
          </div>
          <label>Evidence note<textarea name="evidenceNote" rows={3} maxLength={3000} defaultValue={current.evidenceNote} placeholder="Record the claim supported by the source."/></label>
          <label>Review decision<select name="decision" defaultValue={current.decision}>
            <option value="pending">Pending</option><option value="approved">Approved for dataset review</option><option value="rejected">Rejected</option>
          </select></label>
          <label>Review note<textarea name="reviewNote" rows={2} maxLength={3000} defaultValue={current.reviewNote}/></label>
          <button type="submit" className="primary-button">Save review</button>
        </form> : <div className="review-empty"><FlaskConical size={23}/><p>Select a candidate to add evidence and record a review decision.</p></div>}
      </section>
    </div>
  </main>
}

