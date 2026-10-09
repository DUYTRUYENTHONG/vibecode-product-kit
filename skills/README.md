# Portable skills

Copy a selected skill folder into the skill location supported by your AI tool, only when you intend to install it. Do not overwrite an existing skill without comparing it. Each folder is self-contained and may also be supplied directly as a prompt. Root kit templates are optional supporting tools, not required runtime dependencies.

| Skill | Use when |
| --- | --- |
| pdk-codex-workflow | Coordinating a scoped implementation slice in Codex with approved routing and verification |
| pdk-product-planning | Refining a feature into an outcome, journey and testable scope |
| pdk-delivery-handoff | Resuming a workstream or handing off a development slice |
| pdk-independent-qa | Independently checking real user behavior at an exact candidate |
| pdk-release-evidence | Preparing a release decision or verifying deployment evidence |
| pdk-jira-traceability | Reconciling approved product scope with existing tracker work |

The explicit `codex-install` command copies all six skills to a project's
`.agents/skills` directory without global changes. Test discovery after installation.
Normal skill selection remains enabled; sensitive actions still require authorization.
