"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readCookieConsent, saveCookieConsent } from "../lib/cookie-consent";

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [optional, setOptional] = useState(false);

  useEffect(() => {
    const choice = readCookieConsent();
    setOptional(choice === true);
    setOpen(choice === null || window.location.hash === "#preferencias");
    setConfiguring(window.location.hash === "#preferencias");
    const onHashChange = () => {
      if (window.location.hash === "#preferencias") {
        setOptional(readCookieConsent() === true);
        setConfiguring(true);
        setOpen(true);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function choose(value: boolean) {
    const wasEnabled = readCookieConsent() === true;
    try {
      saveCookieConsent(value);
      setOptional(value);
      setOpen(false);
      // Scripts already loaded cannot be unloaded. A fresh page removes them on withdrawal.
      if (wasEnabled && !value) window.location.reload();
    } catch {
      // Keep the dialog open if the browser cannot save the decision.
    }
  }

  if (!open) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Preferências de cookies da Valutin"
      className="fixed bottom-3 left-3 z-[400] flex max-h-[min(760px,calc(100dvh-24px))] w-[min(480px,calc(100vw-24px))] flex-col overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-[0_14px_45px_#17233b35] sm:bottom-5 sm:left-5"
    >
      <div className="overflow-y-auto px-5 pb-5 pt-6 sm:px-7">
        <div className="flex items-start justify-between gap-5">
          <h2 className="max-w-[290px] font-playfair text-[23px] leading-[1.17] text-[#213448] sm:text-[26px]">
            Sua experiência, suas escolhas
          </h2>
          <Image src="/logo-valutin.png" alt="Valutin" width={1024} height={295} sizes="88px" className="mt-1 h-auto w-[88px] shrink-0" />
        </div>
        <p className="mt-4 font-poppins text-[12px] leading-[1.65] text-[#3f4d5d]">
          Usamos armazenamento necessário para manter o atendimento e a navegação. Com sua autorização, também ativamos ferramentas de análise e personalização para entender o uso do site e melhorar nossas campanhas. Você pode recusar as ferramentas opcionais sem perder o acesso ao catálogo.
        </p>
        <Link href="/politica-de-cookies" className="mt-3 inline-block font-poppins text-[12px] text-[#32506d] underline underline-offset-2 hover:text-[#152b43]">
          Ler a Política de Cookies
        </Link>

        {configuring && (
          <div className="mt-5 space-y-3" aria-label="Configuração de cookies">
            <div className="rounded-lg border border-[#dce3e9] bg-[#f8fafb] px-4 py-3">
              <div className="flex items-center justify-between gap-4"><strong className="font-poppins text-[12px] font-medium text-[#213448]">Funcionamento do site</strong><span className="font-poppins text-[11px] text-[#5c6c7b]">Sempre ativo</span></div>
              <p className="mt-1 font-poppins text-[11px] leading-relaxed text-[#5c6c7b]">Preferência de cookies, continuidade do atendimento e segurança.</p>
            </div>
            <label className="flex cursor-pointer gap-3 rounded-lg border border-[#dce3e9] px-4 py-3">
              <input type="checkbox" checked={optional} onChange={(event) => setOptional(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#32506d]" />
              <span><strong className="block font-poppins text-[12px] font-medium text-[#213448]">Análise e personalização</strong><span className="mt-1 block font-poppins text-[11px] leading-relaxed text-[#5c6c7b]">Ativa o Google Tag Manager e as ferramentas opcionais configuradas nesse contêiner. No momento, essas finalidades são escolhidas juntas.</span></span>
            </label>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 border-t border-[#e4e8ed] bg-white font-poppins text-[11px] font-medium text-[#213448] sm:text-[12px]">
        <button type="button" onClick={() => choose(false)} className="min-h-[53px] px-2 py-3 transition hover:bg-[#f3f6f8] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#32506d]">Recusar opcionais</button>
        <button type="button" onClick={() => configuring ? choose(optional) : setConfiguring(true)} className="min-h-[53px] border-x border-[#e4e8ed] px-2 py-3 transition hover:bg-[#f3f6f8] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#32506d]">{configuring ? "Salvar escolhas" : "Configurar"}</button>
        <button type="button" onClick={() => choose(true)} className="min-h-[53px] px-2 py-3 transition hover:bg-[#f3f6f8] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#32506d]">Aceitar opcionais</button>
      </div>
    </aside>
  );
}
