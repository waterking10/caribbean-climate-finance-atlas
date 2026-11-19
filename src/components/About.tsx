import { ArrowRight, FileCheck2, GitBranch, Landmark } from 'lucide-react'
import { atlasName, atlasSubtitle } from '../model'
import { emptyFilters, selectNetwork } from '../selectors'
import type { AtlasIndex } from '../selectors'
import type { FocusedIndex } from '../focused-network'

export function About({ index, focused }: { index: AtlasIndex; focused?: FocusedIndex }) {
  const { entities, edges } = selectNetwork(index, emptyFilters)
  return <main className="secondary-page about-page" id="main">
    <section className="about-hero">
      <div>
        <h1>{atlasName}</h1>
        <p>{atlasSubtitle}</p>
        <a href="#network" className="primary-button">Explore the network <ArrowRight size={17}/></a>
      </div>
      <div className="about-stats">
        <div><Landmark size={20}/><strong>{entities.filter(entity => entity.scope.status === 'CORE').length}</strong><span>Core entities</span></div>
        <div><GitBranch size={20}/><strong>{index.relationshipList.length}</strong><span>Registry relationship records</span></div>
        <div><FileCheck2 size={20}/><strong>{index.evidence.size}</strong><span>Registry sources</span></div>
      </div>
    </section>
    <div className="about-grid">
      <section className="panel form-card"><h2>Explore the scope</h2><p>The Atlas is a professional portfolio project and public research resource focused on how climate finance reaches Caribbean projects. It covers adaptation, mitigation, energy transition, disaster resilience, biodiversity and nature finance, environmental sustainability and transition finance. It is not a complete inventory of Caribbean climate finance or a map of every regional financial institution. Search reaches records beyond the initial selection.</p></section>
      <section className="panel form-card"><h2>Read the evidence</h2><p>This release covers a selection of institutions and relationships. Source dates and references allow you to check each record. An accreditation link describes a delivery role. Disclosed financial amounts retain their original meaning and currency.</p></section>
      <section className="panel form-card"><h2>Compare institutions and roles</h2><p>Profiles show each entity’s scope rationale, thematic tags, institutional roles and documented access routes. Relationship details identify each participant’s role in that arrangement. Compare up to three entities side by side.</p></section>
      <section className="panel form-card"><h2>Project purpose</h2><p>Explore and understand documented relationships between Caribbean climate finance institutions, funds and financing mechanisms. Capital pathways connect the published relationships to their financing context, decision-making roles and evidence.</p></section>
      <section className="panel form-card"><h2>Methodology</h2><p>Research uses official institutional profiles, programme documents, audited disclosures and financier records. Each entity and relationship is assessed separately for its Caribbean climate and transition finance role. Sources support the recorded parties, direction, roles and dated claims. Amounts retain their currency and distinguish approvals, commitments, payments and risk coverage.</p></section>
      <section className="panel form-card"><h2>Limitations</h2><p>Coverage is selective and source availability varies. Missing records or amounts do not establish an absence of finance. Accreditation, implementation and partnership links do not by themselves demonstrate a financial transfer. Institution-wide funding does not establish the origin of a particular investment. Unresolved attribution and conflicting disclosures remain visible in pathway evidence and open questions.</p></section>
      <section className="panel form-card"><h2>Geographic coverage</h2><p>Country and territory tags, Caribbean/regional mandates and multi-country arrangements come from the existing research. Case geography is used where documented; registry-only connections use shared explicit geographic mandate tags. A regional mandate does not prove that capital was allocated to every country.</p></section>
      <section className="panel form-card"><h2>Relationship definitions</h2><p>Capital and investment links identify financing, participation or commitments with their original labels. Management and administration identify delivery responsibilities; they do not establish ownership of the capital or approval authority. Decision links retain their stated approval or oversight scope. Guarantees and insurance are contingent risk coverage, not disbursements. Technical assistance and project preparation identify documented support. Each entity can perform several roles without being duplicated.</p></section>
      <section className="panel form-card"><h2>Evidence standards</h2><p>Only verified connections appear in Explore. Full pathway profiles retain reported or conflicting claims with their original status, supporting sources, dates and research questions. Separate observations are never added merely because they share a currency or appear in the same diagram. Source identifiers and original relationship and pathway IDs remain intact.</p></section>
      {focused&&<section className="panel form-card"><h2>What the default network includes</h2><p>All {focused.defaultIds.length} qualifying institutions and institutional climate-capital pools in the current dataset are included, without a ranking cutoff. Eligibility comes from a sourced, in-scope thematic profile or participation in a verified relationship with a recorded financing theme or pathway. Research-only institutions retain their research-participant labels. Generic ownership, establishment, accreditation and partnership links do not establish eligibility. Individual arrangements remain hidden until selected or expanded.</p><p>Only documented direct institutional connections are drawn. An institution may have no visible line because its connections run through a hidden mechanism or its evidence currently documents only a thematic profile. Filtering hides institutions without matching direct connections; search and profiles remain available. This is the Atlas’s documented coverage, not a complete regional inventory.</p></section>}
    </div>
  </main>
}

