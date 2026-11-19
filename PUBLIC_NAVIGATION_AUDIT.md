# Public navigation simplification

Prepared 18 November 2026. Local changes for owner review; no deployment authorized.

## Audit before changes

The public entry point is `index.html` → `src/main.tsx` → `src/App.tsx`. Its four hash routes were Network, Compare, Research and About. `#research` mounted `src/components/Research.tsx` directly, with no authentication. A separate, untracked design prototype is not the public entry point and is outside this change.

| Research Desk function | Dependencies and persistence | Disposition |
| --- | --- | --- |
| Candidate intake | `Research.tsx`, `research.ts`, `ResearchCandidate` model, URL validation, `crypto.randomUUID()` | Component and helpers retained; removed from public imports and rendering. |
| Duplicate checks | Published names and aliases in `AtlasIndex`, saved candidate names, selector normalization | Preserved with existing unit coverage. |
| Queue and review decisions | Pending/approved/rejected filters, source metadata, evidence notes, review notes and dates | Preserved in source and seed tables; excluded from public bundle. |
| Browser persistence | Only `localStorage['caribbean-capital-atlas.research.v1']`, scoped to browser profile and origin | Public app does not read, write, merge or clear it. Exact-value export script provided outside public assets. |
| Seed queue and publication annotations | `src/data/candidates.json`, `src/data/candidate-reviews.json`; local edits take precedence during merge | Both tables unchanged and retained; no public bundle import. |
| View atlas profile | Published entity IDs in candidate review annotations | Published profiles remain searchable in Explore and selectable in Compare. |
| Publishing | Approval only marks readiness for dataset review; verified JSON is curated separately | No publication, taxonomy or data changes. |

The Desk does not use an API, server database, session storage or IndexedDB. The other browser key is `caribbean-capital-atlas.theme`, which is an appearance preference and continues to work.

Capital pathway research is independent of candidate management. `src/capital-research.ts` loads and validates pathway, actor, geography and source records; `indexCapitalPathways` attaches them to published relationships. This navigation change does not alter `Inspector.tsx`, `PathwayInspector.tsx`, `Sources.tsx`, graph pathway markers or comparison selectors. All registry JSON, financial observations, research files, evidence, source URLs, relationship types and pathway taxonomy are unchanged by this task. Separate exploration/filter work began changing components in this shared checkout during verification; those edits are outside this navigation change and have been left in place.

## Public interface

Primary navigation is **Explore**, **Compare**, **About & Methodology**, in that order. The internal `#network` and `#about` URLs remain compatible. Legacy `#research`, `#research-desk`, `#/research` and `#/research-desk` hashes (optional trailing slash) replace themselves with `#network`, preserving the host, repository subpath and query string. The previous app used hash routes; there was no standalone `/research` server endpoint.

Removed the Research tab, mounted candidate forms, review queue and About page promotion of those tools. No management code was deleted. There is no hidden admin route or production feature flag. Build verification checks that candidate keys, seed IDs and management UI strings are absent from production JavaScript.

About & Methodology now explains purpose, scope, methods and limitations. A discreet footer on all three public pages links to `.github/ISSUE_TEMPLATE/correction-or-missing-mechanism.yml`. No suitable issue template existed locally, so this change adds one requesting public sources and a reviewable proposal. The link will select that template once these files reach the repository's default branch. No issue is submitted by the app.

## Browser-local export and release prerequisite

The existing hosted atlas tab was located in the user's Chrome profile at `https://waterking10.github.io/caribbean-climate-finance-atlas/#network`. The available native browser tools did not expose a readable storage inspector. No actual browser-local export or technical empty-queue finding is claimed. Other profiles, devices, local development origins and ports cannot be inferred from that tab.

**Owner confirmation:** In response to the backup check, the owner selected **“No saved candidates or review edits.”** There are therefore no owner-reported browser-local research records requiring export or migration for this change. This resolves the backup prerequisite on the basis of that confirmation; synthetic export tests are not presented as a backup of user data.

If research is subsequently saved before release, check each browser profile and origin used (including the hosted origin and any `localhost` / `127.0.0.1` development ports), and complete the following export procedure before removing live access. This task does not deploy, push or change live access.

1. Open the existing atlas in the original browser profile at its original origin. Hashes and repository paths share origin storage; hostnames, schemes and ports do not.
2. Review and run the contents of `tools/export-browser-research.js` in that page's browser developer console. The script only reads the candidate key and downloads a local JSON envelope; it never sends data, modifies storage or parses/normalizes the research value.
3. Confirm the downloaded file exists and its `origin`, `key`, `present` and `raw` fields match that browser. `present: false` and `raw: null` indicate no value on that particular origin, not a global absence of research. Storage errors abort without claiming an empty queue.
4. Keep exports in private storage outside the repository, or in ignored `private-backups/`. Do not place them in `public/`, `dist/`, issue attachments or tracked research tables. Preserve malformed values for recovery as well as valid records.
5. Record completion for each profile/origin before deployment review. Keep the original values in place. A future private research workspace can restore the exact `raw` value to the same key after separately checking the backup and target; this change performs no automatic import or migration.

No underlying dataset migration is needed, and the owner reports no browser-local candidate/review records to migrate. Any future browser-local queues require private backup and eventual transfer if active research management moves elsewhere. Seed files already reside in the repository and do not substitute for a browser-local backup. Existing published evidence inspectors remain publicly available.

## Verification

Unit tests retain candidate merge, duplicate checks, publication, registry validation and capital-pathway preservation coverage. Export tests cover exact unknown fields, malformed/empty values, absence and denied storage without mutation. Production browser tests cover the three navigation labels and active states, legacy routes on load and hash changes, GitHub Pages subpaths, private storage isolation, correction links, mobile navigation and entity/relationship/pathway evidence inspectors. Production JavaScript is checked for candidate-management content. A real-browser export test uses synthetic records to verify the downloaded envelope and unchanged storage; it does not constitute an export of the user's records.

The production build passed. All 58 unit tests present at verification passed (including concurrent exploration/prototype tests). All 15 targeted production browser checks passed, covering navigation, storage isolation, legacy routes, Pages subpaths, entity/relationship/pathway evidence, the synthetic backup download and mobile navigation at 320px and 390px. A separate test-output directory avoided concurrent Playwright runs cleaning each other's trace files. The earlier full browser suite encountered existing graph/filter tests whose selectors no longer match the concurrently revised exploration interface (an additional relationship button, advanced filters and renamed filter labels); the full suite is not claimed green.

Owner review remains a prerequisite to release. The browser-local backup check is resolved by the owner's confirmation above. The existing `main`/`master` push deployment workflow is unchanged and has not been triggered by this task.
