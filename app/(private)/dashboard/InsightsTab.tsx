"use client";

import { useEffect, useState } from "react";
import type { AiAnalysisResult, DashboardSummary } from "@/app/lib/dashboard/types";
import { formatBRL, formatNumber, formatPct } from "@/app/lib/dashboard/format";

export function InsightsTab({
  current,
  compare,
}: {
  current: DashboardSummary;
  compare: DashboardSummary | null;
}) {
  const [ai, setAi] = useState<AiAnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function runAi() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: ["meta", "google", "ga4", "kommo", "instagram", "youtube", "gmb"],
          period: current.period.key,
          since: current.period.since,
          until: current.period.until,
          compare: compare ? "previous" : "off",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { analysis: AiAnalysisResult };
      setAi(json.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na análise");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void runAi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.generatedAt]);

  const channels = buildChannelBreakdown(current);

  const topContent = [
    ...current.instagram.recentMedia.slice(0, 5).map((m) => ({
      channel: "Instagram",
      title: m.caption || m.id,
      metric: `${formatNumber(m.likeCount)} likes`,
      href: m.permalink,
    })),
    ...current.youtube.recentVideos.slice(0, 5).map((v) => ({
      channel: "YouTube",
      title: v.title,
      metric: `${formatNumber(v.views)} views`,
      href: v.url,
    })),
  ];

  return (
    <div className="space-y-12">
      <section>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Insights</p>
        <h2 className="mt-2 font-playfair text-3xl text-ink md:text-[2.1rem]">Performance & oportunidade</h2>
        <div className="mt-4 h-px w-16 bg-brand" />
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/55">
          Resumo multi-canal, opportunity score, top conteúdo e breakdown.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          label="Opportunity score"
          value={ai ? String(ai.opportunityScore) : busy ? "…" : "—"}
          hint="/100"
        />
        <ScoreCard label="Investimento" value={formatBRL(current.efficiency.spendTotal)} hint="Meta + Google" />
        <ScoreCard label="Leads" value={formatNumber(current.efficiency.leads)} hint={`CPL ${formatBRL(current.efficiency.cpl)}`} />
        <ScoreCard label="Receita CRM" value={formatBRL(current.efficiency.revenue)} hint={`${formatNumber(current.efficiency.sales)} vendas`} />
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Channel breakdown</p>
        <div className="mt-4 overflow-x-auto dash-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-light/30 text-[10px] uppercase tracking-[0.12em] text-ink/40">
                <th className="px-3 py-2">Canal</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">KPI principal</th>
                <th className="px-3 py-2">Secundário</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.name} className="border-b border-brand-light/15">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-ink/50">{c.status}</td>
                  <td className="px-3 py-2">{c.primary}</td>
                  <td className="px-3 py-2 text-ink/60">{c.secondary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Top conteúdo</p>
          <ul className="mt-4 dash-surface">
            {topContent.map((item, i) => (
              <li key={i} className="flex justify-between gap-3 border-b border-brand-light/20 px-4 py-3 text-sm last:border-0">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-ink/40">{item.channel}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="mt-1 block truncate hover:underline">
                      {item.title}
                    </a>
                  ) : (
                    <p className="mt-1 truncate">{item.title}</p>
                  )}
                </div>
                <span className="shrink-0 tabular-nums text-ink/60">{item.metric}</span>
              </li>
            ))}
            {!topContent.length ? (
              <li className="px-4 py-3 text-sm text-ink/40">Sem posts/vídeos no recorte</li>
            ) : null}
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Audience / marca</p>
          <div className="mt-4 grid gap-3">
            <InsightRow label="Seguidores (Page/IG)" value={formatNumber(current.instagram.followers)} />
            <InsightRow label="Alcance IG" value={formatNumber(current.instagram.reach)} />
            <InsightRow label="YT inscritos" value={formatNumber(current.youtube.subscribers)} />
            <InsightRow label="YT views lifetime" value={formatNumber(current.youtube.viewsLifetime)} />
            <InsightRow
              label="GMB rating"
              value={current.gmb.rating == null ? "—" : `${current.gmb.rating.toFixed(1)} · ${formatNumber(current.gmb.reviewCount)} reviews`}
            />
            <InsightRow label="GMB impressões" value={formatNumber(current.gmb.impressions || 0)} />
            <InsightRow
              label="Bounce GA4"
              value={current.ga4.bounceRate == null ? "—" : formatPct(current.ga4.bounceRate, 1)}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">AI Analysis</p>
          <button
            type="button"
            onClick={() => void runAi()}
            disabled={busy}
            className="border border-ink/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] hover:border-brand disabled:opacity-50"
          >
            {busy ? "Analisando…" : "Atualizar análise"}
          </button>
        </div>
        {error ? <p className="mb-3 text-sm text-red-800">{error}</p> : null}
        {ai ? (
          <div className="space-y-6 dash-surface p-6">
            <p className="font-playfair text-2xl text-ink">{ai.executiveSummary}</p>
            <div className="grid gap-6 md:grid-cols-2">
              <BulletList title="Highlights" items={ai.highlights} />
              <BulletList title="Riscos" items={ai.risks} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Recomendações</p>
              <ul className="mt-3 space-y-2">
                {ai.recommendations.map((r, i) => (
                  <li key={i} className="border-b border-brand-light/20 pb-2 text-sm last:border-0">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-ink/40">
                      {r.priority} · {r.channel}
                    </span>
                    <p className="mt-1 text-ink/75">{r.action}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Notas por canal</p>
              <ul className="mt-3 space-y-2">
                {ai.channelNotes.map((n, i) => (
                  <li key={i} className="text-sm">
                    <strong>{n.channel}</strong> · {n.verdict} — {n.detail}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink/35">Modelo {ai.model}</p>
          </div>
        ) : (
          <p className="text-sm text-ink/45">{busy ? "Gerando análise…" : "Sem análise"}</p>
        )}
      </section>
    </div>
  );
}

function buildChannelBreakdown(s: DashboardSummary) {
  return [
    {
      name: "Meta Ads",
      status: s.meta.status,
      primary: formatBRL(s.meta.spend),
      secondary: `${formatNumber(s.meta.entities.filter((e) => e.level === "campaign").length)} campanhas`,
    },
    {
      name: "Google Ads",
      status: s.google.status,
      primary: formatBRL(s.google.spend),
      secondary: `${formatNumber(s.google.conversions)} conversões`,
    },
    {
      name: "GA4",
      status: s.ga4.status,
      primary: `${formatNumber(s.ga4.sessions)} sessões`,
      secondary: `${formatNumber(s.ga4.whatsapp)} WhatsApp`,
    },
    {
      name: "Kommo",
      status: s.kommo.status,
      primary: `${formatNumber(s.kommo.newLeads)} leads`,
      secondary: `${formatNumber(s.kommo.sales)} vendas · ${formatBRL(s.kommo.revenue)}`,
    },
    {
      name: "Instagram / Page",
      status: s.instagram.status,
      primary: `${formatNumber(s.instagram.followers)} seguidores`,
      secondary: `${formatNumber(s.instagram.engagement)} interações`,
    },
    {
      name: "YouTube",
      status: s.youtube.status,
      primary: `${formatNumber(s.youtube.viewsLifetime)} views`,
      secondary: `${formatNumber(s.youtube.videoCount)} vídeos · ${formatNumber(s.youtube.subscribers)} inscritos`,
    },
    {
      name: "Google Meu Negócio",
      status: s.gmb.status,
      primary: s.gmb.rating == null ? "—" : `${s.gmb.rating.toFixed(1)}★`,
      secondary: `${formatNumber(s.gmb.impressions || 0)} impressões · ${formatNumber(s.gmb.reviewCount)} reviews`,
    },
  ];
}

function ScoreCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="dash-surface px-5 py-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">{label}</p>
      <p className="mt-3 font-playfair text-2xl text-ink">{value}</p>
      {hint ? <p className="mt-2 text-xs text-ink/45">{hint}</p> : null}
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 dash-surface px-4 py-3 text-sm">
      <span className="text-ink/50">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">{title}</p>
      <ul className="mt-3 space-y-1 text-sm text-ink/70">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
