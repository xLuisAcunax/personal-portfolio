/** Motion primitives shared by every animated feature. */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function hasFinePointer(): boolean {
  return window.matchMedia("(pointer: fine)").matches;
}

export const clamp = (value: number, min = 0, max = 1): number =>
  value < min ? min : value > max ? max : value;

export const lerp = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
