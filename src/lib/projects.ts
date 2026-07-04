/**
 * Single source for completed-project case studies ("Homeowner Stories").
 *
 * Reads the `projects` content collection and returns only REAL, publishable
 * entries (status === "published", not a placeholder). Publishing an invented
 * project is a fabricated fact (Hard Rule #2 / FTC), so seeds/templates carry
 * `placeholder: true` and are dropped here.
 */
import { getCollection, type CollectionEntry } from "astro:content";

export type ProjectEntry = CollectionEntry<"projects">;

/** Published, real project stories, newest first. */
export async function getPublishedProjects(): Promise<ProjectEntry[]> {
  const all = await getCollection("projects");
  return all
    .filter((p) => p.data.status === "published" && !p.data.placeholder)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Published projects for a given service-area slug (for city-page proof). */
export async function projectsForCity(citySlug: string): Promise<ProjectEntry[]> {
  return (await getPublishedProjects()).filter((p) => p.data.citySlug === citySlug);
}

/** Split a longStory string (blank-line-separated) into paragraphs. */
export function storyParagraphs(longStory: string): string[] {
  return longStory
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
