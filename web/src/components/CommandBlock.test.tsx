import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { INSTALL_COMMAND } from "@/content";
import { CommandBlock } from "./CommandBlock";

const labels = {
  cmdLabel: "Install",
  copy: "Copy",
  copied: "Copied",
  copyFail: "Press Ctrl+C",
};

afterEach(() => vi.restoreAllMocks());

describe("CommandBlock", () => {
  it("copies the install command", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<CommandBlock labels={labels} />);
    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(writeText).toHaveBeenCalledWith(INSTALL_COMMAND);
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("selects the text and says so when the clipboard is unavailable", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    render(<CommandBlock labels={labels} />);
    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(await screen.findByText("Press Ctrl+C")).toBeInTheDocument();
    expect(window.getSelection()?.toString()).toBe(INSTALL_COMMAND);
  });

  it("returns to Copy after the reset delay", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<CommandBlock labels={labels} />);
    await user.click(screen.getByRole("button"));
    await act(() => vi.advanceTimersByTimeAsync(2100));
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
