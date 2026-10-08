# STOS publishing-first profile

This is an illustrative planning profile, not a live snapshot of STOS/Jira or a production-readiness claim. The requirement and Jira keys illustrate existing publishing work; statuses deliberately remain planned with no claimed evidence. Reconcile current code and tracker before adoption.

Primary journey: sign in -> choose template -> edit products/contact -> save -> preview -> publish -> share -> receive an inquiry. Billing is deferred.

STOS alignment:
- Frontend and backend share a canonical versioned page document. Use one rendering contract for preview/public pages.
- Backend owns account/tenant authorization, durable drafts, optimistic concurrency, revisions and publication idempotency.
- Templates are versioned, capability-compatible and safely archived without breaking existing pages.
- Analytics must distinguish CTA intent from a completed message/lead, and missing data from zero.
- AI recommendations are evidence-based suggestions, not unverified promises of conversion lift.
- Keep native administration, real owner grants and auth-provider decisions explicit; installing this kit changes none of them.
- Local browser tests should use the project's existing port-3000 convention. Never kill another process simply to occupy the port.

## Apply alongside STOS

Run kit init against a clean STOS working copy only after reviewing its dry run. Reconcile the example with the current PRD rather than blindly replacing it. Use the existing BA, frontend, backend, QA and release owners; this kit does not launch new agents.

Adopt one publishing slice first. Attach real tests/preview evidence to its actual candidate and obtain the required release approval. Never claim this example's acceptance criteria are already implemented merely because `npm run check` passes.
