# Focused explorer — implementation and validation

19 November 2026. Local review only. No push, merge, commit, deployment, backend or deployment-workflow changes were made by this rebuild.

## Before implementation

The [audit and component/filter plan](FOCUSED_EXPLORER_PLAN.md) was recorded and presented before application changes. It inventories the unfinished explorer, entity taxonomy, public navigation and separate prototypes. The actual pre-change interface is captured in [01-before-desktop.jpg](design/focused-explorer/01-before-desktop.jpg).

## Result

The public app has exactly three navigation tabs: Explore, Compare and About & Methodology. Explore contains one network, a prominent search, three primary filters, one advanced-filter disclosure and compact institution/connection/arrangement panels. Mechanisms are revealed individually; full profiles have shareable URLs and remain inside the same application.

The default is 11 institutional participants and 10 grouped connections. A deterministic scoring policy considers verified climate-financing links, researched pathways, capital provision/intermediation, evidence coverage and profile completeness; it selects at most 12 candidates and removes isolated ones. The formula and resulting scores are visible in About. No generic ownership/accreditation/partnership degree is used as financing relevance. Smaller institutions and all 24 researched pathways remain searchable. This is explicitly a starting sample, not a complete regional inventory or an institutional ranking.

All graph connections retain explicit original endpoints. The current data has no institutional connection groups mixing mapped cases with unmapped relationship records, nor groups containing multiple unmapped records. A direct registry record without a case mapping is shown as direct documentation with no invented mechanism name. Compatible connections preserve family, direction, exact-type breakdowns, distinct case counts, original member IDs and source references. Original amounts are never added together.

Node sizes and fills are consistent; rounded rectangles distinguish individual vehicles/mechanisms where their original form supports that distinction. Colour and pattern encode relationship function. Width does not claim financial volume. Selecting a node/line highlights its documented neighborhood. Geometry is deterministic, new nodes avoid occupied label positions, and returning from a profile or temporary arrangement restores the mounted network context. Mobile keeps the three main filters compact and brings selected information or an expanded pathway into view without animated graph movement.

## Test results

| Check | Result |
| --- | --- |
| `pnpm test` | PASS: 82 unit tests in eight files, including 18 focused-explorer data/layout tests. |
| `pnpm build` | PASS: TypeScript and Vite production build. Full profiles are loaded on demand. |
| `ATLAS_CHROME=1 pnpm exec playwright test --workers=2` | PASS: 27 browser tests, including desktop/mobile requested journeys and real canvas hover/click. Machine-readable final run: [browser-results.json](design/focused-explorer/browser-results.json). |
| Dataset integrity | PASS: all 15 research JSON files are byte-identical to the task-start SHA-256 baseline and Git HEAD. [Integrity results](design/focused-explorer/research-integrity.json). |
| Mutation protection | PASS: indexing, aggregation, filtering, traversal and financial-observation selection leave original registry/research objects unchanged. |
| Existing functionality | PASS: institution/mechanism comparison, source URLs, dark theme, legacy Research redirects, private browser-local research exclusion/export, static repository subpath assets and full-profile reloads. |
| Layout behavior | PASS: deterministic nonoverlapping initial coordinates; collision-aware expansion preserves existing coordinates; hidden/deep-linked graph fitting is deferred until visible. |

Desktop testing used 1440 × 900. Mobile journeys used 390 × 844, with public navigation also checked at 320px. Tests assert no horizontal page overflow. These are browser viewport checks, not tests on physical phones or a claim of full assistive-technology certification.

The production build reports a nonblocking Vite chunk-size warning for the approximately 530 kB minified main chunk (about 145 kB gzip). Detailed profiles are split out, but the local research corpus and existing layout dependencies still contribute to startup payload. This was not hidden by raising warning thresholds or by changing deployment configuration.

## Requested user journeys

| # | Journey | Verification |
| --- | --- | --- |
| 1 | Understand the initial network | Manageable institutional sample, readable short names, neutral nodes, labelled relationship legend and explicit selected-sample coverage statement. No mode tabs or mechanism inventory. |
| 2 | Search CDB | Search focuses CDB and its verified direct institutional connections. Compact panel shows the published one-sentence function; no arrangement-specific role is assigned before selecting an arrangement. |
| 3 | Select a connection | Global Affairs Canada → CDB shows the separate lending/grant types, one linked SuRGE arrangement, source indicator and separate observations. |
| 4 | Expand a mechanism | SuRGE opens its documented multi-party diagram with a visible Back to network action. The GCF/SEF parallel branch remains separate. |
| 5 | Distinguish provider and administrator | SuRGE: Global Affairs Canada provides capital, CDB administers. Energy Smart II: IDB/EU programme legs and EGFL management remain distinct; domestic pool attribution remains unresolved. |
| 6 | Recognize a guarantee | Blue Loan risk filtering produces four participants and three guarantee connections, including sovereign recourse. TNC's USD 50m is Guarantee coverage, explicitly contingent protection rather than a capital transfer. Protected lender identities remain in full details. |
| 7 | Inspect full profiles/evidence | Shareable institution, mechanism and relationship URLs expose original links, source URLs, financial measures/dates, authority evidence, beneficiaries, limitations and questions. |
| 8 | Return without losing context | Institution/connection selection, active filters, expanded arrangement and network context survive full-profile navigation. Back from an arrangement restores the preceding view. |
| 9 | Combine filters | Exactly three primary controls; one advanced section with supported type, ownership and instrument controls. Matching endpoints remain connected; zero-degree nodes are removed. Empty state and Reset filters work while search remains usable. |
| 10 | Use the same features on mobile | All mechanism, provider/administrator, guarantee, profile, return, search and primary/advanced-filter journeys run at 390px; navigation also works at 320px. |

## Screenshots and review

Open the [screenshot gallery](design/focused-explorer/review.html) for all desktop/mobile states. Each screenshot is from the tested application, not a mockup.

1. **Default Explore — pass.** Three public tabs, one network and three primary filters. [Desktop](design/focused-explorer/12-final-desktop-review.jpg), [mobile](design/focused-explorer/02-default-mobile.png).
2. **Selected institution — pass.** Compact CDB information, immediate relationships and access to complete evidence. [Desktop](design/focused-explorer/03-selected-institution-desktop.png), [mobile](design/focused-explorer/03-selected-institution-mobile.png).
3. **Selected connection — pass.** Original relationship breakdown and associated arrangement, with no arbitrary financial total. [Desktop](design/focused-explorer/04-selected-connection-desktop.png), [mobile](design/focused-explorer/04-selected-connection-mobile.png).
4. **Compact and expanded arrangement — pass.** Provider and manager/administrator are distinct; expansion reveals the actual participants and return action. [Compact desktop](design/focused-explorer/05-compact-arrangement-desktop.png), [expanded desktop](design/focused-explorer/06-expanded-arrangement-desktop.png), [compact mobile](design/focused-explorer/05-compact-arrangement-mobile.png), [expanded mobile](design/focused-explorer/11-expanded-mobile-review.jpg).
5. **Full profiles — pass.** Separate full pathway, relationship and institution views preserve technical records and original sources. [Full pathway desktop](design/focused-explorer/07-full-pathway-desktop.png), [full pathway mobile](design/focused-explorer/07-full-pathway-mobile.png), [full relationship desktop](design/focused-explorer/09-full-relationship-desktop.png), [full relationship mobile](design/focused-explorer/09-full-relationship-mobile.png), [full institution](design/focused-explorer/10-full-institution-desktop.png).
6. **Guarantee distinction — pass.** Clear coverage label and contingent-risk explanation. [Desktop](design/focused-explorer/08-guarantee-desktop.png), [mobile](design/focused-explorer/08-guarantee-mobile.png).

## Actual regressions found and corrected

- A downstream BESF administration claim was initially summarized as administration of the Blue Loan. Manager summaries now require the verified MANAGES/ADMINISTERS link to target the selected mechanism. The Blue Loan loan-manager field remains unknown; BESF Secretariat administration and Board grant authority remain attached to BESF in the full evidence. A unit regression and desktop/mobile tests protect this distinction.
- Reusing existing coordinates while adding fresh Dagre positions could overlap CDB with a new participant. Focus contexts now have separate cached layouts, and new-node placement avoids occupied positions without moving existing participants. A unit regression checks collision-free insertion.
- Search results could intercept Reset Filters. Results now occupy their own document flow rather than covering controls; both desktop/mobile end-to-end tests exercise Reset while a query is present.
- Hidden graphs on direct profile URLs needed deferred fitting. They fit when made visible; ordinary profile return preserves the existing viewport.
- Research-only recipient groups were initially labelled as mechanisms in search. Search now retains their actual research-actor kind instead of inventing an entity classification.
- Some initial browser assertions addressed retired controls or expected one unique protected-party paragraph where two guarantees correctly identify the same protected lenders. Retired UI checks were replaced by the requested unified-flow contracts, and the protected-party test now verifies both original risk records. No evidence expectation was removed to hide a product regression.

## Changed files in this rebuild

| Files | Purpose |
| --- | --- |
| `src/App.tsx`, `src/main.tsx` | One public Explore; profile hash routing; retained context/navigation; profile code splitting; stylesheet import. |
| `src/focused-network.ts` | Immutable relevance selection, safe grouping, search, filters, original-scope roles and separate financial observations. |
| `src/components/FocusedExplorer.tsx` | Search, three primary/three advanced controls, direct/two-hop expansion and temporary arrangements. |
| `src/components/FocusedNetworkGraph.tsx` | Stable Cytoscape/Dagre rendering, readable captions, hover, selection, cached viewport, collision-aware expansion and zoom controls. |
| `src/components/CompactPanels.tsx` | Brief institution, connection and arrangement panels with explicit unknowns and detail actions. |
| `src/components/FullProfiles.tsx` | Institution, mechanism and relationship details; full pathway diagrams; sources, access and research limitations. |
| `src/focused-explorer.css` | Scoped desktop/mobile layout using the existing design tokens. |
| `src/components/About.tsx` | Purpose, selection formula, geography, relationship definitions, evidence standards and incomplete-coverage explanation. |
| `tests/focused-network.test.ts`, `tests/focused-explorer.spec.ts` | New data/layout integrity tests and the requested desktop/mobile journeys. |
| `tests/flows.spec.ts`, `tests/entity-filters.spec.ts` | Updated intentional UI contracts while retaining source, privacy, comparison and routing regressions. |
| `README.md`, `ARCHITECTURE.md`, this report and `FOCUSED_EXPLORER_PLAN.md` | Current usage, component/data boundaries, prior audit, validation and limitations. |
| `design/focused-explorer/` | Actual screenshots, review gallery, test report and integrity fingerprints. |

Pre-existing prototype folders, entity taxonomy, old explorer modules, package/lockfile changes and public-navigation work were preserved. This list describes this rebuild rather than claiming ownership of every pre-existing dirty file in the shared checkout.

## Remaining research/model limits

- Original capital providers are traced only as far as the evidence permits. Fiscal savings, institutional funding pools and case-specific loan proceeds retain their separate scopes.
- Energy Smart II domestic pool composition, final committee delegations and downstream authorizations remain unresolved. SuRGE internal decision/delegation details and inconsistent aggregate instrument wording remain unresolved. Blue Loan original subscriptions/bank funding, lender credit/drawdown approvals and realized conservation transfers remain unresolved.
- Some mechanisms have no explicit institutional pair link; they are searchable/expandable but are not converted into invented bilateral edges. Research-only actors often lack ownership, mandate, website and verified-profile metadata.
- Ownership is not capital participation. There is no unsupported blended-ownership filter. Themes and geographic coverage retain the existing research tags; no automatic region-to-country allocation is inferred.
- Historical establishment, accreditation, ownership, targeting and generic partnership records remain in full details where recorded; they do not create default financing relevance or inferred approval authority.
- Financial amount weighting is deliberately absent from this unified view because observations have different measures, dates, overlapping scopes and incomplete attribution. Evidence remains inspectable record by record.
