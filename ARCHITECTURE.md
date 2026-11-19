# Architecture

## Runtime

Vite builds a static React and TypeScript application. Tailwind utilities and shared CSS variables provide layout and themes. Local JSON tables under `src/data/` feed the `AtlasRepository` interface in `src/repository.ts`. The app checks data integrity before rendering and then builds indexed entity, relationship, source and classification lookups.

`src/selectors.ts` contains search, intersecting filters, evidence-based comparison and comparable edge weighting. `NetworkGraph.tsx` owns the Cytoscape renderer and viewport. React owns selection, filters and displayed graph elements. The graph starts with a curated layout and retains dragged positions for the mounted graph. New entities receive fallback positions until their placement is curated.

Hash routes support the network, comparison, research desk and About page on static hosts. Fonts, icons and registry data ship with the app. The profile inspector and relationship lists provide DOM controls for working with the graph using the keyboard.

## Data boundaries

Institutions and vehicles share a profile shape and remain separate tables. Relationships join any two atlas entities by stable ID. For a future database, a shared entity ID table can back both subtype tables and support foreign keys for each endpoint. Join tables can hold evidence, aliases, sectors and geographies. Projects and transaction observations are modeled for later use. A transaction can reference one project and a flow shared with other observations. A relationship with a disclosed amount can point to a documented institutional financing event without needing a project entry.

The local repository joins scope assessments and supplemental evidence by stable ID before validation. The full index contains verified entities and verified relationships with both endpoints present. The default selector serves all core entities, tagged relationships and the supporting endpoints of those relationships. Full network uses the complete verified index. A theme filter matches entity tags and endpoints of tagged links, then displays links with the selected tag. Existing search and profile filters can narrow which endpoints are displayed. Evidence status validates source use. The comparison tool and profile relationship tabs work across the full verified index.

## Local research flow

The capital pathway research layer is loaded and validated by `loadCapitalResearch(atlas)`. `indexCapitalPathways` associates verified registry edges with pathways by explicit edge reference or by an existing mechanism endpoint. The graph and entity relationship list mark those edges. The relationship inspector resolves research actors, sources and canonical amounts while keeping pathway context distinct from claims explicitly attached to that edge. Research-only actors and assertions remain outside the graph. See the [capital tracing audit and taxonomy](CAPITAL_TRACING.md).

The international publication reuses three research actor IDs as registry profiles and shares Cuba's existing geography through the registry. Pathway observations support unknown reporting dates with separate access snapshots, alternatives and overlapping financial bases, and institutional or global pool funding scope. The preservation test checks earlier records against the approved publication fingerprints, projecting their original fields after promotion.

The research desk records intake, checks exact normalized names and aliases for duplicates, captures source details and requires a human review decision. Records persist in browser local storage by origin. Seed candidates merge into existing queues by ID and normalized name, with locally saved records taking precedence. Approval marks a candidate as ready for dataset review. Publication is a curated change to the verified JSON tables.

A future research service can submit name or URL inputs, discover sources, extract candidate claims and financial observations, match aliases, propose duplicates, and queue each proposed change with evidence for a reviewer. Use separate candidate and canonical tables plus a review history. A remote repository can replace the local loader while retaining the `AtlasData` contract and verified graph scope.
