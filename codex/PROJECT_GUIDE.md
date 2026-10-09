# Codex Vibecode Pro Max Kit: project operation

This project installed namespaced Codex role profiles and local skills. Follow
AGENTS.md and the user's current scope first. This file does not override them.

## Start

1. Inspect source/branch, working tree, existing PRD, tracker and current owner.
2. Choose one incomplete user journey and measurable acceptance criteria.
3. Invoke `$pdk-codex-workflow` or the relevant installed skill. Use an existing
   owner; do not create seven agents merely because seven profiles exist.
4. Apply the approved routing policy with explicit available model IDs. Native
   defaults do not switch an already-running chat. Direct tools execute checks.
5. Build, verify and preserve a resume checkpoint; report external blockers with
   the exact owner/action. Do not create an automatic retry or deployment loop.

## Profiles

`cv-planner` and `cv-reviewer`: Astra high. `cv-quick-fix`: Luna low.
`cv-engineer` and `cv-qa`: Terra medium. `cv-secure-engineer` and `cv-release`:
Sol high. Use Sol for complex/auth/migration/tenant-security implementation even
if a generic engineering profile was initially selected. QA synthesis at the
consolidated gate belongs to the reviewer; test execution needs tools, not a model.

## Skills

`pdk-codex-workflow`, `pdk-product-planning`, `pdk-delivery-handoff`,
`pdk-independent-qa`, `pdk-release-evidence`, `pdk-jira-traceability`.

## Activation and safety

Start Codex from this project and verify skill/profile discovery. Availability
depends on the installed runtime and account. Optional hooks are reminders only;
review `/hooks` in Codex CLI before trusting them. They never read transcripts,
write session logs, grant permissions, call a model, loop or deploy.
Hook commands require Git/Node and a Git repository, including when invoked from
a nested directory. Do not copy configured hooks to non-Git project directories.

The installer preserved existing AGENTS.md and config.toml. When no project config
existed, it created role registrations only. For runtimes requiring those entries,
merge `.codex/cv-agents.config.toml` into your existing config after review; do not
replace permissions or other agents. Manually merge a short
reference to this guide into project instructions if needed; inspect conflicts
instead of replacing existing setup. No global configuration was installed.

Use `.codex/cv-kit-installation.json` to review the installed paths/hashes. Updates
are explicit reviewed merges, not overwrites. Commit the installation separately.
Rollback only that owned commit, preserving later edits and unrelated work.

Jira writes, production access and deployment need separate authorization. A
passing record validator or hook is not proof of product behavior or release QA.
