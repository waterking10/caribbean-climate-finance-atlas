# Relationship exploration: implementation and validation

18 November 2026. Local changes only; nothing deployed, published, committed or pushed by this task.

## Deliverables and implementation

- [Audit, revised structure, field mapping and full relationship-type mapping](FILTER_TAXONOMY_AUDIT.md), written before implementation.
- `src/relationship-taxonomy.ts`: exhaustive display mapping for registry and research types, with explicit caveats and a Requires classification exception.
- `src/exploration.ts`: read-only presentation index, original identity preservation, explicit linked-claim deduplication, case-scoped capital types, verified-link traversal, filters and orphan handling.
- Existing App, Sidebar, NetworkPanel, NetworkGraph and inspectors: three exploration modes; direct/two-hop/full depth; primary and advanced filters; removable multi-value selections; accessible visible-relationship list; source inspection and counterparty navigation; selected-path and selected-edge emphasis.
- New controls and research connection inspector expose existing research actors without fabricating registry profiles. Non-verified research claims remain available in the original research inspector and are excluded from verified graph links.
- Existing category colors, core/full registry scopes, comparison, labels, zoom, source inspection and comparable-amount weighting remain available. No new packages were added by this task. Concurrent navigation, prototype and documentation work was preserved.

## Checks run

| Check | Result |
| --- | --- |
| `pnpm test` | PASS: 59 tests in six files, including 11 exploration tests. Includes other concurrent work's existing tests. |
| `pnpm build` | PASS: TypeScript and local Vite production build. |
| Research integrity | PASS: all 15 `src/data/*.json` files compared byte-for-byte with Git HEAD, including pathways, sources, observations, candidates and review records. No differences. |
| Input immutability | PASS: repeated filtering/traversal leaves entities, links, sources, observations and research questions unchanged. |
| Taxonomy completeness | PASS: every declared registry and research relationship type mapped. Management and administration are not classified as approval. |
| Identity and verification | PASS: explicit `atlasRelationshipId` claims share one graph connection; other original IDs remain distinct. Synthetic reported-status claim is excluded from the verified graph. |
| Provider classification | PASS: guarantor status never creates a capital-provider classification; selected-case origins do not borrow another case's CDB funding role. |
| Direct depth regression | PASS: every direct edge is incident to the starting actor. Energy Smart II: direct 7 nodes / 7 edges; two-hop and full each 11 / 15. |
| Registry regression | PASS in the browser and unit tests: initial 76 / 87; Full network 93 / 102. |
| Desktop interaction | PASS at 1440 × 900 in the in-app browser against a fixed local production snapshot. |
| Mobile interaction | PASS at 390 × 844; observed document width 375 CSS pixels including the scrollbar allowance, with no horizontal page overflow. |

Browser validation was performed interactively through the in-app browser; it is not a claim that the Playwright CLI suite was executed. Existing browser-test selectors were updated for renamed filters, the advanced disclosure and the family legend. Coordinate-dependent canvas selection was replaced with the accessible entity selector while retaining a real pan operation in the test. Full assistive-technology conformance and testing on physical mobile devices remain outside this run.

## Captured flow and case results

1. **Existing filters — issue confirmed.** The initial desktop page shows the flat mixed taxonomy. Searching Energy Smart leaves one node and no connections. [Starting screen](design/filter-restructure/01-before-desktop.jpg), [isolated search result](design/filter-restructure/02-before-search-isolates.jpg).
2. **Revised dimensions — pass.** Relationship family, geography and theme combine correctly. Multiple roles match one entity once. Advanced ownership/type controls remain reachable on mobile. Risk-only SuRGE gives zero connected nodes; Display all matching entities restores its ten matching nodes without manufacturing relationships. The final empty state distinguishes absent connections from absent matching actors.
3. **Energy Smart Fund II — pass.** Full case exposes IDB Ordinary Capital and EU programme legs, the immediate Barbados transfer, EGFL management and sub-execution, Energy Division implementation, IDB programme-level disbursement authorisation, and trustees' reporting oversight. The loan contract opens from the authority connection. EGFL can be followed without leaving the case. Desktop and mobile source inspection were checked. No Phase II committee authority was inferred. [Authority and evidence](design/filter-restructure/04-energy-smart-authority-evidence.jpg).
4. **SuRGE — pass.** Full case has 10 actors and 12 connections, including the existing coarse registry links and the more detailed research links. Global Affairs Canada loan and separate TA grant are distinct; CDB management/administration, arrangement, on-lending and documented GPC approval are inspectable. Parallel GCF/SEF, CDF and equity branches retain their original descriptions. Desktop approval evidence and mobile loan sources were opened. No separate CDB own-resource contribution or internal committee delegation was inferred. [Desktop approval](design/filter-restructure/05-surge-approval-desktop.jpg), [mobile capital evidence](design/filter-restructure/09-surge-capital-mobile.jpg).
5. **Barbados Blue Loan — pass.** Full case exposes 15 actors and 19 documented connections, including registry mechanism-level descriptions. Note subscribers, BB Blue DAC, the Barbados bank, arrangers and facility agent are distinct. Risk-only filtering leaves four actors and three guarantee connections, including sovereign recourse. TNC's USD 50 million is labelled Guarantee limit and shows protected lenders and agreement evidence. BESF Board grant policy/award authority and Secretariat administration remain separate from the unresolved lender credit/drawdown decisions. [Guarantee evidence](design/filter-restructure/06-blue-guarantee-desktop.jpg), [mobile Board evidence](design/filter-restructure/08-blue-board-mobile.jpg).
6. **Continuity and responsive navigation — pass.** Following an endpoint retains the selected mechanism. Institution exploration from CDB expands from 20 actors / 23 direct links to 44 / 71 at two hops. Comparison still opens a table after adding a second entity. The original core/full ecosystem switch remains available. [Mobile controls](design/filter-restructure/07-mobile-controls.jpg), [final desktop view](design/filter-restructure/10-final-desktop.jpg).

The local fixed preview is served at `http://127.0.0.1:5175/`; the normal development app remains at port 5173. It is a snapshot for review, not hosting or deployment. Captures numbered 04–09 precede the final direct-depth/capital-type refinements; their displayed evidence and full-case/risk results are unchanged. The corrected direct-depth behavior was rechecked on the final production build on desktop and mobile.

## Remaining classification and research issues

| Issue | Treatment |
| --- | --- |
| TARGETS and STRATEGIC_PARTNER | Requires classification; never treated as transfers or authority. |
| ESTABLISHED_BY | Decision/control family with an explicit historical-establishment/issuance caveat; original arrows and descriptions preserved. Some records describe an issuer or collaborators rather than current control. |
| ACCREDITED_BY | Explicit eligibility caveat; does not establish capital provision or financing approval. |
| SUB_FUND_OF and ARRANGES | Structural/coordination grouping; does not infer management delegation, lending or approval. |
| CO_INVESTS_WITH | Capital participation, with no transfer between the co-investors implied. |
| ADVISES / preparation grants | Advice is support; a documented grant remains capital even if its purpose is preparation. Exact original types remain inspectable. |
| Mixed legacy categories and free-text institution types | Subsequently simplified at the owner's request: ten consolidated type choices, entity-form colours and Financing sector in the main filters. Detailed source types and legacy category fields remain in records; see [Entity taxonomy](ENTITY_TAXONOMY.md). |
| Mandate and origin geography | Explicit existing tags only. No automatic country-to-region expansion, headquarters inference, or ultimate capital attribution. Research-only actor mandate fields remain unknown. |
| Similar actor names and legal identities | IDs remain separate unless an explicit claim mapping exists. Broad registry groups and named legal banks/vehicles are not automatically merged. |
| Energy Smart II | Domestic pool attribution, final committee delegations and downstream loss/disbursement details remain unresolved. |
| SuRGE | Executed-agreement delegations, internal decision bodies, own-resource contributions and inconsistent aggregate instrument wording remain unresolved. |
| Barbados Blue Loan | Investor subscriptions, bank funding mix, internal lender credit/drawdown approval and realised conservation transfers remain unresolved. BESF authority is grant-specific. |

These are research limitations or display-classification exceptions, not new assertions. All original evidence, financial observations and open questions remain available.
