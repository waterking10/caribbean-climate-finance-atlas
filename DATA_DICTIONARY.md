# Data dictionary

Field names are case sensitive. All arrays reference atlas IDs unless the field is described as free text. Optional fields can be omitted when research is incomplete. Dates use ISO `YYYY-MM-DD` and research timestamps use ISO date-time strings.

## Institutions and vehicles

| Field | Meaning |
| --- | --- |
| `id` | Stable entity identifier shared across institution and vehicle tables. Keep it through renames. |
| `kind` | Entity discriminator. Institution table uses `institution`. Vehicle table uses `fund`, `facility` or `programme`. A legally incorporated investment vehicle can use the fund kind. |
| `name` | Official or documented entity name. |
| `shortName` | Graph and list display name. Include important historical names in aliases. |
| `type` | Specific profile type used for filtering, such as development bank or private credit vehicle. |
| `category` | Visualization group. Values include `development`, `climate`, `public`, `commercial`, `institutional` and `investment`. |
| `ownership` | `Public` for government control, `Private` for nongovernment corporate ownership including listed companies, `Multilateral` for jointly governed international public entities, or `Unknown` pending evidence. |
| `scope` | Evidence-backed assessment with `status` (`CORE`, `SUPPORTING` or `OUT_OF_SCOPE`), `rationale` and `evidenceIds`. For an out-of-scope decision, the sources delimit the activity reviewed. |
| `themes` | Unique thematic codes from the [thematic methodology](RESEARCH_METHODOLOGY.md#thematic-tags). Multiple values are allowed. |
| `roles` | Unique institutional role codes from the [role definitions](RESEARCH_METHODOLOGY.md#institutional-roles). Multiple values are allowed. |
| `headquarters` | Documented city or location of the headquarters. |
| `geographies` | Documented geographic coverage codes, including countries, territories and regions. |
| `sectors` | Financing or activity sector codes. |
| `capitalOrigins` | Documented origin labels for capital or sponsors. A headquarters location alone does not establish capital origin. |
| `capitalSources` | Documented mechanisms or named sources for capital. Use `not_publicly_disclosed` only when evidence identifies an undisclosed source. |
| `instruments` | Documented financing, investment, insurance or technical assistance mechanisms. |
| `mandate` | Scope or purpose stated in supporting evidence. |
| `activities` | Short account of the entity’s documented work. |
| `plainLanguage` | Plain-language description derived from the same evidence. |
| `website` | Official URL, or the manager’s or sponsor’s official vehicle page. |
| `parentId` | Optional institution ID for a documented parent of an institution. |
| `managerId` | Optional institution ID for a documented manager or administrator of a vehicle. |
| `access` | Optional object with `route`, `details` and referenced `evidenceId` also present in `evidenceIds`. |
| `evidenceIds` | Supporting source IDs for the profile. |
| `status` | Verification state. |
| `verifiedOn` | Most recent verification date for the recorded profile. |

Access route codes are `direct`, `intermediary`, `government`, `procurement`, `negotiation`, `lending`, `no_public_route` and `unknown`. Access details describe a documented channel. Availability and eligibility may change by programme.

The profile completeness indicator counts recorded headquarters, capital origin, geography, sectors, instruments, capital sources and a known access route. It's a field count.

## Relationships

| Field | Meaning |
| --- | --- |
| `id` | Stable relationship or relationship-event ID. |
| `source` | Entity ID performing the role or taking the action in a directed relationship. |
| `target` | Entity ID receiving the action or serving as its reference point. |
| `type` | Role from the following list. |
| `direction` | `directed` for a one-way role or `mutual` for a reciprocal documented link. |
| `description` | Scope and context of the link, including any intermediary role. |
| `themes` | Unique thematic codes supported for this relationship. An empty array places the link in the full network. |
| `scopeRationale` | Evidence-based reason for including the relationship in the focused network or displaying it only in the full network. |
| `scopeEvidenceIds` | Optional supplemental source IDs for the scope assessment. |
| `participantRoles` | Evidence-backed descriptions of the `source` and `target` roles in this specific link. |
| `evidenceIds` | Source IDs that support the link and any stated amounts. |
| `status` | Verification state. |
| `period` | Optional effective year, date range or dated disclosure described by the evidence. |
| `amount` | Optional financial observation with the fields below. |

| Relationship type | Reading from source to target |
| --- | --- |
| `OWNS` | Holds a documented direct or indirect ownership interest. |
| `MANAGES` | Manages, administers or acts as trustee. |
| `ESTABLISHED_BY` | Was created by or established under the authority of. |
| `CAPITALIZES` | Supplies capital to the entity or vehicle. |
| `FUNDS` | Supplies or administers identified finance for the activity or institution described. |
| `CONTRIBUTES_TO` | Supplies a documented contribution to an identified funding pool or channel. |
| `GRANTS_TO` | Provides or approves grant finance to the specified recipient. |
| `ADMINISTERS` | Performs the documented administration of a mechanism. |
| `COMMITS_SAVINGS_TO` | Commits identified fiscal savings to a downstream financing purpose. |
| `PROVIDES_TECHNICAL_ASSISTANCE_TO` | Supplies documented technical or preparation support. |
| `TARGETS` | Identifies an intended beneficiary or eligible recipient. |
| `LENDS_TO` | Extends or approves a loan or credit line for. |
| `INVESTS_IN` | Makes or approves an investment in. |
| `CO_INVESTS_WITH` | Joins a documented investment alongside. |
| `ACCREDITED_BY` | Receives an accreditation from. |
| `IMPLEMENTS_FOR` | Implements a programme or acts as implementing entity for. |
| `GUARANTEES` | Undertakes a defined guarantee exposure for. |
| `INSURES` | Provides insurance coverage to. |
| `STRATEGIC_PARTNER` | Has a documented strategic partnership with. |
| `SUBSIDIARY_OF` | Is a legally identified subsidiary of. |
| `ARRANGES` | Performs an explicitly disclosed arrangement role for a financing mechanism. |
| `SUB_FUND_OF` | Is a documented investment sleeve of an umbrella fund. |

## Financial observations and transactions

| Field | Meaning |
| --- | --- |
| `value` | Positive amount in original currency units. |
| `currency` | Three-letter uppercase currency code. |
| `status` | The financial meaning of the observation. Use the evidence wording and definitions below. |
| `instrument` | Optional source-specific instrument name or description, such as grant ceiling. |
| `asOf` | Optional date associated with the observation, distinct from the source access date. |

| Amount status | Meaning |
| --- | --- |
| `fund_target` | Fundraising objective. |
| `capital_raised` | Disclosed capital brought into a vehicle. |
| `commitment` | Contracted or explicitly committed financing or grant ceiling. |
| `approval` | Authorized amount, regardless of later signing or payment. |
| `financial_close` | Amount reported at formal financing close. |
| `disbursement` | Amount reported as paid out. |
| `guarantee_limit` | Capped guarantee exposure. |
| `insurance_limit` | Policy coverage exposure. |

Transactions have `id` (stable observation group ID), `relationshipId` (documented institution link), optional `projectId` (underlying activity), optional `flowId` (deduplication key shared across intermediaries), `amounts` (financial observations), `evidenceIds` and verification `status`.

Projects have `id`, `name`, geographic `geographies`, sector `sectors`, supporting `evidenceIds` and verification `status`. Projects and transactions are reserved for future coverage.

## Sources, aliases and classifications

| Field | Meaning |
| --- | --- |
| Source `id` | Stable evidence ID. |
| `title` | Official source title or descriptive document title. |
| `publisher` | Authoring institution or publishing body. |
| `url` | HTTP(S) link to the evidence. |
| `publishedOn` | Optional identified publication date. |
| `accessedOn` | Date the source was consulted. |
| `reference` | Paraphrased support or a locator in the source. |
| `confidence` | Optional description of the evidence basis, such as an inspected primary document or an indexed official record. |
| `ambiguity` | Optional source limitation or unresolved difference shown with the evidence. |
| `status` | `verified` for directly supported claims, `reported` for an attributed claim pending corroboration, `unverified` for incomplete research, `conflicting` for unresolved evidence disagreement. |
| Alias `entityId` and `name` | Target entity and documented historical, short or alternative name. The pair identifies the alias. |
| Classification `id` and `label` | Stable identifier and UI label for each geography and sector. Each collection has its own namespace. |

## Manual research candidates

Candidate records have `id`, proposed `name`, entity `kind`, optional official `website`, intake `notes` and timestamp `createdOn`. Review records can store `evidenceUrl`, `sourceTitle`, `sourcePublisher`, `sourceAccessedOn`, optional `sourcePublishedOn`, `evidenceNote`, optional `reviewNote`, `decision` (`pending`, `approved` or `rejected`) and `reviewedOn`. Approved candidates require documented evidence and remain in the browser review queue.

Bundled reviews in `candidate-reviews.json` add a dated decision and rationale to the original lead. A `publishedEntityId` identifies the verified atlas profile. Local browser edits are preserved when new bundled reviews are released.
