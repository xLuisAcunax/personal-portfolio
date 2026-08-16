export const PROJECT_BADGES = ["featured", "open-source"] as const;

/** Ribbon shown on a project card. Optional in frontmatter; defaults by order. */
export type ProjectBadge = (typeof PROJECT_BADGES)[number];
