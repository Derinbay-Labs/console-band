import type { Metadata } from "next";
import { copyFor } from "@/content";
import { LOCALES, SITE_URL, otherLocale, pathFor, type Locale } from "./locale";

/** Title, description, canonical and hreflang pairs (`x-default` is English). */
export function metadataFor(locale: Locale): Metadata {
  const t = copyFor(locale);
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [l, pathFor(l)]),
  );
  languages["x-default"] = pathFor("en");
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: pathFor(locale), languages },
    openGraph: {
      title: t.title,
      description: t.description,
      url: pathFor(locale),
      siteName: "console-band",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      alternateLocale: otherLocale(locale) === "tr" ? "tr_TR" : "en_US",
      type: "website",
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "console-band",
};
