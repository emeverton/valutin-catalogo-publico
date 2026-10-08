"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { LOGO_SRC } from "@/app/lib/constants";
import "../dashboard/dashboard.css";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Senha inválida");
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Falha de conexão");
      setLoading(false);
    }
  }

  return (
    <main className="dash-paper flex min-h-screen items-center justify-center px-5 py-14 font-poppins text-ink">
      <div className="dash-surface w-full max-w-md p-8 shadow-sm sm:p-10">
        <Image
          src={LOGO_SRC}
          alt="Valutin"
          width={160}
          height={50}
          className="h-11 w-auto object-contain"
          priority
        />
        <p className="mt-10 text-[11px] uppercase tracking-[0.18em] text-brand-strong">
          Acesso da equipe
        </p>
        <h1 className="mt-3 font-playfair text-4xl text-ink">Painel de performance</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/65">
          Acompanhe os resultados da Valutin. O editor de produtos utiliza outro acesso.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block text-xs font-medium" htmlFor="password">
            Senha do painel
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-12 w-full border border-ink/25 bg-white px-4 outline-none focus:border-brand-strong"
            placeholder="••••••••"
          />
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={loading || !password}
            className="min-h-12 w-full bg-brand-strong px-5 text-sm text-white transition hover:bg-[#415873] disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar no painel"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="dash-paper min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}
