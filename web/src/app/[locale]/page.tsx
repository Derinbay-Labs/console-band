import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Faq, Features, Final, Footer, Hero, How, Privacy, Spec } from "@/components/Sections";
import { copyFor } from "@/content";
import { localeFrom } from "@/lib/locale";
import { jsonLdFor, jsonLdScript, metadataFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return metadataFor(await localeFrom(params));
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await localeFrom(params);
  const t = copyFor(locale);
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD is a data block, not executed script; jsonLdScript escapes "<".
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLdFor(locale)) }}
      />
      <Nav t={t} />
      <main id="main">
        <Hero t={t} />
        <Spec t={t} />
        <Features t={t} />
        <How t={t} />
        <Privacy t={t} />
        <Faq t={t} />
        <Final t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}
