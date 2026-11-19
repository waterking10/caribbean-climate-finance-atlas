# Entity display taxonomy

The institution-type filter groups the registry's **75 distinct detailed type labels into ten choices**. Profiles continue displaying the original detailed types. No entity, relationship, evidence, scope, theme, amount or ownership record is changed or deleted.

| Advanced institution type | Node colour category |
| --- | --- |
| Development banks & finance institutions | Development finance institutions |
| Governments & donor institutions | Governments & public bodies |
| Public & intergovernmental bodies | Governments & public bodies |
| Commercial banks | Commercial banks |
| Pension & insurance institutions | Pensions & insurers |
| Fund & asset managers | Companies & investment managers |
| Companies & holding groups | Companies & investment managers |
| Funds, trusts & endowments | Funds, facilities & programmes |
| Financing facilities & programmes | Funds, facilities & programmes |
| Nonprofits, grantmakers & facilitators | Nonprofits & support organizations |

The explicit mapping is in `src/entity-taxonomy.ts`. It describes entity form, not dedicated climate-finance status, ownership or investment authority. For example, a facilitator with unknown ownership is not assigned public ownership. Agencies, nonprofits and funds formerly grouped together under the thematic legacy category now receive their appropriate display categories. “Climate & resilience” is removed from the node legend; climate remains available through evidence-backed financing themes and sector tags.

Financing sector is a main filter beside relationship family, geographic scope and financing theme. Advanced filters retain entity kind, consolidated institution type, institutional roles, ownership/capital attributes, instruments and exact relationship types. The redundant legacy display-category control is removed. Selections use OR within a filter and AND between filters; focused exploration still retains documented counterparties.

All seven node categories use consistent colours across the graph, entity results, profile icons and comparison. Unknown research-only actor types keep their neutral colour. An unrecognized future detailed type is not guessed into a group; taxonomy coverage tests flag missing mappings in the registry. Internal exact-type filter callers remain compatible.

Verification for this change: **64 unit tests and 21 browser tests pass**, including five new taxonomy tests and two new desktop/mobile filter tests; the production build passes. Interactive desktop/mobile checks confirm the sector's primary placement, ten institution-type choices, grouped filtering, the revised legend and no page-wide horizontal overflow. Review captures: [desktop](design/entity-filters/desktop.jpg), [mobile](design/entity-filters/mobile.jpg).
