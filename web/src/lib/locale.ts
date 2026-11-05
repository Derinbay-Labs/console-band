import { notFound } from "next/navigation";
import type { Lang } from "@/content/types";

export const LOCALES = ["en", "tr"] as const satisfies readonly Lang[];
export type Locale = Lang;

export const SITE_URL = (
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://console-band.derinbay.com"
).replace(/\/+$/, "");

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "tr" ? "en" : "tr";
}

/** Static export uses trailing slashes: `/en/`, `/tr/`. */
export function pathFor(locale: Locale): string {
  return `/${locale}/`;
}

/** The Derinbay Labs page in the visitor's language (the family nameplate, footer only). */
export function labsUrl(locale: Locale): string {
  return `https://derinbay.com/${locale}/labs/`;
}

export function localeParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }));
}

/** Resolves the `[locale]` route parameter; an unknown value is a 404 (dynamicParams is off). */
export async function localeFrom(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

/** Picks the landing language for `/` from the browser's preferred languages (EN default). */
export function preferredLocale(languages: readonly string[]): Locale {
  const first = languages[0]?.toLowerCase() ?? "";
  return first.startsWith("tr") ? "tr" : "en";
}
