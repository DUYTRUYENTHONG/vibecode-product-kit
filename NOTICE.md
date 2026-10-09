# Attribution and independence

Reference project: https://github.com/withkynam/vibecode-pro-max-kit

Reviewed revision: `3bcb2f9891308fcaa305e2b64027bd0a7dc8251e`, checked 2026-10-08.

The upstream project is MIT-licensed. Its user-outcome specifications, acceptance-to-test traceability and resumable planning informed this kit's design. This repository independently implements a smaller offline product-management workflow. No upstream installer, agent definitions, hooks or validators are vendored. There is no claim of upstream authorship, endorsement, affiliation or ownership of the reference project.

If future contributions copy substantial upstream code or text, include the applicable copyright and license notices, identify the exact source revision, and describe adaptations. Do not relabel an upstream file as original work.

Differences: non-destructive setup; no global agent-policy replacement; no autonomous restart or deployment loop; no provider-price assumptions; Jira mutation remains out of scope. Version 0.2.0 adds independently implemented Codex profiles, hooks and an explicit owner-approved model preset. It is not a port of every upstream skill. These are design choices, not a claim that the reference project is unsafe in every context.

Codex is an OpenAI product name. This is an independent community project, not
endorsed by or affiliated with OpenAI or the upstream kit's authors.
