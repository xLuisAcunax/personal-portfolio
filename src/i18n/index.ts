import { EN } from "./en";
import { ES } from "./es";
import { DEFAULT_LOCALE, type Dictionary, type Locale } from "./types";

export const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = {
  en: EN,
  es: ES,
};

/**
 * Resolve a key for a locale.
 *
 * Falls back to English, then to `fallback` (typically the value already
 * rendered from a content collection), then to the key itself so a missing
 * translation is obvious rather than silently blank.
 */
export function translate(locale: Locale, key: string, fallback?: string): string {
  return DICTIONARIES[locale][key] ?? EN[key] ?? fallback ?? key;
}

/** Server-side helper for the default locale. */
export const t = (key: string, fallback?: string): string =>
  translate(DEFAULT_LOCALE, key, fallback);

export { DEFAULT_LOCALE, LOCALES, isLocale } from "./types";
export type { Dictionary, Locale } from "./types";
export { experienceKey, projectKey } from "./keys";
