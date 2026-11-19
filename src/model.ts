export const relationshipTypes = [
  'OWNS', 'MANAGES', 'ESTABLISHED_BY', 'CAPITALIZES', 'FUNDS', 'LENDS_TO', 'INVESTS_IN',
  'CO_INVESTS_WITH', 'ACCREDITED_BY', 'IMPLEMENTS_FOR', 'GUARANTEES', 'INSURES',
  'STRATEGIC_PARTNER', 'SUBSIDIARY_OF',
  'ARRANGES', 'SUB_FUND_OF',
  'CONTRIBUTES_TO', 'GRANTS_TO', 'ADMINISTERS', 'COMMITS_SAVINGS_TO',
  'PROVIDES_TECHNICAL_ASSISTANCE_TO', 'TARGETS',
] as const

export const categories = {
  development: { label: 'Development finance', color: '#4fcaaf' },
  climate: { label: 'Climate & resilience', color: '#7dabfd' },
  public: { label: 'Public & regional', color: '#efbb70' },
  commercial: { label: 'Commercial banking', color: '#ed9c93' },
  institutional: { label: 'Pension & insurance', color: '#bf9ce8' },
  investment: { label: 'Private investment', color: '#a9cb78' },
} as const

export const accessRoutes = {
  direct: 'Direct application',
  intermediary: 'Accredited entity or intermediary',
  government: 'Government-led',
  procurement: 'Competitive procurement',
  negotiation: 'Investment negotiation',
  lending: 'Financial institution lending',
  no_public_route: 'No public application route identified',
  unknown: 'Unknown',
} as const

export const amountStatuses = [
  'fund_target', 'capital_raised', 'commitment', 'approval', 'financial_close',
  'disbursement', 'guarantee_limit', 'insurance_limit',
] as const

export const atlasName = 'Caribbean Climate & Transition Finance Atlas'
export const atlasSubtitle = "Mapping the funds, institutions and financing relationships supporting the Caribbean's climate and environmental transition."

export const themes = {
  energy_transition: 'Energy transition',
  climate_mitigation: 'Climate mitigation',
  climate_adaptation: 'Climate adaptation',
  disaster_resilience: 'Disaster resilience',
  biodiversity_nature: 'Biodiversity and nature finance',
  environmental_sustainability: 'Environmental sustainability',
  transition_finance: 'Transition finance',
} as const

export const scopes = {
  CORE: 'Core',
  SUPPORTING: 'Supporting',
  OUT_OF_SCOPE: 'Out of scope',
} as const

export const financialRoles = {
  dedicated_fund: 'Dedicated climate/environmental fund',
  thematic_vehicle: 'Thematic investment vehicle',
  diversified_financier: 'Diversified financier',
  financial_intermediary: 'Financial intermediary',
  fund_manager: 'Fund manager',
  capital_provider: 'Capital provider',
  project_preparation: 'Project preparation provider',
  risk_sharing: 'Risk-sharing provider',
  implementing_entity: 'Implementing or executing entity',
} as const

export type Theme = keyof typeof themes
export interface ScopeAssessment {
  status: keyof typeof scopes
  rationale: string
  evidenceIds: string[]
}

export type RelationshipType = typeof relationshipTypes[number]
export type Category = keyof typeof categories
export type Verification = 'verified' | 'reported' | 'unverified' | 'conflicting'
export type Ownership = 'Public' | 'Private' | 'Multilateral' | 'Unknown'
export type EntityKind = 'institution' | 'fund' | 'facility' | 'programme'
export type AmountStatus = typeof amountStatuses[number]

export interface Evidence {
  id: string
  title: string
  publisher: string
  url: string
  publishedOn?: string
  accessedOn: string
  reference: string
  status: Verification
  confidence?: string
  ambiguity?: string
}

interface EntityProfile {
  id: string
  name: string
  shortName: string
  type: string
  category: Category
  ownership: Ownership
  themes: Theme[]
  roles: (keyof typeof financialRoles)[]
  scope: ScopeAssessment
  headquarters?: string
  capitalOrigins?: string[]
  geographies: string[]
  sectors: string[]
  instruments?: string[]
  capitalSources?: string[] | 'not_publicly_disclosed'
  mandate: string
  activities: string
  plainLanguage: string
  website: string
  access?: { route: keyof typeof accessRoutes; details: string; evidenceId: string }
  evidenceIds: string[]
  status: Verification
  verifiedOn?: string
}
export interface Institution extends EntityProfile {
  kind: 'institution'
  parentId?: string
}
export interface Vehicle extends EntityProfile {
  kind: Exclude<EntityKind, 'institution'>
  managerId?: string
}
export type Entity = Institution | Vehicle
export interface Alias { entityId: string; name: string }

export interface FinancialAmount {
  value: number
  currency: string
  status: AmountStatus
  instrument?: string
  asOf?: string
}
export interface Relationship {
  id: string
  source: string
  target: string
  type: RelationshipType
  direction: 'directed' | 'mutual'
  description: string
  themes: Theme[]
  scopeRationale: string
  scopeEvidenceIds?: string[]
  participantRoles: { source: string; target: string }
  evidenceIds: string[]
  status: Verification
  period?: string
  amount?: FinancialAmount
}
export interface Project {
  id: string
  name: string
  geographies: string[]
  sectors: string[]
  evidenceIds: string[]
  status: Verification
}
export interface Transaction {
  id: string
  relationshipId: string
  projectId?: string
  flowId?: string
  amounts: FinancialAmount[]
  evidenceIds: string[]
  status: Verification
}
export interface Classification { id: string; label: string }
export interface AtlasData {
  institutions: Institution[]
  vehicles: Vehicle[]
  aliases: Alias[]
  relationships: Relationship[]
  sources: Evidence[]
  geographies: Classification[]
  sectors: Classification[]
  projects: Project[]
  transactions: Transaction[]
}

export type ReviewDecision = 'pending' | 'approved' | 'rejected'
export interface ResearchCandidate {
  id: string
  name: string
  kind: EntityKind
  website?: string
  notes: string
  evidenceUrl?: string
  sourceTitle?: string
  sourcePublisher?: string
  sourcePublishedOn?: string
  sourceAccessedOn?: string
  evidenceNote?: string
  decision: ReviewDecision
  reviewNote?: string
  createdOn: string
  reviewedOn?: string
}

