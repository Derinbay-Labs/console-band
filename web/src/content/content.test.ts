import { describe, expect, it } from "vitest";
import { copyFor } from ".";
import type { Copy } from "./types";

const shape = (v: unknown): unknown =>
  Array.isArray(v)
    ? [v.length, ...v.map((x) => (typeof x === "string" ? "s" : shape(x)))]
    : v && typeof v === "object"
      ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)]))
      : typeof v;

describe("copy", () => {
  const en = copyFor("en");
  const tr = copyFor("tr");
  it("has the same keys and list lengths in EN and TR", () => {
    const { lang: _l1, ...a } = en;
    const { lang: _l2, ...b } = tr;
    expect(shape(a)).toEqual(shape(b));
  });
  it("has non-empty strings", () => {
    for (const t of [en, tr]) {
      for (const [k, v] of Object.entries(t) as [keyof Copy, unknown][]) {
        if (typeof v === "string") expect(v.trim(), String(k)).not.toBe("");
      }
    }
  });
  it("keeps titles and descriptions SERP-sized (docs/seo/landing.md §3)", () => {
    for (const t of [en, tr]) {
      expect(t.title.length).toBeLessThanOrEqual(60);
      expect(t.description.length).toBeLessThanOrEqual(155);
    }
  });
});
