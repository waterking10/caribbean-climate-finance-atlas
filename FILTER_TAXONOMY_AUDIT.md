# Filter taxonomy audit and implementation specification

Recorded 18 November 2026, before interface implementation. Scope: the existing local Atlas, not a new research assessment or redesign.

## Existing implementation

Inspected `src/model.ts`, `selectors.ts`, `App.tsx`, Sidebar, NetworkPanel, NetworkGraph, both inspectors, the repository, all registry JSON and the separate capital-pathway model. The registry has 93 verified entities and 102 verified relationships. The initial climate scope contains 76 entities and 87 relationships; Full network opens the wider registry. The capital research contains 24 cases and additional actors and links, including authority bodies, which are not currently network nodes.

| Existing control | Underlying field | Dimension and ambiguity |
| --- | --- | --- |
| Search | name, shortName, aliases | Text; AND of normalized search terms |
| Institution category | entity.category | Mixed grouping: development/climate themes, public ownership/geographic role, commercial/institutional/investment institution types |
| Institution type | entity.type | Free-text institution/vehicle descriptions; also mixes mandate, instrument and ownership; singular/plural variants |
| Ownership | entity.ownership | Public/Private/Multilateral/Unknown; Multilateral is an institutional constitution, not a source-of-funds claim |
| Capital origin | entity.capitalOrigins[] | Profile-level geography of capital; not transaction-level attribution |
| Country or mandate | entity.geographies[] | Explicit geographic tags; mixes national, regional and global mandates; no automatic geographic hierarchy |
| Financing sector | entity.sectors[] | Broad economic activity, overlapping financing themes |
| Theme | entity.themes[], relationship.themes[] | Financing theme; includes endpoints of eligible themed edges |
| Financial instrument | entity.instruments[] | Profile capability; does not establish that every connection uses that instrument |
| Relationship type | relationship.type | Documented relationship function, 20 populated registry types out of 22 declared |
| Full network | entity.scope.status, relationship.themes | Research inclusion scope, not geographic scope; default includes CORE and attached SUPPORTING entities |
| Legend toggles | edgeGroup(type) | Finance/risk/institutional; management, governance and technical support share one institutional bucket |
| Isolate | selected entity, incident edges | One-hop only, after other filtering; no indirect/pathway navigation |
| View / labels / weighting | label visibility; amount currency/status | Display controls; weighting limited to comparable finance amounts |

All nine dropdowns are single-choice and combine with AND. Array fields test membership. Relationship/theme gates run first; entity filters then remove nodes; edges survive only if both endpoints survive. This can leave disconnected matching entities. Legend toggles also remove edges without removing orphan nodes. Search for Energy Smart produces one node and zero relationships. Choosing an absent counterparty clears filters and resets legend groups, potentially returning the user to a broad network. Research-only authority bodies are reachable through text in the existing evidence inspector, not directly on the graph.

Captured evidence: [desktop starting state](design/filter-restructure/01-before-desktop.jpg), [search isolates a mechanism](design/filter-restructure/02-before-search-isolates.jpg). These demonstrate crowding, the flat filter hierarchy and loss of context. Mobile uses a Show filters disclosure and stacked panels. Screenshots alone do not prove accessibility compliance; keyboard controls and responsive behavior require interaction tests.

## Revised structure and data mapping

Primary: Relationship family; Geographic scope (existing explicit mandate tags); Financing theme (existing themes); Financing sector. Advanced: Entity kind, consolidated Institution type and documented multi-role tags; Ownership/capital type (ownership, profile capital origin, documented pathway origin capitalType); instruments and exact relationship types. The subsequent owner-requested simplification maps 75 detailed types into ten groups and replaces the thematic node-colour category with entity-form categories. Raw types and legacy categories remain in the source records. See [Entity taxonomy](ENTITY_TAXONOMY.md).

Selections within a dimension use OR; distinct dimensions use AND. Entity identities remain keyed by original ID. Themes, roles and capital-origin types can be multi-valued; matching more than once never creates duplicate nodes. Capital types come only from pathway.origins and retain their case-specific provenance; they are not inferred from ownership. Geography continues to mean explicit tags, not headquarters or an inferred regional hierarchy.

| New filter group | Controls and source fields | Matching behavior |
| --- | --- | --- |
| Relationship family (primary) | Display-only mapping in `relationship-taxonomy.ts`; original registry `type` and research `link.type` | OR of chosen families; AND with exact-type refinement and legend visibility. The sixth visible entry is a classification exception, not an invented relationship family. |
| Geographic scope (primary) | Registry `entity.geographies[]`; selected case `pathway.geographies[]` in pathway mode | Exact explicit tags. In pathway mode this selects the case geography, not an assertion about each participant's mandate. |
| Financing theme (primary) | `entity.themes[]`, `relationship.themes[]`, `pathway.themes[]` | OR of tags, preserving documented themed endpoints; no exclusive entity classification. |
| Financing sector (primary) | Explicit `entity.sectors[]` | OR within sector selections; AND with other dimensions. No sector inferred from a climate theme. |
| Institution type (advanced) | `kind`, consolidated `type` groups in `entity-taxonomy.ts`, `roles[]` | Multiple selections may match one ID. Detailed types remain in profiles; no financial authority or ownership inferred from a display group. |
| Ownership/capital type (advanced) | `ownership`, `capitalOrigins[]`; `pathway.origins[].capitalType` for the actor identified by `providerId` | In pathway mode capital types are limited to the selected case. In institution/ecosystem mode they summarize documented provider roles across cases. Do not infer capital type from ownership or from guarantor status. |
| Further refinements (advanced) | Profile `instruments[]`, exact registry/research relationship type | Retains existing capabilities; profile instrument membership never changes a connection's original instrument. |

In pathway and institution modes, attribute filters identify matching actors and retain the directly connected counterparties of surviving documented links. This keeps, for example, a selected bond-investor class connected to its issuer even though the issuer is not itself a bond investor. The entity list contains matching actors; the graph and visible relationship list also contain those contextual counterparties. Ecosystem mode preserves strict endpoint matching for inventory filtering. Search remains a name/alias match; use **Explore documented relationships** to continue from a search result. Following a counterparty clears the name query, preserves other filters and retains the selected case.

Direct depth contains only edges incident to the starting actor. Two-hop depth shows the induced neighborhood of actors at distance at most two. Institution full depth is its connected documented component. Pathway full depth is the entire selected case, including its documented parallel branches; none of these traversal rules implies a serial financial flow.

## Relationship family mapping

Apply the same display taxonomy to registry types and research types. This does not migrate, alter or create research records.

| Family | Existing types | Caveat |
| --- | --- | --- |
| Capital & investment | CAPITALIZES, CONTRIBUTES_TO, FUNDS, GRANTS_TO, LENDS_TO, ON_LENDS_TO, INVESTS_IN, SUBSCRIBES_TO, COMMITS_SAVINGS_TO, DISBURSES_TO, CO_INVESTS_WITH | Co-investment is participation, not a transfer between co-investors. Savings commitments are not realised payments. Approval stage amounts do not prove disbursement. Preparation grants remain capital grants even when their purpose is technical support. |
| Management & administration | MANAGES, ADMINISTERS, IMPLEMENTS_FOR, ARRANGES, SUB_FUND_OF | Arrangement is transaction coordination, not lending; a sub-fund link is structure, not management delegation. No decision authority inferred. |
| Decision-making & control | OWNS, SUBSIDIARY_OF, ESTABLISHED_BY, ACCREDITED_BY, SETS_INVESTMENT_POLICY_FOR, SETS_GRANT_POLICY_FOR, SETS_ELIGIBILITY_FOR, APPRAISES, APPROVES_FINANCING_FOR, AUTHORIZES_DISBURSEMENT_FOR, OVERSEES, OVERSEES_IMPLEMENTATION_OF | Ownership is a legal structure, not proof of transaction approval. Establishment is historical and sometimes issuance. Accreditation grants eligibility, not funding or delegated approval. Appraisal is assessment, not approval. Oversight remains limited to the stated object. |
| Guarantees & risk sharing | GUARANTEES, INSURES, BEARS_RISK_FOR | Contingent protection, never direct financing. Retain named protected parties and recourse descriptions. |
| Technical & preparation support | PROVIDES_TECHNICAL_ASSISTANCE_TO, ADVISES | Advice can be legal/transaction support and does not imply financing or approval. |
| Requires classification (visible exception, outside the five families) | TARGETS, STRATEGIC_PARTNER | Beneficiary targeting and generic partnership do not establish any of the five functions. Do not force into a financial or authority family. STRATEGIC_PARTNER and SUBSIDIARY_OF are declared but unpopulated in the registry. |

## Exploration behavior specification

Explore pathways starts from a documented mechanism/case; Explore institutions starts from an institution or related actor; Explore ecosystem retains the existing registry overview and Full network scope switch. Direct and two-hop modes traverse documented connections in either direction for discovery, never assert a money flow along that traversal. Full documented pathway shows all links in the chosen case, including explicitly documented parallel branches. Institution full depth uses its connected documented component. Preserve a chosen case when following counterparties; keep evidence and unknown/conflicting classifications visible.

Hide orphan nodes by default when filters or relationship legend gates are active. Provide Display all matching entities to retain isolated matches for inventory work. Keep a separately accessible list of matching entities. Highlight the selected documented pathway and dim unrelated connections. Every research-only node must be marked as a research actor; every research-only connection must expose its original evidence and status, without fabricating registry profile fields or authority.

## Research integrity and unresolved classification

All data JSON must remain byte-for-byte unchanged. Preserve financial observations, dates, non-aggregation limits, source links, research questions and verification status. Research-only links are a presentation overlay with original IDs. Suppress a linked registry edge only when the same claim is already represented by its explicit atlasRelationshipId; retain genuinely separate claims. Non-verified research claims must never silently become verified graph edges.

Existing uncertainty remains: exact Energy Smart II domestic pool attribution and committee delegations; SuRGE internal approval/disbursement delegations and aggregate loan/grant description; Blue Loan original note subscriptions, bank funding, internal credit approvals and realised savings transfers. No new relationships will resolve these gaps.

## Validation plan

Unit tests: exhaustive type mapping, bounded traversal, multi-value OR/AND semantics, isolated-node pruning/override, identity deduplication and immutable inputs. Named cases: Energy Smart II (IDB/EU, EGFL, evidenced programme-level authorisation); SuRGE (Global Affairs Canada, CDB administration and project approval, separate parallel financing); Barbados Blue Loan (note investors and local bank, arrangers/agent, guarantees and BESF Board authority with its grant-specific limits). Desktop/mobile interaction checks must inspect evidence, follow counterparties in context and test depth, families and advanced filters. Existing comparison, research intake, source inspection, themes and build checks remain in scope. No deployment or publication.

Implementation and completed checks: [validation report](FILTER_RESTRUCTURE_VALIDATION.md). The original audit above predates implementation. Concurrent public-navigation work removed the Research desk from the public app; that independent change and its local-data protections were preserved rather than reversed by this task.
