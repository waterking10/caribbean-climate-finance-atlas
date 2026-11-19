import { ArrowRight, FileCheck2, GitBranch, Landmark } from 'lucide-react'
import { atlasName, atlasSubtitle } from '../model'
import { emptyFilters, selectNetwork } from '../selectors'
import type { AtlasIndex } from '../selectors'

export function About({ index }: { index: AtlasIndex }) {
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
        <div><GitBranch size={20}/><strong>{edges.length}</strong><span>Relationships in the default view</span></div>
        <div><FileCheck2 size={20}/><strong>{index.evidence.size}</strong><span>Registry sources</span></div>
      </div>
    </section>
    <div className="about-grid">
      <section className="panel form-card"><h2>Explore the scope</h2><p>The atlas covers adaptation, mitigation, the energy transition, disaster resilience, biodiversity and nature finance, environmental sustainability, and transition finance. The default view shows core participants and the supporting entities that explain their documented financing or institutional relationships. Use Full network to explore the wider registry.</p></section>
      <section className="panel form-card"><h2>Read the evidence</h2><p>This release covers a selection of institutions and relationships. Source dates and references allow you to check each record. An accreditation link describes a delivery role. Disclosed financial amounts retain their original meaning and currency.</p></section>
      <section className="panel form-card"><h2>Compare institutions and roles</h2><p>Profiles show each entity’s scope rationale, thematic tags, institutional roles and documented access routes. Relationship details identify each participant’s role in that arrangement. Compare up to three entities side by side.</p></section>
      <section className="panel form-card"><h2>Review new candidates</h2><p>The research desk stores manual intake and review decisions in this browser. Verified graph updates are managed in the underlying dataset.</p></section>
    </div>
  </main>
}

