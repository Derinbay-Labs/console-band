import type { MetadataRoute } from "next";
import { LOCALES, SITE_URL, pathFor } from "@/lib/locale";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${pathFor(l)}`]));
  return LOCALES.map((l) => ({
    url: `${SITE_URL}${pathFor(l)}`,
    alternates: { languages },
  }));
}
