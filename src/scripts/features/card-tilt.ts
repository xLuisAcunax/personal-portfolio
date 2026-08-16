import { queryAll } from "../core/dom";
import { clamp, hasFinePointer, prefersReducedMotion } from "../core/motion";
import { trackScrollRange } from "../core/scroll";

const MAX_TILT_X = 5;
const MAX_TILT_Y = 6;
const IMAGE_PARALLAX = 8; // percent

/** Subtle 3D tilt on project cards plus a slow parallax on their artwork. */
export function initCardTilt(): void {
  if (prefersReducedMotion()) return;

  for (const card of queryAll<HTMLElement>("[data-tilt]")) {
    for (const image of queryAll<HTMLElement>("[data-tilt-image]", card)) {
      trackScrollRange({
        target: card,
        from: { edge: "top", viewport: 1 },
        to: { edge: "bottom", viewport: 0 },
        onUpdate: (progress) => {
          image.style.transform = `translate3d(0, ${-IMAGE_PARALLAX * progress}%, 0)`;
        },
      });
    }

    if (!hasFinePointer()) continue;

    card.addEventListener(
      "pointermove",
      (event) => {
        const rect = card.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width) - 0.5;
        const y = clamp((event.clientY - rect.top) / rect.height) - 0.5;
        card.style.setProperty("--tilt-x", `${-y * MAX_TILT_X}deg`);
        card.style.setProperty("--tilt-y", `${x * MAX_TILT_Y}deg`);
        card.dataset.tiltActive = "true";
      },
      { passive: true },
    );

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      delete card.dataset.tiltActive;
    });
  }
}
