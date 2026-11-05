import type { ReactNode } from "react";

/** Renders `code` spans marked with backticks; everything else stays plain text. */
export function inlineCode(text: string): ReactNode[] {
  return text.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}
