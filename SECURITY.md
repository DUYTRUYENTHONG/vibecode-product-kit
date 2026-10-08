# Security and trust boundaries

Version 0.1.x receives best-effort maintenance; no response-time SLA is promised.

## Report privately

Use GitHub private vulnerability reporting if enabled on this repository. If unavailable, open a minimal public issue asking the maintainer for a private reporting channel without exploit details, credentials or sensitive logs. Do not assume a contact address from commit metadata is a security inbox.

## Threat model

- Product JSON is untrusted input. It is parsed as JSON, capped at 1 MiB when read from disk, and never evaluated or used to run shell commands.
- Artifact URLs are references only. The CLI never fetches them. URL credentials, query strings and fragments are rejected to reduce accidental secret embedding. Local references must be relative, without parent traversal or backslashes.
- Initialization targets a trusted, user-owned local directory. It refuses an existing `.product-kit`, including symlinks, and uses exclusive creation. This is not a sandbox against a malicious same-user process replacing directories during execution. A failed write may leave a partial scaffold; inspect and recover manually, never overwrite blindly.
- `jira-export` is not an API client. No tokens are requested or stored. Generated proposals require human review and a separately authorized connector.
- Evidence and approver names are self-reported. A malicious author can fabricate them. Structural checks cannot authenticate consent, enforce access controls, or establish test truth. Require protected branches, trusted CI artifacts and real independent review for sensitive releases.
- No external content can authorize changes to production, billing, identity grants or database permissions. The kit provides no such action mechanism.

Do not commit credentials or private business records. A dedicated secret scanner and access policy should be added by host repositories as appropriate; the kit validator is not a secret scanner or a replacement for application security testing.
