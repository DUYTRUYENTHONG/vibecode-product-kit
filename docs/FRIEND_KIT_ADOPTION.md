# Use alongside Vibecode Pro Max Kit

Reference: https://github.com/withkynam/vibecode-pro-max-kit
Reviewed baseline: version 3.2.5 at
`3bcb2f9891308fcaa305e2b64027bd0a7dc8251e`.

This is an adoption playbook derived from the STOS integration, not an upstream
installer or a distribution of that kit. No upstream agents, hooks, screenshots or private
STOS context are included here. Retain upstream MIT attribution when copying its
files. New upstream versions require a new review; do not assume parity.

## Responsibilities

Use the friend kit for its specification/planning/implementation skills and roles.
Use this kit for offline product records, evidence consistency and optional routing.
Keep one orchestration owner, one authoritative tracker and existing product PRDs.
Do not install a second scheduler, create duplicate tickets or replace an existing
agent policy just because both kits provide role prompts.

## Project-local adoption checklist

1. Capture branch, SHA, dirty files and current agent configuration. Inspect the
   pinned source, manifest, installer and executable hooks before installation.
2. Inventory existing `.claude`, `.codex`, `.agents`, `AGENTS.md` and process files.
   Merge reviewed changes explicitly; do not run a replacing installer over them.
3. Preserve the upstream license and source revision. Exclude historical screenshots,
   session state, transcripts, credentials, private tracker data and unrelated assets
   from any public redistribution. Keep original and adapted hashes distinguishable.
4. Add project context: actual stack, canonical local URL, source boundaries,
   current PRD/ticket references, tests and next unfinished user journey. Unknown
   progress stays unknown. Keep product context outside the public generic kit.
5. Explicitly adopt the routing preset if authorized. Set native role defaults using
   supported runtime configuration, and override generic coding roles for sensitive
   work. Never copy upstream model, permission or sandbox defaults blindly.
6. For Windows, inspect shell dependencies and file discovery. Use a reviewed Node
   bridge when Bash is unavailable. Resolve the repository root, allowlist hook
   entrypoints, normalize payload paths, bound runtime/output and preserve failure
   codes. Test root and nested working directories. A generated command is not proof
   that lifecycle hooks actually ran.
7. If symlinks are unavailable, maintain byte-identical skill mirrors and adapt
   validators explicitly. Test discovery with Windows and POSIX path separators.
8. Review exact hooks in the runtime's human trust interface. Never manufacture
   trust records or bypass approvals. Advisory hooks are not a sandbox, grant system,
   release gate or guaranteed inspector of nested/freeform tool calls.
9. Validate routing, role configuration, skill discovery, mirror identity, context
   references and selected hook behavior. Record executed tests versus unverified
   runtime behavior. Existing product typechecks/tests remain separate obligations.
10. Commit only the reviewed integration and provide activation/rollback instructions.
    For updates, compare a new pinned checkout, preserve local adaptations, rerun
    tests and re-review changed hooks. Never erase process history.

## Delivery contract

The next slice follows discover -> specify -> plan -> implement -> independent QA
-> preview approval -> authorized release -> production smoke checks. Existing
release gates remain authoritative; a green kit validator is not product QA.
When blocked, record the last verified step, owner and exact next action. Continue
independent safe work where possible, without infinite restart loops.

Jira synchronization, background orchestration, production deployment and hook
activation are separate authorized operations. An upstream command named publish
may publish the kit itself; inspect it before assuming it deploys your product.
