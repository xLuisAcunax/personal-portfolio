import { queryAll } from "../core/dom";
import { prefersReducedMotion } from "../core/motion";
import { trackDocumentProgress } from "../core/scroll";

/** Drifts the ambient background blobs as the page scrolls. */
export function initBackdropParallax(): void {
  if (prefersReducedMotion()) return;

  const blobs = queryAll<HTMLElement>("[data-parallax]");
  if (blobs.length === 0) return;

  trackDocumentProgress((progress) => {
    for (const blob of blobs) {
      const distance = Number(blob.dataset.parallax) || 0;
      blob.style.transform = `translate3d(0, ${distance * progress}px, 0)`;
    }
  });
}
