import type { Metadata } from "next";
import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "Política de Cookies | Valutin",
  description: "Entenda como a Valutin usa cookies e como alterar suas preferências.",
  alternates: { canonical: "/politica-de-cookies" },
};

export default function CookiePolicyPage() {
  return <>
    <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
    <AnnouncementBar />
    <Header />
    <main id="main-content" tabIndex={-1} className="bg-[#faf8f5] px-5 pb-20 pt-[180px] sm:px-8">
      <article className="mx-auto max-w-[780px] text-[#213448]">
        <p className="font-poppins text-[10px] uppercase tracking-[0.2em] text-[#6d7b89]">Privacidade e escolhas</p>
        <h1 className="mt-3 font-playfair text-4xl sm:text-5xl">Política de Cookies</h1>
        <p className="mt-5 font-poppins text-sm leading-7 text-[#4c5a68]">Esta página explica o armazenamento usado no site da Valutin e como você pode controlar as ferramentas opcionais. Atualizada em 23 de setembro de 2026.</p>

        <section className="mt-11 space-y-3">
          <h2 className="font-playfair text-2xl">O que usamos</h2>
          <p className="font-poppins text-sm leading-7 text-[#4c5a68]">Cookies são pequenos arquivos guardados pelo navegador. O site também usa armazenamento local para recordar sua decisão sobre cookies. Alguns registros são necessários para uma solicitação de atendimento; outros só são ativados com sua escolha.</p>
        </section>

        <div className="mt-8 overflow-x-auto rounded-xl border border-[#dfe5e8] bg-white">
          <table className="w-full min-w-[600px] border-collapse text-left font-poppins text-xs leading-5">
            <thead className="bg-[#eef2f4] text-[#213448]"><tr><th className="px-4 py-3 font-medium">Registro</th><th className="px-4 py-3 font-medium">Finalidade</th><th className="px-4 py-3 font-medium">Duração máxima</th></tr></thead>
            <tbody className="text-[#4c5a68]">
              <tr className="border-t border-[#e9ecef]"><td className="px-4 py-3">valutin-cookie-consent</td><td className="px-4 py-3">Guardar sua escolha neste navegador (armazenamento local).</td><td className="px-4 py-3">Até você alterar ou limpar os dados do navegador.</td></tr>
              <tr className="border-t border-[#e9ecef]"><td className="px-4 py-3">vlt_retail_ok</td><td className="px-4 py-3">Dar continuidade à solicitação de atendimento.</td><td className="px-4 py-3">30 minutos.</td></tr>
              <tr className="border-t border-[#e9ecef]"><td className="px-4 py-3">vlt_wa_assignment</td><td className="px-4 py-3">Manter a distribuição do atendimento no WhatsApp.</td><td className="px-4 py-3">24 horas.</td></tr>
              <tr className="border-t border-[#e9ecef]"><td className="px-4 py-3">vl_lead_key</td><td className="px-4 py-3">Reconhecer a continuidade de um contato iniciado por você.</td><td className="px-4 py-3">90 dias.</td></tr>
              <tr className="border-t border-[#e9ecef]"><td className="px-4 py-3">vl_attr</td><td className="px-4 py-3">Guardar a origem da visita e parâmetros de campanha, quando presentes no endereço acessado, para preservar essa informação se você solicitar atendimento.</td><td className="px-4 py-3">90 dias.</td></tr>
            </tbody>
          </table>
        </div>

        <section className="mt-10 space-y-3">
          <h2 className="font-playfair text-2xl">Análise e personalização opcionais</h2>
          <p className="font-poppins text-sm leading-7 text-[#4c5a68]">Se você aceitar, o site carrega o Google Tag Manager, que pode executar as ferramentas de medição e personalização configuradas no contêiner. Essas ferramentas podem criar cookies próprios ou de terceiros. Como são geridas em um mesmo contêiner, a escolha atual ativa ou desativa o conjunto, não cada ferramenta individualmente. Sem aceite, o site não carrega esse contêiner nem envia os eventos de navegação do catálogo para ele.</p>
          <p className="font-poppins text-sm leading-7 text-[#4c5a68]">Os vídeos de coleção exibidos nas páginas atuais são servidos pela própria Valutin. Links para serviços externos, quando acionados, seguem as políticas desses serviços.</p>
        </section>

        <section id="preferencias" className="mt-10 rounded-xl border border-[#dfe5e8] bg-white p-6 sm:p-8">
          <h2 className="font-playfair text-2xl">Mude sua escolha a qualquer momento</h2>
          <p className="mt-3 font-poppins text-sm leading-7 text-[#4c5a68]">Use o painel de preferências que aparece nesta página. Você também pode apagar cookies e dados locais nas configurações do navegador. Ao retirar o aceite, a página é recarregada para deixar de executar as ferramentas opcionais.</p>
          <Link href="/catalogo" className="mt-5 inline-block font-poppins text-xs text-[#32506d] underline underline-offset-4">Voltar ao catálogo</Link>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="font-playfair text-2xl">Dúvidas</h2>
          <p className="font-poppins text-sm leading-7 text-[#4c5a68]">Para falar sobre o uso de dados neste site, <Link href="/atendimento" className="text-[#32506d] underline underline-offset-4">entre em contato com a Valutin</Link>. Veja também nossa <Link href="/politica-de-privacidade" className="text-[#32506d] underline underline-offset-4">Política de Privacidade</Link>.</p>
        </section>
      </article>
    </main>
    <Footer />
  </>;
}
