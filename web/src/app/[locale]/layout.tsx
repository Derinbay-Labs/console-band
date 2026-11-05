import type { ReactNode } from "react";
import { copyFor } from "@/content";
import { localeFrom, localeParams } from "@/lib/locale";
import { rootMetadata } from "@/lib/seo";
import "../globals.css";

export const dynamicParams = false;
export const generateStaticParams = localeParams;
export const metadata = rootMetadata;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await localeFrom(params);
  return (
    <html lang={locale}>
      <body>
        <a className="skip" href="#main">
          {copyFor(locale).skip}
        </a>
        {children}
      </body>
    </html>
  );
}
