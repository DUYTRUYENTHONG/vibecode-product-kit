# GitHub and Jira traceability

## Native development linking

An authorized administrator connects GitHub for Atlassian to the selected repository and Jira site. Restrict repository scope where supported. Review app permissions rather than pasting tokens into this kit.

Reference the real issue key in a branch, commit or pull-request title:

```text
feature/SCRUM-39-page-document
SCRUM-39: persist page revisions
```

Then verify the actual commit or PR in the Jira Development panel. A commit message containing a key prepares linking; it does not prove the integration is enabled. Do not rewrite shared history just to add old ticket keys. Avoid smart-commit workflow commands unless explicitly approved; a merge must not automatically mean production verified.

Official reference: [Link GitHub development information to Jira work items](https://support.atlassian.com/jira-cloud-administration/docs/use-the-github-for-jira-app/).

## Product documents are a different integration

The native connector links development activity, not arbitrary PRD content. `pdk jira-export` emits a review proposal. It does not create/update issues, attach files, assign owners or move sprints.

Recommended reconciliation workflow:
1. Read the current Jira issue and stable feature ID. Search for duplicates before any create.
2. Generate the proposal, compare it with current Jira fields and preserve human edits/history.
3. Have BA approve scope changes; confirm owners/capacity separately.
4. Apply via an authorized connector using a stable mapping and idempotency strategy.
5. Read back the resulting issue/attachment and save a receipt with key, changed fields, timestamp and document version/hash.

Future connector requirements: least privilege, environment-only credentials, explicit site/project allowlist, dry-run default, optimistic conflict check, duplicate detection, bounded retries, rate limiting and tested recovery after an uncertain write. A record marked applied without readback is not a valid synchronization receipt. No automatic bidirectional sync is implemented in 0.1.0.
