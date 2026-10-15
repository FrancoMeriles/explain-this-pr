# View mapping

Choose archify diagram types from **signals in the diff**, not from a checklist. Each view must answer a question a reviewer actually has. Archify's type router (in its SKILL.md) has the schemas and examples; this table only decides *which* types earn a tab.

## Signal → view

| Signal in the diff | Archify type | The question it answers |
|---|---|---|
| New or changed API endpoints, RPC calls, service-to-service requests, webhooks | `sequence` | Who calls whom, in what order, with which returns? |
| New statuses, state fields, retries, gates, terminal states | `lifecycle` | Where can this thing be, and what moves it? |
| Migrations, new tables/columns, model changes, new relations | `erd` | What does the data look like now? |
| New modules, moved packages, changed dependency direction, new boundaries | `architecture` | What is the system made of, and where does this change sit? |
| Pipelines, transforms, ETL, consumers/producers, document or money movement | `dataflow` | Where does the data go, and what happens to it on the way? |
| User-facing flows, CLI commands, UI actions, approval steps | `workflow` | What does the user do, and what happens next? |
| New classes/interfaces, changed contracts, inheritance changes | `class` | What are the types and how do they relate? |
| Repository/module containment, feature breakdowns, "what files form this subsystem" | `tree` | What contains what? |
| Incident fixes with a known history, release-train PRs | `timeline` | When did things happen? |
| Perf/latency PRs with phases, queues, parallel work | `waterfall` | Where does the time go? |

## Always-on rule

If the PR touches **more than one subsystem**, include an overview first: `architecture` for a component/service map, `tree` for a pure module layout. It gives the reviewer bearings before the detail views.

## Common PR shapes

- **Bugfix**: usually 1 view — the flow that now takes the corrected branch (`sequence` or `workflow`).
- **New feature**: overview + the main new path (`sequence`/`workflow`) + `lifecycle` or `erd` if it introduced state.
- **Refactor**: `architecture` or `tree` showing the new structure; diff-only views mislead here.
- **Schema/data change**: `erd` + `dataflow` for what consumes it.
- **Infra/CI**: `workflow` (the pipeline) or `architecture` (the topology).
- **Docs-only or mechanical**: tell the user a walkthrough adds little; offer the figure instead.

## Authoring notes for PRs

- Diagram the **after state** (HEAD). Include a removed path only if the change is confusing without it, marked clearly.
- Names, calls, states, and columns come from the diff and the files at HEAD — never from the diagram type's example.
- A view that duplicates what the PR description already says in two sentences is not worth a tab.
- Keep each diagram scoped to what the PR changes plus its immediate neighbors; the whole system belongs to archify's own repository workflow, not to a PR tour.
