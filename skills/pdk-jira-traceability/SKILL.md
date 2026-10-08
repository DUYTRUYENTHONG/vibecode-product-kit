---
name: pdk-jira-traceability
description: Reconcile approved requirements with Jira issues and GitHub development links using stable IDs, conflict review and verified write receipts.
---

# Jira traceability

Read the existing issue and requirement ID before proposing a create or update. Search for duplicates; preserve assignees, sprint capacity, workflow state, comments and evidence unless the user requested a change.

Diff the approved scope against Jira. Apply only authorized fields using an available connector or browser. After uncertain writes, inspect current state before retrying; read back issue keys and changed fields before claiming synchronization.

Include real issue keys in commits and PR titles. Native GitHub development linking requires an authorized integration; it does not synchronize arbitrary PRD files or prove Jira status.

Without a connector, output a review proposal and label it unapplied. Never ask users to paste tokens into documents, invent issue IDs, mark Done from a merge, or imply a local file write reached Jira.
