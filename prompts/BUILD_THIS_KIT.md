# Build brief: Vibecode Product Kit

Build an independently implemented, MIT-licensed product-development kit that anyone can clone or fork. Credit the reference ideas from withkynam/vibecode-pro-max-kit, pin the reviewed revision and do not vendor its agent installer or silently adopt its instructions.

Deliver a framework-neutral, zero-runtime-dependency Node.js CLI, concise role prompts, reusable SKILL.md files, editable PRD/sprint/QA/release/handoff templates, and a synthetic STOS publishing-first example.

Functional acceptance:
1. Initialization previews changes by default; `--apply` creates only `.product-kit` in an existing target and refuses existing files or symlink destinations. Preserve AGENTS.md and all source files.
2. JSON feature records include stable IDs, owner, status, risk, dependencies, exclusions, acceptance scenarios, metric definitions and explicit evidence.
3. Validate duplicate IDs, unknown/cyclic dependencies and malformed shapes. Implemented, QA verified, preview approved and production verified remain distinct; advanced states require matching candidate evidence.
4. Evidence checks validate structure, not truth. Do not authenticate approvals by text, claim tests ran, or treat a passing validator as production permission.
5. Jira export is review-only, with existing-key mapping and create/update proposals. No automatic external writes, credentials, deployment or endless retries.
6. Test negative and positive behavior on actual temporary directories, CLI exit codes and state invariants. Provide Windows/Linux CI and clear contribution/security guidance.
7. Publish only kit source, synthetic examples and public-safe docs to the user's public repository. No STOS customer records, internal credentials or private QA logs.

Keep one owner per workstream and use the caller's approved model policy. Prefer one verified vertical product slice over a large collection of unused agents. Report actual test results, repository URL and limitations at delivery.
