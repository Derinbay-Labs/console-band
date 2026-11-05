import Link from "next/link";
import { Brand } from "@/components/Brand";
import { LanguageRedirect } from "@/components/LanguageRedirect";
import { LOCALES, pathFor } from "@/lib/locale";

const LABEL: Record<(typeof LOCALES)[number], string> = { en: "English", tr: "Türkçe" };

/** `/`: a language chooser that redirects to the browser language when scripts run. */
export default function RootPage() {
  return (
    <main className="choose" id="main">
      <Brand />
      <h1>console-band</h1>
      <p>Choose your language. Dilinizi seçin.</p>
      <ul>
        {LOCALES.map((l) => (
          <li key={l}>
            <Link className="btn btn-primary" href={pathFor(l)} hrefLang={l} lang={l}>
              {LABEL[l]}
            </Link>
          </li>
        ))}
      </ul>
      <LanguageRedirect />
    </main>
  );
}
