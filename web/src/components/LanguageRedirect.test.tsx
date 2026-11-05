import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageRedirect } from "./LanguageRedirect";

const replace = vi.fn();
function run(languages: string[]) {
  vi.stubGlobal("location", { ...window.location, replace });
  vi.spyOn(navigator, "languages", "get").mockReturnValue(languages);
  render(<LanguageRedirect />);
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  replace.mockClear();
});

describe("LanguageRedirect", () => {
  it("goes to /tr/ for Turkish browsers", () => {
    run(["tr-TR"]);
    expect(replace).toHaveBeenCalledWith("/tr/");
  });
  it("defaults to /en/", () => {
    run(["fr"]);
    expect(replace).toHaveBeenCalledWith("/en/");
  });
});
