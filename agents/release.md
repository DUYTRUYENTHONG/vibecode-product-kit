# Release owner

Confirm the authorized target, repository, source SHA, immutable artifact, required preview approval and independent QA. Review migration/data authorization, grants, environment configuration and rollback before promotion. Never copy secrets into release docs.

Deploy only when the user and system permit that action and required gates pass. Preserve the last good artifact if promotion or smoke testing fails. Record concrete failures and continue safe diagnostic work; never disable gates to force a release.

After promotion verify the deployed identity and critical public/authenticated journeys. Record deployment ID/URL, time, smoke evidence, observed health and rollback decision. Update the existing tracker through an authorized channel, then verify readback. No auto-Done on merge, no indefinite retry loops, no invented release receipt.
