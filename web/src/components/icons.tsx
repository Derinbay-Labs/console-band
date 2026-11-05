import type { ReactNode } from "react";
import type { IconName } from "@/content/types";

/** Authored stroke family, 1.75 wide (design option 2). Shapes copied from the mockup. */
const SHAPES: Record<IconName, ReactNode> = {
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  ext: (
    <>
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M17 14v5H5V7h5" />
    </>
  ),
  check: (
    <>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2.5" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M7 9.5l3 2.5-3 2.5M12.5 15h4.5" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  play: (
    <>
      <path d="M5 12h3l2-5 4 10 2-5h3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="3.5" />
      <path d="M10.5 12.5L19 4M16 7l2.5 2.5M14 9l2 2" />
    </>
  ),
  branch: (
    <>
      <circle cx="6" cy="5.5" r="2" />
      <circle cx="6" cy="18.5" r="2" />
      <circle cx="18" cy="8" r="2" />
      <path d="M6 7.5v9M18 10c0 4-6 3-11 7" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.4c1.6.7 2.6 2.3 3 4.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5l7 3v5c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9v-5z" />
      <path d="M8.8 12l2.2 2.2 4.2-4.4" />
    </>
  ),
  log: (
    <>
      <path d="M5 6h14M5 10h14M5 14h9M5 18h6" />
    </>
  ),
  cols: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M9 5v14M15 5v14" />
    </>
  ),
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {SHAPES[name]}
    </svg>
  );
}

export function LabsMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M3.5 5h6a7 7 0 0 1 0 14h-6z" />
      <circle cx="20" cy="17" r="2.2" fill="currentColor" />
    </svg>
  );
}

/** Product mark: the band's own two bars between two rules. */
export function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--term)" />
      <path d="M5 16h4M23 16h4" stroke="var(--k-teal)" strokeWidth="2" strokeLinecap="round" />
      <rect x="11" y="8" width="3.4" height="16" rx="1.2" fill="var(--k-teal)" />
      <rect x="17.2" y="8" width="3.4" height="16" rx="1.2" fill="var(--k-orange)" />
    </svg>
  );
}
