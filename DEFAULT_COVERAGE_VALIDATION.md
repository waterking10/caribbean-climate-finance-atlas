# Expanded default Explore coverage

19 November 2026. Focused follow-up to the explorer merged in `7ed0fa7`. No research records or deployment workflows changed.

## Before and after

| Default canvas | Before | After |
| --- | ---: | ---: |
| Institutions and institutional capital pools | 11 | 46 |
| Grouped documented institutional connections | 10 | 49 |
| Institutions without a direct institutional edge | 0 | 0 |
| Individual mechanism nodes | 0 | 0 |

The previous implementation ranked registry candidates, took at most 12, then removed disconnected candidates. The new view has no ranking cutoff and requires every displayed institution to have a documented direct institutional connection. The first PR preview included 69 institutions, of which 23 had no direct edge. Following review, those 23 remain available through search/profiles or mechanism expansion rather than floating in the overview. The 49 connections retain 53 original relationship records, their directions, exact types, arrangement mappings and evidence. No financial observations are summed. The machine-readable [coverage snapshot](design/default-coverage/coverage.json) lists every displayed node and connection.

## Eligibility and presentation

- Retain the existing institution classification: registry institutions, explicitly typed institutional climate-capital pools, and research actors whose recorded kind is `institution`. Individual mechanisms, recipient groups, decision bodies and projects are revealed through the existing arrangement interactions.
- Include both endpoints of every verified, non-generic institutional-to-institutional relationship with an existing supported relationship or pathway theme.
- Keep profile-only institutions in search and full profiles. Selecting one opens its profile rather than adding an isolated node; its profile does not offer an unsupported Show in network action. Mechanism-only institutions remain searchable, open their compact summary alongside the connected overview, and appear on the graph only through arrangement expansion.
- Generic ownership, parentage, establishment, accreditation, sub-fund structure, partnerships and targeting never establish eligibility or create default lines.
- Deduplicate by the original entity/actor ID. Different roles and themes do not create extra nodes. Distinct recorded legal entities are not merged merely because their names resemble one another.
- Relevance scores remain available internally but do not determine default membership. Stable IDs and documented edges determine layout order.
- Pack deterministic Dagre connected components into rows. Keep every connected node in the overview; show labels at closer zoom or on selection, with hover details and the institution list available. Colours, relationship patterns and financial semantics remain unchanged.
- Default fitting accommodates the entire graph on desktop and mobile. Returning from a mechanism restores the prior selection and viewport. Resetting filters refits the enlarged overview.
- Active filters continue to operate on documented relationships and remove disconnected nodes. Search remains independent of the current view and filters.

## Screenshots

| View | Desktop | Mobile |
| --- | --- | --- |
| Previous default | [Before](design/focused-explorer/02-default-desktop.png) | [Before](design/focused-explorer/02-default-mobile.png) |
| Expanded default | [After](design/default-coverage/default-desktop.png) | [After](design/default-coverage/default-mobile.png) |
| Mechanism-only participant selected | [Searious Business](design/default-coverage/mechanism-only-desktop.png) | [Searious Business](design/default-coverage/mechanism-only-mobile.png) |

## Validation

Unit coverage verifies uncapped eligibility, 30 additional connected specialists and an excluded standalone sourced profile, excluded generic/reported participation, deterministic ordering, unique IDs, mechanism-only participants, original endpoints, exact family/direction aggregation, separate financial observations, and immutable research.

Browser coverage verifies all 46 node centres fit the actual Cytoscape viewport at 1440px and 390px, with no isolated nodes. The new journey searches CCSA, opens and reloads its profile without adding a node, returns to the overview, then searches Searious Business, opens its Advancing Circular Economy Facility arrangement and full evidence, returns to the prior selection/zoom/pan, combines all three primary and all three advanced filters, checks isolated nodes are removed, and resets to all 46 connected nodes. Existing journeys cover CDB, Energy Smart Fund II, SuRGE, Barbados Blue Loan guarantees, profiles and evidence, two-hop expansion, Compare, three-tab navigation and legacy routes.

The clean production export passes all 74 Atlas unit tests and the production build. The complete local browser suite passes all 29 desktop/mobile tests; the 10 separate prototype unit tests also pass locally and are excluded from the PR. The existing ~532 kB main-bundle warning is unchanged in scope and does not fail the build. GitHub check status is recorded in the pull request. The [research integrity report](design/default-coverage/research-integrity.json) confirms all 15 research JSON files are byte-identical to the baseline.

## Classification limitations

- The 23 institutions removed from the first PR preview have no direct institutional edge. Mechanism participation or a sourced thematic profile does not justify drawing an institution-to-institution shortcut. They remain accessible through search; verified mechanism participants appear when their arrangements are expanded. Some profiles have no separately traced arrangement yet.
- Research-only institutions have verified participation claims, not complete verified institutional profiles. They retain their research-participant labels and existing missing-information messages.
- FundAccess has an older out-of-scope profile assessment but an existing verified thematic pathway role. It remains available through its documented pathway, rather than as an isolated default node, without altering either research record.
- Institutional climate-capital pools retain the existing explicit-type treatment. This change does not reclassify funds, legal entities, themes, decision authority or financial measures.
- Advisory, management, risk and institution-wide funding context retain their original descriptions and limitations. Visibility does not convert them into case-specific disbursements.
- The overview covers the Atlas’s current research, not the entire regional financing ecosystem. Existing attribution gaps remain in full profiles.

The branch is for review. Do not merge or deploy without a separate instruction.
