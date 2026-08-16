import { queryAll } from "../core/dom";
import { easeOutCubic, prefersReducedMotion } from "../core/motion";
import { onEnterViewport } from "../core/scroll";
import { ticker } from "../core/ticker";

const DURATION_MS = 1400;

function countUp(element: HTMLElement, target: number): void {
  const start = performance.now();
  const stop = ticker.add((now) => {
    const progress = Math.min(1, (now - start) / DURATION_MS);
    element.textContent = String(Math.round(easeOutCubic(progress) * target));
    if (progress >= 1) stop();
  });
}

/** Animates the hero stat numbers the first time they scroll into view. */
export function initCounters(): void {
  const counters = queryAll<HTMLElement>("[data-count]");
  const reduced = prefersReducedMotion();

  onEnterViewport(
    counters,
    (element) => {
      const target = Number((element as HTMLElement).dataset.count);
      if (!Number.isFinite(target)) return;
      if (reduced) {
        element.textContent = String(target);
        return;
      }
      countUp(element as HTMLElement, target);
    },
    { threshold: 0.92 },
  );
}
