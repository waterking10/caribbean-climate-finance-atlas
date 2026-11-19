# Expanded default Explore coverage

19 November 2026. Focused follow-up to the explorer merged in `7ed0fa7`. No research records or deployment workflows changed.

## Before and after

| Default canvas | Before | After |
| --- | ---: | ---: |
| Institutions and institutional capital pools | 11 | 69 |
| Grouped documented institutional connections | 10 | 49 |
| Institutions without a direct institutional edge | 0 | 23 |
| Individual mechanism nodes | 0 | 0 |

The previous implementation ranked registry candidates, took at most 12, then removed disconnected candidates. The new view has no ranking or visible-degree cutoff. The 49 connections retain 53 original relationship records, their directions, exact types, arrangement mappings and evidence. No financial observations are summed. The machine-readable [coverage snapshot](design/default-coverage/coverage.json) lists every displayed node and connection.

## Eligibility and presentation

- Retain the existing institution classification: registry institutions, explicitly typed institutional climate-capital pools, and research actors whose recorded kind is `institution`. Individual mechanisms, recipient groups, decision bodies and projects are revealed through the existing arrangement interactions.
- Include every institutional endpoint of a verified, non-generic financing relationship with an existing supported relationship or pathway theme.
- Also include verified institutional profiles with a non-out-of-scope thematic assessment and cited scope evidence. A sourced thematic profile does not establish a bilateral transaction.
- Generic ownership, parentage, establishment, accreditation, sub-fund structure, partnerships and targeting never establish eligibility or create default lines.
- Deduplicate by the original entity/actor ID. Different roles and themes do not create extra nodes. Distinct recorded legal entities are not merged merely because their names resemble one another.
- Relevance scores remain available internally but do not determine default membership. Stable IDs and documented edges determine layout order.
- Pack deterministic Dagre connected components into rows. Keep every node in the overview; show labels at closer zoom or on selection, with hover details and the institution list available. Colours, relationship patterns and financial semantics remain unchanged.
- Default fitting accommodates the entire graph on desktop and mobile. Returning from a mechanism restores the prior selection and viewport. Resetting filters refits the enlarged overview.
- Active filters continue to operate on documented relationships and remove disconnected nodes. Search remains independent of the current view and filters.

## Screenshots

| View | Desktop | Mobile |
| --- | --- | --- |
| Previous default | [Before](design/focused-explorer/02-default-desktop.png) | [Before](design/focused-explorer/02-default-mobile.png) |
| Expanded default | [After](design/default-coverage/default-desktop.png) | [After](design/default-coverage/default-mobile.png) |
| Mechanism-only participant selected | [Searious Business](design/default-coverage/mechanism-only-desktop.png) | [Searious Business](design/default-coverage/mechanism-only-mobile.png) |

## Validation

Unit coverage verifies uncapped eligibility, 30 additional sourced specialist profiles, excluded generic/reported participation, deterministic ordering, unique IDs, mechanism-only participants, original endpoints, exact family/direction aggregation, separate financial observations, and immutable research.

Browser coverage verifies all 69 node centres fit the actual Cytoscape viewport at 1440px and 390px, including the 23 nodes without direct edges. The new journey selects Searious Business, opens its Advancing Circular Economy Facility arrangement and full evidence, returns to the prior selection/zoom/pan, combines all three primary and all three advanced filters, checks isolated nodes are removed, and resets to all 69 visible nodes. Existing journeys cover CDB, Energy Smart Fund II, SuRGE, Barbados Blue Loan guarantees, profiles and evidence, two-hop expansion, Compare, three-tab navigation and legacy routes.

The clean production export passes all 74 Atlas unit tests and the production build. The complete local browser suite passes all 29 desktop/mobile tests; the 10 separate prototype unit tests also pass locally and are excluded from the PR. The existing ~532 kB main-bundle warning is unchanged in scope and does not fail the build. GitHub check status is recorded in the pull request. The [research integrity report](design/default-coverage/research-integrity.json) confirms all 15 research JSON files are byte-identical to the baseline.

## Classification limitations

- The 23 nodes without direct institutional edges are intentional. Mechanism participation or a sourced thematic profile does not justify drawing an institution-to-institution shortcut. Some profiles have no separately traced arrangement yet.
- Research-only institutions have verified participation claims, not complete verified institutional profiles. They retain their research-participant labels and existing missing-information messages.
- FundAccess has an older out-of-scope profile assessment but an existing verified thematic pathway role. Its documented pathway participation establishes eligibility without altering either research record.
- Institutional climate-capital pools retain the existing explicit-type treatment. This change does not reclassify funds, legal entities, themes, decision authority or financial measures.
- Advisory, management, risk and institution-wide funding context retain their original descriptions and limitations. Visibility does not convert them into case-specific disbursements.
- The overview covers the Atlas’s current research, not the entire regional financing ecosystem. Existing attribution gaps remain in full profiles.

The branch is for review. Do not merge or deploy without a separate instruction.
