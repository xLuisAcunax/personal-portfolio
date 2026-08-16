import { defineCollection, z } from "astro:content";
import { PROJECT_BADGES } from "../types/project";

const experience = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    /** Year or `YYYY-MM`. */
    start: z.string(),
    /** Year, `YYYY-MM`, or `present`. */
    end: z.string().optional(),
    stack: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    year: z.number().int().optional(),
    /** Path under /public, e.g. "/portfolio.png". */
    cover: z.string().optional(),
    link: z.string().url().optional(),
    repo: z.string().url().optional(),
    /** Defaults to `featured` for the first project, `open-source` after. */
    badge: z.enum(PROJECT_BADGES).optional(),
  }),
});

export const collections = { experience, projects };
