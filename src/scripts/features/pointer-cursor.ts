import { byId, queryAll } from "../core/dom";
import { hasFinePointer, lerp, prefersReducedMotion } from "../core/motion";
import { ticker } from "../core/ticker";

const RING_SMOOTHING = 0.22;
const DOT_SMOOTHING = 0.55;

/**
 * Custom pointer: a square ring that eases towards the cursor and a dot that
 * tracks it closely. Only enabled for fine pointers with motion allowed.
 */
export function initPointerCursor(): void {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const ring = byId("cursor-ring");
  const dot = byId("cursor-dot");
  if (!ring || !dot) return;

  const pointer = { x: 0, y: 0 };
  const ringPos = { x: 0, y: 0 };
  const dotPos = { x: 0, y: 0 };
  let visible = false;

  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (visible) return;
      visible = true;
      ringPos.x = dotPos.x = pointer.x;
      ringPos.y = dotPos.y = pointer.y;
      ring.dataset.visible = "true";
      dot.dataset.visible = "true";
    },
    { passive: true },
  );

  ticker.add(() => {
    if (!visible) return;
    ringPos.x = lerp(ringPos.x, pointer.x, RING_SMOOTHING);
    ringPos.y = lerp(ringPos.y, pointer.y, RING_SMOOTHING);
    dotPos.x = lerp(dotPos.x, pointer.x, DOT_SMOOTHING);
    dotPos.y = lerp(dotPos.y, pointer.y, DOT_SMOOTHING);
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
  });

  for (const magnet of queryAll("[data-magnet]")) {
    magnet.addEventListener("pointerenter", () => {
      ring.dataset.magnetised = "true";
    });
    magnet.addEventListener("pointerleave", () => {
      delete ring.dataset.magnetised;
    });
  }
}
