---
name: pdk-release-evidence
description: Check source, QA, preview, migration and rollback evidence for an authorized release, keeping promotion and production verification distinct.
---

# Release evidence

Verify the requested target, source SHA and immutable artifact. Require the applicable independent QA, preview approval, migration authorization and grants. Do not treat this skill as deployment permission.

Record blockers with owners and next actions. Never skip a gate, grant yourself access, rotate credentials or use production data solely to finish a release checklist.

After an authorized promotion, confirm the deployed SHA and run the approved public/authenticated smoke tests. Record deployment ID, URL, time, health and rollback action. A pushed commit, successful build or merged PR is not production verification.

Use structural evidence validation only as a document check. Verify real artifacts and approver authority separately; update the tracker only through an authorized channel and read back the change.
