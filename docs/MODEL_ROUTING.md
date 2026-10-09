# Owner-approved routing preset

The optional `stos-approved` preset implements the STOS owner's routing policy.
It is not a universal cost ranking. Model IDs must exist in the dispatching tool;
the kit does not check provider availability or make any model/network call.

| Task metadata | Recommendation | Effort |
| --- | --- | --- |
| planning, specification, review | gpt-6-astra | high |
| simple implementation | gpt-5.6-luna | low |
| routine implementation | gpt-5.6-terra | medium |
| complex or sensitive implementation | gpt-5.6-sol | high |
| test, build, format, status, metrics | Direct tools | None |

Implementation kinds: coding, research, documentation, debugging. Default
complexity: routine. Authentication, data migrations and tenant-security work must
be marked `--sensitive`; difficult debugging must be complex. The caller supplies
this metadata. No LLM classifier or inference from ticket text is used.

Precedence: tool-only work, then planning/review, then sensitive/complex
implementation, then simple/routine. A security design review still uses Astra;
its implementation uses Sol. Test execution stays tool-only; writing a new test
is coding and should use coding metadata.

```sh
node bin/pdk.mjs route planning --preset stos-approved
node bin/pdk.mjs route coding --preset stos-approved --complexity simple
node bin/pdk.mjs route coding --preset stos-approved --sensitive
node bin/pdk.mjs route test --preset stos-approved
```

Every result has `dispatched: false`. Apply the recommendation through a supported
explicit model/effort override to the existing owner, after checking availability.
Never silently substitute a more expensive model. No automatic fallback to GPT-5.5.
This command does not create agents, change another chat, install hooks or authorize
production actions. Unknown kinds, presets and malformed options fail closed.

Reuse one owner per workstream. Consolidate review at a meaningful feature/release
gate; escalate earlier for a real security/data-loss risk. Distinguish defects from
missing credentials/infrastructure before retrying. A simple implementation may be
escalated once using complex metadata; preserve the reason in the handoff and stop
unchanged retries. Build/test/status actions remain direct tools, not model retries.

Keep protected release QA regardless of token cost. Report savings only from
observed usage/cost per accepted task; subscription quota is not API pricing.
