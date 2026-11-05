import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import {
  isLocale,
  labsUrl,
  localeFrom,
  localeParams,
  otherLocale,
  pathFor,
  preferredLocale,
} from "./locale";
import { metadataFor } from "./seo";

describe("locale helpers", () => {
  it("knows its locales and paths", () => {
    expect(isLocale("en") && isLocale("tr")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(pathFor("tr")).toBe("/tr/");
    expect(otherLocale("en")).toBe("tr");
    expect(localeParams()).toEqual([{ locale: "en" }, { locale: "tr" }]);
    expect(labsUrl("tr")).toBe("https://derinbay.com/tr/labs/");
  });
  it("resolves the route parameter or 404s", async () => {
    await expect(localeFrom(Promise.resolve({ locale: "tr" }))).resolves.toBe("tr");
    await expect(localeFrom(Promise.resolve({ locale: "xx" }))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
  it("prefers Turkish only when it is the first language", () => {
    expect(preferredLocale(["tr-TR", "en"])).toBe("tr");
    expect(preferredLocale(["en-US", "tr"])).toBe("en");
    expect(preferredLocale([])).toBe("en");
  });
});

describe("metadataFor", () => {
  it("sets canonical, hreflang pairs and x-default", () => {
    const m = metadataFor("tr");
    expect(m.alternates?.canonical).toBe("/tr/");
    expect(m.alternates?.languages).toEqual({ en: "/en/", tr: "/tr/", "x-default": "/en/" });
    expect(String(m.title).length).toBeGreaterThan(0);
  });
});
