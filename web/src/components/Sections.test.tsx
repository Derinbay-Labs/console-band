import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { copyFor } from "@/content";
import { inlineCode } from "@/lib/inline";
import { Nav } from "./Nav";
import { Faq, Features, Final, Footer, Hero, How, Privacy, Spec } from "./Sections";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
});

describe.each(["en", "tr"] as const)("page sections (%s)", (lang) => {
  const t = copyFor(lang);

  it("renders every section with one h1", () => {
    render(
      <>
        <Nav t={t} />
        <Hero t={t} />
        <Spec t={t} />
        <Features t={t} />
        <How t={t} />
        <Privacy t={t} />
        <Faq t={t} />
        <Final t={t} />
        <Footer t={t} />
      </>,
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(document.querySelectorAll("details")).toHaveLength(t.faq.length);
  });

  it("puts the Labs nameplate in the footer only, with hreflang", () => {
    render(
      <>
        <Nav t={t} />
        <Footer t={t} />
      </>,
    );
    const links = document.querySelectorAll('a[href*="derinbay.com"]');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", `https://derinbay.com/${lang}/labs/`);
    expect(links[0]).toHaveAttribute("hreflang", lang);
    expect(links[0]?.closest("footer")).not.toBeNull();
  });

  it("marks the current language in the nav", () => {
    render(<Nav t={t} />);
    const group = screen.getByRole("group");
    const current = within(group)
      .getAllByRole("link")
      .filter((a) => a.getAttribute("aria-current") === "true");
    expect(current.map((a) => a.textContent)).toEqual([lang.toUpperCase()]);
  });
});

describe("inlineCode", () => {
  it("turns backtick spans into code elements", () => {
    const { container } = render(<p>{inlineCode("run `x` now")}</p>);
    expect(container.querySelector("code")?.textContent).toBe("x");
    expect(container.textContent).toBe("run x now");
  });
});
