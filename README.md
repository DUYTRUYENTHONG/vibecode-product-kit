# Vibecode Product Kit

An evidence-driven product-development kit by **DUYTRUYENTHONG**.

Turn product requirements into traceable development slices, QA evidence and release records. Designed for small product teams and AI-assisted work, with STOS as the first example. Framework-neutral; works alongside an existing repository and tracker.

**Version 0.1.0:** a working offline CLI plus editable templates, agent role prompts and skills. It is not an autonomous agent runtime, hosted project manager, Jira connector, or deployment service.

## Start in two minutes

Requirements: Git and Node.js 22 or newer. No API keys, paid services or runtime packages required.

```sh
git clone https://github.com/DUYTRUYENTHONG/vibecode-product-kit.git
cd vibecode-product-kit
npm ci --ignore-scripts
npm test
node bin/pdk.mjs validate examples/stos --gate planning
node bin/pdk.mjs report examples/stos
```

Point initialization at an **existing product directory**. The first command previews exactly where files will be created:

```sh
node bin/pdk.mjs init ../your-product --name "Your product" --key DEMO
node bin/pdk.mjs init ../your-product --name "Your product" --key DEMO --apply
node bin/pdk.mjs validate ../your-product/.product-kit
```

The setup writes only a new `.product-kit/` directory. It refuses an existing destination, including symlinks; never overwrites `AGENTS.md`, modifies global skills, installs hooks or sends data anywhere. Replace the starter feature before using it as a real plan. The repository is available on GitHub; this package is **not published to npm**.

## Included

| Component | What it does |
| --- | --- |
| [Master prompt](prompts/PRODUCT_DELIVERY_MASTER.md) | Scope, refine, build, verify and hand off work with explicit permissions |
| [Kit build brief](prompts/BUILD_THIS_KIT.md) | The requirements used to build this reusable kit |
| [Agent roles](agents/README.md) | BA, engineering, QA and release responsibilities; no hidden agent spawning |
| [Skills](skills/README.md) | Product planning, delivery handoffs, independent QA, release evidence and Jira reconciliation |
| [Templates](templates/) | PRD, sprint, feature registry, handoff, QA and release records |
| [CLI](docs/CLI.md) | Dry-run setup, record validation, status reporting and review-only Jira export |
| [STOS profile](examples/stos/README.md) | Publishing-first application guidance with illustrative, unverified statuses |
| [GitHub/Jira guide](docs/JIRA_GITHUB.md) | Link code to work items; separate development linking from document synchronization |
| [CI](.github/workflows/ci.yml) | Tests on Windows/Linux and Node 22/24; sample-record validation |

## The delivery contract

```text
planned -> in_progress -> implemented -> qa_verified
                                      -> preview_approved -> production_verified
                  blocked: reason + owner + next action
```

These are evidence states, not automatic Jira workflow transitions. The CLI validates the current record, not a complete transition history. `implemented` is not released. A merge does not prove a real user can publish a page. Every criterion must name a test scenario; advanced states require matching candidate SHA and recorded evidence. Unknown metrics remain `not_measured`.

**Important limitation:** records can be forged. The validator checks structure and consistency; it does not authenticate reviewers, fetch artifacts, run product tests, inspect deployment health or grant approval. Protect evidence-producing CI and reviewer access separately. See [trust boundaries](SECURITY.md).

## Use with AI coding tools

Give the existing workstream owner the [master prompt](prompts/PRODUCT_DELIVERY_MASTER.md) and the relevant role/skill file. These are portable Markdown prompts, not installed or running agents. To install a skill, explicitly copy only its folder into the skill directory supported by your tool, then verify discovery in that tool. Preserve existing policies and avoid installing duplicate skills. No compatibility claim is made for every agent runtime.

Use one accountable owner per workstream. Choose models by configured scope/risk rules, not an extra classification call. This kit does not select a provider, hard-code model prices, or promise cost savings. A concrete blocker gets a named next action, not an automatic infinite retry loop.

## GitHub and Jira

Use ticket keys in branches, commits and PR titles, for example `SCRUM-39: persist page revisions`. An authorized GitHub for Atlassian connection can expose that activity in Jira. This kit's `jira-export` produces an **offline review proposal only**; it does not install that integration or write Jira issues.

```sh
node bin/pdk.mjs jira-export examples/stos
```

## Contribute or fork

Fork this public repository, create a branch, add a focused change and tests, and submit a pull request. Follow [CONTRIBUTING.md](CONTRIBUTING.md). Do not commit credentials, real lead data or private company evidence. The [roadmap](docs/ROADMAP.md) distinguishes shipped features from proposed work.

## Credit and license

Inspired by the spec-driven planning and handoff ideas in [withkynam/vibecode-pro-max-kit](https://github.com/withkynam/vibecode-pro-max-kit). This is an independently implemented product-delivery kit, not a full fork, upstream replacement or affiliated distribution. See [NOTICE.md](NOTICE.md) for the reviewed source revision and [LICENSE](LICENSE) for MIT terms.
