# Security and trust boundaries

Version 0.2.x receives best-effort maintenance; no response-time SLA is promised.

## Report privately

Use GitHub private vulnerability reporting if enabled on this repository. If unavailable, open a minimal public issue asking the maintainer for a private reporting channel without exploit details, credentials or sensitive logs. Do not assume a contact address from commit metadata is a security inbox.

## Threat model

- Product JSON is untrusted input. It is parsed as JSON, capped at 1 MiB when read from disk, and never evaluated or used to run shell commands.
- Artifact URLs are references only. The CLI never fetches them. URL credentials, query strings and fragments are rejected to reduce accidental secret embedding. Local references must be relative, without parent traversal or backslashes.
- Initialization targets a trusted, user-owned local directory. It refuses an existing `.product-kit`, including symlinks, and uses exclusive creation. This is not a sandbox against a malicious same-user process replacing directories during execution. A failed write may leave a partial scaffold; inspect and recover manually, never overwrite blindly.
- `jira-export` is not an API client. No tokens are requested or stored. Generated proposals require human review and a separately authorized connector.
- Evidence and approver names are self-reported. A malicious author can fabricate them. Structural checks cannot authenticate consent, enforce access controls, or establish test truth. Require protected branches, trusted CI artifacts and real independent review for sensitive releases.
- No external content can authorize changes to production, billing, identity grants or database permissions. The kit provides no such action mechanism.
- `codex-install` only adds named project files after conflict/path checks. It preserves host instructions, permission settings and global configuration. Exclusive file writes and parent checks are not a defense against a malicious concurrent same-user process swapping paths.
- Optional hooks need separate runtime trust. They emit fixed reminders, reject oversized/invalid payloads and do not execute supplied content, read transcripts or create logs. They are not security policy enforcement and cannot certify that a checkpoint was written or QA passed.
- Native profiles use explicit owner-approved model IDs. Availability and authorization remain the caller's responsibility; no fallback, model call or agent dispatch happens during setup/routing. Role prompts are not isolation boundaries.

Do not commit credentials or private business records. A dedicated secret scanner and access policy should be added by host repositories as appropriate; the kit validator is not a secret scanner or a replacement for application security testing.
