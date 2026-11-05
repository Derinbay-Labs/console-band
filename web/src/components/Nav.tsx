"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { REPO_URL } from "@/content";
import type { Copy } from "@/content/types";
import { LOCALES, pathFor } from "@/lib/locale";
import { Brand } from "./Brand";
import { Icon } from "./icons";

const SCROLLED_AFTER = 8;

export function Nav({ t }: { t: Copy }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
      <div className="wrap">
        <Brand />
        <nav className="nav-links" aria-label="Primary">
          {t.nav.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="lang" role="group" aria-label="Language / Dil">
          {LOCALES.map((l) => (
            <Link
              key={l}
              href={pathFor(l)}
              hrefLang={l}
              lang={l}
              aria-current={l === t.lang ? "true" : undefined}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </div>
        <a className="icon-btn" href={REPO_URL} aria-label={t.gh} title={t.gh}>
          <Icon name="ext" />
        </a>
        <a className="btn btn-primary btn-sm" href="#get">
          {t.navcta}
        </a>
      </div>
    </header>
  );
}
