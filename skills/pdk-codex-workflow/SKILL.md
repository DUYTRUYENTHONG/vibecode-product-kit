---
name: pdk-codex-workflow
description: Run a scoped product-development slice in Codex using existing owners, explicit model routing, real verification and resumable evidence; use when coordinating implementation across product, engineering and QA.
---

# Codex product workflow

Inspect AGENTS.md, the current request, Git status and the existing feature record.
Reuse the owner and tracker item. Do not turn a bounded request into a new team.

Agree on one observable outcome and its failure/recovery cases. Read the owning
code and tests; preserve concurrent edits. Plan only as much as the risk requires.
Document API/state contracts before splitting frontend and backend work.

If the user adopted the kit's stos-approved routing preset: Astra high for planning
and consolidated review; Luna low for simple bounded implementation; Terra medium
for routine work; Sol high for complex/auth/migration/tenant-security work. Run
tests, builds, formatting and status checks directly. Check available model IDs
before dispatch and never silently substitute. Profiles do not switch existing chats.

Use native subagents only when available and the decomposition benefits the task.
Give a bounded scope, owned files, acceptance criteria and a completion condition.
Avoid competing writers and acknowledgement-only messages. One consolidated review
at a meaningful gate is enough unless an earlier security/data-loss risk appears.

Implement the vertical slice. Verify real behavior at the exact candidate, not only
mocks or screenshots. Separate implemented, QA verified, preview approved and
production verified. A hook reminder does not grant permission or certify QA.

At a blocker or handoff, record the last verified step, changed files, actual test
results, next executable action, owner and external prerequisite. Stop unchanged
retries; continue independent safe work. No infinite restart or hidden scheduler.
Close with accurate commit/push/preview/deploy state and evidence links.
