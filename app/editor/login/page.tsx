"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LOGO_SRC } from "../../lib/constants";

export default function EditorLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/editor/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) throw new Error("Senha inválida ou editor não configurado");
      router.replace("/editor");
      router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha no acesso"); setBusy(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f8f7f5] px-5 py-14 font-poppins text-ink">
    <div className="w-full max-w-md border border-ink/10 bg-white p-8 shadow-sm sm:p-10">
      <Image src={LOGO_SRC} alt="Valutin" width={160} height={50} priority className="h-11 w-auto" />
      <p className="mt-10 text-[11px] uppercase tracking-[0.18em] text-brand-strong">Acesso da equipe</p>
      <h1 className="mt-3 font-playfair text-4xl">Editor da página</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/65">Edite a coleção em rascunho e publique quando estiver pronta. O painel de métricas usa outro acesso.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-xs font-medium" htmlFor="editor-password">Senha de edição</label>
        <input id="editor-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full border border-ink/25 px-4 outline-none focus:border-brand-strong" />
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy || !password} className="min-h-12 w-full bg-brand-strong px-5 text-sm text-white disabled:opacity-50">{busy ? "Entrando…" : "Entrar no editor"}</button>
      </form>
    </div>
  </main>;
}
