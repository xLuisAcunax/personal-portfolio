import { byId, queryAll } from "../core/dom";
import { onEnterViewport, trackScrollRange } from "../core/scroll";

/**
 * Draws the gradient spine as the experience section scrolls past and reveals
 * each job entry when it arrives.
 */
export function initExperienceTimeline(): void {
  const section = byId("experience");
  const spine = byId("experience-spine");

  if (section && spine) {
    trackScrollRange({
      target: section,
      from: { edge: "top", viewport: 0.6 },
      to: { edge: "bottom", viewport: 0.75 },
      onUpdate: (progress) => {
        spine.style.transform = `scaleY(${progress})`;
      },
    });
  }

  onEnterViewport(queryAll("[data-job]"), (element) => element.classList.add("is-revealed"), {
    threshold: 0.85,
  });
}
