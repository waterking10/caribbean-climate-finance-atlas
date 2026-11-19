# Dataset scope audit

Reviewed 17 November 2026. The review covers the 31 institutions, 19 vehicles and 44 verified relationships in the original registry. Record-level decisions, rationales and source IDs are available in the [entity assessments](src/data/entity-scope.json) and [relationship assessments](src/data/relationship-scope.json). The [supplemental source register](src/data/scope-sources.json) contains 16 primary sources used in the review.

This report describes the original-registry audit. The subsequent [candidate review](CANDIDATE_REVIEW.md) records publication decisions and the resulting changes to network coverage.

## Scope and ownership

| Ownership | Core | Supporting | Out of scope | Full network | Default view |
| --- | ---: | ---: | ---: | ---: | ---: |
| Public | 6 | 1 | 4 | 11 | 6 |
| Private | 4 | 2 | 8 | 14 | 5 |
| Multilateral | 20 | 4 | 0 | 24 | 21 |
| Unknown | 1 | 0 | 0 | 1 | 1 |
| **Total** | **31** | **7** | **12** | **50** | **33** |

Ownership follows the original registry. The Caribbean Climate-Smart Accelerator is the entity with unknown ownership. Counts describe entities, including vehicles, rather than financing volumes or distinct ultimate owners.

The default view retains **29 of 44 relationships**. CARICOM appears through its founding role for the Caribbean Community Climate Change Centre. Enertur appears as the documented project-finance counterparty that connects its sponsor and lenders. Five supporting entities and 15 relationships are accessible through Full network. The 12 out-of-scope entities are also accessible there. The five original amount observations retain their currency, amount, instrument and financial status.

## Thematic coverage

Entity columns count the entity’s own tags. The thematic filter can also surface counterparties connected by relationships carrying the selected tag. Rows overlap because a record can carry multiple tags.

| Theme | Tagged core entities | Tagged supporting entities in default view | Tagged relationships |
| --- | ---: | ---: | ---: |
| Energy transition | 19 | 1 | 13 |
| Climate mitigation | 19 | 1 | 18 |
| Climate adaptation | 15 | 0 | 13 |
| Disaster resilience | 8 | 0 | 5 |
| Biodiversity and nature finance | 7 | 0 | 0 |
| Environmental sustainability | 10 | 0 | 4 |
| Transition finance | 14 | 1 | 12 |

## Major evidence gaps

- **Nature and blue finance.** Several profiles have primary evidence for nature finance, while the original edge set has no dedicated conservation arrangement. Barbados’s debt conversion and the Caribbean Biodiversity Fund network have documented structures for future review. [IDB Barbados debt conversion](https://www.iadb.org/en/news/barbados-places-climate-financing-firmly-agenda-idb-nature-conservancy-support), [CBF conservation finance](https://caribbeanbiodiversityfund.org/conservation-finance/)
- **Private and domestic capital.** The default network has five private records, including one supporting borrower. Market-wide holdings, bank on-lending portfolios, pension and insurer allocations, and domestic guarantees are thinly documented at entity and instrument level. Specific deals can establish a role for a diversified institution. [CIBC Caribbean arrangement](https://www.iadb.org/en/news/barbados-launched-worlds-first-debt-climate-resilience-operation), [Sygnus Capital management](https://idbinvest.org/en/projects/caribbean-community-resilience-fund)
- **Disaster risk finance.** The retained risk network centers on CCRIF. Sovereign catastrophe bonds, contingent financing, the parties to risk transfer and insurance trigger details need their own records. [IBRD catastrophe bond for Jamaica](https://www.worldbank.org/en/news/press-release/2026/05/18/world-bank-prices-catastrophe-bond-for-disaster-protection-for-jamaica)
- **Preparation and capital structures.** The current graph covers selected umbrella facilities and implementing entities. Approval records, signed terms, intermediary roles, current application windows and capital by sleeve need source-specific review. [GCF project preparation in the Caribbean](https://www.greenclimate.fund/document/transforming-finance-unlock-climate-action-caribbean), [CDB preparation fund](https://www.caribank.org/our-work/programmes/climate-change-project-preparation-fund)
- **Amounts and dates.** Existing observations represent a mix of approvals, commitments and disclosed ceilings. Disbursement data and complete time series are scarce. Historical announcements and estimated targets need further evidence before they can support claims about current availability or capital deployed.

## Research candidate list

This section records the original candidate intake. Research Desk code and candidate records are retained outside the public app; see the [public navigation audit](PUBLIC_NAVIGATION_AUDIT.md) for the current interface and browser-local backup requirements.

The Research desk includes 16 new pending candidates and preserves the two original project-brief leads. Initial priority goes to mechanisms with named Caribbean counterparts or activity and a source that identifies the instrument or mandate. Each queue entry includes a source and the next verification step. [Candidate records](src/data/candidates.json)

| Coverage | Priority candidates and current evidence |
| --- | --- |
| International climate and environmental funds | Special Climate Change Fund for an approved Caribbean fisheries adaptation operation and Global Biodiversity Framework Fund for an approved Belize operation. [SCCF project record](https://www.thegef.org/projects-operations/projects/11412), [GBFF project record](https://www.thegef.org/projects-operations/projects/11598) |
| Regional climate and resilience facilities | Caribbean Community Resilience Fund and its debt and equity sleeves, Credit Risk Abatement Facility and Supporting Resilient Green Energy programme. Verify instrument terms and distinguish fund-level commitments from downstream lending. [CCRF](https://idbinvest.org/en/projects/caribbean-community-resilience-fund), [CRAF](https://caricomdevelopmentfund.org/news/renwick-company-becomes-first-saint-lucian-business-to-access-craf-guarantee-for-clean-energy/), [SuRGE](https://www.caribank.org/newsroom/news-and-events/cdb-marks-major-milestone-financial-close-dominica-geothermal-energy-project) |
| Renewable infrastructure and private investor coverage | MPC Caribbean Clean Energy Fund and MPC Capital. Paradise Park establishes historical Jamaican activity. The subsequent sale makes dating manager and ownership claims important. FMO is a separate development finance lead for the Enertur facility. [Fund investment](https://www.mpc-capital.com/fileadmin/mpc/capital_24/Downloads/Press_Releases/Press_Releases_2018/Infrastructure/2018_05_31_PR_Jamaique_May_2018_VEng_Final.pdf), [MPC exit](https://www.mpc-capital.com/fileadmin/mpc/capital_24/Downloads/Press_Releases/Press_Releases_2025/2025_04_16_PR_Paradise_Park_exit_e.pdf), [FMO disclosure](https://www.fmo.nl/project-detail/63516) |
| Domestic and enterprise green finance | Barbados Energy Smart Fund II and the regional BRIDGE Green Transition Grant. Verify administrators, financing terms and award records. [Energy Smart Fund II](https://energy.gov.bb/our-projects/sustainable-energy-investment-programme-energy-smart-fund-2/), [BRIDGE grant](https://carib-export.com/en/opportunities/green-transition-bridge) |
| Biodiversity and conservation finance | Caribbean Biodiversity Fund Endowment Fund and Ecosystem-based Adaptation Facility. Verify their different funding structures and roles of partner trust funds. [Conservation finance](https://caribbeanbiodiversityfund.org/conservation-finance/), [Grant recipients](https://caribbeanbiodiversityfund.org/beneficiaries-grantees/) |
| Blue finance | Barbados Blue Loan for Marine Conservation. Verify the loan, guarantee and conservation fund as distinct mechanisms. [IDB transaction disclosure](https://www.iadb.org/en/news/barbados-places-climate-financing-firmly-agenda-idb-nature-conservancy-support) |
| Disaster risk financing | Jamaica’s 2026 catastrophe bond. Record its covered period and scope and distinguish it from the predecessor bond. [IBRD issuance](https://www.worldbank.org/en/news/press-release/2026/05/18/world-bank-prices-catastrophe-bond-for-disaster-protection-for-jamaica) |
| Project preparation | CDB Climate Change Project Preparation Fund and GCF Project Preparation Facility. The cited GCF document is a regional preparation request. Confirm approval and implementation stages separately. [CDB fund](https://www.caribank.org/our-work/programmes/climate-change-project-preparation-fund), [GCF preparation request](https://www.greenclimate.fund/document/transforming-finance-unlock-climate-action-caribbean) |
