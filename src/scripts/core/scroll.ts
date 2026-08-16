import { clamp } from "./motion";

export type ScrollProgressHandler = (progress: number) => void;

export type Edge = "top" | "bottom";

/**
 * One end of a scroll range.
 *
 * `edge` picks which edge of the tracked element to watch; `viewport` is where
 * that edge has to sit, as a fraction of viewport height (0 = top of the
 * viewport, 1 = bottom). `{ edge: "top", viewport: 0.6 }` therefore reads as
 * "when the element's top edge reaches 60% down the viewport".
 */
export interface ScrollAnchor {
  readonly edge: Edge;
  readonly viewport: number;
}

export interface ScrollRangeOptions {
  readonly target: Element;
  readonly from: ScrollAnchor;
  readonly to: ScrollAnchor;
  readonly onUpdate: ScrollProgressHandler;
}

/**
 * Drives a 0→1 value from an element's position in the viewport.
 *
 * Layout is read at most once per animation frame and only while the page is
 * actually scrolling or resizing, so this never thrashes layout.
 */
export function trackScrollRange(options: ScrollRangeOptions): () => void {
  const { target, from, to, onUpdate } = options;
  let queued = false;
  let last = -1;

  const measure = (): void => {
    queued = false;
    const rect = target.getBoundingClientRect();
    const scrollY = window.scrollY;
    const viewport = window.innerHeight || 1;

    const documentEdge = (anchor: ScrollAnchor): number => {
      const edgeOffset = anchor.edge === "bottom" ? rect.bottom : rect.top;
      return edgeOffset + scrollY - viewport * anchor.viewport;
    };

    const startAt = documentEdge(from);
    const endAt = documentEdge(to);
    const span = endAt - startAt;
    const progress = span === 0 ? 1 : clamp((scrollY - startAt) / span);

    if (progress === last) return;
    last = progress;
    onUpdate(progress);
  };

  const schedule = (): void => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(measure);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  measure();

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
}

/** Fraction of the document that has been scrolled, 0→1. */
export function trackDocumentProgress(onUpdate: ScrollProgressHandler): () => void {
  let queued = false;

  const measure = (): void => {
    queued = false;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    onUpdate(scrollable <= 0 ? 0 : clamp(window.scrollY / scrollable));
  };

  const schedule = (): void => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(measure);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  measure();

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
}

export interface EnterOptions {
  /** Fraction of viewport height at which an element counts as entered. */
  readonly threshold?: number;
  readonly once?: boolean;
}

/** Fire a callback the first time each element scrolls into view. */
export function onEnterViewport(
  elements: readonly Element[],
  callback: (element: Element) => void,
  options: EnterOptions = {},
): () => void {
  const { threshold = 0.88, once = true } = options;

  if (elements.length === 0) return () => undefined;

  if (!("IntersectionObserver" in window)) {
    elements.forEach(callback);
    return () => undefined;
  }

  const bottomMargin = -Math.round((1 - threshold) * 100);
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callback(entry.target);
        if (once) observer.unobserve(entry.target);
      }
    },
    { rootMargin: `0px 0px ${bottomMargin}% 0px` },
  );

  elements.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
}

/** True while any part of the element is on screen. */
export function observeVisibility(
  target: Element,
  onChange: (visible: boolean) => void,
): () => void {
  if (!("IntersectionObserver" in window)) {
    onChange(true);
    return () => undefined;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) onChange(entry.isIntersecting);
    },
    { rootMargin: "10% 0px" },
  );
  observer.observe(target);
  return () => observer.disconnect();
}
