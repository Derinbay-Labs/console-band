"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { INSTALL_COMMAND } from "@/content";
import { Icon } from "./icons";

export interface CommandLabels {
  cmdLabel: string;
  copy: string;
  copied: string;
  copyFail: string;
}

type Status = "idle" | "copied" | "failed";
const RESET_MS = 2000;

/** The install command with a copy button; falls back to selecting the text. */
export function CommandBlock({
  labels,
  variant = "final",
  children,
}: {
  labels: CommandLabels;
  variant?: "term" | "final";
  children?: ReactNode;
}) {
  const code = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), RESET_MS);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setStatus("copied");
    } catch {
      const node = code.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setStatus("failed");
    }
  }

  const ok = status === "copied";
  return (
    <div className="cta">
      <div
        className={`cmd${variant === "term" ? " cmd-term" : ""}`}
        role="group"
        aria-label={labels.cmdLabel}
      >
        <code ref={code}>{INSTALL_COMMAND}</code>
        <button className="btn btn-primary btn-sm" type="button" onClick={copy}>
          <Icon name={ok ? "check" : "copy"} />
          <span>{ok ? labels.copied : labels.copy}</span>
        </button>
      </div>
      {children}
      <span className="sr-only" aria-live="polite">
        {status === "copied" ? labels.copied : status === "failed" ? labels.copyFail : ""}
      </span>
    </div>
  );
}
