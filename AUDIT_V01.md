# Caribbean Capital Atlas v0.1 quality and coverage audit

**Audit date · 17 November 2026**

## Release findings

| Priority | Finding | Implication |
| --- | --- | --- |
| High | The JN Fund Managers profile uses a superseded name. March 2026 fund financial statements identify Barita Fund Managers Limited as the same legal entity and as investment manager and administrator. | A user relying on the verified badge could use an outdated identity or contact route. Preserve the historical name as an alias and date the supporting records. [March 2026 financial statements](https://www.jnfunds.com/wp-content/uploads/JN-Mutual-Funds-LMMF-FS-2026-Final.pdf), [Barita transition page](https://barita.com/transition/) |
| High | The EIB register dates both parts of its €100 million CDB commitment to 30 September 2024. The press release is dated 24 October and uses signing language. The stored period is October and the source metadata says 25 October. | The amount and committed stage are supported. A single date field obscures the difference between the register and the public announcement. [EIB project register](https://www.eib.org/en/projects/all/20220727), [EIB announcement](https://www.eib.org/en/press/all/2024-392-global-gateway-eib-and-caribbean-development-bank-partner-to-boost-resilience-to-climate-change-in-the-caribbean) |
| High | The CIBC annual-report URL returned 404. The official report at its corrected URL supports the corporate structure. | The profile’s strongest ownership evidence is harder for a visitor to retrieve. [CIBC annual reports](https://www.cibccaribbean.com/about-us/investor-relations/annual-reports), [2025 report](https://www.cibccaribbean.com/binaries/content/assets/annual-reports/2025/cibccaribbean-group-ar-2025.pdf) |
| Medium | The atlas represents both facility-level relationships and individual financing components. The five recorded values are distinct as recorded, while facility totals, co-financing and subsequent disbursements can overlap. | Keep the values scoped to their instrument and stage. A future aggregate would need transaction IDs and parent-child reconciliation. See [financial integrity](#4-financial-integrity). |
| Medium | Domestic institutional capital and market coverage are thin. Only 14 of 50 records have a documented access route. Nine entities have no documented graph links. | Coverage supports institution discovery. Country filters and empty graph states need clear limits so users can distinguish a documentation gap from a real-world absence. |

**Scope and severity.** The file records the workspace snapshot of 50 entities, 44 relationships, 90 evidence records, and two candidate records outside the verified graph. High denotes a material identity, evidence or financing interpretation issue. Medium denotes a scope, accessibility, coverage or workflow issue that could affect use. Low denotes precision or metadata debt. Pass indicates support within the stated scope. Priorities below are recommendations for review.

Inventory and completeness were computed from the JSON. Relationship meaning was checked against publisher content. Evidence access was tested separately with automated HTTP GET requests and a publisher-content review. Usability combines the current automated browser results with source-code inspection. The Product Design audit skill calls for live screenshots. The Codex browser denied observation of the localhost origin under a saved access setting, so the live screenshot and hands-on browser review were blocked. See [testing and limits](#7-testing-and-limits).

## 1. Institutional coverage

Counts are **record counts**. Groups, operating institutions, funds and programmes can share an economic parent. The 50 therefore measure registry breadth. The count is unsuitable as a count of independent pools of capital.

### Ownership and entity type

| Stored ownership | Institutions | Vehicles | All |
| --- | ---: | ---: | ---: |
| Multilateral | 11 | 13 | 24 |
| Private | 11 | 3 | 14 |
| Public | 8 | 3 | 11 |
| Unknown | 1 | 0 | 1 |
| **Total** | **31** | **19** | **50** |

The 19 vehicles comprise **14 funds, three facilities and two programmes**. The stored `type` has 40 distinct labels. Commercial bank, Development bank and Multilateral climate fund each occur three times. Blended finance facility, Development finance institution, Insurance holding company and Statutory social insurance administrator each occur twice. The remaining 33 labels occur once. Singular “Development bank” and plural “Development banks” are separate filter values. The full type and role for every record appear in the [entity register and completeness matrix](#6-entity-register-and-data-completeness).

“Private” includes publicly traded companies in the atlas taxonomy. Listed status and government versus private control are separate attributes in practice. Programme ownership is also ambiguous where the evidence establishes sponsorship or management. Count the classifications as recorded, with CCSA’s ownership recorded as Unknown. [Data dictionary](DATA_DICTIONARY.md), [CIBC 2025 annual report, ownership chart](https://www.cibccaribbean.com/binaries/content/assets/annual-reports/2025/cibccaribbean-group-ar-2025.pdf)

### Primary financing roles

Roles below are audit classifications based on the primary function represented in each profile. Each entity is counted once.

| Primary role | Count |
| --- | ---: |
| Development lender or DFI | 9 |
| Government or intergovernmental group | 3 |
| Bilateral or supranational donor | 2 |
| Development or climate fund, facility or programme | 15 |
| Climate or trade finance facilitator | 3 |
| Commercial bank or bank holding company | 4 |
| Insurer or insurance holding company | 4 |
| Statutory social insurance or reserve fund | 3 |
| Investment manager | 2 |
| Private investment vehicle | 3 |
| Infrastructure sponsor or project company | 2 |

### Geography and sector

For the exclusive geography count, assign the first applicable scope in this order: Global, Latin America and Caribbean, Caribbean regional, Eastern Caribbean, single named market. The underlying tags are independently counted below. Tag presence is documented scope as entered and may reflect a borrower list, operations, programme eligibility or a broad mandate.

| Exclusive geographic scope | Entities |
| --- | ---: |
| Global | 10 |
| Latin America and Caribbean | 9 |
| Caribbean regional | 19 |
| Eastern Caribbean | 2 |
| Single named market | 10 |

| Geography tags | Number of records carrying each tag |
| --- | --- |
| Regional | Caribbean 35, Global 10, Latin America & Caribbean 10, Eastern Caribbean 2, Central America 1, North America 1 |
| Named markets with multiple records | Barbados 10, Jamaica 8, Trinidad & Tobago 6, Belize 3, Dominican Republic 3, Guyana 2 |
| Named markets with one record each | Anguilla, Antigua and Barbuda, British Virgin Islands, Cayman Islands, Dominica, Grenada, Haiti, Montserrat, Puerto Rico, Saint Kitts and Nevis, Saint Lucia, Saint Vincent and the Grenadines, Suriname, The Bahamas, Turks and Caicos Islands |

Fourteen of the 15 one-record market tags come from CDB’s borrowing-member list. Puerto Rico appears on Sygnus Credit Investments. The list covers 21 named markets in total. Explicit tags for Cuba and the French and Dutch Caribbean are absent, even where broader regional profiles may cover those markets. The country counts measure the dataset's tagging coverage. [CDB borrowing members](https://www.caribank.org/countries-and-members/borrowing-members), [Sygnus Credit Investments](https://sygnusgroup.com/alternative-investment-platform/sygnus-credit-investments/)

| Sector label | Entity records |
| --- | ---: |
| Economic & social development | 18 |
| Enterprise & SME finance | 17 |
| Financial services | 17 |
| Climate adaptation & resilience | 16 |
| Infrastructure | 16 |
| Renewable energy & efficiency | 11 |
| Insurance & disaster risk | 7 |
| Trade & exports | 4 |
| Environment | 2 |

Sectors are multi-label. Private credit, pensions and banking are currently better distinguished through entity type and primary role than through the broad Financial services sector.

### Underrepresented parts of the market

| Area | Coverage in v0.1 | Assessment |
| --- | --- | --- |
| Private investment funds | Three private vehicles: one listed private-credit vehicle, one private-equity vehicle and one collective investment vehicle. Two are Sygnus vehicles. | **Medium.** One explicitly identified private-equity vehicle and zero dedicated private infrastructure or climate investment funds. The infrastructure sponsor and project company are operating entities. |
| Fund managers | Two primary investment-manager profiles, Sygnus Capital and the record still labelled JN Fund Managers. Sagicor Life has a secondary asset-management role. | **High** for correcting the JN identity. **Medium** for breadth across managers, strategies and domiciles. |
| Commercial banks | Three commercial banks plus one holding company. Republic Bank (Barbados) is the only individually represented local operating subsidiary in the bank group set. CIBC Caribbean and RBC have zero graph edges. | **Medium.** Operating subsidiaries, bank-level lending links and market-by-market coverage are thin. RBC’s parent identity and its regional service page represent different scopes. |
| Pension and social insurance capital | Two statutory administrators and one named reserve fund. No separately modelled occupational or private pension fund. | **Medium.** The atlas represents statutory reserves in Barbados and an administrator in Trinidad and Tobago. It cannot yet trace pension allocations to investments. |
| Insurance and reinsurance | Two private insurance holding groups, one private operating insurer/asset manager and one government-owned regional risk pool. | **Medium.** Commercial operating carriers and reinsurance are largely missing. The only `INSURES` edge is the CCRIF–Barbados COAST relationship. Guardian has no graph edges despite an accessible subsidiary chart. [Guardian organization chart](https://trinidad.myguardiangroup.com/companies/guardian-holdings-limited%3A%3Aorganisation-structure) |
| Regional and domestic links | CDB is incident to 11 of 44 edges. Nine entities are disconnected. | **Medium.** Hub prominence reflects research coverage. For instance, the existing DBJ source already names lenders including CDB and the World Bank even though DBJ has no edges. [DBJ intermediary-lending page](https://dbankjm.com/services/loansthroughafi/) |

## 2. Relationship audit

All **44 of 44** relationship IDs, endpoints, types, directions and evidence references pass the current structural checks. The graph holds 43 directed edges and one mutual edge. Each edge references one source. There are 32 distinct relationship sources and zero exact duplicate endpoint/type keys when the mutual pair is normalized. The review rated 19 edges Pass, 14 Low, nine Medium and two High. Period is present on 19 edges and absent on 25. The review below checks direction and scope against publisher content. A missing period is material where a reader could confuse a historical event with a current relationship.

| Type | Count | Type | Count |
| --- | ---: | --- | ---: |
| MANAGES | 12 | ESTABLISHED_BY | 7 |
| FUNDS | 7 | ACCREDITED_BY | 6 |
| LENDS_TO | 4 | IMPLEMENTS_FOR | 3 |
| OWNS | 3 | CO_INVESTS_WITH | 1 |
| INSURES | 1 | | |

For each directed edge, the arrow follows the stored verb. A facility points to its founder for `ESTABLISHED_BY`, while the accredited institution points to its accreditor for `ACCREDITED_BY`. The [evidence register](#evidence-register) gives the original publisher link and access result for each cited source ID.

| Relationship | Direction and stored type | Stored period | Evidence ID | Finding |
| --- | --- | --- | --- | --- |
| `rel-cdb-gcf` | `cdb` → `gcf` · `ACCREDITED_BY` | Unrecorded | `src-gcf-cdb` | **Low.** GCF’s directory lists CDB as accredited. It gives 13 Oct 2016 accreditation and 29 Nov 2018 agreement effectiveness. The edge has neither date. |
| `rel-ccccc-gcf` | `ccccc` → `gcf` · `ACCREDITED_BY` | Initial accreditation in 2015 | `src-gcf-ccccc` | **Pass.** GCF identifies the Centre as a regional accredited entity. Initial accreditation in 2015 matches the directory. It also gives 14 Mar 2023 re-accreditation. |
| `rel-idb-gcf` | `idb` → `gcf` · `ACCREDITED_BY` | Unrecorded | `src-gcf-idb` | **Low.** The announcement documents July 2015 accreditation and the 2017 accreditation agreement. The current directory corroborates the role. The edge has neither event date. [GCF IDB directory](https://www.greenclimate.fund/partners/accredited-entities/idb) |
| `rel-idbi-gcf` | `idbi` → `gcf` · `ACCREDITED_BY` | Unrecorded | `src-gcf-idbi` | **Low.** GCF confirms IDB Invest accreditation. Its directory shows 20 Oct 2018 and later agreement effectiveness. The edge is undated. |
| `rel-ifc-gcf` | `ifc` → `gcf` · `ACCREDITED_BY` | Unrecorded | `src-gcf-ifc` | **Low.** GCF confirms IFC accreditation and distinguishes its 8 Mar 2016 accreditation from the 11 Mar 2025 agreement effectiveness date shown. The edge is undated. |
| `rel-cdb-af` | `cdb` → `adaptation-fund` · `ACCREDITED_BY` | Unrecorded | `src-af-cdb` | **Low.** The Adaptation Fund lists CDB as a regional implementing entity. The profile includes a seemingly unrelated website domain in its contact block. Use the official registry entry for the role and CDB’s own page for its website. |
| `rel-cdb-ukcif` | `cdb` → `ukcif` · `MANAGES` | Unrecorded | `src-cdb-ukcif` | **Pass.** CDB and its procurement notice support the grant programme administration role. The programme page names the donor and historical delivery. [CDB procurement notice](https://www.caribank.org/work-with-us/procurement/procurement-notices/united-kingdom-caribbean-infrastructure-partnership-programme-ukcif) |
| `rel-uk-ukcif` | `fcdo` → `ukcif` · `FUNDS` | Unrecorded | `src-cdb-ukcif` | **Low.** CDB identifies the UK government via FCDO as funder. The source describes contributions already provided. The edge has no effective period or statement of the remaining funding window. |
| `rel-cdb-sdf` | `cdb` → `sdf` · `MANAGES` | Unrecorded | `src-cdb-sdf` | **Pass.** CDB describes the Special Development Fund as its concessional fund. The institutional management relation contributes no financing amount. |
| `rel-cdb-sef` | `cdb` → `sef` · `MANAGES` | From 2015 agreement | `src-idb-sef` | **Pass.** RG-L1071 identifies CDB as borrower and on-lender for eligible SEF sub-loans. The 2015 agreement supports the delivery role. Scope this to the documented operation. |
| `rel-idb-cdb-sef` | `idb` → `cdb` · `LENDS_TO` | 2015 | `src-idb-sef` | **Low.** The IDB source verifies the US$20m original approval, CDB and downstream on-lending. Approval was 13 Oct 2015 and signing followed. The stored year is accurate and the amount lacks its exact date. |
| `rel-ctf-cdb-sef` | `ctf` → `cdb` · `FUNDS` | 2015 | `src-cdb-sef` | **Medium.** CDB and IDB identify a separate CTF grant ceiling in the 20 Oct 2015 package. The direction represents economic source and ultimate recipient. The FP020 proposal identifies the component as contingent grants and describes CDB special-fund accounting. Executed terms and payment history remain open. [IDB signing announcement](https://www.iadb.org/en/news/idb-and-cdb-fund-sustainable-energy-facility-sef-eastern-caribbean) |
| `rel-gef-cdb-sef` | `gef-trust` → `cdb` · `FUNDS` | 2015 | `src-cdb-sef` | **Medium.** The amount is a distinct GEF component. GEF project 5312 calls it the SEEC Program, names IDB as implementing agency and includes CDB among executing agencies. CDB calls it a component of SEF. Preserve the shared operation identity and the IDB intermediation. [GEF project 5312](https://www.thegef.org/projects-operations/projects/5312) |
| `rel-gcf-sef` | `gcf` → `sef` · `FUNDS` | Unrecorded | `src-gcf-fp020` | **Medium.** FP020 confirms GCF support and IDB accreditation. GCF records approval in 2016, agreement execution in 2019 and later disbursements. This five-country geothermal programme is a narrower scope than the broader 2015 SEF package. |
| `rel-idb-sef` | `idb` → `sef` · `IMPLEMENTS_FOR` | Unrecorded | `src-gcf-fp020` | **Medium.** IDB is the accredited entity for FP020. The edge reads as implementation of the whole SEF because it uses the same facility node. Date and scope the operational role to FP020. It describes delivery within the same financing as the GCF edge. |
| `rel-cdb-seec` | `cdb` → `seec` · `MANAGES` | Unrecorded | `src-cdb-seec` | **Medium.** CDB’s programme page identifies CDB as a founding funder and lists a CDB contact. The 2015 announcement says SEEC is available through CDB. These support a delivery role. Explicit trustee or programme administration authority is less clear in the attached source. [CDB signing announcement](https://www.caribank.org/newsroom/news-and-events/cdb-signs-agreement-idb-secure-usd715m-sustainable-energy-facility-eastern-caribbean) |
| `rel-eu-seec` | `eu` → `seec` · `FUNDS` | 2015 | `src-cdb-sef` | **Pass.** The 2015 announcement names the EU Caribbean Investment Facility as an SEEC contributor. The EU is an umbrella source here. Keep this programme contribution distinct from the CTF and GEF components recorded for SEF. |
| `rel-idb-idblab` | `idb` → `idb-lab` · `MANAGES` | Unrecorded | `src-idb-lab-report` | **Pass.** The IDB President’s report identifies the Multilateral Investment Fund as IDB Lab and as a trust fund administered by IDB. The publisher’s indexed document passage supports the claim despite the direct HTTP block. [IDB annual report](https://publications.iadb.org/publications/english/document/idb_annual_report_2025_web_version.pdf) |
| `rel-idb-gef` | `idb` → `gef` · `IMPLEMENTS_FOR` | Unrecorded | `src-gef-agencies` | **Pass.** The GEF agencies directory names IDB as an agency. Implementing for GEF is distinct from the World Bank’s trustee role. |
| `rel-wb-gef` | `world-bank` → `gef-trust` · `MANAGES` | Unrecorded | `src-gef-organization` | **Pass.** GEF identifies the World Bank as trustee of the GEF Trust Fund. Source-to-target direction matches management. No amount is attributed to the trustee. |
| `rel-wb-af` | `world-bank` → `adaptation-fund` · `MANAGES` | Unrecorded | `src-af-trustee` | **Pass.** The Adaptation Fund identifies the World Bank as interim trustee. The cited text supports trust-fund administration. The description preserves the interim qualification. |
| `rel-eib-cdb` | `eib` → `cdb` · `LENDS_TO` | October 2024 | `src-eib-cdb-2024` | **High.** The loan and amount are supported. The press release describes October signing, while the register lists both signatures on 30 Sep 2024. The source record’s 25 Oct publication date also differs from the 24 Oct press date. [EIB project register](https://www.eib.org/en/projects/all/20220727) |
| `rel-cdb-ppp` | `ppp` → `cdb` · `ESTABLISHED_BY` | 2015 | `src-cdb-ppp` | **Pass.** CDB’s programme page names CDB among the 2015 launch parties. The edge reads from facility to founder and conveys no financing amount. |
| `rel-wb-ppp` | `ppp` → `world-bank` · `ESTABLISHED_BY` | 2015 | `src-cdb-ppp` | **Pass.** The same 2015 CDB account names the World Bank as a launch collaborator. It supports co-establishment. The edge has no funding inference. |
| `rel-idb-ppp` | `ppp` → `idb` · `ESTABLISHED_BY` | 2015 | `src-cdb-ppp` | **Pass.** The same 2015 CDB account names IDB as a launch collaborator. It supports co-establishment. The edge has no funding inference. |
| `rel-idblab-ppp` | `ppp` → `idb-lab` · `ESTABLISHED_BY` | 2015 | `src-cdb-ppp` | **Pass.** The same 2015 CDB account names the Multilateral Investment Fund as collaborator. The endpoint preserves its legal fund identity and the 2015 period. |
| `rel-caricom-ccccc` | `ccccc` → `caricom` · `ESTABLISHED_BY` | 2002 approval | `src-ccccc-about` | **Pass.** The Centre’s history records approval and signature of its enabling protocol by CARICOM Heads in 2002. Its operational start followed later. The stored period correctly labels approval. |
| `rel-caricom-cdf` | `cdf` → `caricom` · `ESTABLISHED_BY` | Unrecorded | `src-cdf-about` | **Low.** The CDF cites Article 158 of the Revised Treaty as its authority. The institutional shorthand CARICOM is reasonable. A treaty-based role and operational date could be made explicit. |
| `rel-eu-lacif` | `lacif` → `eu` · `ESTABLISHED_BY` | Unrecorded | `src-eu-lacif` | **Low.** The Commission describes LACIF as an EU facility and explains its antecedent regional blending facilities. EU sponsorship is clear. The edge would benefit from a formal creation or consolidation reference and date. |
| `rel-eu-export` | `caribbean-export` → `eu` · `IMPLEMENTS_FOR` | Unrecorded | `src-export-rpsdp` | **Low.** Caribbean Export implements a specifically named EU-financed programme from 2023 to 2027. The edge to the EU is defensible for that programme. The undated generic label can look broader. |
| `rel-export-rpsdp` | `caribbean-export` → `rpsdp` · `MANAGES` | Unrecorded | `src-export-rpsdp` | **Low.** Caribbean Export is the named implementer of RPSDP III. The source supports delivery from 2023 to 2027. `MANAGES` expresses programme delivery broadly. No additional funding flow follows from the edge. |
| `rel-eu-rpsdp` | `eu` → `rpsdp` · `FUNDS` | Unrecorded | `src-export-rpsdp` | **Low.** The programme page gives direct EU co-financing and a 2023 to 2027 period. This funding edge is one part of the same programme represented by the two implementation/management links. |
| `rel-wb-ccrif` | `world-bank` → `ccrif` · `FUNDS` | 2015–2021 results period | `src-ccrif-wb` | **Medium.** The 2022 results page supports donor co-financing administered by the World Bank during the recorded results period. `FUNDS` can imply the Bank supplied all resources. Preserve trustee/administrator and donor roles separately in any attribution. |
| `rel-rfhl-republic-bb` | `rfhl` → `republic-bb` · `OWNS` | Unrecorded | `src-rfhl-about` | **Pass.** The publisher’s readable site view names RFHL as registered owner of Republic Bank (Barbados). The automated GET encountered a 307 interstitial. |
| `rel-sagicor-life` | `sagicor` → `sagicor-life` · `OWNS` | Unrecorded | `src-sagicor-ar` | **Medium.** The official annual report variant shows a 100% effective group interest in 2025. This supports group ownership. Direct parentage is narrower. November 2026 results describe a proposed combination expected to close in 2027, so it still needs monitoring. [2025 annual report](https://www.sagicor.com/-/media/pdfs/sfc/annual-reports/sfc-annual-report-2025.pdf?ts=20261102t1923148682), [November 2026 update](https://investors.sagicor.com/2026-11-11-Sagicor-Financial-Reports-Third-Quarter-2026-Results) |
| `rel-nis-managed` | `nis` → `nis-fund` · `MANAGES` | Unrecorded | `src-nis-investment` | **Medium.** The attached investment page demonstrates disclosure of the fund’s portfolios. The NISSS About page explicitly assigns control and management to its Board and records the December 2023 transition. Attach that stronger passage to the edge. [NISSS About](https://www.nis.gov.bb/about-us/) |
| `rel-sygnus-sci` | `sygnus` → `sci` · `MANAGES` | Unrecorded | `src-sygnus-sci` | **Pass.** The vehicle page explicitly names Sygnus Capital as manager. Direction and type match. It is a management relationship with no amount. |
| `rel-sygnus-deneb` | `sygnus` → `deneb` · `MANAGES` | January 2022 disclosure | `src-sygnus-deneb-agm` | **Low.** January 2022 AGM minutes, PDF p. 15, identify Sygnus Capital as manager. The stored historical period is accurate. The edge supplies no independent confirmation of current arrangements. |
| `rel-jn-managed` | `jnfm` → `jn-mutual` · `MANAGES` | 2024–2025 offering document | `src-jn-offering` | **High.** The 2024–2025 offering document confirms the historical manager. March 2026 accounts identify the same entity under its new name Barita Fund Managers Limited and as manager/administrator. The historical edge is sound and the displayed institution identity is stale. [2026 financial statements](https://www.jnfunds.com/wp-content/uploads/JN-Mutual-Funds-LMMF-FS-2026-Final.pdf) |
| `rel-ccrif-barbados` | `ccrif` → `barbados-gov` · `INSURES` | Unrecorded | `src-ccrif-coast` | **Low.** CCRIF identifies Barbados among the COAST purchasers and describes government purchase of policies. It supplies no Barbados-specific dates, policy limit or renewal evidence. Keep those as unknown. |
| `rel-interenergy-enertur` | `interenergy` → `enertur` · `OWNS` | November 2024 transaction | `src-findev-enertur` | **Pass.** FinDev’s signing summary, PDF p. 1, explicitly says InterEnergy fully owns the Enertur project company. The period bounds the statement to the deal disclosure. |
| `rel-findev-enertur` | `findev` → `enertur` · `LENDS_TO` | November 2024 | `src-findev-enertur` | **Pass.** FinDev’s summary names the counterparty, debt instrument, up-to US$18.8m amount and 1 Nov 2024 signing. It is an individual loan within the coordinated facility. |
| `rel-idbi-enertur` | `idbi` → `enertur` · `LENDS_TO` | November 2024 | `src-idbi-enertur` | **Pass.** IDB Invest identifies itself as a co-lender and identifies Enertur as borrower. The atlas leaves the relationship unquantified. The publicly stated US$56.4m package is the group total. |
| `rel-idbi-findev-enertur` | `idbi` ↔ `findev` · `CO_INVESTS_WITH` | November 2024 | `src-idbi-enertur` | **Medium.** IDB Invest describes equal participation by the three lenders. Reciprocity is correct for this co-financing. `CO_INVESTS_WITH` can read as equity or a second transaction even though this is the same shared debt deal. |

## 3. Evidence accessibility and content audit

### Automated URL results

A Node.js GET check requested all 90 stored URLs on 17 November 2026. It followed ordinary HTTP redirects, used a 16-second request timeout, and retried transport errors and 5xx responses once. It recorded response status and identified PDFs by file signature. This is a point-in-time client result. An institutional firewall, JavaScript wrapper or network timeout can produce a different result in a visitor’s browser.

| Direct GET result | Count | Interpretation |
| --- | ---: | --- |
| 200 | 76 | Transport succeeded. Two redirected at HTTP level to canonical URLs. RBC returned a small HTML meta redirect. Some publisher pages required a readable view for text. |
| 403 | 9 | Access denied for this client, usually by a publisher’s request filter. |
| 307 | 2 | RFHL interstitials remained at the original URL. The publisher’s readable views supplied content. |
| 404 | 2 | Both original CIBC URLs returned 404 to this client. The history was readable at its original URL through a publisher-indexed view. The annual report used a corrected official path. |
| Timeout | 1 | NIBTT annual report timed out. The publisher PDF was readable through the document view. |
| **Total** | **90** | **76/90** returned HTTP 200. |

Content review inspected extracted HTML and PDF text and available publisher views. Where the recorded URL supplied an interstitial, redirect, or incomplete document, the ledger identifies the verification path. Each source row tests the registry’s stated reference. Entity profiles contain multiple factual fields and map sources at the profile level, so this is a test of the source’s stated purpose and the 44 relationship claims rather than a certification of every field on every profile.

All 90 source records carry the stored “verified” label and the same access date. Publication dates are populated on five. Some undated reference entries are normal for live landing pages, while dated announcements, annual reports and contracts benefit from publication dates and page, table, or section locators. Of the 90 sources, 58 appear on profiles only, 27 appear on profiles and edges, and five appear on edges only. Source access status, passage verification, and the as-of date of the underlying fact would benefit from separate fields.

### Evidence register

Status codes describe content. **S** supports the stated reference in the recorded publisher material, including a readable publisher-indexed view. **A** indicates supporting content recovered through a corrected URL, link destination or linked report. **P** indicates partial support or a substantive metadata or scope difference. **T** indicates a superseded current identity. Evidence for qualified or dated claims remains useful when presented within that scope.

The ledger contains **83 S, 4 A, 2 P and 1 T** results.

| Recorded source | HTTP GET | Content result and locator |
| --- | --- | --- |
| [`src-cdb-about`](https://www.caribank.org/about-us) | `200` | **S.** Institutional mandate and borrowing-member development purpose are in the About and functions sections. |
| [`src-cdb-hq`](https://www.caribank.org/general-privacy-notice) | `200` | **S.** The privacy notice lists headquarters in Wildey, St Michael, Barbados. |
| [`src-cdb-members`](https://www.caribank.org/countries-and-members/borrowing-members) | `200` | **S.** The published list gives 19 borrowing members and explains borrowing and voting rights. |
| [`src-cdb-finance`](https://www.caribank.org/sites/default/files/publication-resources/CDB%20Sustainable%20Finance%20Framework%20-%20Clean%20-%2021.11.22%201.pdf) | `200` | **S.** Framework PDF pp. 8 and 16 cover the mandate and capital-market funding. |
| [`src-idb-about`](https://www.iadb.org/en/who-we-are/about-us) | `403` | **S.** The publisher’s readable view separates IDB public-sector work, IDB Invest and IDB Lab. |
| [`src-idb-capital`](https://www.iadb.org/en/how-we-can-work-together/public-sector/capital-and-funds-under-administration) | `403` | **S.** The publisher’s readable view identifies member subscriptions, bonds and funds managed for donors. |
| [`src-idb-offices`](https://www.iadb.org/en/who-we-are/country-offices) | `403` | **S.** The publisher’s readable view gives the Washington headquarters and borrowing-country office list. |
| [`src-idbi-about`](https://idbinvest.org/en/about-us) | `200` | **S.** The About page states the private-sector mandate and ownership by 48 member countries. |
| [`src-idbi-finance`](https://www.idbinvest.org/es/download/7451) | `200` (redirect) | **S.** The redirect resolves to the audited financial statements. PDF p. 72 lists lending, equity and guarantees. |
| [`src-idb-lab-report`](https://publications.iadb.org/publications/english/document/IDB_President_Report_2025.pdf) | `403` | **S.** The publisher-indexed introductory footnote names the MIF trust fund and IDB as administrator. The [IDB annual report](https://publications.iadb.org/publications/english/document/idb_annual_report_2025_web_version.pdf) also corroborates it. |
| [`src-wb-about`](https://www.worldbank.org/en/about/annual-report/world-bank) | `200` | **S.** The annual report overview distinguishes IBRD from the concessional IDA window. |
| [`src-wbg-basics`](https://libguides.worldbank.org/WBGInfoguide/basics) | `200` | **S.** The library overview names the five institutions under the group umbrella. |
| [`src-wbg-caribbean`](https://www.worldbank.org/ext/en/region/lac/caribbean) | `200` | **S.** The regional overview documents resilience, work on jobs and regional approaches. Cite the edition if using portfolio figures. |
| [`src-ifc-lac`](https://www.ifc.org/en/where-we-work/latin-america-and-the-caribbean) | `200` | **S.** The regional page describes private-sector investment and advisory work. |
| [`src-eib-lac`](https://www.eib.org/en/projects/region/latin-america-caribbean) | `200` | **S.** The regional introduction identifies climate action, sustainable development and infrastructure. |
| [`src-eib-cdb-2024`](https://www.eib.org/en/press/all/2024-392-global-gateway-eib-and-caribbean-development-bank-partner-to-boost-resilience-to-climate-change-in-the-caribbean) | `200` | **P.** The amount, water/waste purpose and EIB public ownership are supported. The press date is 24 Oct and the stored publication date is 25 Oct. The [project register](https://www.eib.org/en/projects/all/20220727) records signatures on 30 Sep. |
| [`src-dbj-about`](https://dbankjm.com/elementor-16221/) | `200` | **S.** The institutional history establishes state ownership and creation in 2000. |
| [`src-dbj-afi`](https://dbankjm.com/services/loansthroughafi/) | `200` | **S.** The intermediary-lending page explains wholesale delivery and names several financing sources, including CDB and World Bank. |
| [`src-gcf-about`](https://www.greenclimate.fund/about) | `200` | **S.** The About page identifies its development-country climate mitigation and adaptation mandate and UNFCCC origins. |
| [`src-gcf-hq`](https://www.greenclimate.fund/about/secretariat/headquarters) | `200` | **S.** The headquarters page gives Songdo, Incheon, Republic of Korea. |
| [`src-gcf-access`](https://www.greenclimate.fund/access-funding) | `200` | **S.** The guidance describes country-driven preparation, financing and accredited or project-specific access routes. |
| [`src-gef-funding`](https://www.thegef.org/who-we-are/funding) | `200` | **S.** The funding page covers donor contributions and periodic replenishment, followed by delivery through GEF agencies. |
| [`src-gef-agencies`](https://www.thegef.org/partners/gef-agencies) | `200` | **P.** IDB is explicitly listed. The World Bank is a listed agency, while the comparative-advantage description uses the World Bank Group label. Cite the precise legal role when building an edge. |
| [`src-af-about`](https://www.adaptation-fund.org/) | `200` | **S.** The fund homepage describes practical adaptation support for vulnerable developing countries. |
| [`src-af-access`](https://www.adaptation-fund.org/apply-funding/implementing-entities/) | `200` | **S.** The implementing-entities page identifies national, regional and multilateral accredited access. |
| [`src-af-cdb`](https://www.adaptation-fund.org/imp_entity/caribbean-development-bank-cdb/) | `200` | **S.** The entry identifies CDB as a regional implementing entity. Its contact block lists a separate web domain that should be avoided as CDB identity evidence. |
| [`src-ifc-cif`](https://www.ifc.org/en/what-we-do/sector-expertise/blended-finance/climate/climate-Investment-funds) | `200` | **S.** The IFC overview identifies CIF’s mandate, the CTF window and MDB implementation. |
| [`src-cdb-sef`](https://www.caribank.org/newsroom/news-and-events/cdb-signs-agreement-idb-secure-usd715m-sustainable-energy-facility-eastern-caribbean) | `200` | **S.** The 20 Oct 2015 signing notice lists the IDB loan and CTF/GEF ceilings separately from the package total. |
| [`src-idb-sef`](https://www.iadb.org/en/project/RG-L1071) | `403` | **S.** The publisher's operation page gives approval, signing, amount, form of credit and CDB as borrower/on-lender. |
| [`src-gcf-fp020`](https://www.greenclimate.fund/portfolio/projects/fp020) | `200` | **S.** The portfolio lists IDB as accredited entity and distinguishes board approval, agreement, commitments, co-financing and disbursement. |
| [`src-ccccc-about`](https://caribbeanclimate.org/about/) | `200` | **S.** The Centre’s history describes the 2002 Heads of Government approval and enabling protocol. |
| [`src-gcf-ccccc`](https://www.greenclimate.fund/partners/accredited-entities/ccccc) | `200` | **S.** The directory lists a regional entity, initial accreditation in 2015 and re-accreditation in 2023. |
| [`src-ccccc-caricom`](https://caricom.org/institutions/caribbean-community-climate-change-centre-ccccc/) | `200` | **S.** CARICOM identifies the institution, its regional coordination role and Belize location. |
| [`src-ccsa-about`](https://caribbeanaccelerator.org/about) | `200` | **S.** The accelerator’s history describes its origin, project implementation focus and finance mobilisation. |
| [`src-ccsa-work`](https://caribbeanaccelerator.org/what-we-do) | `200` | **S.** The activity page describes project support and connections with funders. |
| [`src-ccsa-terms`](https://caribbeanaccelerator.org/terms) | `200` | **S.** The terms identify Caribbean Climate-Smart Accelerator Inc. as the website counterparty. Ownership remains undetermined. |
| [`src-ccrif-about`](https://www.ccrif.org/about-us?language_content_entity=en) | `200` | **S.** The history documents conversion to a segregated portfolio company and the regional parametric risk pool. |
| [`src-ccrif-wb`](https://www.worldbank.org/en/results/2022/04/21/risk-insurance-builds-climate-and-disaster-resilience-in-central-america-and-the-caribbean) | `200` | **S.** The 2022 results page attributes co-finance to an administered multi-donor trust fund. The results period and donor roles matter. |
| [`src-cdb-seec`](https://www.caribank.org/our-work/programmes/sustainable-energy-eastern-caribbean) | `200` | **S.** The programme page gives the multi-donor structure, 2015 start and six-country mandate. Its administration authority needs a more explicit reference on the edge. |
| [`src-caricom-about`](https://caricom.org/our-community/who-we-are/) | `200` | **S.** The community page records Member States, Associate Members and the integration mandate. |
| [`src-cdf-about`](https://caricomdevelopmentfund.org/who-we-are/) | `200` | **S.** The About page cites Article 158 of the Revised Treaty and its purpose of reducing disparities. |
| [`src-cdf-programmes`](https://caricomdevelopmentfund.org/) | `200` | **S.** The fund’s programme overview identifies financial and technical assistance to members. |
| [`src-export-rpsdp`](https://carib-export.com/en/projects/regional-private-sector-development-programme-iii) | `200` | **S.** The publisher’s rendered programme text names the implementer, EU co-financing and the 2023–2027 term. Full market eligibility needs its own locator. |
| [`src-export-eu`](https://carib-export.com/en/partners/european-union) | `200` | **S.** The publisher’s rendered partner page documents past EDF programmes and RPSDP III co-financing. |
| [`src-eu-caribbean`](https://www.eeas.europa.eu/eeas/factsheet-eu-caribbean-relations_en) | `200` | **S.** The factsheet summarizes the EU–Caribbean policy, trade and development relationship. Treat its agreements discussion as dated background. |
| [`src-eu-lacif`](https://international-partnerships.ec.europa.eu/policies/programming/programmes/lacif-eu-vehicle-generate-sustainable-investment-latin-america-and-caribbean_en) | `200` | **S.** The Commission describes grant blending with partner finance through its regional facility. |
| [`src-uk-caribbean`](https://www.gov.uk/government/publications/uk-caribbean-region-development-partnership-summary/uk-caribbean-region-development-partnership-summary-july-2023) | `200` | **S.** The July 2023 policy summary identifies investment and development priorities. Its timetable is historical. |
| [`src-cdb-ukcif`](https://www.caribank.org/our-work/programmes/united-kingdom-caribbean-infrastructure-fund-ukcif) | `200` | **S.** The programme overview identifies UK/FCDO grant funding and CDB delivery. The attached procurement source states administration explicitly. |
| [`src-ukcif-procurement`](https://www.caribank.org/work-with-us/procurement/procurement-notices/united-kingdom-caribbean-infrastructure-partnership-programme-ukcif) | `200` | **S.** The procurement notice explicitly identifies UK funding and CDB administration. The notice’s application dates are specific to that procurement. |
| [`src-cdb-sdf`](https://www.caribank.org/our-work/programmes/special-development-fund) | `200` | **S.** CDB describes its concessional pool, replenishment contributions and loans/grants. |
| [`src-cdb-ppp`](https://www.caribank.org/our-work/programmes/regional-public-private-partnership-support-facility) | `200` | **S.** CDB names the World Bank, IDB and MIF among its 2015 establishment partners. |
| [`src-rfhl-about`](https://www.rfhl.com/about-us/) | `307` | **S.** The publisher’s readable view expressly lists Republic Bank (Barbados) among the entities the holding group owns. |
| [`src-rfhl-subs`](https://www.rfhl.com/subsidiaries/) | `307` | **S.** The publisher’s subsidiary table identifies the Barbados bank and its website. The direct GET encountered an interstitial. |
| [`src-republic-bb`](https://www.republicbarbados.com/) | `200` | **S.** The bank homepage lists personal and commercial banking services. |
| [`src-cibc-ar`](https://www.cibccaribbean.com/binaries/content/assets/annual-reports/2025/cibc-caribbean-group-ar-2025.pdf) | `404` | **A.** The stored PDF path returned 404. The corrected [2025 annual report](https://www.cibccaribbean.com/binaries/content/assets/annual-reports/2025/cibccaribbean-group-ar-2025.pdf), p. 155, shows the listed parent-owned bank and its subsidiaries. |
| [`src-cibc-history`](https://www.cibccaribbean.com/about-us/corporate-profile/history) | `404` | **S.** The direct GET returned 404 but the publisher’s readable view at the same URL documents the formation and CIBC branding history. |
| [`src-rbc-caribbean`](https://www.rbcroyalbank.com/caribbean/) | `200` (meta refresh) | **A.** HTTP 200 is an HTML meta redirect. The [destination](https://www.rbc.com/caribbean.html) identifies the regional markets and routes to the products. [RBC financing solutions](https://www.rbcroyalbank.com/caribbean/business/financing-solutions.html) supplies the lending detail. |
| [`src-sagicor-about`](https://www.sagicor.com/en/about-sagicor/who%20we%20are) | `403` | **S.** The publisher’s readable profile describes Barbados origins, life insurance, annuities and wider group operations. |
| [`src-sagicor-life`](https://www.sagicor.com/en/about-sagicor/our-companies/sagicor-life-inc) | `403` | **S.** The publisher’s readable operating-company page lists Barbados origins and insurance, mortgages, asset and pension services. |
| [`src-guardian-structure`](https://trinidad.myguardiangroup.com/companies/guardian-holdings-limited%3A%3Aorganisation-structure) | `200` | **S.** The group chart identifies life, general insurance and reinsurance operations and subsidiary ownership percentages. |
| [`src-guardian-sustainability`](https://trinidad.myguardiangroup.com/sustainability-report-2025) | `200` | **A.** The landing page links the [full Guardian report](https://c360filestore.blob.core.windows.net/strapi-files/assets/Guardian_Group_Sustainability_Report_2025_April_29_2026_6fa5c934c3.pdf). PDF p. 4 identifies Guardian Holdings Limited and its subsidiaries as the reporting scope. |
| [`src-nis-about`](https://www.nis.gov.bb/about-us/) | `200` | **S.** The history describes contributions, fund return objectives and the 2023 statutory corporation transition. It assigns fund control and management to the Board. |
| [`src-nis-investment`](https://www.nis.gov.bb/investments-2/) | `200` | **S.** The rendered National Insurance Fund page links historical portfolio snapshots. Evidence of management authority comes from the About page. |
| [`src-nib-investments`](https://www.nibtt.net/NIBTT/Investments.html) | `200` | **S.** NIBTT says investment returns and contribution income fund coverage. |
| [`src-nib-ar`](https://www.nibtt.net/annualreport/AR2023_24.pdf) | Timeout | **S.** A publisher PDF view was available despite the GET timeouts. The FY2023–24 report describes scheme operations and investment performance. |
| [`src-sygnus-capital`](https://sygnusgroup.com/who-is-sygnus/our-companies/) | `200` | **S.** The group’s legal-services profiles identify the licensed dealer and private-market financing activities. |
| [`src-sygnus-sci`](https://sygnusgroup.com/alternative-investment-platform/sygnus-credit-investments/) | `200` | **S.** The vehicle profile names Sygnus Capital as manager and lists notes, preference shares, asset backing and mezzanine instruments. |
| [`src-sygnus-deneb`](https://sygnusgroup.com/alternative-investment-platform/sygnus-deneb/) | `200` | **S.** The vehicle profile describes regional private equity, growth and mezzanine capital for mid-sized companies. |
| [`src-sygnus-deneb-agm`](https://sygnusgroup.com/wp-content/uploads/2023/01/Minutes-for-Sygnus-Credit-Investments-Ltd-AGM-held-on-January-26-2022-FINAL.pdf) | `200` | **S.** PDF p. 15 of the January 2022 minutes identifies the manager at that date. |
| [`src-jn-about`](https://www.jnfunds.com/who-we-are/) | `403` (redirect) | **T.** The former JN About page redirects to Barita Fund Managers. The old name is historical. The [March 2026 fund accounts](https://www.jnfunds.com/wp-content/uploads/JN-Mutual-Funds-LMMF-FS-2026-Final.pdf) identify the current name and continuing legal role. |
| [`src-jn-offering`](https://www.jnfunds.com/wp-content/uploads/JN-Mutual-Funds-Offering-Document-2024-to-2025-approved-Dec-20-2024.pdf) | `200` | **S.** Historical support. The 2024–2025 offering PDF, p. 16, lists the manager and Kingston address. Use dated wording. |
| [`src-fundaccess-about`](https://www.fundaccess.org/about/) | `200` | **S.** The entity’s profile identifies its corporate name, incorporation and MSME development mandate. |
| [`src-fundaccess-loans`](https://www.fundaccess.org/app-docs/) | `200` | **S.** The application page provides a document checklist and distinguishes that from the online form. |
| [`src-gcf-cdb`](https://www.greenclimate.fund/partners/accredited-entities/cdb) | `200` | **S.** The accredited-entity profile identifies CDB and the accreditation and agreement dates. |
| [`src-gcf-idb`](https://www.greenclimate.fund/about/news-and-updates/gcf-strengthens-partnership-inter-american-development-bank) | `200` | **S.** The September 2017 announcement describes IDB’s accreditation and signing of the master agreement. |
| [`src-gcf-idbi`](https://www.greenclimate.fund/partners/accredited-entities/idb-invest) | `200` | **S.** The directory identifies IDB Invest as accredited and gives accreditation and agreement dates. |
| [`src-gcf-ifc`](https://www.greenclimate.fund/partners/accredited-entities/ifc) | `200` | **S.** The directory identifies IFC accreditation and associated dates. |
| [`src-gef-organization`](https://www.thegef.org/who-we-are/organization) | `200` | **S.** The governance page explicitly identifies the World Bank as GEF Trust Fund trustee. |
| [`src-af-trustee`](https://www.adaptation-fund.org/about/governance/trustee/) | `200` | **S.** The governance page explicitly identifies the interim trustee and trust-fund administration functions. |
| [`src-ccrif-ownership`](https://www.ccrif.org/request-expressions-interest-asset-manager?language_content_entity=en) | `200` | **S.** The procurement notice confirms Cayman domicile, government ownership and the risk pooling mandate. |
| [`src-barbados-gov`](https://gisbarbados.gov.bb/government/) | `200` | **S.** The official government listing names finance, economic development and public investment portfolios. |
| [`src-ccrif-coast`](https://www.ccrif.org/projects/coast/caribbean-ocean-and-aquaculture-sustainability-facility?language_content_entity=en) | `200` | **S.** The insurance programme page lists Barbados among purchasers. It supplies no Barbados-specific coverage start, renewal or limit. |
| [`src-gef-trust`](https://www.thegef.org/sites/default/files/documents/2025-04/GEF-9-Inf.03%20GEF%20Trust%20Fund%20Financial%20Report.pdf) | `200` | **S.** The Trustee’s PDF describes accounting and donor resources for the GEF Trust Fund under its instrument. |
| [`src-sagicor-ar`](https://www.sagicor.com/-/media/pdfs/sfc/annual-reports/sfc-annual-report-2025.pdf) | `403` | **A.** The recorded URL blocked the direct fetch. The official [2025 report variant](https://www.sagicor.com/-/media/pdfs/sfc/annual-reports/sfc-annual-report-2025.pdf?ts=20261102t1923148682) shows the effective group interest in Sagicor Life Inc. |
| [`src-ctf-governance`](https://cif.org/sites/cif_enc/files/meeting-documents/ctf_governance-framework-01212025.pdf) | `200` (redirect) | **S.** The redirect resolves to the governance PDF. Paragraph 3 places CTF within CIF. |
| [`src-interenergy-about`](https://interenergy.com/about-us/) | `200` | **S.** The group profile states generation, distribution and commercialization in Latin America and the Caribbean. |
| [`src-interenergy-portfolio`](https://interenergy.com/portfolio/enertur/) | `200` | **S.** The sponsor’s page identifies the Enertur subsidiary and La Romana solar and storage project. |
| [`src-findev-enertur`](https://www.findevcanada.ca/sites/default/files/2025-02/2025_001_TDS_Enertur_EN.pdf) | `200` | **S.** PDF p. 1 identifies the borrower, owner, debt, USD 18.8m ceiling and exact signing date. |
| [`src-idbi-enertur`](https://idbinvest.org/en/news-media/idb-invest-findev-canada-and-fmo-announce-financing-enertur-boost-renewable-energy) | `200` | **S.** The lender release identifies the three co-lenders and their equal participation. It also identifies InterEnergy’s markets and FinDev as the Canadian DFI. |
| [`src-findev-story`](https://www.findevcanada.ca/en/about-us/our-story) | `200` | **S.** The institutional history sets out the formal name and private-sector development mandate. |

## 4. Financial integrity

The five recorded amounts match primary disclosures in value and reported currency. A recorded approval or commitment is a financing stage. The “up to” values are ceilings. For the two grants the IDB announcement uses USD-equivalent wording, so the reporting currency is established and the original contract denomination remains unverified. None of the five rows records a disbursement.

| Relationship | Value and stored representation | Source check and severity |
| --- | --- | --- |
| `rel-idb-cdb-sef` | **USD 20,000,000**, global credit loan, **approval**, period 2015, no amount date | **Low.** RG-L1071 confirms the amount, approval on **13 Oct 2015** and signing on **20 Oct 2015**. The Global Credit Operation modality and approved amount match. Record the approval date separately from the signing. [IDB operation RG-L1071](https://www.iadb.org/en/project/RG-L1071) |
| `rel-ctf-cdb-sef` | **USD 19,050,000**, CTF grant ceiling, **commitment**, period 2015, no amount date | **Medium.** CDB and IDB describe this ceiling in the **20 Oct 2015** signed package. The commitment classification reflects the package announcement. The approved FP020 proposal, Tables 1 and 2, describes the CTF component as contingent grant funding. The recorded instrument omits that qualification. Check the executed terms and payment history before assigning a more specific realized status. [FP020 approved proposal, PDF pp. 9–10](https://www.greenclimate.fund/sites/default/files/document/funding-proposal-fp020-idb-dominica-grenada-saint-kitts-and-nevis-saint-lucia-and-saint-vincent-and.pdf) [CDB package](https://www.caribank.org/newsroom/news-and-events/cdb-signs-agreement-idb-secure-usd715m-sustainable-energy-facility-eastern-caribbean), [IDB announcement](https://www.iadb.org/en/news/idb-and-cdb-fund-sustainable-energy-facility-sef-eastern-caribbean) |
| `rel-gef-cdb-sef` | **USD 3,013,698**, GEF Trust Fund grant ceiling, **commitment**, period 2015, no amount date | **Medium.** The **20 Oct 2015** signed package reports the ceiling. GEF project **5312** independently records the grant and approval for implementation on **15 Sep 2015**, with IDB as implementing agency. GEF uses SEEC in its title. The package accounts for the ceiling as SEF. Keep the approval, package commitment context and routing distinct. [GEF project 5312](https://www.thegef.org/projects-operations/projects/5312), [CDB package](https://www.caribank.org/newsroom/news-and-events/cdb-signs-agreement-idb-secure-usd715m-sustainable-energy-facility-eastern-caribbean) |
| `rel-eib-cdb` | **EUR 100,000,000**, loan, **commitment**, period October 2024, no amount date | **High.** EIB operation **20220727** gives EUR 5m for solid waste and EUR 95m for water and sewerage, both signed **30 Sep 2024**. The **24 Oct** press release describes a signing at the announcement. Resolve the two accounts before recording the amount date. The register establishes the signature dates used for the two amounts. [EIB project register](https://www.eib.org/en/projects/all/20220727), [EIB announcement](https://www.eib.org/en/press/all/2024-392-global-gateway-eib-and-caribbean-development-bank-partner-to-boost-resilience-to-climate-change-in-the-caribbean) |
| `rel-findev-enertur` | **USD 18,800,000**, project finance loan ceiling, **commitment**, amount date **1 Nov 2024** | **Pass.** FinDev identifies its own up-to debt commitment, the counterparty, and the exact signing date. The transaction summary was published 3 Feb 2025. USD 56.4m describes the overall facility. [FinDev summary, p. 1](https://www.findevcanada.ca/sites/default/files/2025-02/2025_001_TDS_Enertur_EN.pdf) |

### Double-counting and graph interpretation

- **High for future aggregation · SEF, SEEC and FP020.** The three 2015 quantified components and the disclosed CDB counterpart contribution are parts of the roughly USD 71.5m package. The USD 20m approval and subsequent signing are stages of the same original loan. GEF 5312 also reports USD 49.435m in co-financing and a separate agency fee. FP020 lists USD 80m in GCF financing and approximately USD 112.4m in co-financing, including values of USD 20m and USD 19.05m. The approved FP020 proposal attributes USD 20m to IDB and USD 19.05m in contingent grants to CTF, confirming the overlap at financing-line level. It allocates about USD 1.918m from GEF to this specific scope, below the original USD 3.013698m grant. The portfolio now shows a USD 1.935698m co-financing grant line without naming its donor, so the exact subsequent GEF allocation still needs reconciliation. [FP020 approved proposal, PDF pp. 9–10](https://www.greenclimate.fund/sites/default/files/document/funding-proposal-fp020-idb-dominica-grenada-saint-kitts-and-nevis-saint-lucia-and-saint-vincent-and.pdf) Reconcile instrument IDs, programme scope and recipient routing before including package, co-finance or downstream amounts in any total. [2015 CDB signing notice](https://www.caribank.org/newsroom/news-and-events/cdb-signs-agreement-idb-secure-usd715m-sustainable-energy-facility-eastern-caribbean), [GEF project 5312](https://www.thegef.org/projects-operations/projects/5312), [GCF FP020 financing](https://www.greenclimate.fund/portfolio/projects/fp020)
- **Medium · Enertur.** The direct FinDev amount is an individual share of a three-lender package. Exclude the total from any sum of individual shares, and treat the co-financing edge as a relationship within the same deal. The two other atlas links carry no amount. [IDB Invest deal announcement](https://idbinvest.org/en/news-media/idb-invest-findev-canada-and-fmo-announce-financing-enertur-boost-renewable-energy)
- **Medium · EIB water and waste loan.** EUR 5m and EUR 95m reconcile to the one EUR 100m total already recorded. The register also places that operation under a parent programme loan. The related EU grant mentioned in the press release has a separate funding source and purpose. [EIB project register](https://www.eib.org/en/projects/all/20220727), [EIB announcement](https://www.eib.org/en/press/all/2024-392-global-gateway-eib-and-caribbean-development-bank-partner-to-boost-resilience-to-climate-change-in-the-caribbean)
- **Medium · Edge widths.** Weighting is off by default. When enabled it groups by currency and stage, and uses the largest visible eligible value as the scale. This avoids mixing currencies or approval stages. One group can still include grant and loan ceilings, and the same edge may change visual width after filtering. Add that explanation beside the weighting control. [Scale calculation](src/selectors.ts#L86), [Weighting UI](src/components/NetworkPanel.tsx#L48)

No exact amount duplication was observed among the five stored rows. The graph has no aggregate totals, and the transaction and project arrays are empty. The registry lacks operation and tranche identifiers on the edges, so this audit relies on source reconciliation for overlap.

## 5. Usability and accessibility

The automated tests establish the behaviors listed as exercised below. Other findings come from reading the component and selector code and from applying the filters to the dataset. The Product Design screenshot-based review was blocked by the Codex in-app browser’s saved origin permission. Hands-on, touch, visual, and assistive-technology observations remain open.

| Step | Automated or code evidence | Findings and recommendation |
| --- | --- | --- |
| **1. Find an entity** | The browser test finds CIBC via FirstCaribbean, selects an incompatible ownership filter, observes the empty state and resets. Search covers names, abbreviations and stored aliases. | **Medium.** Search also filters the graph’s endpoint set. A unique CDB match yields one visible node and zero visible edges even though the profile has 11 documented links. Label graph counts as visible results and offer a path to the matched entity’s neighborhood. Name matching normalizes case and accents. Punctuation variants and a stale name such as Barita create misses without aliases. [Search selector](src/selectors.ts#L44), [Node and edge filtering](src/App.tsx#L43) |
| **2. Narrow by filters** | Ownership and a Jamaica query were exercised in browser tests. The code intersects all active filters. Relationship type is checked against an entity’s whole indexed neighborhood, and the graph then requires both endpoints. | **Medium.** “Barbados” plus “Insures” retains Government of Barbados and removes CCRIF, which is tagged Caribbean and Central America, so the graph shows no edge despite the documented policy. Explain exact geographic tagging and why an edge is filtered. “Development bank” and “Development banks” appear as separate exact type options. [Filter selector](src/selectors.ts#L48), [Filter options](src/selectors.ts#L64), [Graph edge inclusion](src/App.tsx#L58) |
| **3. Explore graph** | The browser test exercised fit, node and edge selection, node drag, pan, isolation, group toggles, labels, weighting and zoom controls at 1440 × 900. Lists next to the graph provide keyboard-operable entity and relationship buttons. | **Medium.** The graph is exposed as a single labelled image with pointer events for nodes and edges. The lists allow key tasks but have different filter semantics and no keyboard equivalent for moving through the graph or panning to neighbors. Add a keyboard-reachable list or table for the same scoped graph, with clear direction in text. The current tabs also keep filter results separate from graph isolation. [Graph events and ARIA](src/components/NetworkGraph.tsx#L117), [Relationship list](src/components/Inspector.tsx#L124), [WCAG keyboard criterion](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) |
| **4. Inspect a profile and sources** | Automation opened the CDB explanation, checked the official site href, inspected a loan amount, and found the GCF evidence link through an adjacent relationship list. It checked hrefs within the app. External page access was reviewed separately. | **Medium.** “Verified” is a record-wide badge despite field-level coverage, link-access differences and historical evidence. The relationship list shows the counterparty and verb with a directional icon. Supply words for direction because “CDB · Accredited by” from GCF’s profile is easy to misread. Opening an edge from a profile replaces the inspector and back remounts it on Overview. Preserve the tab and restore focus to the initiating control. [Edge inspector](src/components/Inspector.tsx#L37), [Profile tabs and evidence](src/components/Inspector.tsx#L99), [Inspector switching](src/App.tsx#L149) |
| **5. Compare entities** | Automation selected two and three entries, checked shared ownership highlighting, expanded the geographic list and removed a comparison entry. The table has row/column headers and a keyboard-focusable scroll container. | **Low to Medium.** Shared values are exact string matches across any two selected profiles. A shared “Private” or “Caribbean” can hide differences in regulatory status or scope. Evidence and dates require opening separate profiles. Comparison selections live in app state and disappear on reload. Show the scope of exact matches and make supporting evidence easy to reach from the comparison. [Comparison UI](src/components/Compare.tsx#L45), [Matching rules](src/selectors.ts#L93), [Selection state](src/App.tsx#L42) |
| **6. Record and review a candidate** | Automation created and approved a fixture, checked required fields, reloaded, found the approved entry and checked that it remained absent from the graph. | **Medium.** Browser-local persistence is explained. There is no recovery action for unreadable saved data, and saving writes the entire queue from the mounted tab’s copy, so concurrent tabs can overwrite intervening changes. Pending candidates have an intake/evidence workflow but no export or built-in handoff to the curated JSON. Exact-name deduplication will miss the Barita rename until an alias is recorded. Keep “Approved for dataset review” visible in the queue and document local recovery and transfer limits. [Storage and save handling](src/components/Research.tsx#L12), [Deduplication](src/research.ts#L31) |

**Cross-cutting accessibility risks.** Code provides a skip link, native inputs, labelled icon controls, visible focus CSS and live counts. Inspector replacement and hash navigation lack an explicit focus destination. The clear-search and comparison remove controls are small by CSS inspection, and the clear button sits inside the label for a separate input. Test their rendered target size and spacing, tab order, focus recovery, zoom/reflow, colour and contrast, the full keyboard workflow and a screen reader. The 390 px automated run checks horizontal overflow for the tested state. Contrast, touch gestures and mobile screen-reader behavior remain untested. [Skip link and hash navigation](src/App.tsx#L66), [Search controls](src/components/Sidebar.tsx#L27), [Focus and control styles](src/styles.css#L94), [WCAG target size criterion](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## 6. Entity register and data completeness

One point per core field. Ownership counts when classified beyond Unknown. Mandate counts when populated. Capital origin and instruments count when at least one value is present. Official website counts when a valid HTTP(S) URL is recorded. Relationships count when at least one verified incoming or outgoing edge exists. Access counts when a non-unknown route is documented. All fields carry equal weight, including cases where an instrument or access route may legitimately be inapplicable. Score measures field availability. Accuracy, current link access and evidence strength have separate findings.

| Core field | Institutions (31) | All entities (50) |
| --- | ---: | ---: |
| Classified ownership | 30 | 49 |
| Mandate | 31 | 50 |
| Capital origin | 12 | 20 |
| Financing instruments | 14 | 24 |
| Official website recorded | 31 | 50 |
| At least one verified relationship | 23 | 41 |
| Documented access route | 6 | 14 |
| **Filled slots** | **147/217 (67.7%)** | **248/350 (70.9%)** |

The 50-record score distribution is 2/7 for one, 3/7 for two, 4/7 for 15, 5/7 for 15, 6/7 for 14 and 7/7 for three. Headquarters is populated on six records and capital sources on 12. All 50 profiles carry the stored verified status and the same verification date. The app’s profile badge uses a different seven-field definition that includes headquarters, geography, sectors and capital sources. The two scores should be labelled differently. [Profile scoring code](src/components/Inspector.tsx#L77)

“Links” is the number of incident verified edges. The final column lists absent or unknown audit fields. Geography and sector tags use the [registry geography IDs](src/data/geographies.json) and [sector IDs](src/data/sectors.json). The role column reflects the audit taxonomy in section 1.

| Entity and stable ID | Kind and stored type | Ownership | Primary financing role | Scope and geography tags | Sector tags | Links | Completeness and gaps |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| Caribbean Development Bank · `cdb` | institution · Development bank | Multilateral | Development lender or DFI | Caribbean regional · caribbean, anguilla, antigua-barbuda, barbados, belize, bvi, cayman-islands, dominica, grenada, guyana, haiti, jamaica, montserrat, saint-kitts-nevis, saint-lucia, saint-vincent-grenadines, suriname, bahamas, trinidad-tobago, turks-caicos | development, adaptation, infrastructure, energy | 11 | 7/7 · Complete |
| Inter-American Development Bank · `idb` | institution · Development bank | Multilateral | Development lender or DFI | Latin America & Caribbean · lac, caribbean | development, infrastructure, enterprise | 6 | 6/7 · Access route |
| Inter-American Investment Corporation · `idbi` | institution · Development finance institution | Multilateral | Development lender or DFI | Latin America & Caribbean · lac, caribbean | development, enterprise, financial | 3 | 7/7 · Complete |
| World Bank (IBRD and IDA) · `world-bank` | institution · Development banks | Multilateral | Development lender or DFI | Global · global, caribbean | development, adaptation, infrastructure | 4 | 6/7 · Access route |
| World Bank Group · `wbg` | institution · Multilateral group | Multilateral | Government or intergovernmental group | Global · global, caribbean | development, adaptation, enterprise | 0 | 3/7 · Capital origin, Instruments, Relationships, Access route |
| International Finance Corporation · `ifc` | institution · Development finance institution | Multilateral | Development lender or DFI | Global · global, lac, caribbean | development, enterprise, financial | 1 | 4/7 · Capital origin, Instruments, Access route |
| European Investment Bank · `eib` | institution · Development bank | Multilateral | Development lender or DFI | Latin America & Caribbean · lac, caribbean | adaptation, infrastructure | 1 | 6/7 · Access route |
| Development Bank of Jamaica Limited · `dbj` | institution · Domestic development bank | Public | Development lender or DFI | Single market · jamaica | development, enterprise | 0 | 5/7 · Capital origin, Relationships |
| Caribbean Community Climate Change Centre · `ccccc` | institution · Regional climate agency | Public | Climate or trade finance facilitator | Caribbean regional · caribbean, belize | adaptation | 2 | 4/7 · Capital origin, Instruments, Access route |
| Caribbean Climate-Smart Accelerator Inc. · `ccsa` | institution · Climate finance facilitator | Unknown | Climate or trade finance facilitator | Caribbean regional · caribbean | adaptation, energy, enterprise | 0 | 2/7 · Ownership, Capital origin, Instruments, Relationships, Access route |
| CCRIF SPC · `ccrif` | institution · Regional disaster risk insurer | Multilateral | Insurer or insurance holding company | Caribbean regional · caribbean, central-america | insurance, adaptation | 2 | 5/7 · Capital origin, Access route |
| Caribbean Community · `caricom` | institution · Intergovernmental organization | Multilateral | Government or intergovernmental group | Caribbean regional · caribbean | development, trade | 2 | 4/7 · Capital origin, Instruments, Access route |
| Caribbean Export Development Agency · `caribbean-export` | institution · Trade and investment agency | Multilateral | Climate or trade finance facilitator | Caribbean regional · caribbean | trade, enterprise | 2 | 4/7 · Capital origin, Instruments, Access route |
| European Union · `eu` | institution · Supranational donor | Multilateral | Bilateral or supranational donor | Latin America & Caribbean · lac, caribbean | development, infrastructure, trade | 4 | 6/7 · Access route |
| Foreign, Commonwealth & Development Office · `fcdo` | institution · Bilateral development agency | Public | Bilateral or supranational donor | Global · global, caribbean | development, adaptation, infrastructure | 1 | 5/7 · Instruments, Access route |
| Republic Financial Holdings Limited · `rfhl` | institution · Financial holding company | Private | Commercial bank or bank holding company | Caribbean regional · caribbean, guyana, barbados, trinidad-tobago | financial | 1 | 4/7 · Capital origin, Instruments, Access route |
| Republic Bank (Barbados) Limited · `republic-bb` | institution · Commercial bank | Private | Commercial bank or bank holding company | Single market · barbados | financial, enterprise | 1 | 6/7 · Capital origin |
| CIBC Caribbean Bank Limited · `cibc` | institution · Commercial bank | Private | Commercial bank or bank holding company | Caribbean regional · caribbean, barbados, jamaica, trinidad-tobago | financial, enterprise | 0 | 5/7 · Relationships, Access route |
| Royal Bank of Canada · `rbc` | institution · Commercial bank | Private | Commercial bank or bank holding company | Caribbean regional · caribbean | financial, enterprise | 0 | 6/7 · Relationships |
| Sagicor Financial Company Ltd. · `sagicor` | institution · Insurance holding company | Private | Insurer or insurance holding company | Caribbean regional · caribbean, north-america | insurance, financial | 1 | 4/7 · Capital origin, Instruments, Access route |
| Sagicor Life Inc · `sagicor-life` | institution · Insurer and asset manager | Private | Insurer or insurance holding company | Caribbean regional · caribbean, barbados, trinidad-tobago, belize | insurance, financial | 1 | 5/7 · Capital origin, Access route |
| Guardian Holdings Limited · `guardian` | institution · Insurance holding company | Private | Insurer or insurance holding company | Caribbean regional · caribbean, trinidad-tobago, jamaica | insurance, financial | 0 | 3/7 · Capital origin, Instruments, Relationships, Access route |
| National Insurance and Social Security Service · `nis` | institution · Statutory social insurance administrator | Public | Statutory social insurance or reserve fund | Single market · barbados | insurance, financial | 1 | 5/7 · Instruments, Access route |
| National Insurance Board of Trinidad and Tobago · `nibtt` | institution · Statutory social insurance administrator | Public | Statutory social insurance or reserve fund | Single market · trinidad-tobago | insurance, financial | 0 | 4/7 · Instruments, Relationships, Access route |
| Sygnus Capital Limited · `sygnus` | institution · Alternative investment manager | Private | Investment manager | Latin America & Caribbean · caribbean, lac | enterprise, financial | 2 | 4/7 · Capital origin, Instruments, Access route |
| JN Fund Managers Limited · `jnfm` | institution · Asset manager | Private | Investment manager | Single market · jamaica | financial | 1 | 4/7 · Capital origin, Instruments, Access route |
| The Barbados Agency for Micro Enterprise Development Ltd. · `fundaccess` | institution · Enterprise development lender | Public | Development lender or DFI | Single market · barbados | enterprise, development | 0 | 5/7 · Capital origin, Relationships |
| Government of Barbados · `barbados-gov` | institution · National government | Public | Government or intergovernmental group | Single market · barbados | development, infrastructure | 1 | 4/7 · Capital origin, Instruments, Access route |
| Development Finance Institute Canada (DFIC) Inc. · `findev` | institution · Bilateral development finance institution | Public | Development lender or DFI | Latin America & Caribbean · lac, dominican-republic | development, energy, infrastructure | 2 | 6/7 · Access route |
| InterEnergy Group Limited · `interenergy` | institution · Energy infrastructure investor and operator | Private | Infrastructure sponsor or project company | Latin America & Caribbean · lac, caribbean, dominican-republic, jamaica | energy, infrastructure | 1 | 4/7 · Capital origin, Instruments, Access route |
| Energia Turistica Enertur S.A. · `enertur` | institution · Renewable infrastructure project company | Private | Infrastructure sponsor or project company | Single market · dominican-republic | energy, infrastructure | 3 | 4/7 · Capital origin, Instruments, Access route |
| Multilateral Investment Fund · `idb-lab` | fund · Innovation fund | Multilateral | Development or climate fund, facility or programme | Latin America & Caribbean · lac, caribbean | enterprise, development | 2 | 4/7 · Capital origin, Instruments, Access route |
| Green Climate Fund · `gcf` | fund · Multilateral climate fund | Multilateral | Development or climate fund, facility or programme | Global · global, caribbean | adaptation, energy | 6 | 6/7 · Instruments |
| Global Environment Facility · `gef` | fund · Multilateral environment facility | Multilateral | Development or climate fund, facility or programme | Global · global | environment, adaptation | 1 | 6/7 · Instruments |
| Adaptation Fund · `adaptation-fund` | fund · Multilateral climate fund | Multilateral | Development or climate fund, facility or programme | Global · global, caribbean | adaptation | 2 | 6/7 · Capital origin |
| Climate Investment Funds · `cif` | fund · Multilateral climate fund | Multilateral | Development or climate fund, facility or programme | Global · global | adaptation, energy | 0 | 5/7 · Instruments, Relationships |
| Clean Technology Fund · `ctf` | fund · Concessional climate fund | Multilateral | Development or climate fund, facility or programme | Global · global, caribbean | energy | 1 | 5/7 · Capital origin, Access route |
| Sustainable Energy Facility for the Eastern Caribbean · `sef` | facility · Blended finance facility | Multilateral | Development or climate fund, facility or programme | Eastern Caribbean · eastern-caribbean | energy, infrastructure | 3 | 6/7 · Access route |
| Sustainable Energy for the Eastern Caribbean · `seec` | programme · Sustainable energy programme | Multilateral | Development or climate fund, facility or programme | Eastern Caribbean · eastern-caribbean | energy, infrastructure | 2 | 5/7 · Capital origin, Access route |
| CARICOM Development Fund · `cdf` | fund · Regional development fund | Multilateral | Development or climate fund, facility or programme | Caribbean regional · caribbean | development, enterprise | 1 | 5/7 · Capital origin, Instruments |
| Regional Private Sector Development Programme III · `rpsdp` | programme · Enterprise development programme | Public | Development or climate fund, facility or programme | Caribbean regional · caribbean | enterprise, trade | 2 | 5/7 · Instruments, Access route |
| Latin America and Caribbean Investment Facility · `lacif` | facility · Blended finance facility | Multilateral | Development or climate fund, facility or programme | Latin America & Caribbean · lac, caribbean | infrastructure, adaptation, development | 1 | 6/7 · Access route |
| United Kingdom Caribbean Infrastructure Fund · `ukcif` | fund · Bilateral infrastructure fund | Public | Development or climate fund, facility or programme | Caribbean regional · caribbean | adaptation, infrastructure | 2 | 7/7 · Complete |
| Special Development Fund · `sdf` | fund · Concessional development fund | Multilateral | Development or climate fund, facility or programme | Caribbean regional · caribbean | development, adaptation | 1 | 5/7 · Capital origin, Access route |
| Regional Public-Private Partnership Support Facility · `ppp` | facility · Project preparation facility | Multilateral | Development or climate fund, facility or programme | Caribbean regional · caribbean | infrastructure, development | 4 | 5/7 · Capital origin, Access route |
| National Insurance Fund (Barbados) · `nis-fund` | fund · Social insurance reserve fund | Public | Statutory social insurance or reserve fund | Single market · barbados | insurance, financial | 1 | 5/7 · Instruments, Access route |
| Sygnus Credit Investments Limited · `sci` | fund · Listed private credit vehicle | Private | Private investment vehicle | Caribbean regional · caribbean, jamaica, barbados, puerto-rico | financial, enterprise, energy, infrastructure | 1 | 6/7 · Capital origin |
| Sygnus Deneb Investments Limited · `deneb` | fund · Private equity vehicle | Private | Private investment vehicle | Caribbean regional · caribbean | enterprise, financial | 1 | 6/7 · Capital origin |
| JN Mutual Funds · `jn-mutual` | fund · Collective investment vehicle | Private | Private investment vehicle | Single market · jamaica | financial | 1 | 4/7 · Capital origin, Instruments, Access route |
| Global Environment Facility Trust Fund · `gef-trust` | fund · Multilateral trust fund | Multilateral | Development or climate fund, facility or programme | Global · global, caribbean | environment, adaptation | 2 | 4/7 · Capital origin, Instruments, Access route |

## 7. Testing and limits

| Check on 17 November 2026 | Actual result |
| --- | --- |
| `pnpm test` | **Passed.** Vitest 3.2.7, one test file, 13 of 13 tests, 914 ms total. |
| `pnpm build` | **Passed.** TypeScript project build and Vite 6.4.6 production bundle. Vite transformed 1,604 modules and completed in 5.48 s. |
| `$env:ATLAS_CHROME='1'; pnpm test:e2e` | **Passed.** Five of five Playwright tests using installed Chrome and a production preview on loopback port 4173, 19.4 s total. |
| Live Codex browser review | **Blocked.** Saved origin permission denied observation. No manual interaction or screenshot was verified. |

The five tests covered graph/evidence interactions, search/filter/compare, local candidate intake and persistence, a 390 × 844 viewport with theme persistence, and a simulated Pages repository path using intercepted production assets. The Pages test is a local simulation. Live deployment remains outside the test scope. Node.js was 24.22.1 and pnpm was 11.25.0. [Browser suite](tests/flows.spec.ts), [Unit suite](tests/atlas.test.ts)

The runtime validator checks IDs, references, supported types, enumerated directions, currency format and compatible amount stages. The passing suite does not substantiate publisher claims, prove current role status, resolve economic duplicates or establish allocable financing totals. It also has no manual cross-browser, keyboard, touch, screen-reader or visual coverage for this audit. [Validation implementation](src/validation.ts#L33)

## Prioritized recommendations

1. **High · Correct identity and source integrity first.** Review the Barita rename and dated manager evidence under the existing stable institution ID. Resolve the EIB signature versus announcement chronology and correct the press publication date. Replace the CIBC report link with the publisher’s listed PDF. Keep the audit findings as review decisions before editing the registry.
2. **High · Establish transaction traceability before financial aggregation.** Give each quantified component an operation and instrument identifier, exact stage and date, immediate counterparty, ultimate economic recipient and links to any package total. Reconcile the 2015 SEF/SEEC financing with FP020 and preserve EIB’s two components and Enertur’s lender shares. The graph can remain an institutional discovery tool during reconciliation.
3. **Medium · Make claim strength and freshness visible.** Record passage locators, direct versus corroborating support, fact as-of dates, and last link-check outcomes. Reassess sources with 403, 307, timeout or wrapper responses and record replacements where needed. Prioritize historical management and accreditation edges, indirect funding roles and source records whose labels imply present-day status.
4. **Medium · Resolve discovery and accessibility gaps.** Communicate filtered graph counts, add an accessible scoped relationship view, preserve inspector context, and test the keyboard and mobile workflows independently of the current fixture. Clarify comparisons, review statuses and browser-local recovery.
5. **Medium · Agree on the next coverage targets before expanding.** Define a country-by-sector benchmark and a list of target institution types. Prioritize operating commercial banks, private investment and infrastructure managers, pension plans, insurers, and less-covered Caribbean markets. Use the existing evidence base to distinguish documented geographic eligibility, domicile and operating footprint.

**Snapshot fingerprints · SHA-256**

| File | Hash |
| --- | --- |
| `institutions.json` | `6366a4176e142695180c9cad789196fe55e8000ab956df28469751600bc64313` |
| `vehicles.json` | `f079d7fee545130db0dcea972deb76a68997b64f3cf3b788029b1145de353f7c` |
| `relationships.json` | `7ac559eeb85e36da358975370f5135e4d43f46870db2a314a9ca02fdb23e323e` |
| `sources.json` | `ea83a3dbaf7a49dd16ce38d47cef41957ce5693e4cef35e193c078a6e36854db` |
