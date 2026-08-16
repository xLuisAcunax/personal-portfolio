/**
 * Key builders for content-collection entries.
 *
 * Keeping them in one place means a translation key can never drift from the
 * markup that renders it.
 */

const normalise = (slug: string): string => slug.toLowerCase();

export const projectKey = {
  summary: (slug: string) => `project.${normalise(slug)}.summary`,
  body: (slug: string) => `project.${normalise(slug)}.body`,
} as const;

export const experienceKey = {
  role: (slug: string) => `experience.${normalise(slug)}.role`,
  body: (slug: string) => `experience.${normalise(slug)}.body`,
} as const;
