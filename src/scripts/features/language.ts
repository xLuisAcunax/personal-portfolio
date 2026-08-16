import { DEFAULT_LOCALE, DICTIONARIES, isLocale, type Locale } from "../../i18n";
import { queryAll, readStorage, writeStorage } from "../core/dom";
import { prefersReducedMotion } from "../core/motion";

const LANGUAGE_STORAGE_KEY = "la-lang";

export interface LocaleStore {
  readonly get: () => Locale;
  readonly set: (locale: Locale) => void;
  readonly subscribe: (listener: (locale: Locale) => void) => () => void;
}

/**
 * Client-side locale switching.
 *
 * The page is server-rendered in the default locale; each translatable node
 * carries `data-i18n="<key>"` and its rendered markup is captured as the
 * English baseline on init. Swapping locale replaces that markup from a
 * build-time dictionary — never from user input — so `innerHTML` here is not
 * an injection surface.
 */
export function initLanguage(): LocaleStore {
  const nodes = queryAll<HTMLElement>("[data-i18n]");
  const placeholders = queryAll<HTMLInputElement | HTMLTextAreaElement>("[data-i18n-placeholder]");
  const baselines = new WeakMap<HTMLElement, string>();
  const listeners = new Set<(locale: Locale) => void>();
  const animate = !prefersReducedMotion();

  for (const node of nodes) baselines.set(node, node.innerHTML);
  for (const field of placeholders) baselines.set(field, field.placeholder);

  let locale: Locale = DEFAULT_LOCALE;

  const render = (next: Locale): void => {
    const dictionary = DICTIONARIES[next];

    for (const node of nodes) {
      const key = node.dataset.i18n;
      if (!key) continue;
      const markup = dictionary[key] ?? baselines.get(node) ?? node.innerHTML;
      if (markup === node.innerHTML) continue;
      node.innerHTML = markup;
      if (animate) {
        node.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 450, easing: "ease-out" });
      }
    }

    for (const field of placeholders) {
      const key = field.dataset.i18nPlaceholder;
      if (!key) continue;
      field.placeholder = dictionary[key] ?? baselines.get(field) ?? field.placeholder;
    }

    document.documentElement.lang = next;
    for (const button of queryAll<HTMLButtonElement>("[data-lang-option]")) {
      button.setAttribute("aria-pressed", String(button.dataset.langOption === next));
    }
  };

  const set = (next: Locale): void => {
    if (next === locale) return;
    locale = next;
    writeStorage(LANGUAGE_STORAGE_KEY, next);
    render(next);
    for (const listener of listeners) listener(next);
  };

  for (const button of queryAll<HTMLButtonElement>("[data-lang-option]")) {
    button.addEventListener("click", () => {
      const value = button.dataset.langOption;
      if (isLocale(value)) set(value);
    });
  }

  const stored = readStorage(LANGUAGE_STORAGE_KEY);
  if (isLocale(stored) && stored !== locale) set(stored);
  else render(locale);

  return {
    get: () => locale,
    set,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
