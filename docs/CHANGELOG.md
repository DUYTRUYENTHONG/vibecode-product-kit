# Changelog

## 0.2.0 - 2026-10-09

- Rename the product to Codex Vibecode Pro Max Kit; retain `pdk` CLI compatibility.
- Add explicit non-overwriting Codex installation: seven native profiles, six local
  skills, manifest hashes and three optional lifecycle reminders. No Claude dependency.

- Add offline `route` command with the explicitly adopted `stos-approved` preset.
- Route planning/review to Astra, simple implementation to Luna, routine work to
  Terra, complex/sensitive work to Sol; keep test/build/status execution tool-only.
- Reject unknown metadata/options; never dispatch, silently fall back or switch chats.
- Add routing regression tests and a pinned friend-kit tailoring/activation playbook.
- Preserve existing initialization, evidence validation and Jira export contracts.

No upstream installer/hooks are bundled or auto-enabled. The independent optional
Codex hooks require human trust. No private product data,
Jira writes, production deployments, model calls or npm publication are included.

## 0.1.0 - 2026-10-08

- Initial offline product records, templates, portable roles/skills, validation,
  status reports, review-only Jira export and Windows/Linux CI.
