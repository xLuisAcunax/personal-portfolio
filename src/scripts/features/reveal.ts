import { queryAll } from "../core/dom";
import { onEnterViewport } from "../core/scroll";

const REVEALED = "is-revealed";

/** Fades sections and skill tiles in as they enter the viewport. */
export function initReveal(): void {
  onEnterViewport(queryAll("[data-reveal]"), (element) => {
    element.classList.add(REVEALED);
  });

  const tiles = queryAll("[data-tile]");
  onEnterViewport(
    tiles,
    (element) => {
      const index = tiles.indexOf(element as HTMLElement);
      const delay = (index % 5) * 60 + Math.floor(index / 5) * 120;
      window.setTimeout(() => element.classList.add(REVEALED), delay);
    },
    { threshold: 0.82 },
  );
}
