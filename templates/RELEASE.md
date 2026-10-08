# Release decision and receipt

Status: NOT APPROVED. This template grants no permission to deploy.

## Before promotion
- Exact candidate SHA and immutable build/deployment identity.
- Independent QA evidence and approved preview tied to the candidate.
- Migration review, backup/restore rehearsal and data-operation authorization where required.
- Required grants, secrets and environment validated without exposing values.
- Rollback plan and owner; scope of rollout and monitoring.

## After authorized promotion
- Deployment ID, URL, timestamp and deployed SHA.
- Independent public and authenticated smoke tests.
- Observed errors/latency, rollout decision and rollback result if invoked.
- Jira release comment and remaining known limitations.

The CLI release gate checks receipt structure after verification. It does not execute deployment or authorize it.
