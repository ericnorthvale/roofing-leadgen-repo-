# Incident response — website, lead flow, payments

## Site down (5xx at the CDN, no pages rendering)

1. Check Vercel status page.
2. Roll back: `vercel rollback` to the previous good deploy.
3. Post a one-line GBP update if outage is > 30 min.
4. Forensics: pull Vercel logs for the bad deploy, diff against last good commit, file a postmortem in `docs/postmortems/YYYY-MM-DD-outage.md`.

## Lead API (/api/lead) returning 5xx

1. Check if HighLevel API is the culprit (status page / curl their `/ping`).
2. If HighLevel: the endpoint falls through to a redirect anyway — leads *do not get lost*, they're only missing from CRM for the window. Manually backfill from Vercel logs.
3. If Vercel function-level: check recent deploys, roll back if needed.

## CallRail webhook returning 4xx/5xx

1. Verify `CALLRAIL_WEBHOOK_SECRET` matches the secret set in CallRail → Webhooks.
2. Check Vercel logs for the exact payload that failed verification.
3. CallRail retries 3x with backoff; if all fail, missed-call events land only in CallRail dashboard — pull them manually.

## Compliance flag (weekly-compliance workflow fails)

1. Open the workflow log; banned-phrase grep will show which file + line.
2. Hotfix the copy in a branch named `compliance-hotfix-<date>`, open a PR, merge as soon as CI is green.
3. Root-cause: who/what (script, human, template) introduced the phrase? Update the process that let it through.

## Ad account suspension (Google / Meta)

1. Stop all other campaigns on that platform immediately to preserve account health.
2. Submit reinstatement with specific evidence: Texas roofing contractor, not reselling anything, no pharma/financial claims.
3. Escalate via rep if you have one.
