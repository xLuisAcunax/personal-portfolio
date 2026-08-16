import { queryAll, writeStorage } from "../core/dom";

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "la-theme";

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

function currentTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  return isTheme(attr) ? attr : "dark";
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  writeStorage(THEME_STORAGE_KEY, theme);
  for (const button of queryAll<HTMLButtonElement>("[data-theme-toggle]")) {
    button.setAttribute("aria-pressed", String(theme === "light"));
  }
}

/**
 * Wires the theme toggle.
 *
 * The initial value is applied by a blocking inline script in the document
 * head so the first paint already uses the right palette.
 */
export function initTheme(): void {
  applyTheme(currentTheme());

  for (const button of queryAll<HTMLButtonElement>("[data-theme-toggle]")) {
    button.addEventListener("click", () => {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }
}
