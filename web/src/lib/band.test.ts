import { describe, expect, it } from "vitest";
import { clip, fitCols, fmtClock, fmtCount, lvl, rowsFor, srBand } from "./band";

describe("formatters", () => {
  it("formats counts", () => {
    expect(fmtCount(950)).toBe("950");
    expect(fmtCount(1500)).toBe("1.5k");
    expect(fmtCount(98000)).toBe("98k");
    expect(fmtCount(2_500_000)).toBe("2.5M");
  });
  it("formats clocks", () => {
    expect(fmtClock(252)).toBe("4:12");
    expect(fmtClock(5)).toBe("0:05");
  });
  it("maps percent to a tone", () => {
    expect([lvl(10), lvl(50), lvl(80)]).toEqual(["gr", "y", "r"]);
  });
});

describe("fitCols and clip", () => {
  it("keeps columns within bounds", () => {
    expect(fitCols(780, 7.8)).toBe(99);
    expect(fitCols(10, 7.8)).toBe(30);
    expect(fitCols(100000, 7.8)).toBe(999);
  });
  it("cuts spans at the column limit", () => {
    const spans = [
      { text: "abcd", c: "x" as const, b: false },
      { text: "efgh", c: "t" as const, b: false },
    ];
    expect(clip(spans, 6).map((s) => s.text)).toEqual(["abcd", "ef"]);
    expect(clip(spans, 0)).toEqual([]);
  });
});

describe("rowsFor", () => {
  it("draws the full band wide and a compact one narrow", () => {
    const wide = rowsFor("agents", 120).map((r) => r.k);
    const narrow = rowsFor("agents", 60).map((r) => r.k);
    expect(wide).toContain("gate");
    expect(narrow).toEqual(["head", "live", "ctx", "lim", "cache", "foot"]);
  });
  it("forces the full layout and filters keys", () => {
    const rows = rowsFor("mid", 60, { full: true, keys: ["gate"] });
    expect(rows.map((r) => r.k)).toEqual(["gate"]);
  });
  it("never draws a row longer than its width after clipping", () => {
    for (const name of ["mid", "agents", "cool"] as const) {
      for (const cols of [40, 80, 120]) {
        for (const r of rowsFor(name, cols)) {
          const len = clip(r.spans, cols).reduce((n, s) => n + s.text.length, 0);
          expect(len).toBeLessThanOrEqual(cols);
        }
      }
    }
  });
});

describe("srBand", () => {
  it("describes each scene in both languages", () => {
    for (const name of ["mid", "agents", "cool"] as const) {
      expect(srBand(name, "en")).toHaveLength(8);
      expect(srBand(name, "tr")).toHaveLength(8);
    }
    expect(srBand("agents", "en")[1]).toMatch(/working/);
    expect(srBand("cool", "en")[1]).toMatch(/idle/);
    expect(srBand("agents", "tr")[0]).toMatch(/oturum maliyeti/);
  });
});
