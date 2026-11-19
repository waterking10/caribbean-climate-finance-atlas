import type { PathwayRelationshipType } from './capital-research-model'
import type { RelationshipType } from './model'

export const relationshipFamilies = {
  capital: 'Capital & investment',
  management: 'Management & administration',
  decision: 'Decision-making & control',
  risk: 'Guarantees & risk sharing',
  support: 'Technical & preparation support',
  review: 'Requires classification',
} as const
export type RelationshipFamily = keyof typeof relationshipFamilies

// Presentation metadata only. Never use this grouping as evidence of authority or a transfer.
export const relationshipFamilyByType = {
  CAPITALIZES: 'capital', CONTRIBUTES_TO: 'capital', FUNDS: 'capital', GRANTS_TO: 'capital',
  LENDS_TO: 'capital', ON_LENDS_TO: 'capital', INVESTS_IN: 'capital', SUBSCRIBES_TO: 'capital',
  COMMITS_SAVINGS_TO: 'capital', DISBURSES_TO: 'capital', CO_INVESTS_WITH: 'capital',
  MANAGES: 'management', ADMINISTERS: 'management', IMPLEMENTS_FOR: 'management', ARRANGES: 'management', SUB_FUND_OF: 'management',
  OWNS: 'decision', SUBSIDIARY_OF: 'decision', ESTABLISHED_BY: 'decision', ACCREDITED_BY: 'decision',
  SETS_INVESTMENT_POLICY_FOR: 'decision', SETS_GRANT_POLICY_FOR: 'decision', SETS_ELIGIBILITY_FOR: 'decision',
  APPRAISES: 'decision', APPROVES_FINANCING_FOR: 'decision', AUTHORIZES_DISBURSEMENT_FOR: 'decision',
  OVERSEES: 'decision', OVERSEES_IMPLEMENTATION_OF: 'decision',
  GUARANTEES: 'risk', INSURES: 'risk', BEARS_RISK_FOR: 'risk',
  PROVIDES_TECHNICAL_ASSISTANCE_TO: 'support', ADVISES: 'support',
  TARGETS: 'review', STRATEGIC_PARTNER: 'review',
} as const satisfies Record<RelationshipType | PathwayRelationshipType, RelationshipFamily>

export function relationshipFamily(type: string): RelationshipFamily {
  return relationshipFamilyByType[type as keyof typeof relationshipFamilyByType] ?? 'review'
}

export const classificationNotes: Partial<Record<RelationshipType | PathwayRelationshipType, string>> = {
  CO_INVESTS_WITH: 'Documents participation alongside another investor, not a transfer between the co-investors.',
  COMMITS_SAVINGS_TO: 'A commitment of savings does not establish a realised payment.',
  ARRANGES: 'Arrangement and agency do not establish lending or credit approval authority.',
  SUB_FUND_OF: 'Documents fund structure; does not establish management delegation or a capital transfer.',
  ESTABLISHED_BY: 'Historical establishment or issuance; does not establish current financing approval authority. Read the original direction and description.',
  ACCREDITED_BY: 'Accreditation establishes eligibility, not financing or delegated approval authority.',
  OWNS: 'Ownership does not establish authority over an individual financing decision.',
  SUBSIDIARY_OF: 'Legal group structure does not establish transaction-level approval authority.',
  APPRAISES: 'Appraisal is assessment, not approval.',
  OVERSEES: 'Oversight is limited to the activity described in the evidence.',
  OVERSEES_IMPLEMENTATION_OF: 'Implementation oversight is distinct from loan or grant approval.',
  ADVISES: 'Advice may be legal or transactional; no financing or approval role is implied.',
  TARGETS: 'Identifies intended beneficiaries or eligibility. No transfer or decision-making authority is established.',
  STRATEGIC_PARTNER: 'Generic partnership does not establish a specific capital, management, authority, risk or support function.',
}
