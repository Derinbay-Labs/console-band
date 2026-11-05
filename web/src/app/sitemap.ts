import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/locale";
import { hreflangs, pageUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** The two locale pages, each with the full `en`/`tr`/`x-default` set (docs/seo/landing.md §7). */
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((l) => ({ url: pageUrl(l), alternates: { languages: hreflangs() } }));
}
