# Scripts

Content-engine + operational scripts that run in GitHub Actions (see `.github/workflows/content-pipeline.yml`) or locally via `pnpm tsx`.

## Planned modules

- `keyword-brief-generator.ts` — expands `keyword-seeds.json` into a `briefs/queue/<slug>.json` per slot, using Anthropic Claude.
- `content-draft.ts` — consumes a brief, drafts a full MDX blog post, writes to `src/content/blog/<slug>.mdx` with `status: "draft"`, opens a PR labeled `needs-human-review`.
- `compliance-scan.ts` — runs weekly, greps the built `dist/` for banned phrases (deductible-waiving language, unverified awards, "hail-proof" claims).
- `reviews-sync.ts` — nightly, pulls the latest Google Business Profile reviews via Places API and writes to `src/content/reviews/*.json`.

All scripts use the same shape:

```ts
import "dotenv/config";
// validate env
// run work
// exit 0 on success, non-zero with logged error otherwise
```

See `docs/utm-scheme.md` and `docs/compliance.md` for the invariants each script must respect.
