import { byId } from "../core/dom";

const MOBILE_BREAKPOINT = "(min-width: 700px)";

/** Accessible disclosure behaviour for the mobile navigation panel. */
export function initNavMenu(): void {
  const toggle = byId<HTMLButtonElement>("menu-toggle");
  const panel = byId("mobile-menu");
  if (!toggle || !panel) return;

  const setOpen = (open: boolean): void => {
    panel.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  setOpen(false);

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  panel.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  const desktop = window.matchMedia(MOBILE_BREAKPOINT);
  desktop.addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}
