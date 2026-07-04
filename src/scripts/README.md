# Scripts

Content-engine + operational scripts that run in GitHub Actions (see `.github/workflows/`) or locally via `pnpm tsx`.

## Status per script

| Script                       | Status          | Notes                                                                                                                                                                                                                                                                             |
| ---------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compliance-scan.ts`         | **Implemented** | Weekly banned-phrase scan of the built site (`weekly-compliance.yml`). Greps every `dist/` HTML page for deductible-waiver offers, "hail-proof" claims, uncited superlatives, fake scarcity. Rules + educational-context exemptions: `src/lib/compliance-rules.ts` (unit-tested). |
| `keyword-brief-generator.ts` | Not implemented | Would expand `keyword-seeds.json` into a `briefs/queue/<slug>.json` per slot using Anthropic Claude. Blocked on: the script + `ANTHROPIC_API_KEY` repo secret. `content-pipeline.yml` has a guard step that fails fast with a clear message until then.                           |
| `content-draft.ts`           | Not implemented | Would consume a brief and draft MDX with `status: "draft"` + a `needs-human-review` PR. Deliberately human-gated (Hard Rule #2: every fact must trace to `docs/research-facts.md`). Same guard as above.                                                                          |
| `e2e-lead-test.ts`           | Not implemented | Would submit a synthetic lead against the live site nightly (`nightly-e2e.yml`). Blocked on: the script + a deployed site + HighLevel secrets. Guarded the same way.                                                                                                              |
| `reviews-sync.ts`            | Not implemented | Would pull Google Business Profile reviews nightly via Places API into `src/content/reviews/*.json`. No workflow invokes it yet; blocked on a claimed GBP + `GOOGLE_PLACES_API_KEY` (owner P1).                                                                                   |

Run the compliance scan locally:

```sh
pnpm build && pnpm tsx src/scripts/compliance-scan.ts
```

All scripts use the same shape: validate env, run work, exit 0 on success and
non-zero with a logged error otherwise — and print any machine-readable report
to stdout (diagnostics to stderr).

See `docs/utm-scheme.md` and `docs/compliance.md` for the invariants each script must respect.
