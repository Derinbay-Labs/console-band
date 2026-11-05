"use client";

import { useEffect } from "react";
import { pathFor, preferredLocale } from "@/lib/locale";

/** Sends `/` visitors to their browser language; no cookie or storage is read or written. */
export function LanguageRedirect() {
  useEffect(() => {
    window.location.replace(
      pathFor(preferredLocale(navigator.languages ?? [navigator.language])),
    );
  }, []);
  return null;
}
