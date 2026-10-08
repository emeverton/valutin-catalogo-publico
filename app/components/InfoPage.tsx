import Link from "next/link";
import type { ReactNode } from "react";
import AnnouncementBar from "./AnnouncementBar";
import Footer from "./Footer";
import GtmSnippet from "./GtmSnippet";
import Header from "./Header";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export default function InfoPage({ eyebrow, title, intro, children }: InfoPageProps) {
  return <>
    <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
    <GtmSnippet />
    <AnnouncementBar />
    <Header />
    <main id="main-content" tabIndex={-1} className="bg-[#faf8f5] pt-[142px]">
      <div className="mx-auto max-w-[1180px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:pb-28">
        <nav aria-label="Navegação estrutural" className="font-poppins text-xs text-ink/60">
          <Link href="/" className="underline underline-offset-4 hover:text-brand-strong">Início</Link>
          <span aria-hidden="true" className="px-2">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        <header className="mt-10 max-w-3xl border-b border-ink/15 pb-10 sm:pb-12">
          <p className="font-poppins text-[11px] uppercase tracking-[0.2em] text-brand-strong">{eyebrow}</p>
          <h1 className="mt-4 font-playfair text-4xl leading-tight text-ink sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl font-poppins text-sm leading-7 text-ink/75 sm:text-base">{intro}</p>
        </header>
        <div className="info-page-content max-w-3xl space-y-10 pt-10 text-ink/80 sm:pt-12">{children}</div>
      </div>
    </main>
    <Footer />
  </>;
}
