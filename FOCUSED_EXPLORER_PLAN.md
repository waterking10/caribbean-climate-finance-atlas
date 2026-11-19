# Focused climate finance explorer — audit and implementation plan

19 November 2026. Recorded before implementation. Baseline screenshot: `design/focused-explorer/01-before-desktop.jpg`; research SHA-256 baseline: `design/focused-explorer/research-baseline.json`.

## 1. Existing interface audit

The actual checkout has 93 verified registry entities (52 institutions, 41 vehicles), 102 registry relationships, 24 capital research pathways and 74 research actors. The public navigation is already Explore / Compare / About & Methodology, and retired Research URLs resolve to Explore without reading private browser-local research. Preserve that work.

The current Explore page shows 76 entities and 87 connections initially, three exploration modes, four primary filters (including sector), a large advanced taxonomy, legend toggles, isolation, full-network and graph settings. The initial canvas has small, overlapping labels and many mechanisms. The existing sidebar also acts as a registry inventory. Institution, relationship and pathway inspectors expose research detail immediately; there are no shareable detailed-profile routes. The current chart changes geometry on selection/expansion and has no compact institution hover card.

Uncommitted work includes the existing relationship explorer, entity taxonomy, public-navigation changes, separate pathway and capital-flow prototypes, tests, and documentation. Reuse the data/indexing, evidence components, existing visual tokens, type groupings and Compare. Do not edit the prototypes, research JSON, deployment workflows, or introduce a backend. Retire the three-mode controls from the public App while retaining their modules if still consumed by independent tests/prototypes.

## 2. Proposed component structure

- `App`: exactly three main navigation links, hash routes for profiles, shared comparison and retained Explore state. Legacy `#network`, `#compare`, `#about` and Research redirects remain valid.
- `FocusedExplorer`: one network, prominent cross-registry search, three primary filters, one Advanced filters disclosure, compact selection panel and temporary arrangement expansion with Back to network.
- `focused-network.ts`: immutable adapter for registry + verified research claims, safe connection grouping, searchable institution/mechanism records, relevance scoring, explicit geography/theme filtering and one-/two-hop selection.
- `FocusedNetworkGraph`: Cytoscape, uniform node sizes, neutral institution styling, family-based edge styles, deterministic layout, persistent positions/viewport, minimal hover summary, accessible entity/connection controls and zoom/fit.
- `CompactPanels`: institution, connection and arrangement summaries. Detailed evidence and questions stay behind full-profile/details actions.
- `FullProfiles`: shareable institution/actor, relationship and mechanism views. Reuse Sources and PathwayInspector for original claims, amounts and limitations; render full pathway within the same app.
- Existing Compare remains available for registry institutions and mechanisms. About gains the actual selection policy, climate-finance focus, geography and coverage limits.

No additional main tabs, exploration sub-tabs, separate app, new service or dependencies.

## 3. Filters and field mapping

| Placement | Control | Existing data and matching |
| --- | --- | --- |
| Primary | Relationship type | Five existing display families derived from registry `type` / research `link.type`. All financing relationships includes the relevant verified set; generic partnership, targeting, accreditation and historical ownership are not default financing edges. |
| Primary | Geography | Existing geography register plus pathway `geographies[]`. All Caribbean means the researched climate-finance coverage, not every financial entity. Country choices retain existing IDs. Regional/multi-country is derived from existing regional tags or multiple explicit country tags, without adding a research classification. Registry-only relationships use explicit shared mandate tags and disclose that coverage basis. |
| Primary | Financing theme | Existing verified relationship/pathway `themes[]`; retain the published labels rather than invent renewable/blue/cross-cutting tags not present in the records. |
| Advanced | Institution type | Existing exact types grouped by the existing `entity-taxonomy.ts` mapping. Unknown research-only actor types remain unknown. |
| Advanced | Ownership | Existing Public / Private / Multilateral / Unknown values. No automatic blended classification: ownership is not a transaction's capital mix. |
| Advanced | Financing instrument | Documented research-link instruments and recorded relationship amounts' instruments. Profile capability alone does not establish a transaction instrument. |

All controls combine with AND. Default direct relationships; one checkbox expands to two hops around the selected/searched institution. Filters operate on documented connections, retain their matching endpoints and hide zero-degree nodes. Search spans registry names, aliases, short names, research actors and pathway/mechanism names, independently of the initial selection. Search remains usable even when active filters yield no connections. One Reset filters action clears the filter criteria.

## 4. Default relevance and aggregation policy

Institution nodes include registry institutions and institutional climate-capital pools identified by their existing explicit type (for example GCF). Individual case mechanisms stay out of the overview. Research-only participants appear when needed by a search or expansion and are labelled as research actors, without fabricating complete institutional profiles.

Rank verified registry candidates deterministically using relevant documented climate-finance links only: 4 points per distinct incident relevant link; 6 per associated documented pathway; 5 per capital-provision link; 3 per intermediation/administration link; up to 5 for verified evidence coverage; up to 3 for profile completeness. Break ties by stable ID. Start with at most 12 of the highest-scoring candidates that have actual institutional connections; prune isolated nodes. Publish the formula and resulting selection. This is a starting sample, not a ranking of institutional merit or a comprehensive ecosystem inventory.

Connections must have original, explicit source and target IDs. Never project an institution–mechanism–institution chain into a new bilateral edge. Group only the same endpoints, direction, relationship family and verification status, with a clear exact-type breakdown. Deduplicate only explicit `atlasRelationshipId` references. Count distinct underlying arrangements separately from original claim counts. Do not sum any financial observations. Mechanism names are attached only through existing case/link mappings; selecting or searching a mechanism opens its original multi-party pathway with its actual nodes.

## 5. Research and data-model limits

- Legal institutions, capital pools and mechanisms are not perfectly separated by `kind`; use a documented presentation policy and retain original types/IDs.
- Research actors have names/kinds but often no institutional profile, mandate, ownership or verification metadata. A verified link does not create a verified full profile.
- No generic role may be promoted into approval authority. Administrators are not automatically original capital providers.
- Amounts include targets, commitments, approvals, disbursements, coverage, overlapping programme totals and institution-wide context. Show individual labelled observations; no arbitrary compact-panel totals or amount-based weighting across unlike measures.
- Geographic mandate is not proof of a case-specific allocation. Preserve explicit case geography and distinguish it from registry mandate overlap.
- Some mechanisms have no direct institution-to-institution links. They remain searchable and expandable; no shortcut edge will be fabricated to make the overview appear connected.
- Energy Smart II attribution and committee delegations, SuRGE internal delegations, and Blue Loan lender approvals/realised savings gaps remain unresolved in full profiles.

## 6. Validation plan

Unit tests cover relevance determinism and exclusion of generic links; direct endpoint preservation; safe family/direction grouping; explicit deduplication; arrangement counts; no financial summation; immutable research; filtering, search and depth. Browser tests cover the ten requested journeys on desktop and mobile, full-profile deep links and return context, actual graph interactions, Compare, navigation and legacy routes. Preserve source evidence and private Research exclusion. Investigate real failures; replace old tests only where they assert intentionally retired controls or obsolete UI structure. Capture default, institution, connection, expansion, compact/full profile and mobile states. No push, merge or deployment.
