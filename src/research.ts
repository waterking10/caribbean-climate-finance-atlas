import rawCandidates from './data/candidates.json'
import reviewData from './data/candidate-reviews.json'
import type { ResearchCandidate } from './model'
import { isWebUrl } from './validation'
import { normalize } from './selectors'
import type { AtlasIndex } from './selectors'

export const candidateKey = 'caribbean-capital-atlas.research.v1'
type CandidateReview = Partial<ResearchCandidate> & { publishedEntityId?: string }
export const candidateReviews = reviewData as Readonly<Partial<Record<string, CandidateReview>>>
const originalCandidates = rawCandidates as ResearchCandidate[]
export const seedCandidates = originalCandidates.map(candidate => ({ ...candidate, ...candidateReviews[candidate.id] }))
const candidateKinds = ['institution', 'fund', 'facility', 'programme']
const decisions = ['pending', 'approved', 'rejected']

function isCandidate(value: unknown): value is ResearchCandidate {
  if (!value || typeof value !== 'object') return false
  const item = value as ResearchCandidate
  return typeof item.id === 'string' && typeof item.name === 'string' &&
    typeof item.createdOn === 'string' && typeof item.notes === 'string' &&
    candidateKinds.includes(item.kind) && decisions.includes(item.decision) &&
    [item.website, item.evidenceUrl].every(url => url === undefined || typeof url === 'string' && isWebUrl(url)) &&
    [item.reviewedOn, item.reviewNote, item.sourceTitle, item.sourcePublisher, item.sourcePublishedOn,
      item.sourceAccessedOn, item.evidenceNote].every(value => value === undefined || typeof value === 'string')
}

export function readCandidates(storage: Storage): ResearchCandidate[] {
  const saved = storage.getItem(candidateKey)
  if (saved === null) return seedCandidates
  const data: unknown = JSON.parse(saved)
  if (!Array.isArray(data) || !data.every(isCandidate)) throw new Error('Invalid candidate data.')
  const savedIds = new Set(data.map(candidate => candidate.id))
  const savedNames = new Set(data.map(candidate => normalize(candidate.name)))
  const originalById = new Map(originalCandidates.map(candidate => [candidate.id, candidate]))
  const savedEntries = data.map(candidate => {
    const original = originalById.get(candidate.id)
    // Older versions saved the whole seed alongside local edits. Refresh untouched copies.
    const untouched = original && Object.keys(candidate).length === Object.keys(original).length &&
      Object.entries(candidate).every(([key, value]) => original[key as keyof ResearchCandidate] === value)
    return untouched ? { ...candidate, ...candidateReviews[candidate.id] } : candidate
  })
  return [...savedEntries, ...seedCandidates.filter(candidate => !savedIds.has(candidate.id) && !savedNames.has(normalize(candidate.name)))]
}

export function duplicateName(name: string, index: AtlasIndex, candidates: ResearchCandidate[]): boolean {
  const names = [
    ...index.entities.flatMap(entity => [entity.name, entity.shortName, ...(index.aliases.get(entity.id) ?? [])]),
    ...candidates.map(candidate => candidate.name),
  ]
  return names.some(value => normalize(value) === normalize(name))
}

