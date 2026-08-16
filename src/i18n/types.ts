export const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * A locale dictionary.
 *
 * Values are trusted, build-time authored HTML fragments — they are inlined
 * into the page at render time and swapped client-side with `innerHTML`. They
 * must never be populated from user input or a remote source.
 */
export type Dictionary = Readonly<Record<string, string>>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
