# Caribbean Climate & Transition Finance Atlas

Mapping the funds, institutions and financing relationships supporting the Caribbean's climate and environmental transition.

Explore the [hosted atlas on GitHub Pages](https://waterking10.github.io/caribbean-climate-finance-atlas/).

The atlas explores institutional relationships behind adaptation, mitigation, energy transition, disaster resilience, nature finance, environmental sustainability and transition finance. The default network shows core entities and supporting counterparties with relevant documented links. **Full network** opens the wider verified registry.

The international capital expansion approved on 18 November 2026 brings coverage to 93 entities, 102 relationships and 24 capital pathways. Its source records distinguish institution-wide funding, case-specific finance, contingent protection, approval authority and unknown attribution. See the [publication record and remaining gaps](INTERNATIONAL_CAPITAL_PROPOSAL.md).

## Run locally

Use Node.js 24 and pnpm 11.25.0. On a machine with npm, use `npm install --global pnpm@11.25.0` to install pnpm if needed.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [the local atlas](http://127.0.0.1:5173/). The application bundles its fonts and data and runs without credentials or an external service.

- Search names and aliases or filter by theme, profile fields and documented relationship types.
- Click a node to highlight its direct links. Select an edge to inspect its direction, evidence and amount where available.
- Follow the amber **Capital pathway** highlight on the map, or the same label under an entity’s **Relationships** tab. Open the link to see documented financing, authority, risk, reported amounts and open questions with their sources.
- Use the relationship legend to show or hide each line category. Open **View** to change labels or select a like-for-like edge weighting.
- Open an entity’s **Evidence** or **Relationships** tab to inspect records using the keyboard.
- Add profile entries to **Compare**, or use the chooser there.
- Use **Research** for manual intake and review. Candidate data persists on the same browser origin.

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

1. Push the checkout to the GitHub repository you want to use.
2. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the source.
3. Run **GitHub Pages** from the Actions tab or push to `main` or `master`. The [workflow](.github/workflows/pages.yml) validates and builds the site before uploading `dist/`.
4. Use the Pages URL displayed by GitHub. Hash navigation and relative assets work under a repository subpath.

Follow [GitHub’s Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) when setting repository deployment permissions.

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Data dictionary](DATA_DICTIONARY.md)
- [Research methodology](RESEARCH_METHODOLOGY.md)
- [Dataset scope audit and research priorities](SCOPE_AUDIT.md)
- [Candidate review and published additions](CANDIDATE_REVIEW.md)
- [Capital tracing audit, taxonomy and relationship inspection](CAPITAL_TRACING.md)
- [Capital pathway case studies and evidence](CAPITAL_PATHWAY_CASES.md)
- [Data sources](DATA_SOURCES.md)
- [Validation protocol](VALIDATION_PROTOCOL.md)
- [Roadmap](ROADMAP.md)
