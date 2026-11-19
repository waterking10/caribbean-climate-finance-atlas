# Capital tracing research

Updated 18 November 2026 following approval of the international expansion. The research layer contains 24 financing pathways, 169 sourced claims, 65 financial observations and 64 open questions. Twenty new profiles and 29 new graph relationships bring the registry to 93 entities and 102 relationships. The registry has 165 sources, supplemented by 46 research source records. [International publication and evidence](INTERNATIONAL_CAPITAL_PROPOSAL.md), [initial case studies](CAPITAL_PATHWAY_CASES.md), [structured research dataset](src/data/capital-pathways.json)

## Registry baseline audited on 17 November 2026

At that baseline the atlas had 37 institutions, 36 vehicles, 73 relationships, 134 sources and eight relationship amounts. Twenty of the 73 profiles had a populated `capitalOrigins` field, and 12 listed capital sources. Among 53 core profiles, the respective counts were 15 and nine. The two free-text fields describe institutions and vehicles at profile level. They cannot establish the origin, decision body or beneficiary for a specific financing leg.

| Starting record | What the research layer adds |
| --- | --- |
| Barbados capitalises Energy Smart Fund II. EGFL manages it. | Separate links for IDB Ordinary Capital and the EU grant, Barbados as borrower and channel, IDB’s disbursement authority, Energy Division supervision, the EGFL-administered windows and a FundAccess transfer. The funding composition of the audited domestic pool remains unresolved. |
| Global Affairs Canada funds SuRGE. CDB manages it. | Separate Canadian loan and technical assistance grant, CDB approval and financial close for the Dominica geothermal recipient, GCF and CDF parallel financing, and another named recipient in Grenada. The CDB internal delegation for approvals is still an evidence gap. |
| CIBC Caribbean arranges the Blue Loan. IDB and TNC provide guarantees. | The actual lender names, US-dollar note investors, domestic arranger and facility agent, primary and secondary guarantees with beneficiaries, and the downstream conservation fund and its Board’s award authority. |

The original graph uses `MANAGES` for management, administration and some trusteeships. `FUNDS` can describe a direct contribution or a programme channel. The original links, descriptions, evidence and amounts are preserved. The research links describe the specific role, scope and source and can reference an existing graph link when the endpoints and meaning match. There were no project or transaction ledger records at review.

## Data model

| Field | Interpretation |
| --- | --- |
| `mechanismId` | Resolves to an existing atlas entity or a research-only actor. Pathways also carry geography, theme, instrument and review status. A pathway may describe a single operation within a larger mechanism. Supplemental geography IDs, such as Cuba in this release, are defined in the research file. |
| `actors` | Research-only legal entities, decision bodies, investor or recipient groups and named operations. Established participants use their existing atlas IDs. Individual actors can take several roles across a pathway. |
| `origins` | Each record names the furthest upstream provider supported for a financing leg, its capital type, the relative geography, a verified financing-link ID and any attribution limits. `upstreamCoverage` marks the documented, partial or unknown state. |
| `links` | Directed assertions with the specific action, participants, instrument where applicable, source IDs and verification status. Risk links can identify the parties protected by the obligation using `beneficiaryIds`. |
| `recipients` | `immediate` for the first documented borrower, vehicle or channel, `downstream` for a later recipient or allocation, and `intended` for an eligible group. Each record points to a financing or eligibility link. |
| `amounts` | One scoped observation with measure, stage, original currency, reporting date, date basis and source IDs. Values already present on registry relationships resolve by ID. A null reporting date uses `undated_source_snapshot` and a separate `observedOn` access date. Alternatives and overlapping amounts carry explicit references and scope notes. |
| `gaps` | An explicit unknown or a difference between sources that needs resolution. Evidence identifies the reviewed documents and any limits to what they establish. |

### Capital origins and financial roles

- **Source type** records government resources, bilateral public funds, supranational public funds, multilateral capital, commercial bank credit, private institutional investment, private subscription proceeds, philanthropic funds, bond investors or committed fiscal savings.
- **Geography** is relative to the mechanism’s stated market or the country under review. Domestic capital is attributable to that market. Regional capital comes from a cross-Caribbean provider or pool. International capital comes from an external donor, multilateral pool, or identified international market. A pathway can combine origins. Where the provider is known but its funding mix or investor domicile is unconfirmed, the limitation appears on the origin and the geographic classification can be unknown.
- **Channel** describes how resources reach the next party. A sovereign borrower, special-purpose issuer, fund, development bank or manager can be the channel. Where entity-level categories are broad, the link identifies the exact capacity and instrument for the arrangement.
- **Authority** applies to a documented action at a defined stage. Eligibility, appraisal, grant or investment policy, approvals, disbursement and implementation oversight each have their own link type. A participant’s management role is recorded separately. Where evidence establishes only an institutional decision, the record names the institution and leaves the internal body unidentified.
- **Institutional and global pool context** identifies balance-sheet funding and pooled fund revenues whose allocation to a particular Caribbean operation remains unestablished. `fundingScope` records this distinction on links and amounts. The Adaptation Fund context includes carbon-market proceeds. Unknown source types remain explicit.
- **Evidence confidence** is attached to the link. `verified` has direct support, `reported` is an attributed claim requiring corroboration, and `conflicting` identifies a claim under review. Gaps can cover absent documentation, differing scopes or inconsistent classifications. Where a chronological change reconciles documents, preserve that chronology in the description.

### Relationship taxonomy

The taxonomy below applies to the research data. Published institutions also use precise contribution, grant, administration, savings-commitment, technical-assistance and intended-beneficiary types in the graph. Existing types and directions retain their earlier meaning. `CO_INVESTS_WITH` remains valid in the graph. The research layer records separate financing legs to the common recipient. A single directed financing assertion serves both lender and recipient views.

| Group | Type | Meaning from source to target |
| --- | --- | --- |
| Finance | `CAPITALIZES` | Supplies capital to establish or replenish the target. |
| Finance | `CONTRIBUTES_TO` | Supplies a documented contribution to a defined fund or channel. |
| Finance | `FUNDS` | Provides or channels documented resources where the exact financial action is broader or spans instruments. |
| Finance | `GRANTS_TO` | Provides or approves nonrepayable resources for the stated recipient. |
| Finance | `LENDS_TO` | Extends or approves a loan or credit line to the borrower. |
| Finance | `ON_LENDS_TO` | Lends onward from identified resources received through the upstream arrangement. |
| Finance | `INVESTS_IN` | Makes, signs or approves a scoped investment in an investee or vehicle. |
| Finance | `SUBSCRIBES_TO` | Supplies capital by subscribing to issued shares or notes of the target. |
| Finance | `COMMITS_SAVINGS_TO` | Undertakes to allocate fiscal savings to a defined downstream use. |
| Finance | `DISBURSES_TO` | Releases documented funds to the named recipient. |
| Risk | `GUARANTEES` | Undertakes a defined contingent exposure for identified obligations or a protected party. |
| Risk | `INSURES` | Provides insurance cover for a named party or risk. |
| Risk | `BEARS_RISK_FOR` | Holds a documented financial exposure, such as residual creditor or investor risk. |
| Authority | `SETS_INVESTMENT_POLICY_FOR` | Determines investment policy for the specified pool or activity. |
| Authority | `SETS_GRANT_POLICY_FOR` | Sets or adopts the grantmaking policy and rules of the specified programme. |
| Authority | `SETS_ELIGIBILITY_FOR` | Establishes eligibility criteria for the stated mechanism or call. |
| Authority | `APPRAISES` | Performs a documented substantive financial or technical review. |
| Authority | `APPROVES_FINANCING_FOR` | Makes or holds the documented approval within the identified funding stage. |
| Authority | `AUTHORIZES_DISBURSEMENT_FOR` | Has authority to allow release of funds under stated conditions. |
| Authority | `OVERSEES` | Holds a documented strategic, fiduciary or reporting oversight role. |
| Authority | `OVERSEES_IMPLEMENTATION_OF` | Supervises implementation, compliance or delegated execution. |
| Institutional | `MANAGES` | Manages a fund or assets, with discretion only where explicitly stated. |
| Institutional | `ADMINISTERS` | Carries out documented operational or fiduciary administration. |
| Institutional | `ARRANGES` | Structures or arranges a specified financing. |
| Institutional | `ADVISES` | Supplies advisory, structuring or legal support in the stated capacity. |
| Institutional | `IMPLEMENTS_FOR` | Executes a named project, programme or component for the target. |
| Institutional | `PROVIDES_TECHNICAL_ASSISTANCE_TO` | Provides documented preparation, design or technical advisory services. |
| Institutional | `TARGETS` | Identifies eligible or intended downstream recipients. |
| Institutional | `ESTABLISHED_BY` | Identifies the body that established the source mechanism. |
| Institutional | `SUB_FUND_OF` | Identifies a separately documented sleeve of an umbrella vehicle. |

### Financial observations

Store the **measure** and the **stage** independently. Measures include a fund target, capital raised or contributed, loan principal, grant, equity contribution, guarantee or insurance coverage, project cost, facility size, fiscal savings, or contributions received. Stages distinguish targets, approvals, commitments, signatures, financial close, actual disbursements or receipts, estimates and figures whose source only reports an amount. The chosen date may be the event date, reporting period end or source publication. Year or month precision is supported when a day is unavailable.

`partOfAmountId` identifies a component of a figure in the same pathway, such as the separate SuRGE and GCF portions of the closed CDB facility or the UK share of an IDB Invest commitment. The reporting basis in `scope` defines what each figure represents. Loan principal, contingent cover, total project costs, expected savings and eventual cash movements are displayed as separate observations. A comparable value must have the same measure, stage, scope and currency. The research layer provides no portfolio total or currency conversion.

### Research and verification

Use the signed financing agreement or governing document for authority, the implementing or fund records for delivery, and audited financial statements for dated receipts and disbursements. Record source title, publisher, originating URL, relevant page or section, date accessed, date of publication where documented, and link confidence. Store an agreement’s signing date as an event date. The case studies describe source limitations where an operative manual, transaction document, legal delegation or allocation ledger could not be established.

`loadCapitalResearch(atlas)` validates references to actors, geographies, sources and graph edges, the required evidence, amount types and parent observations, and claim confidence. The inspector resolves amounts and evidence against this validated dataset.

## Unresolved information gaps

The dataset records 64 gaps, comprising 26 from the initial research and 38 from the international expansion. The three initial cases have the following priorities.

| Mechanism | Missing evidence |
| --- | --- |
| Energy Smart Fund II | A reconciliation of the Barbados capitalisation ledger to external programme proceeds and any domestic own-source funds. The operative Phase II manual or subsidiary agreement could establish award delegations, payment signatories and FundAccess’s on-lending records. |
| SuRGE | Executed Canadian agreements and CDB allocation procedures showing the roles in setting eligibility, approving individual operations and releasing funds. CDB’s own-account contributions and recipient-level drawdowns remain open. |
| Barbados Blue Loan | The original note subscription ledger, local lender funding mix, closing drawdown instructions, evidence of any guarantee claims, and audited conservation transfers and payments. |

Across additional mechanisms, the recurring gaps are subproject approvals below a fund-level approval, legal documentation for trustee and intermediary transfers, loan or award payouts, and institutional investor origin behind pooled finance. Historical portfolio exits and restructurings also require dated evidence of any successor arrangements. [Case studies](CAPITAL_PATHWAY_CASES.md)

## Relationship inspection

The existing graph uses an amber underlay to mark relationships with capital-pathway research. The same label appears on those rows in each entity’s Relationships tab. The marker leaves the underlying relationship line and any financial weighting visible.

The relationship inspector shows claims with an explicit reference to the selected edge under **Research on this relationship**. The **Wider financing pathway** shows additional upstream, downstream and parallel links with named actors, documented roles, instruments and claim-level evidence. For an edge incident to a studied mechanism, the wider pathway can be relevant even when there is no exact match to that edge. Reported amounts carry their stage, measure, date and evidence. Open research questions record missing or conflicting links, including gaps in approval, disbursement and credit risk.

Twenty-one of the 24 pathways have a verified graph linkage. FP242, the Caribbean Biodiversity Fund’s Advancing Circular Economy Facility, and the Barbados catastrophe deferred drawdown option remain in the research dataset pending their separate registry-publication review. The existing Compare page remains the place to compare participating institutions. A future mechanism comparison could reuse the same sourced claims and date each amount and role.

## Data changes

The initial research added 14 pathways, 56 research-only actor or recipient records, 111 assertions, 35 financial observations and 46 supplemental evidence records. The international expansion adds ten pathways, 58 assertions, 30 financial observations and 31 registry sources. Three of the new observations reuse original registry values, bringing canonical amount references to eight. BMZ, KfW and GIZ retain their IDs as their research-only identities move into the registry. Cuba's existing research geography also moves into the registry. Earlier records are checked through the [publication preservation manifest](research/international-capital-publication.json).
