import type { Classification, Evidence, Theme, Verification } from './model'

export const pathwayRelationshipGroups = {
  CAPITALIZES: 'finance',
  CONTRIBUTES_TO: 'finance',
  FUNDS: 'finance',
  GRANTS_TO: 'finance',
  LENDS_TO: 'finance',
  ON_LENDS_TO: 'finance',
  INVESTS_IN: 'finance',
  SUBSCRIBES_TO: 'finance',
  COMMITS_SAVINGS_TO: 'finance',
  DISBURSES_TO: 'finance',
  GUARANTEES: 'risk',
  INSURES: 'risk',
  BEARS_RISK_FOR: 'risk',
  SETS_INVESTMENT_POLICY_FOR: 'decision',
  SETS_GRANT_POLICY_FOR: 'decision',
  SETS_ELIGIBILITY_FOR: 'decision',
  APPRAISES: 'decision',
  APPROVES_FINANCING_FOR: 'decision',
  AUTHORIZES_DISBURSEMENT_FOR: 'decision',
  OVERSEES: 'decision',
  OVERSEES_IMPLEMENTATION_OF: 'decision',
  MANAGES: 'institutional',
  ADMINISTERS: 'institutional',
  ARRANGES: 'institutional',
  ADVISES: 'institutional',
  IMPLEMENTS_FOR: 'institutional',
  PROVIDES_TECHNICAL_ASSISTANCE_TO: 'institutional',
  TARGETS: 'institutional',
  ESTABLISHED_BY: 'institutional',
  SUB_FUND_OF: 'institutional',
} as const

export type PathwayRelationshipType = keyof typeof pathwayRelationshipGroups
export const financingInstruments = [
  'loan', 'concessional_loan', 'credit_line', 'contingent_credit', 'grant', 'rebate',
  'technical_assistance', 'equity', 'guarantee', 'insurance', 'bond', 'debt_conversion', 'blended_finance',
] as const
export const capitalSourceTypes = [
  'government_resources', 'bilateral_public', 'supranational_public', 'multilateral', 'commercial_bank',
  'private_institutional', 'private_subscribers', 'philanthropic', 'bond_investor', 'fiscal_savings',
  'carbon_market_proceeds', 'unknown',
] as const
export const capitalOriginGeographies = ['domestic', 'regional', 'international', 'unknown'] as const
export const researchActorKinds = ['institution', 'vehicle', 'authority_body', 'investor_class', 'recipient_group', 'project'] as const
export const recipientRoles = ['immediate', 'downstream', 'intended', 'contingent'] as const
export const pathwayAmountMeasures = [
  'fund_target', 'capital_raised', 'capital_contribution', 'loan_principal', 'grant', 'equity_contribution', 'guarantee_coverage',
  'insurance_coverage', 'project_cost', 'facility_size', 'fiscal_savings', 'contributions_received',
] as const
export const pathwayAmountStages = [
  'target', 'approved', 'committed', 'signed', 'closed', 'disbursed', 'received', 'estimated', 'reported',
] as const
export const pathwayAmountDateBases = ['event', 'reporting_period_end', 'source_publication', 'undated_source_snapshot'] as const

export type FinancingInstrument = typeof financingInstruments[number]

// Atlas IDs can be used directly as endpoints. These actors exist only in the research dataset.
export interface ResearchActor {
  id: string
  name: string
  kind: typeof researchActorKinds[number]
}

export interface PathwayLink {
  id: string
  source: string
  target: string
  type: PathwayRelationshipType
  instrument?: FinancingInstrument
  atlasRelationshipId?: string
  beneficiaryIds?: string[]
  description: string
  status: Exclude<Verification, 'unverified'>
  evidenceIds: string[]
  stage?: string
  fundingScope?: 'institution_balance_sheet' | 'global_pool_context'
  limitation?: string
}

export interface CapitalOrigin {
  providerId: string
  capitalType: typeof capitalSourceTypes[number]
  geography: typeof capitalOriginGeographies[number]
  linkId: string
  note: string
}

interface PathwayAmountDetails {
  id: string
  measure: typeof pathwayAmountMeasures[number]
  stage: typeof pathwayAmountStages[number]
  reportedOn: string | null
  dateBasis: typeof pathwayAmountDateBases[number]
  observedOn?: string
  alternativeToAmountId?: string
  aggregationStatus?: string
  precision?: string
  doNotAggregateWith?: string[]
  fundingScope?: 'institution_balance_sheet' | 'global_pool_context'
  linkId?: string
  partOfAmountId?: string
  scope: string
  evidenceIds: string[]
}

export type PathwayAmount = PathwayAmountDetails & (
  { value: number; currency: string; atlasRelationshipId?: never } |
  { atlasRelationshipId: string; value?: never; currency?: never }
)

export interface CapitalPathway {
  id: string
  name: string
  mechanismId: string
  geographies: string[]
  themes: Theme[]
  instruments: FinancingInstrument[]
  reviewStatus: 'partially_traced' | 'traced'
  upstreamCoverage: 'documented' | 'partial' | 'unknown'
  upstreamNote?: string
  origins: CapitalOrigin[]
  links: PathwayLink[]
  recipients: { actorId: string; role: typeof recipientRoles[number]; linkId: string }[]
  amounts: PathwayAmount[]
  gaps: { field: string; status: 'unknown' | 'conflicting'; description: string; evidenceIds: string[] }[]
}

export interface CapitalResearch {
  reviewedOn: string
  geographies: Classification[]
  actors: ResearchActor[]
  sources: Evidence[]
  pathways: CapitalPathway[]
}
