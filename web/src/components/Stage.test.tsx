import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { copyFor } from "@/content";
import { Stage } from "./Stage";

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

describe("Stage", () => {
  const t = copyFor("en");

  it("shows the first scene's notes and switches with arrow keys", async () => {
    const user = userEvent.setup();
    render(<Stage t={t} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveFocus();
    await user.keyboard("{End}");
    expect(tabs[3]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowLeft}");
    expect(tabs[3]).toHaveAttribute("aria-selected", "true");
  });

  it("toggles a note and lights its rows", async () => {
    const user = userEvent.setup();
    const { container } = render(<Stage t={t} />);
    const note = screen.getAllByRole("button", { pressed: false })[0]!;
    await user.click(note);
    expect(note).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll(".band .is-lit").length).toBeGreaterThan(0);
    await user.click(note);
    expect(note).toHaveAttribute("aria-pressed", "false");
  });
});
