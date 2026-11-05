"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clip, fitCols, rowsFor, type RowOptions, type SceneName } from "@/lib/band";

// The pre-rendered band uses the compact layout (5 rows), which is what every screen up to
// the widest stage measures to, so the hydrated band never changes the page height.
const DEFAULT_COLS = 60;
const FALLBACK_CHAR_WIDTH = 7.8;
const widths = new Map<string, number>();

/** Width of one monospace character at the element's font size, measured once per size. */
function charWidth(el: HTMLElement): number {
  const fontSize = getComputedStyle(el).fontSize;
  const known = widths.get(fontSize);
  if (known) return known;
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-family:var(--font-mono);font-size:${fontSize}`;
  probe.textContent = "0".repeat(100);
  document.body.appendChild(probe);
  const w = probe.getBoundingClientRect().width / 100 || FALLBACK_CHAR_WIDTH;
  probe.remove();
  widths.set(fontSize, w);
  return w;
}

function measure(el: HTMLElement): number {
  const cs = getComputedStyle(el);
  const inner = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  return fitCols(inner, charWidth(el));
}

interface BandProps extends RowOptions {
  scene: SceneName;
  className?: string;
  /** Row keys to light (`is-lit`); `null` draws no highlight. */
  lit?: readonly string[] | null;
  onCols?: (cols: number) => void;
}

/** Draws a band scene at the number of columns that fits its box, like a real terminal. */
export function Band({ scene, className, lit = null, onCols, ...options }: BandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const onColsRef = useRef(onCols);

  useEffect(() => {
    onColsRef.current = onCols;
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      const next = measure(el);
      setCols(next);
      onColsRef.current?.(next);
    };
    update();
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(update, 80);
    });
    observer.observe(el);
    void document.fonts?.ready.then(() => {
      widths.clear();
      update();
    });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const { full, city, patch, keys } = options;
  const rows = useMemo(
    () => rowsFor(scene, cols, { full, city, patch, keys }),
    [scene, cols, full, city, patch, keys],
  );

  return (
    <div ref={ref} className={`band-box${className ? ` ${className}` : ""}`}>
      <pre className={`band${lit ? " has-lit" : ""}`} aria-hidden="true">
        {rows.map((r) => (
          <span key={r.k} className={`r${lit?.includes(r.hl) ? " is-lit" : ""}`}>
            {clip(r.spans, cols).map((x, i) => (
              <span key={i} className={`k-${x.c}${x.b ? " bo" : ""}`}>
                {x.text}
              </span>
            ))}
          </span>
        ))}
      </pre>
    </div>
  );
}
