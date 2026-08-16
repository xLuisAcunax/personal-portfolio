import { byId } from "../core/dom";
import { trackDocumentProgress } from "../core/scroll";

/** Thin gradient bar showing how far down the page the reader is. */
export function initReadingProgress(): void {
  const bar = byId("reading-progress");
  if (!bar) return;

  trackDocumentProgress((progress) => {
    bar.style.transform = `scaleX(${progress})`;
  });
}
