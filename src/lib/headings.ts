/**
 * Stable anchor ids for on-page headings — single source for both the heading
 * elements and the TableOfContents jump links, so anchors never drift.
 */
export function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
