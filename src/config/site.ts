/**
 * Static, build-time site configuration.
 *
 * Everything here is content-agnostic chrome: identity, outbound links and the
 * few numbers the hero advertises. Section content itself comes from the
 * `projects` / `experience` content collections.
 */

export interface NavItem {
  readonly labelKey: string;
  readonly href: string;
}

export const SITE = {
  brand: "Luis Acuña",
  brandMark: "LUIS-ACUNA.DEV",
  domain: "https://luis-acuna.dev",
  tagline: "Software Engineer · .NET · Angular · Azure",
  role: "Senior Full Stack Developer",
  secondaryRole: "Cloud Solutions Architect",
  location: "Barranquilla, CO",
  email: "ldacuna83@gmail.com",
  github: "https://github.com/xLuisAcunax",
  linkedin: "https://www.linkedin.com/in/ldacuna83/",
  cvPath: "/cv",
  avatar: "/about-me.jpg",
  /** Advertised years of experience. Kept explicit so copy and stats agree. */
  yearsOfExperience: 12,
} as const;

export const NAV_ITEMS: readonly NavItem[] = [
  { labelKey: "nav.experience", href: "#experience" },
  { labelKey: "nav.projects", href: "#projects" },
  { labelKey: "nav.skills", href: "#skills" },
  { labelKey: "nav.contact", href: "#contact" },
] as const;

/** Ticker strip under the hero. */
export const MARQUEE_ITEMS: readonly string[] = [
  "C#",
  ".NET CORE",
  "ANGULAR",
  "TYPESCRIPT",
  "GOOGLE CLOUD",
  "AZURE DEVOPS",
  "MONGODB",
  "SQL SERVER",
  "MICROSERVICES",
  "DOCKER",
  "CI/CD",
] as const;
