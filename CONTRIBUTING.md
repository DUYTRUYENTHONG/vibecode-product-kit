# Contributing

1. Open an issue with user outcome, current behavior, intended scope and a reproducible example. Never include secrets or customer data.
2. Fork the repository and branch from main. Keep each PR focused; reuse an existing issue where possible.
3. Write a regression test for behavior changes. Run `npm ci --ignore-scripts`, `npm test` and `npm run check` with Node 22+.
4. Update CLI/record documentation for contract changes. Breaking schema changes require an explicit migration plan; never silently reinterpret old evidence.
5. Submit a PR describing tests actually run and limitations. The maintainer reviews it before merge; CI alone does not approve product releases.

Security issues: follow SECURITY.md rather than posting exploit details publicly. Code of conduct: be respectful, focus criticism on work, and do not publish private information or harass contributors.

Contributions are provided under this repository's MIT license. Preserve third-party attribution and do not copy unlicensed commercial assets.
