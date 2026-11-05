import type { Metadata } from "next";
import { Brand } from "@/components/Brand";
import { LOCALES, pathFor } from "@/lib/locale";
import "./globals.css";

export const metadata: Metadata = { title: "404 | console-band", robots: { index: false } };

/** One 404 for every unknown URL: static hosting cannot pick a language, so both are shown. */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="choose" id="main">
          <Brand />
          <h1>404</h1>
          <p>Page not found. Sayfa bulunamadı.</p>
          <ul>
            {LOCALES.map((l) => (
              <li key={l}>
                <a className="btn btn-primary" href={pathFor(l)} hrefLang={l} lang={l}>
                  {l === "tr" ? "Ana sayfa" : "Home"}
                </a>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}
