# Codex-native setup

## Install

Use Node 22+ and an existing product directory. No API key or paid service is needed
for installation and local tests. Using models still requires your own Codex access.

```sh
node bin/pdk.mjs codex-install ../product --preset stos-approved
node bin/pdk.mjs codex-install ../product --preset stos-approved --apply
```

The first command is a dry run. The second creates only the listed kit files:
seven `.codex/agents/cv-*.toml` profiles, six `.agents/skills/pdk-*/SKILL.md`
skills, `CODEX_KIT.md`, a registration fragment and `.codex/cv-kit-installation.json`.
If `.codex/config.toml` is absent, it creates role registrations there; existing
configs and AGENTS.md are never replaced. Add a reference to CODEX_KIT.md to your existing project
instructions after review if helpful. No Claude Code configuration is required.

Namespaced profiles: planner, engineer, secure-engineer, quick-fix, qa, reviewer,
release. They inherit your permission environment and use the explicitly adopted
[model policy](MODEL_ROUTING.md). No default model fallback or price claim.

All paths are preflighted. Existing destinations and symlink/junction parents are
rejected. Concurrent writers or I/O failures may still leave an incomplete new
installation; inspect reported paths instead of deleting existing configuration.
There is no force/update mode. Do not run concurrent installers on the same target.
Use an owned Git commit for review/rollback. The manifest records exact installed
bytes but is not a cryptographic signature or authenticated trust decision.

## Optional hooks

On initial installation, add `--hooks` to include SessionStart, PreCompact and Stop
reminders. The hooks require Git/Node and installation at the Git repository root;
their command resolves that root even when Codex runs from a nested folder.
An existing hooks.json causes a conflict, not an overwrite. For an installed
project, inspect/merge updates manually; the installer deliberately refuses reruns.

These small hooks only emit fixed reminders. They never read transcripts, run
product commands, write logs, access a network, approve tools or block stopping.
PreCompact/Stop reminders do not guarantee the model persisted a handoff. Record
checkpoints during work. Human trust and actual lifecycle execution remain separate
from direct script tests. Use `/hooks` in Codex CLI to review exact definitions.

## Activation and verification

Launch Codex in the product. Verify six skills and seven profile names are visible;
restart if discovery is cached. Try `$pdk-codex-workflow` on a bounded task. Reuse
existing owners, rather than launching every profile. Verify actual model availability
before delegation. Installation neither changes existing chats nor launches models.

Local baseline: Codex CLI 0.137.0, Node 24 on Windows. Automated tests exercise
installation, collisions, symlink parents, manifest hashes, routing, payload limits
and exact optional hook commands from nested paths. CI also tests Windows/Linux
with Node 22/24. Config parsing is not evidence that a model was spawned, hooks were
trusted, every desktop build supports profiles, or a product is production ready.

Profiles include `name`, `description` and `developer_instructions`. The installer
also provides role-table registrations for runtimes requiring them. If your project
already has a config, manually merge `.codex/cv-agents.config.toml` without replacing
existing keys. This is necessary when standalone profiles are not discovered.
Skill discovery was observed through the local CLI's debug prompt inspection;
profile and hook execution still require their respective runtime checks.

Official format references checked 2026-10-09:
- [Native subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Local skills](https://learn.chatgpt.com/docs/build-skills)
- [Hooks and trust](https://learn.chatgpt.com/docs/hooks)

## Existing friend-kit installation

This package is independently implemented, not all 33 upstream skills repackaged.
The STOS-local friend-kit installation and this public kit are distinct. Do not
install two equivalent orchestrators; selectively adopt the routing, records or
roles you need. See [friend-kit adoption](FRIEND_KIT_ADOPTION.md) for review and
attribution requirements. Nothing here exports private STOS context.
