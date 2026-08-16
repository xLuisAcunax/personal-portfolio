import type { Dictionary } from "./types";

/**
 * English strings.
 *
 * This is the baseline locale: anything not listed here falls back to whatever
 * the component renders from the content collections. The few `experience.*`
 * entries exist because those roles are stored in Spanish in the markdown
 * frontmatter, so the English page needs a display override.
 */
export const EN: Dictionary = {
  "nav.experience": "Experience",
  "nav.projects": "Projects",
  "nav.skills": "Skills",
  "nav.contact": "Contact",

  "hero.kicker": "// SOFTWARE ENGINEER · BARRANQUILLA, CO",
  "hero.role.primary": "Senior Full Stack Developer",
  "hero.role.secondary": "Cloud Solutions Architect",
  "hero.bio":
    "Over <strong>12 years</strong> of experience designing and building scalable enterprise applications. Specialized in <strong>.NET</strong>, <strong>Angular</strong>, and <strong>Google Cloud Platform</strong>. Focused on delivering high-performance, secure, and cloud-native solutions.",
  "hero.cv": "Download CV",

  "stat.years": "Years shipping",
  "stat.companies": "Companies",
  "stat.tech": "Core technologies",

  "section.projects.kicker": "PROJECTS",
  "section.projects.title": "Things I've built",
  "section.projects.subtitle": "",
  "project.badge.featured": "FEATURED",
  "project.badge.open-source": "OPEN SOURCE",
  "project.visit": "Visit Site",
  "project.code": "View Code",

  "section.skills.kicker": "STACK",
  "section.skills.title": "Technical Expertise",

  "section.experience.kicker": "EXPERIENCE",
  "section.experience.title": "12 years, in order",
  "experience.present": "Present",

  "section.about.kicker": "ABOUT",
  "section.about.title": "About Me",
  "about.p1":
    "As a <strong>Senior Software Engineer</strong> with over <strong>12 years of experience</strong>, I specialize in designing and implementing scalable, high-availability systems. My expertise spans the entire software development lifecycle, with a deep focus on the <strong>.NET ecosystem</strong> and <strong>Angular</strong> for building robust enterprise solutions.",
  "about.p2":
    "I am currently focused on <strong>Cloud Architecture</strong>, leveraging <strong>Google Cloud Platform</strong> to design resilient and secure cloud-native applications. My goal is to bridge the gap between complex business requirements and technical excellence.",
  "about.p3":
    "Beyond corporate projects, I am the lead architect of <strong>RestroLogic</strong>, a comprehensive SaaS platform for restaurant management. This project demonstrates my ability to build full-scale products using modern stacks like .NET10, Angular 22, and PostgreSQL.",

  "section.contact.kicker": "CONTACT",
  "section.contact.title": "Get In Touch",
  "section.contact.subtitle":
    "Open to senior full stack and cloud architecture work.",

  "form.name": "Name",
  "form.email": "Email",
  "form.message": "Message",
  "form.send": "Send Message",
  "form.sending": "Sending...",
  "form.success": "Message sent successfully!",
  "form.error": "Failed to send. Please try again.",
  "form.networkError": "Network error. Please try again.",
  "form.placeholder.name": "John Doe",
  "form.placeholder.email": "john@example.com",
  "form.placeholder.message": "Tell me about your project...",

  "footer.tagline": "Software Engineer · .NET · Angular · Azure",

  // Roles stored in Spanish in the content collection.
  "experience.02-qualitydata.role": ".NET Developer",
  "experience.03-ludycom.role": "Application Programmer",
  "experience.04-uac.role": "Systems Analyst",
  "experience.06-steckerl.role": "Systems Engineer",
};
