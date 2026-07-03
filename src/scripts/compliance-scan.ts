/**
 * Weekly compliance scan — greps the BUILT site for banned phrases.
 *
 * Invoked by .github/workflows/weekly-compliance.yml (Mondays) after
 * `pnpm build`, and runnable locally:
 *
 *   pnpm build && pnpm tsx src/scripts/compliance-scan.ts [dist-dir]
 *
 * Rules + exemption logic live in src/lib/compliance-rules.ts (unit-tested).
 * Output: a JSON report on stdout (the workflow tees it to audit-report.json);
 * human-readable diagnostics on stderr. Exits non-zero when any NON-exempt
 * violation is found, which makes the workflow open an incident issue.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { findViolations, htmlToText, type ComplianceFinding } from "../lib/compliance-rules";

function walkHtml(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walkHtml(path));
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

const distDir = resolve(process.argv[2] ?? "dist");

let files: string[];
try {
  files = walkHtml(distDir);
} catch {
  console.error(`[compliance-scan] cannot read ${distDir} — run \`pnpm build\` first.`);
  process.exit(2);
}
if (files.length === 0) {
  console.error(`[compliance-scan] no .html files under ${distDir} — is the build complete?`);
  process.exit(2);
}

const findings: ComplianceFinding[] = [];
for (const file of files) {
  const text = htmlToText(readFileSync(file, "utf8"));
  findings.push(...findViolations(text, relative(distDir, file)));
}

const violations = findings.filter((f) => !f.exempt);
const exempt = findings.filter((f) => f.exempt);

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      distDir,
      scannedFiles: files.length,
      status: violations.length === 0 ? "pass" : "fail",
      violations,
      // Matches downgraded by educational/negation context — informational.
      exemptMatches: exempt,
    },
    null,
    2,
  ),
);

console.error(
  `[compliance-scan] ${files.length} pages scanned — ` +
    `${violations.length} violation(s), ${exempt.length} exempt educational match(es).`,
);
for (const v of violations) {
  console.error(`  VIOLATION [${v.ruleId}] ${v.source}: "${v.match}" — ${v.excerpt}`);
}

process.exit(violations.length === 0 ? 0 : 1);
