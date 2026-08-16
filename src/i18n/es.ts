import type { Dictionary } from "./types";

/** Spanish strings. Keys mirror `EN`; anything missing falls back to English. */
export const ES: Dictionary = {
  "nav.experience": "Experiencia",
  "nav.projects": "Proyectos",
  "nav.skills": "Stack",
  "nav.contact": "Contacto",

  "hero.kicker": "// INGENIERO DE SOFTWARE · BARRANQUILLA, CO",
  "hero.role.primary": "Desarrollador Full Stack Senior",
  "hero.role.secondary": "Arquitecto de Soluciones Cloud",
  "hero.bio":
    "Más de <strong>12 años</strong> de experiencia diseñando y construyendo aplicaciones empresariales escalables. Especializado en <strong>.NET</strong>, <strong>Angular</strong> y <strong>Google Cloud Platform</strong>. Enfocado en entregar soluciones cloud-native de alto rendimiento y seguras.",
  "hero.cv": "Descargar CV",

  "stat.years": "Años construyendo",
  "stat.companies": "Empresas",
  "stat.tech": "Tecnologías clave",

  "section.projects.kicker": "PROYECTOS",
  "section.projects.title": "Cosas que he construido",
  "section.projects.subtitle":
    "Dos productos que llevo de punta a punta: un SaaS multi-tenant y un motor de renderizado.",
  "project.badge.featured": "DESTACADO",
  "project.badge.open-source": "CÓDIGO ABIERTO",
  "project.visit": "Ver sitio",
  "project.code": "Ver código",

  "section.skills.kicker": "STACK",
  "section.skills.title": "Experiencia técnica",

  "section.experience.kicker": "EXPERIENCIA",
  "section.experience.title": "12 años, en orden",
  "experience.present": "Actualidad",

  "section.about.kicker": "SOBRE MÍ",
  "section.about.title": "Sobre mí",
  "about.p1":
    "Como <strong>Ingeniero de Software Senior</strong> con más de <strong>12 años de experiencia</strong>, me especializo en diseñar e implementar sistemas escalables y de alta disponibilidad. Mi experiencia abarca todo el ciclo de vida del software, con un enfoque profundo en el <strong>ecosistema .NET</strong> y <strong>Angular</strong> para construir soluciones empresariales robustas.",
  "about.p2":
    "Actualmente me enfoco en <strong>Arquitectura Cloud</strong>, aprovechando <strong>Google Cloud Platform</strong> para diseñar aplicaciones cloud-native resilientes y seguras. Mi objetivo es cerrar la brecha entre requerimientos de negocio complejos y la excelencia técnica.",
  "about.p3":
    "Más allá de los proyectos corporativos, soy el arquitecto líder de <strong>RestroLogic</strong>, una plataforma SaaS integral para gestión de restaurantes. Este proyecto demuestra mi capacidad de construir productos completos con stacks modernos como .NET10, Angular 22 y PostgreSQL.",

  "section.contact.kicker": "CONTACTO",
  "section.contact.title": "Hablemos",
  "section.contact.subtitle":
    "Abierto a trabajo senior de full stack y arquitectura cloud.",

  "form.name": "Nombre",
  "form.email": "Correo",
  "form.message": "Mensaje",
  "form.send": "Enviar mensaje",
  "form.sending": "Enviando...",
  "form.success": "¡Mensaje enviado!",
  "form.error": "No se pudo enviar. Intenta de nuevo.",
  "form.networkError": "Error de red. Intenta de nuevo.",
  "form.placeholder.name": "Juan Pérez",
  "form.placeholder.email": "juan@ejemplo.com",
  "form.placeholder.message": "Cuéntame sobre tu proyecto...",

  "footer.tagline": "Ingeniero de Software · .NET · Angular · Azure",

  "project.01-restrologic.summary":
    "SaaS de gestión de restaurantes. Módulos de delivery, inventario, facturación electrónica y administración de sucursales y franquicias.",
  "project.01-restrologic.body":
    "<ul><li>Arquitectura <strong>SaaS multi-tenant</strong> escalable, diseñada para la gestión integral de restaurantes.</li><li>Backend robusto con <strong>.NET10</strong> y <strong>Angular 22</strong>, soportando alta concurrencia.</li><li>Base de datos <strong>PostgreSQL</strong> optimizada para flexibilidad y rendimiento.</li><li>Implementación de caché con <strong>Redis</strong> para mejorar los tiempos de respuesta.</li></ul>",

  "project.02-fluxo.summary":
    "Librería de animación en TypeScript ligera, de alto rendimiento y muy fluida, con 0% de CPU en reposo y cero lag al hacer scroll.",
  "project.02-fluxo.body":
    "<ul><li>Librería de animación en <strong>TypeScript</strong> ligera y de alto rendimiento, compilada para ESM, CJS y CDN.</li><li>Loop <strong>Ticker</strong> unificado e independiente del frame-rate, que evita layout thrashing y sobrecarga de pintado.</li><li>Funciones avanzadas: <strong>Timelines</strong> con offsets relativos y <strong>Scroll Binds</strong> interactivos (scrubbing).</li><li>Módulos de utilidad para revelado tipográfico (<strong>SplitText</strong>) y trazado de rutas (<strong>DrawSVG</strong>).</li><li>Cero dependencias externas, construida para máximo rendimiento y 60fps.</li></ul>",

  "experience.01-globallogic.role": "Ingeniero de Software",
  "experience.01-globallogic.body":
    "<ul><li>Diseño y desarrollo de microservicios escalables con <strong>.NET Core</strong> y <strong>Azure Functions</strong>.</li><li>Implementación de pipelines CI/CD en <strong>Azure DevOps</strong> para automatizar despliegues y asegurar la calidad del código.</li><li>Optimización de consultas en <strong>SQL Server</strong> y <strong>MongoDB</strong> para mejorar el rendimiento en aplicaciones de alto tráfico.</li><li>Participación activa en revisiones de código y mentoría técnica a desarrolladores junior.</li><li>Colaboración en equipos ágiles con metodología Scrum, asegurando entrega continua de valor.</li></ul>",

  "experience.02-qualitydata.role": "Desarrollador .NET",
  "experience.02-qualitydata.body":
    "<ul><li>Mantenimiento y evolución de aplicaciones críticas del sector salud desarrolladas en <strong>ASP.NET</strong>.</li><li>Administración y optimización de bases de datos <strong>SQL Server</strong>, incluyendo Stored Procedures, Triggers y Jobs.</li><li>Gestión del ciclo de vida del desarrollo de software y control de versiones.</li><li>Soporte técnico de nivel 3 para resolver incidentes complejos en producción.</li></ul>",

  "experience.03-ludycom.role": "Programador de Aplicaciones",
  "experience.03-ludycom.body":
    "<ul><li>Desarrollo de aplicaciones web con el patrón <strong>MVC</strong> en <strong>ASP.NET (C#)</strong>.</li><li>Implementación de lógica dinámica de cliente con <strong>JavaScript</strong> y <strong>jQuery</strong>.</li><li>Generación de scripts SQL y optimización de bases de datos.</li><li>Estimación de tiempos y planificación de entregas de proyectos de software.</li></ul>",

  "experience.04-uac.role": "Analista de Sistemas",
  "experience.04-uac.body":
    "<ul><li>Análisis, diseño y desarrollo de portales web administrativos y estudiantiles.</li><li>Implementación de soluciones Full Stack con <strong>C#</strong>, <strong>ASP.NET</strong> y <strong>SQL Server</strong>.</li><li>Diseño de interfaces responsivas con <strong>Bootstrap</strong> y <strong>CSS3</strong>.</li><li>Mantenimiento y actualización de sistemas legados.</li></ul>",

  "experience.05-it49.role": "Desarrollador Web Front-End y Back-End",
  "experience.05-it49.body":
    "<ul><li>Diseño y desarrollo de sitios web responsivos con <strong>ASP.NET</strong>.</li><li>Creación y maquetación de campañas de Email Marketing (newsletters HTML).</li><li>Administración y mantenimiento de bases de datos <strong>SQL Server</strong>.</li></ul>",

  "experience.06-steckerl.role": "Ingeniero de Sistemas",
  "experience.06-steckerl.body":
    "<ul><li>Consultoría y desarrollo de sistemas para automatización de flujos de trabajo en producción.</li><li>Implementación de aplicaciones de escritorio y web para gestión administrativa.</li><li>Modelado y administración de bases de datos <strong>SQL Server 2008 R2</strong>.</li><li>Integración de sistemas y optimización de procesos operativos.</li></ul>",
};
