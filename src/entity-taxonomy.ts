import type { Entity } from './model'

// Display classifications describe entity form, not thematic focus or financing
// authority. Detailed source types and legacy categories remain in the records.
export const entityCategories = {
  development: {label:'Development finance institutions',color:'#4fcaaf'},
  public: {label:'Governments & public bodies',color:'#efbb70'},
  commercial: {label:'Commercial banks',color:'#ed9c93'},
  institutional: {label:'Pensions & insurers',color:'#bf9ce8'},
  investment: {label:'Companies & investment managers',color:'#a9cb78'},
  funds: {label:'Funds, facilities & programmes',color:'#7dabfd'},
  nonprofit: {label:'Nonprofits & support organizations',color:'#e8b4d0'},
} as const
export type EntityCategory = keyof typeof entityCategories

export const institutionTypeGroups = {
  development_finance: {label:'Development banks & finance institutions',category:'development',types:[
    'Development bank','Development banks','Bilateral development bank','Domestic development bank',
    'Development finance institution','Bilateral development finance institution','Multilateral group',
    'Public export credit and financing institution','Enterprise development lender',
  ]},
  government_donor: {label:'Governments & donor institutions',category:'public',types:[
    'National government','Bilateral development agency','Bilateral development ministry',
    'Bilateral environment ministry','Bilateral public donor','Supranational donor',
  ]},
  public_agency: {label:'Public & intergovernmental bodies',category:'public',types:[
    'Intergovernmental organization','Regional climate agency',
    'Trade and investment agency','Development cooperation implementing agency',
    'Multilateral environmental implementing agency','National implementing institution','Public water utility',
  ]},
  commercial_bank: {label:'Commercial banks',category:'commercial',types:['Commercial bank']},
  pension_insurance: {label:'Pension & insurance institutions',category:'institutional',types:[
    'Insurance holding company','Insurer and asset manager','Statutory social insurance administrator',
    'Regional disaster risk insurer',
  ]},
  fund_manager: {label:'Fund & asset managers',category:'investment',types:[
    'Alternative investment manager','Asset manager','Domestic fund manager and financier',
  ]},
  investment_company: {label:'Companies & holding groups',category:'investment',types:[
    'Financial holding company','Energy infrastructure investor and operator','Renewable infrastructure project company',
    'Listed renewable infrastructure investment company','Special-purpose conservation lender',
  ]},
  fund_trust: {label:'Funds, trusts & endowments',category:'funds',types:[
    'Bilateral infrastructure fund','Blended investment fund','Collective investment vehicle',
    'Concessional climate fund','Concessional development fund','Conservation endowment','Conservation trust fund',
    'Domestic clean-energy financing fund','Historical clean-energy investment fund','Innovation fund',
    'Listed private credit vehicle','Multi-donor disaster risk finance trust fund','Multilateral adaptation fund',
    'Multilateral biodiversity trust fund','Multilateral climate fund','Multilateral environment facility',
    'Multilateral trust fund','Private credit sub-fund','Private equity sub-fund','Private equity vehicle',
    'Regional development fund','Social insurance reserve fund','Climate project preparation fund',
  ]},
  facility_programme: {label:'Financing facilities & programmes',category:'funds',types:[
    'Blended finance facility','Clean-energy guarantee facility','Climate and environmental programme loan',
    'Climate project preparation facility','Concessional energy transition programme','Ecosystem adaptation grant facility',
    'Enterprise development programme','Enterprise environmental grant window','Project preparation facility',
    'Regional environmental financing programme','Sovereign catastrophe bond','Sovereign debt-for-nature financing mechanism',
    'Sovereign debt-for-nature loan','Sustainable energy programme',
  ]},
  nonprofit: {label:'Nonprofits, grantmakers & facilitators',category:'nonprofit',types:[
    'Conservation nonprofit and guarantor','Regional conservation grantmaker','Climate finance facilitator',
  ]},
} as const satisfies Record<string,{label:string;category:EntityCategory;types:readonly string[]}>
export type InstitutionTypeGroup = keyof typeof institutionTypeGroups
const typeIndex = new Map<string,InstitutionTypeGroup>(Object.entries(institutionTypeGroups)
  .flatMap(([id,group]) => group.types.map(type => [type,id as InstitutionTypeGroup] as const)))

export function institutionTypeGroup(type:string) { return typeIndex.get(type) }
export function institutionTypeValues(type:string) {
  const group = institutionTypeGroup(type)
  return group ? [group,type] : [type] // Preserve existing exact-type filter callers.
}
export function entityCategory(entity:Pick<Entity,'type'>) {
  const group = institutionTypeGroup(entity.type)
  return group ? institutionTypeGroups[group].category : undefined
}
export function entityColor(entity:Pick<Entity,'type'>) {
  const category = entityCategory(entity)
  return category ? entityCategories[category].color : '#b8c6c0'
}
