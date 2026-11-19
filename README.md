# Caribbean Climate & Transition Finance Atlas

Mapping the funds, institutions and financing relationships supporting the Caribbean's climate and environmental transition.

Explore the [hosted atlas on GitHub Pages](https://waterking10.github.io/caribbean-climate-finance-atlas/).

The atlas explores institutional relationships behind adaptation, mitigation, energy transition, disaster resilience, nature finance, environmental sustainability and transition finance. The focused local explorer starts with a deterministic selection of highly relevant institutions and documented connections. Search reaches the complete research registry; mechanisms expand individually when selected. The hosted version may precede these local changes.

The international capital expansion approved on 18 November 2026 brings coverage to 93 entities, 102 relationships and 24 capital pathways. Its source records distinguish institution-wide funding, case-specific finance, contingent protection, approval authority and unknown attribution. See the [publication record and remaining gaps](INTERNATIONAL_CAPITAL_PROPOSAL.md).

## Run locally

Use Node.js 24 and pnpm 11.25.0. On a machine with npm, use `npm install --global pnpm@11.25.0` to install pnpm if needed.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [the local atlas](http://127.0.0.1:5173/). The application bundles its fonts and data and runs without credentials or an external service.

- Use the prominent search for institutions, funds, facilities, mechanisms, acronyms and aliases, including records outside the starting view.
- Filter connections by relationship type, geography and financing theme. Advanced filters contain supported institution types, ownership and documented financing instruments.
- Click an institution for a compact summary and immediate connections; expand around it or include two-hop connections.
- Click a connection for its original relationship types and associated arrangements. Expand an arrangement to reveal its documented multi-party pathway, then return to the previous network.
- Open **See full profile**, **See relationship details** or **See full pathway** for original observations, sources, role limitations and research questions. Detailed profiles have shareable hash URLs and preserve the mounted network context when returning.
- Institution nodes use a neutral appearance; relationship colours and patterns describe documented function. Graph line widths do not claim financial volume. Financial observations remain separately labelled and are never summed automatically.
- Use **Explore**, **Compare** and **About & Methodology**. There are no exploration sub-tabs. Compare retains up to three registry institutions or financing mechanisms.
- Use **Suggest a correction or missing mechanism** in the footer to open the existing sourced suggestion issue template.

The public app does not include candidate intake or review tools. Existing Research Desk bookmarks open Explore. Research management code and all data are retained. The owner confirmed there are no saved candidates or review edits to export for this change; no dataset migration is required. If browser-local research is saved before release, export it from each original browser profile and origin using the [navigation audit and backup procedure](PUBLIC_NAVIGATION_AUDIT.md).

## Verify and build

```sh
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

The browser suite serves the production build locally. Set `ATLAS_CHROME=1` to run against an installed Google Chrome instead of downloading Chromium. On Windows PowerShell, use `$env:ATLAS_CHROME = '1'`. Use `pnpm preview` to browse the built site manually.

## Maintain the registry

Add institutions in [institutions.json](src/data/institutions.json), vehicles in [vehicles.json](src/data/vehicles.json), and documented links in [relationships.json](src/data/relationships.json). Cite the source register and record the scope assessment in [entity-scope.json](src/data/entity-scope.json) or [relationship-scope.json](src/data/relationship-scope.json) using the same record ID. Preserve legal identities, historical dates and amount status when updating records. See the [data dictionary](DATA_DICTIONARY.md) and [validation protocol](VALIDATION_PROTOCOL.md) for field and amount rules.

## Deploy to GitHub Pages

This navigation change is for local review only. Do not deploy or push it to `main`/`master` until the owner has reviewed it. The browser-local backup check is resolved by the owner's confirmation recorded in the [audit](PUBLIC_NAVIGATION_AUDIT.md). Those branches trigger the existing deployment workflow.

1. Push the checkout to the GitHub repository you want to use.
2. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the source.
3. Run **GitHub Pages** from the Actions tab or push to `main` or `master`. The [workflow](.github/workflows/pages.yml) validates and builds the site before uploading `dist/`.
4. Use the Pages URL displayed by GitHub. Hash navigation and relative assets work under a repository subpath.

Follow [GitHub’s Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) when setting repository deployment permissions.

## Documentation

- [Focused explorer: pre-implementation audit, structure and mapping](FOCUSED_EXPLORER_PLAN.md)
- [Focused explorer: validation, screenshots and remaining limits](FOCUSED_EXPLORER_VALIDATION.md)

- [Filter taxonomy audit and revised structure](FILTER_TAXONOMY_AUDIT.md)
- [Relationship exploration validation and unresolved classifications](FILTER_RESTRUCTURE_VALIDATION.md)

- [Architecture](ARCHITECTURE.md)
- [Public navigation audit and browser-local backup procedure](PUBLIC_NAVIGATION_AUDIT.md)
- [Data dictionary](DATA_DICTIONARY.md)
- [Research methodology](RESEARCH_METHODOLOGY.md)
- [Dataset scope audit and research priorities](SCOPE_AUDIT.md)
- [Candidate review and published additions](CANDIDATE_REVIEW.md)
- [Capital tracing audit, taxonomy and relationship inspection](CAPITAL_TRACING.md)
- [Capital pathway case studies and evidence](CAPITAL_PATHWAY_CASES.md)
- [Data sources](DATA_SOURCES.md)
- [Validation protocol](VALIDATION_PROTOCOL.md)
- [Roadmap](ROADMAP.md)
