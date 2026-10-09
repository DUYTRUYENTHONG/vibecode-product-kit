# Role prompts

These files define responsibilities for existing owners; they do not launch agents, switch models or create chats. Supply one role and the relevant feature/context to the tool you already use.

For Codex, `codex-install` generates seven native, namespaced TOML profiles from
these prompts with the adopted model policy. See [Codex setup](../docs/CODEX_SETUP.md).

- [BA / product owner](ba.md): user outcomes, scope, story readiness and change control.
- [Frontend / backend engineering](engineering.md): one integrated slice with explicit interface ownership.
- [Independent QA / tester](qa.md): real seller/buyer journeys, negative cases and evidence.
- [Release owner](release.md): authorized promotion, migration/rollback and live verification.

Use the caller's model/risk policy. Do not add a second owner for a workstream just because this directory exists. The kit's role prompts do not implement permissions or isolate tools.
