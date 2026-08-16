import { SITE } from "../config/site";
import { initBackdropParallax } from "./features/backdrop-parallax";
import { initCardTilt } from "./features/card-tilt";
import { initContactForm } from "./features/contact-form";
import { initCounters } from "./features/counters";
import { initExperienceTimeline } from "./features/experience-timeline";
import { initLanguage } from "./features/language";
import { initNavMenu } from "./features/nav-menu";
import { initPixelAvatar } from "./features/pixel-avatar";
import { initPointerCursor } from "./features/pointer-cursor";
import { initReadingProgress } from "./features/reading-progress";
import { initReveal } from "./features/reveal";
import { initTheme } from "./features/theme";

/**
 * Composition root for the home page.
 *
 * Every feature is independent and no-ops when the markup it needs is absent,
 * so sections can be added or removed without touching this file beyond one
 * line.
 */
function bootstrap(): void {
  initTheme();
  initNavMenu();

  const locale = initLanguage();
  initContactForm(locale);

  initReveal();
  initCounters();
  initReadingProgress();
  initExperienceTimeline();
  initCardTilt();
  initBackdropParallax();
  initPointerCursor();

  void initPixelAvatar(SITE.avatar);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
