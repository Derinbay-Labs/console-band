"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Copy, SceneId } from "@/content/types";
import { REPO_URL } from "@/content";
import { rowsFor, srBand } from "@/lib/band";
import { Band } from "./Band";
import { CommandBlock } from "./CommandBlock";
import { Icon } from "./icons";

const DEFAULT_LIT: Record<SceneId, string> = {
  session: "head env main turn",
  usage: "ctx lim cache",
  work: "gate agents log",
  place: "loc foot",
};
const PATCH = { city: "Istanbul", weather: "17°C partly cloudy" };
const split = (s: string) => s.split(" ");

/** The hero: the live band, the scene tabs and the notes that light its rows. */
export function Stage({ t }: { t: Copy }) {
  const [scene, setScene] = useState<SceneId>(t.scenes[0]![0]);
  const [pressed, setPressed] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [cols, setCols] = useState(100);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const present = useMemo(
    () => new Set(rowsFor("agents", cols, { city: true, patch: PATCH }).map((r) => r.hl)),
    [cols],
  );
  const notes = t.notes[scene].filter(([hl]) => split(hl).some((k) => present.has(k)));
  const litKey = hover ?? pressed ?? DEFAULT_LIT[scene];
  const lit = split(litKey);

  function select(id: SceneId) {
    setScene(id);
    setPressed(null);
  }

  function onKeyDown(e: KeyboardEvent) {
    const i = t.scenes.findIndex((s) => s[0] === scene);
    const n = t.scenes.length;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    select(t.scenes[next]![0]);
    tabs.current[next]?.focus();
  }

  return (
    <div className="stage" id="stage">
      <div className="wrap stage-grid">
        <figure className="device-wrap" style={{ margin: 0 }}>
          <div
            className="device"
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`tab-${scene}`}
            id="device"
          >
            <div className="term o2-term">
              <div className="term-body">
                <Band scene="agents" city patch={PATCH} lit={lit} onCols={setCols} />
                <CommandBlock labels={t} variant="term" />
              </div>
            </div>
            <ul className="sr-only" aria-label={t.srBand}>
              {srBand("agents", t.lang).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </figure>
        <div className="under">
          <a className="btn btn-ghost btn-sm" href={REPO_URL}>
            {t.ghBtn}
            <Icon name="ext" />
          </a>
          <span className="note">
            {t.cmdNote} {t.synthetic}
          </span>
        </div>
        <div className="scenes" role="tablist" aria-label={t.scenesLabel}>
          {t.scenes.map(([id, name, desc], i) => (
            <button
              key={id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              className="scene"
              id={`tab-${id}`}
              aria-controls="device"
              aria-selected={id === scene}
              tabIndex={id === scene ? 0 : -1}
              onClick={() => select(id)}
              onKeyDown={onKeyDown}
            >
              <strong>{name}</strong>
              {desc ? <span>{desc}</span> : null}
            </button>
          ))}
        </div>
        <ul className="notes">
          {notes.map(([hl, label, text]) => (
            <li key={hl}>
              <button
                type="button"
                className="note-btn"
                aria-pressed={pressed === hl}
                onClick={() => setPressed(pressed === hl ? null : hl)}
                onMouseEnter={() => setHover(hl)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(hl)}
                onBlur={() => setHover(null)}
              >
                <span className="pin" aria-hidden="true" />
                <span>
                  <b>{label}</b>
                  {text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
