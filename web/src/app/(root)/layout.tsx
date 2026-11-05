import type { Metadata } from "next";
import type { ReactNode } from "react";
import { rootMetadata } from "@/lib/seo";
import "../globals.css";

export const metadata: Metadata = {
  ...rootMetadata,
  title: "console-band",
  description:
    "A live status band above the Claude Code prompt. Claude Code isteminin üstünde canlı bir durum bandı.",
  alternates: { canonical: "/", languages: { en: "/en/", tr: "/tr/", "x-default": "/en/" } },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
