# CLI and feature record reference

Run `node bin/pdk.mjs --help`. All commands are offline. Supported Node versions: 22+. The initial local verification uses Node 24; the CI matrix checks 22 and 24 on Windows/Linux.

## Commands

| Command | Behavior | Writes |
| --- | --- | --- |
| `init TARGET --name NAME --key KEY` | Preview scaffold; TARGET must exist | None |
| `init TARGET --name NAME --key KEY --apply` | Create a new `.product-kit` directory; refuse existing state | Six new files only |
| `validate PATH --gate planning` | Validate every record, including evidence demanded by its claimed state | None |
| `validate PATH --gate qa` | Additionally require every feature to be QA verified or later | None |
| `validate PATH --gate preview` | Additionally require preview approval or later | None |
| `validate PATH --gate release` | Require production verification records for every feature | None |
| `report PATH` | Print states, owners, blockers and measurements | stdout only |
| `jira-export PATH` | Emit a JSON create/update review proposal, preserving external workflow fields | stdout only |
| `route KIND --preset stos-approved [--complexity simple\|routine\|complex] [--sensitive]` | Return deterministic owner-approved model recommendation; never dispatch | stdout only |
| `codex-install TARGET --preset stos-approved [--hooks] [--apply]` | Preview/install native profiles and skills; optional untrusted lifecycle hooks | Namespaced project files only with --apply |

PATH is a JSON file or directory containing `project.json`. Exit 0 means valid record structure; exit 1 means an input/validation/I/O error. There is no `--force` or overwrite option. A release gate is a post-verification receipt check, not a pre-deploy approval mechanism. Use a separate scoped project record for an individual release; do not delete deferred roadmap features just to pass a gate.

Routing takes task metadata, not a project path. See [routing policy](MODEL_ROUTING.md)
for kinds, precedence, security-sensitive flags and runtime availability limits.

## Version 1 record contract

Root: `schemaVersion: 1`, `product: { name, key }`, `features: [...]` (1-1000 features).

Each feature contains:
- `id`: stable requirement ID, e.g. DEMO-001 or STOS-R28; unique within the project.
- `jiraKey`: optional existing issue key, e.g. SCRUM-39; one-to-one mapping. Omit until verified rather than inventing a ticket.
- `title`, `owner`, `outcome`; `risk`: low, medium or high. Non-planned states reject unassigned/TBD/unknown owners; this is a completeness check, not identity authentication.
- `status`: planned, in_progress, blocked, implemented, qa_verified, preview_approved, production_verified.
- `dependencies`: requirement IDs in the same project; no missing IDs, duplicates or cycles.
- `outOfScope`: nonempty list of explicit exclusions.
- `acceptance`: nonempty list of `{ id, outcome, scenario }`; criterion IDs unique per feature.
- `metrics`: nonempty list of `{ name, definition, target, measurement }`. Use `not_measured`; never invent an observation. Definitions should include denominator/window/exclusions where applicable.
- `candidateSha`: full lowercase 40-character Git SHA, required from implemented onward.
- `blocker`: null or `{ reason, owner, nextAction }`; only present in blocked state.
- `evidence`: array, empty until tests run. Each item: `{ criterion, scenario, candidateSha, result, environment, method, reviewer, recordedAt, artifact }`.
- Evidence `result`: pass/fail/not_run; `environment`: local/qa/preview/production; `method`: automated/hybrid/manual; timestamps use UTC ISO format. URLs must be HTTPS with no credentials/query/fragment, or use safe relative artifact paths.
- `previewApproval`: null or `{ by, at, candidateSha, url }`, required from preview_approved onward.
- `deployment`: null or `{ id, at, candidateSha, url, rollback }`, required for production_verified.

QA requires passing QA evidence covering every criterion at the exact candidate SHA, with reviewer different from implementation owner. Current-candidate failure records prevent a verified state; keep superseded historical runs in linked evidence logs and the repository history. Preview approval and production receipts must match that SHA. Production additionally requires independent production smoke evidence for every criterion; define criteria that can be verified safely, without destructive production tests.

The validator does not audit arbitrary extra fields, measure values, resolve artifact paths, verify file existence, check upstream dependency deployment, authenticate names, run commands or implement a transition-history store. These responsibilities remain with the product team and its CI/tracker. A single passing record must never be presented as verified production readiness.
