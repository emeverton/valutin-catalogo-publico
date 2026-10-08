"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardSummary, ProviderStatus } from "@/app/lib/dashboard/types";
import {
  DEFAULT_SEED_GOALS,
  listAutomations,
  listOpsGoals,
  listTimeline,
  newOpsId,
  saveAutomations,
  saveOpsGoals,
  saveTimeline,
  type OpsAutomation,
  type OpsGoal,
  type OpsTimelineEvent,
} from "@/app/lib/dashboard/ops-store";
import { formatBRL, formatNumber, progressPct } from "@/app/lib/dashboard/format";

type OpsSub = "integracoes" | "goals" | "automacoes" | "timeline";

export function OpsTab({ current }: { current: DashboardSummary }) {
  const [sub, setSub] = useState<OpsSub>("integracoes");
  const [goals, setGoals] = useState<OpsGoal[]>([]);
  const [autos, setAutos] = useState<OpsAutomation[]>([]);
  const [events, setEvents] = useState<OpsTimelineEvent[]>([]);

  useEffect(() => {
    let g = listOpsGoals();
    if (!g.length) {
      g = DEFAULT_SEED_GOALS.map((x) => ({ ...x }));
      saveOpsGoals(g);
    }
    // sync currents from live summary
    g = g.map((goal) => {
      if (goal.metric === "leads") return { ...goal, current: current.efficiency.leads };
      if (goal.metric === "sales") return { ...goal, current: current.efficiency.sales };
      if (goal.metric === "followers") {
        return {
          ...goal,
          current: current.instagram.followersDeltaH2 || current.instagram.followers,
        };
      }
      if (goal.metric === "revenue") return { ...goal, current: current.efficiency.revenue };
      return goal;
    });
    setGoals(g);
    saveOpsGoals(g);
    setAutos(listAutomations());
    setEvents(listTimeline());
  }, [current.generatedAt, current.efficiency.leads, current.efficiency.sales, current.efficiency.revenue, current.instagram.followers, current.instagram.followersDeltaH2]);

  const integrations = useMemo(() => buildIntegrations(current), [current]);

  function addGoal() {
    const next: OpsGoal = {
      id: newOpsId("goal"),
      title: "Nova meta",
      metric: "custom",
      target: 100,
      current: 0,
      unit: "count",
      platform: "geral",
    };
    const list = [...goals, next];
    setGoals(list);
    saveOpsGoals(list);
  }

  function updateGoal(id: string, patch: Partial<OpsGoal>) {
    const list = goals.map((g) => (g.id === id ? { ...g, ...patch } : g));
    setGoals(list);
    saveOpsGoals(list);
  }

  function removeGoal(id: string) {
    const list = goals.filter((g) => g.id !== id);
    setGoals(list);
    saveOpsGoals(list);
  }

  function addAuto() {
    const next: OpsAutomation = {
      id: newOpsId("auto"),
      title: "Relatório semanal C-level",
      channel: "email",
      frequency: "weekly",
      platforms: ["meta", "google", "kommo"],
      active: true,
      createdAt: new Date().toISOString(),
    };
    const list = [...autos, next];
    setAutos(list);
    saveAutomations(list);
  }

  function toggleAuto(id: string) {
    const list = autos.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    setAutos(list);
    saveAutomations(list);
  }

  function removeAuto(id: string) {
    const list = autos.filter((a) => a.id !== id);
    setAutos(list);
    saveAutomations(list);
  }

  function addEvent() {
    const next: OpsTimelineEvent = {
      id: newOpsId("evt"),
      title: "Marco operacional",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      category: "ops",
    };
    const list = [next, ...events];
    setEvents(list);
    saveTimeline(list);
  }

  function updateEvent(id: string, patch: Partial<OpsTimelineEvent>) {
    const list = events.map((e) => (e.id === id ? { ...e, ...patch } : e));
    setEvents(list);
    saveTimeline(list);
  }

  function removeEvent(id: string) {
    const list = events.filter((e) => e.id !== id);
    setEvents(list);
    saveTimeline(list);
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Ops</p>
        <h2 className="mt-2 font-playfair text-3xl text-ink md:text-[2.1rem]">Integrações, metas, automações & timeline</h2>
        <div className="mt-4 h-px w-16 bg-brand" />
      </section>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["integracoes", "Integrações"],
            ["goals", "Goals"],
            ["automacoes", "Automações"],
            ["timeline", "Timeline"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSub(id)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] ${
              sub === id ? "bg-ink text-cream" : "text-ink/55 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === "integracoes" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((item) => (
            <div key={item.name} className="dash-surface p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-playfair text-xl">{item.name}</p>
                <Status status={item.status} />
              </div>
              <p className="mt-3 text-sm text-ink/60">{item.detail}</p>
              {item.error ? <p className="mt-3 text-xs text-ink/45">{item.error}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {sub === "goals" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={addGoal} className="border border-ink/15 px-3 py-1.5 text-xs uppercase tracking-[0.12em] hover:border-brand">
              + Meta
            </button>
          </div>
          {goals.map((g) => {
            const pct = progressPct(g.current, g.target);
            return (
              <div key={g.id} className="dash-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <input
                    value={g.title}
                    onChange={(e) => updateGoal(g.id, { title: e.target.value })}
                    className="min-w-[200px] flex-1 border-b border-transparent bg-transparent font-playfair text-xl outline-none focus:border-brand"
                  />
                  <button type="button" onClick={() => removeGoal(g.id)} className="text-[10px] uppercase tracking-[0.14em] text-ink/40 hover:text-ink">
                    Remover
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Field label="Plataforma" value={g.platform} onChange={(v) => updateGoal(g.id, { platform: v })} />
                  <Field label="Métrica" value={g.metric} onChange={(v) => updateGoal(g.id, { metric: v })} />
                  <NumField label="Atual" value={g.current} onChange={(v) => updateGoal(g.id, { current: v })} />
                  <NumField label="Meta" value={g.target} onChange={(v) => updateGoal(g.id, { target: v })} />
                </div>
                <div className="mt-4 h-1.5 w-full bg-brand-light/30">
                  <div className="h-1.5 bg-brand" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-ink/45">
                  {g.unit === "currency" ? formatBRL(g.current) : formatNumber(g.current)} /{" "}
                  {g.unit === "currency" ? formatBRL(g.target) : formatNumber(g.target)} · {pct}%
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {sub === "automacoes" ? (
        <div className="space-y-4">
          <p className="text-sm text-ink/55">
            Configuração local (como Reportei). Webhook opcional para n8n/e-mail — envio real fica para o próximo passo.
          </p>
          <div className="flex justify-end">
            <button type="button" onClick={addAuto} className="border border-ink/15 px-3 py-1.5 text-xs uppercase tracking-[0.12em] hover:border-brand">
              + Automação
            </button>
          </div>
          {autos.map((a) => (
            <div key={a.id} className="dash-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                  value={a.title}
                  onChange={(e) => {
                    const list = autos.map((x) => (x.id === a.id ? { ...x, title: e.target.value } : x));
                    setAutos(list);
                    saveAutomations(list);
                  }}
                  className="flex-1 border-b border-transparent bg-transparent font-playfair text-xl outline-none focus:border-brand"
                />
                <button type="button" onClick={() => toggleAuto(a.id)} className="text-xs uppercase tracking-[0.12em] text-ink/55 hover:text-ink">
                  {a.active ? "Ativa" : "Pausada"}
                </button>
                <button type="button" onClick={() => removeAuto(a.id)} className="text-[10px] uppercase tracking-[0.14em] text-ink/40">
                  Remover
                </button>
              </div>
              <p className="mt-3 text-sm text-ink/60">
                {a.channel} · {a.frequency} · {a.platforms.join(", ")}
              </p>
              <input
                placeholder="Webhook URL (opcional)"
                value={a.webhookUrl || ""}
                onChange={(e) => {
                  const list = autos.map((x) => (x.id === a.id ? { ...x, webhookUrl: e.target.value } : x));
                  setAutos(list);
                  saveAutomations(list);
                }}
                className="mt-3 w-full border border-brand-light/35 bg-white/80 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
          ))}
          {!autos.length ? <p className="text-sm text-ink/40">Nenhuma automação ainda.</p> : null}
        </div>
      ) : null}

      {sub === "timeline" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={addEvent} className="border border-ink/15 px-3 py-1.5 text-xs uppercase tracking-[0.12em] hover:border-brand">
              + Evento
            </button>
          </div>
          {events.map((ev) => (
            <div key={ev.id} className="dash-surface p-5">
              <div className="flex flex-wrap gap-3">
                <input
                  type="date"
                  value={ev.date}
                  onChange={(e) => updateEvent(ev.id, { date: e.target.value })}
                  className="border border-brand-light/35 bg-white/80 px-3 py-2 text-sm"
                />
                <select
                  value={ev.category}
                  onChange={(e) => updateEvent(ev.id, { category: e.target.value as OpsTimelineEvent["category"] })}
                  className="border border-brand-light/35 bg-white/80 px-3 py-2 text-sm"
                >
                  <option value="campanha">Campanha</option>
                  <option value="loja">Loja</option>
                  <option value="criativo">Criativo</option>
                  <option value="ops">Ops</option>
                  <option value="milestone">Milestone</option>
                </select>
                <button type="button" onClick={() => removeEvent(ev.id)} className="text-[10px] uppercase tracking-[0.14em] text-ink/40">
                  Remover
                </button>
              </div>
              <input
                value={ev.title}
                onChange={(e) => updateEvent(ev.id, { title: e.target.value })}
                className="mt-3 w-full border-b border-transparent bg-transparent font-playfair text-xl outline-none focus:border-brand"
              />
              <textarea
                value={ev.description}
                onChange={(e) => updateEvent(ev.id, { description: e.target.value })}
                rows={2}
                placeholder="Descrição"
                className="mt-2 w-full border border-brand-light/30 bg-white/70 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
          ))}
          {!events.length ? <p className="text-sm text-ink/40">Timeline vazia — registre marcos H2, coleções e go-lives.</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function buildIntegrations(s: DashboardSummary) {
  const row = (name: string, status: ProviderStatus, detail: string, error?: string) => ({
    name,
    status,
    detail,
    error,
  });
  return [
    row("Meta Ads", s.meta.status, `${formatBRL(s.meta.spend)} no período`, s.meta.error),
    row("Google Ads", s.google.status, `${formatBRL(s.google.spend)} · ${formatNumber(s.google.conversions)} conv.`, s.google.error),
    row("GA4", s.ga4.status, `${formatNumber(s.ga4.sessions)} sessões`, s.ga4.error),
    row("Kommo", s.kommo.status, `${formatNumber(s.kommo.newLeads)} leads · ${formatNumber(s.kommo.sales)} vendas`, s.kommo.error),
    row(
      "Instagram / Page",
      s.instagram.status,
      `${formatNumber(s.instagram.followers)} seguidores · ${s.instagram.source === "reportei" ? "Reportei" : "Meta"}`,
      s.instagram.error
    ),
    row("YouTube", s.youtube.status, `${s.youtube.title || "Canal"} · ${formatNumber(s.youtube.viewsLifetime)} views`, s.youtube.error),
    row("Google Meu Negócio", s.gmb.status, s.gmb.title || "Perfil da loja", s.gmb.error),
  ];
}

function Status({ status }: { status: string }) {
  const label = status === "ok" ? "live" : status === "partial" ? "parcial" : "off";
  return <span className="text-[10px] uppercase tracking-[0.18em] text-ink/40">{label}</span>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.14em] text-ink/40">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full border border-brand-light/35 bg-white/80 px-3 py-2 text-sm normal-case tracking-normal outline-none focus:border-brand"
      />
    </label>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.14em] text-ink/40">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 block w-full border border-brand-light/35 bg-white/80 px-3 py-2 text-sm normal-case tracking-normal outline-none focus:border-brand"
      />
    </label>
  );
}
