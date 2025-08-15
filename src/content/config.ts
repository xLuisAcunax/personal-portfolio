import { defineCollection, z } from "astro:content";
const experience = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    start: z.string(), // "2024-01"
    end: z.string().optional(), // "present"
    stack: z.array(z.string()).optional(),
  })
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    year: z.number().int().optional(),
    cover: z.string().optional(),   // ej: "/projects/restrologic.jpg" (en /public)
    link: z.string().url().optional(),
    repo: z.string().url().optional(),
  }),
});

export const SITE = {
  brand: 'Luis Acuña',
  tagline: 'Software Engineer · .NET · Angular · Azure',
  github: 'https://github.com/xLuisAcunax',
  linkedin: 'https://www.linkedin.com/in/ldacuna83/',
  nav: [
    { label: 'Experiencia', href: '/#experiencia' },
    { label: 'Proyectos',   href: '/#proyectos' },
    { label: 'Contacto',    href: '/#contacto' },
    { label: 'CV',          href: '/cv.pdf' },
  ],
} as const;

export const collections = { experience, projects };