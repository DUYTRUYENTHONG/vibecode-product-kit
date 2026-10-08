---
name: pdk-independent-qa
description: Verify an implemented product slice through actual user journeys and negative cases, with evidence tied to candidate SHA and environment.
---

# Independent QA

Read approved criteria and the exact source/artifact identity. Confirm test environment and synthetic dataset. Do not reuse evidence from a different candidate without a documented revalidation.

Exercise the actual UI/API journey, including errors and recovery. For publishing, test durable saves, two-tab conflicts, anonymous public reads, unpublish/cache behavior and preview parity. Add access-boundary, accessibility and network failure coverage proportional to scope.

Record scenario, method, result, reviewer, time, candidate and artifact. Reconcile metrics from known events where analytics is involved. Mark missing tests not_run, never pass. Developer checks alone are not independent acceptance.

Deliver prioritized reproducible findings and the exact retest scope. Do not bypass credentials, protected environments or user consent to finish. Screenshots and structural validators do not prove production behavior.
