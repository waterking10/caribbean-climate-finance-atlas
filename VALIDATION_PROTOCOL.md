# Validation protocol

## Adding or changing records

1. Add a source in `src/data/sources.json` with the official link, publisher, date accessed and a reference that identifies what it supports. Check any named parties and exact role.
2. Add an institution in `institutions.json`, or add a fund, facility or programme in `vehicles.json`. Reuse existing IDs for aliases and renamed institutions. Use `aliases.json` for historical names.
3. Add links in `relationships.json` using the supported type and actual source and target. Attach supporting evidence and period. Preserve the event date if the relationship is historical.
4. Record an amount only when a named source documents the amount and its financial status for the represented relationship. Include original currency, instrument, amount date if available, and any qualification such as grant or loan ceiling in the reference or description.
5. Record the entity and relationship assessments against their stable IDs in `entity-scope.json` and `relationship-scope.json`. Review any proposed themes against the underlying activity and document both participants’ roles on every edge. Use `scope-sources.json` for supplemental scope evidence.
6. Run `pnpm test` and `pnpm build`. Check profiles, directions, source links, default visibility and full-network visibility. Run the browser suite for interaction changes.

The runtime checks identifiers, references, relationship types, direction, evidence availability and status, source dates, access route evidence, classification references and compatibility of financial status with the relationship type. It checks assessment coverage, rationale, evidence references, role and theme vocabularies, and the requirement that a tagged link have a core endpoint and in-scope participants. Reviewers assess whether the evidence supports each label.

## Review boundaries

For capital pathway records, use the [research taxonomy](CAPITAL_TRACING.md) to classify evidence and assign authority at the reported scope and stage. Reuse an existing atlas relationship amount by reference when it is the same observation. Run `pnpm test` to check links, risk beneficiaries, evidence and amount classification.

An unknown reporting date uses `reportedOn: null`, `dateBasis: undated_source_snapshot` and a separate calendar `observedOn` date. Check alternatives and overlapping observations against their referenced IDs. Institutional funding and global pool revenues carry `fundingScope` and attribution notes. The international publication regression checks compare preserved record fields against their approved baseline fingerprints, including identities promoted from research to the registry.

Use `reported` for a claim attributed to a source that does not yet meet atlas standards, `unverified` for claims under research, and `conflicting` where sources disagree. Verified records require directly supporting primary evidence. If a public source identifies a detail as confidential or unpublished, record the disclosure gap explicitly. Pending research stays distinct.

Quantities remain separated by financial status and currency. Targets and capitalization describe fundraising. Transaction amounts describe individual financing events. Guarantees and insurance describe risk exposure. A set of observations belonging to the same original flow can share a `flowId`. Avoid summing observations at different stages or from successive intermediaries. The atlas displays individual observations.

Graph weighting is off by default. The selected currency and status determine which eligible financing edges can be thickened. Width grows with the square root of the original amount relative to the largest visible qualifying amount. Fundraising targets, capital raised, risk limits, missing amounts and other currency or status groups keep baseline widths.
