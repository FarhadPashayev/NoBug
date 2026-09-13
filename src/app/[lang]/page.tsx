import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { CineBand } from "@/components/site/cine-band";
import { Services } from "@/components/site/services";
import { About } from "@/components/site/about";
import { Technology } from "@/components/site/technology";
import { Careers, Clients, Divider } from "@/components/site/clients-careers";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  // Section order is final (README §"Korporativ sayt — section by section").
  return (
    <>
      <Header lang={lang} t={t} />
      <main>
        <Hero lang={lang} t={t} />
        <CineBand t={t} />
        <Services lang={lang} t={t} />
        <About t={t} />
        <Technology t={t} />
        <Clients t={t} />
        <Divider />
        <Careers lang={lang} t={t} />
        <Contact lang={lang} t={t} />
      </main>
      <Footer lang={lang} t={t} />
    </>
  );
}
