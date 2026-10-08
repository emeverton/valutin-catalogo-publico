"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  deltaRatio,
  formatBRL,
  formatNumber,
  formatPct,
  formatRoas,
  relativeTime,
} from "@/app/lib/dashboard/format";
import { formatDate } from "@/app/lib/dashboard/periods";
import type {
  DashboardCompareResponse,
  DashboardSummary,
  DashboardTab,
  PeriodKey,
  StudioDocument,
} from "@/app/lib/dashboard/types";
import { HierarchyTable } from "./HierarchyTable";
import { InsightsTab } from "./InsightsTab";
import { MetricsConfigPanel } from "./MetricsConfigPanel";
import { OpsTab } from "./OpsTab";
import { StudioTab } from "./StudioTab";
import { ChannelTile } from "./ui/ChannelTile";
import { DashShell, groupForTab, type NavGroupId } from "./ui/DashShell";
import { DataTable, DataRow, ListCard } from "./ui/DataTable";
import { GoalMeter } from "./ui/GoalMeter";
import { DeltaLine, KpiStat } from "./ui/KpiStat";
import { PlatformShell } from "./ui/PlatformShell";
import { SectionHead } from "./ui/SectionHead";
import "./dashboard.css";

const NOTION_HUB = "https://app.notion.com/p/388968afab6681ce97a8e79f0e1ff0fb";
type CompareMode = "off" | "previous" | "custom";

function todayIso(): string {
  return formatDate(new Date());
}
function monthStartIso(): string {
  const d = new Date();
  return formatDate(new Date(d.getFullYear(), d.getMonth(), 1));
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function DashboardClient() {
  const [tab, setTab] = useState<DashboardTab>("geral");
  const [navGroup, setNavGroup] = useState<NavGroupId>("visao");
  const [periodKey, setPeriodKey] = useState<PeriodKey>("mtd");
  const [customSince, setCustomSince] = useState(monthStartIso);
  const [customUntil, setCustomUntil] = useState(todayIso);
  const [compareMode, setCompareMode] = useState<CompareMode>("previous");
  const [compareSince, setCompareSince] = useState("");
  const [compareUntil, setCompareUntil] = useState("");
  const [payload, setPayload] = useState<DashboardCompareResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (fresh = false) => {
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams();
        if (periodKey === "custom") {
          qs.set("since", customSince);
          qs.set("until", customUntil);
        } else {
          qs.set("period", periodKey);
        }
        if (compareMode !== "off") {
          qs.set("compare", compareMode === "custom" ? "1" : "previous");
          if (compareMode === "custom" && compareSince && compareUntil) {
            qs.set("compareSince", compareSince);
            qs.set("compareUntil", compareUntil);
          }
        }
        if (fresh) qs.set("fresh", "1");
        const res = await fetch(`/api/dashboard/summary?${qs.toString()}`, { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/login?next=/dashboard";
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setPayload((await res.json()) as DashboardCompareResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao carregar");
      } finally {
        setLoading(false);
      }
    },
    [periodKey, customSince, customUntil, compareMode, compareSince, compareUntil]
  );

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  function applyStudioDashboard(doc: StudioDocument) {
    setPeriodKey(doc.periodKey);
    if (doc.periodKey === "custom" && doc.customSince && doc.customUntil) {
      setCustomSince(doc.customSince);
      setCustomUntil(doc.customUntil);
    }
    setCompareMode(doc.compareMode);
    if (doc.compareMode === "custom" && doc.compareSince && doc.compareUntil) {
      setCompareSince(doc.compareSince);
      setCompareUntil(doc.compareUntil);
    }
    setTab("geral");
    setNavGroup("visao");
  }

  function handleSetTab(t: DashboardTab) {
    setTab(t);
    setNavGroup(groupForTab(t));
  }

  const current = payload?.current || null;
  const compare = payload?.compare || null;
  const freshness = current ? `Atualizado ${relativeTime(current.generatedAt)}` : "";

  return (
    <DashShell
      freshness={freshness}
      loading={loading}
      onRefresh={() => void load(true)}
      onLogout={() => void logout()}
      periodKey={periodKey}
      setPeriodKey={setPeriodKey}
      customSince={customSince}
      setCustomSince={setCustomSince}
      customUntil={customUntil}
      setCustomUntil={setCustomUntil}
      compareMode={compareMode}
      setCompareMode={setCompareMode}
      compareSince={compareSince}
      setCompareSince={setCompareSince}
      compareUntil={compareUntil}
      setCompareUntil={setCompareUntil}
      periodLabel={current?.period.label}
      compareLabel={compare?.period.label}
      tab={tab}
      setTab={handleSetTab}
      navGroup={navGroup}
      setNavGroup={setNavGroup}
    >
      {error ? (
        <p className="mb-6 border border-red-200 bg-white/80 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}
      {!current && loading ? (
        <p className="font-playfair text-2xl text-ink/35">Carregando…</p>
      ) : null}

      {current ? (
        <>
          {tab === "geral" ? (
            <GeralTab current={current} compare={compare} onOpenTab={handleSetTab} />
          ) : null}
          {tab === "meta" ? <MetaTab current={current} compare={compare} /> : null}
          {tab === "google" ? <GoogleTab current={current} compare={compare} /> : null}
          {tab === "ga4" ? <Ga4Tab current={current} compare={compare} /> : null}
          {tab === "kommo" ? <KommoTab current={current} compare={compare} /> : null}
          {tab === "instagram" ? <BrandTab current={current} compare={compare} /> : null}
          {tab === "youtube" ? <YouTubeTab current={current} compare={compare} /> : null}
          {tab === "gmb" ? <GmbTab current={current} compare={compare} /> : null}
          {tab === "insights" ? <InsightsTab current={current} compare={compare} /> : null}
          {tab === "studio" ? (
            <StudioTab current={current} compare={compare} onApplyDashboard={applyStudioDashboard} />
          ) : null}
          {tab === "ops" ? <OpsTab current={current} /> : null}
          {tab === "metricas" ? <MetricsConfigPanel /> : null}
          <footer className="mt-14 border-t border-brand-light/30 pt-6 pb-16 text-sm text-ink/45">
            <p>Editorial atelier · mídia · GA4 · Kommo · YouTube · GMB · lag 5–15 min.</p>
            <a
              href={NOTION_HUB}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-brand hover:underline"
            >
              Hub Notion Valutin
            </a>
          </footer>
        </>
      ) : null}
    </DashShell>
  );
}

function GeralTab({
  current,
  compare,
  onOpenTab,
}: {
  current: DashboardSummary;
  compare: DashboardSummary | null;
  onOpenTab: (t: DashboardTab) => void;
}) {
  const c = current.efficiency;
  const p = compare?.efficiency;

  return (
    <motion.div className="space-y-14" variants={stagger} initial="hidden" animate="show">
      <motion.section variants={fadeUp}>
        <SectionHead eyebrow="Visão executiva" title="Dashboard geral" />
        <p className="max-w-xl text-sm leading-relaxed text-ink/55">
          Scorecard H2 e eficiência do período — leitura executiva da Valutin.
        </p>
      </motion.section>

      <motion.section variants={fadeUp}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Metas H2</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <GoalMeter
            title={current.goals.leads.label}
            current={current.goals.leads.current}
            target={current.goals.leads.target}
            previous={compare?.goals.leads.current}
          />
          <GoalMeter
            title={current.goals.sales.label}
            current={current.goals.sales.current}
            target={current.goals.sales.target}
            previous={compare?.goals.sales.current}
          />
          <GoalMeter
            title={current.goals.followers.label}
            current={current.goals.followers.current}
            target={current.goals.followers.target}
            previous={compare?.goals.followers.current}
          />
        </div>
      </motion.section>

      <motion.section variants={fadeUp}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Eficiência</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiStat
            label="Investimento"
            value={formatBRL(c.spendTotal)}
            previous={p ? formatBRL(p.spendTotal) : undefined}
            delta={deltaRatio(c.spendTotal, p?.spendTotal)}
            hint={`Meta ${formatBRL(c.spendMeta)} · Google ${formatBRL(c.spendGoogle)}`}
            invertDelta
            large
          />
          <KpiStat
            label="CPL"
            value={formatBRL(c.cpl)}
            previous={p ? formatBRL(p.cpl) : undefined}
            delta={deltaRatio(c.cpl, p?.cpl)}
            invertDelta
            large
          />
          <KpiStat
            label="CPA"
            value={formatBRL(c.cpa)}
            previous={p ? formatBRL(p.cpa) : undefined}
            delta={deltaRatio(c.cpa, p?.cpa)}
            invertDelta
            large
          />
          <KpiStat
            label="ROAS"
            value={formatRoas(c.roas)}
            previous={p ? formatRoas(p.roas) : undefined}
            delta={deltaRatio(c.roas, p?.roas)}
            large
          />
        </div>
      </motion.section>

      {current.meta.funnel.length ? (
        <motion.section variants={fadeUp}>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Funil Meta · 40 / 35 / 25</p>
          <div className="dash-surface mt-5 space-y-5 px-5 py-6">
            {current.meta.funnel.map((layer) => {
              const drift = layer.share - layer.targetShare;
              return (
                <div key={layer.key}>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink/45">{layer.label}</p>
                    <p className="text-sm tabular-nums text-ink/70">
                      {formatBRL(layer.spend)} · {formatPct(layer.share)}{" "}
                      <span className="text-ink/40">alvo {formatPct(layer.targetShare)}</span>
                    </p>
                  </div>
                  <div className="relative h-1 w-full bg-brand-light/30">
                    <div
                      className="absolute inset-y-0 left-0 bg-brand-light/60"
                      style={{ width: `${Math.min(100, layer.targetShare * 100)}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-brand"
                      style={{ width: `${Math.min(100, layer.share * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink/40">
                    {formatNumber(layer.results)} {layer.resultsLabel}
                    {" · "}
                    desvio {drift >= 0 ? "+" : ""}
                    {formatPct(drift, 1)}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.section>
      ) : null}

      <motion.section variants={fadeUp}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Canais</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ChannelTile
            name="Meta"
            status={current.meta.status}
            primary={formatBRL(current.meta.spend)}
            primaryLabel="Spend"
            secondary={formatNumber(current.meta.entities.filter((e) => e.level === "ad").length)}
            secondaryLabel="anúncios"
            onClick={() => onOpenTab("meta")}
          />
          <ChannelTile
            name="Google"
            status={current.google.status}
            primary={formatBRL(current.google.spend)}
            primaryLabel="Spend"
            secondary={formatNumber(current.google.conversions)}
            secondaryLabel="conversões"
            onClick={() => onOpenTab("google")}
          />
          <ChannelTile
            name="GA4"
            status={current.ga4.status}
            primary={formatNumber(current.ga4.sessions)}
            primaryLabel="Sessões"
            secondary={formatNumber(current.ga4.whatsapp)}
            secondaryLabel="WhatsApp"
            onClick={() => onOpenTab("ga4")}
          />
          <ChannelTile
            name="Kommo"
            status={current.kommo.status}
            primary={formatNumber(current.kommo.newLeads)}
            primaryLabel="Leads"
            secondary={formatNumber(current.kommo.sales)}
            secondaryLabel="vendas"
            onClick={() => onOpenTab("kommo")}
          />
          <ChannelTile
            name="Marca"
            status={current.instagram.status}
            primary={formatNumber(current.instagram.followers)}
            primaryLabel="Seguidores"
            secondary={formatNumber(current.instagram.engagement)}
            secondaryLabel="interações"
            onClick={() => onOpenTab("instagram")}
          />
          <ChannelTile
            name="YouTube"
            status={current.youtube.status}
            primary={formatNumber(current.youtube.viewsLifetime)}
            primaryLabel="Views"
            secondary={formatNumber(current.youtube.videoCount)}
            secondaryLabel="vídeos"
            onClick={() => onOpenTab("youtube")}
          />
          <ChannelTile
            name="Meu Negócio"
            status={current.gmb.status}
            primary={current.gmb.rating == null ? "—" : `${current.gmb.rating.toFixed(1)}★`}
            primaryLabel="Rating"
            secondary={formatNumber(current.gmb.reviewCount)}
            secondaryLabel="reviews"
            onClick={() => onOpenTab("gmb")}
          />
        </div>
      </motion.section>

      {current.notes.length ? (
        <motion.section variants={fadeUp} className="border-t border-brand-light/30 pt-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Notas</p>
          <ul className="mt-3 space-y-1 text-sm text-ink/55">
            {current.notes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </motion.section>
      ) : null}
    </motion.div>
  );
}

function MetaTab({ current, compare }: { current: DashboardSummary; compare: DashboardSummary | null }) {
  const m = current.meta;
  const p = compare?.meta;
  return (
    <PlatformShell title="Meta Ads" status={m.status} error={m.error} subtitle="Campanhas · conjuntos · anúncios · funil 40/35/25">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiStat label="Spend" value={formatBRL(m.spend)} previous={p ? formatBRL(p.spend) : undefined} delta={deltaRatio(m.spend, p?.spend)} invertDelta />
        <KpiStat label="Impressões" value={formatNumber(m.impressions)} previous={p ? formatNumber(p.impressions) : undefined} delta={deltaRatio(m.impressions, p?.impressions)} />
        <KpiStat label="Alcance" value={formatNumber(m.reach)} previous={p ? formatNumber(p.reach) : undefined} delta={deltaRatio(m.reach, p?.reach)} />
        <KpiStat label="Cliques" value={formatNumber(m.clicks)} previous={p ? formatNumber(p.clicks) : undefined} delta={deltaRatio(m.clicks, p?.clicks)} />
        <KpiStat label="Entidades" value={formatNumber(m.entities.length)} hint={`${m.entities.filter((e) => e.level === "campaign").length} camp · ${m.entities.filter((e) => e.level === "adset").length} conj · ${m.entities.filter((e) => e.level === "ad").length} ads`} />
      </div>
      <div className="mt-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Funil</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {m.funnel.map((layer, i) => {
            const prev = p?.funnel[i];
            const delta = layer.share - layer.targetShare;
            return (
              <div key={layer.key} className="dash-surface p-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/45">{layer.label}</p>
                <p className="mt-4 font-playfair text-3xl tabular-nums">{formatBRL(layer.spend)}</p>
                <DeltaLine ratio={deltaRatio(layer.spend, prev?.spend)} invert />
                <p className="mt-2 text-sm text-ink/60">
                  {formatPct(layer.share)} · alvo {formatPct(layer.targetShare)}
                </p>
                <p className="mt-1 text-xs text-ink/45">
                  desvio {delta >= 0 ? "+" : ""}
                  {formatPct(delta, 1)}
                </p>
                <p className="mt-4 text-sm">
                  {formatNumber(layer.results)} {layer.resultsLabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-10">
        <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink/40">Hierarquia completa</p>
        <HierarchyTable entities={m.entities} channel="meta" />
      </div>
    </PlatformShell>
  );
}

function GoogleTab({ current, compare }: { current: DashboardSummary; compare: DashboardSummary | null }) {
  const g = current.google;
  const p = compare?.google;
  return (
    <PlatformShell title="Google Ads" status={g.status} error={g.error} subtitle="Campanhas · ad groups · anúncios">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiStat label="Spend" value={formatBRL(g.spend)} previous={p ? formatBRL(p.spend) : undefined} delta={deltaRatio(g.spend, p?.spend)} invertDelta />
        <KpiStat label="Impressões" value={formatNumber(g.impressions)} previous={p ? formatNumber(p.impressions) : undefined} delta={deltaRatio(g.impressions, p?.impressions)} />
        <KpiStat label="Cliques" value={formatNumber(g.clicks)} previous={p ? formatNumber(p.clicks) : undefined} delta={deltaRatio(g.clicks, p?.clicks)} />
        <KpiStat label="Conversões" value={formatNumber(g.conversions)} previous={p ? formatNumber(p.conversions) : undefined} delta={deltaRatio(g.conversions, p?.conversions)} />
        <KpiStat label="Entidades" value={formatNumber(g.entities.length)} hint={`${g.entities.filter((e) => e.level === "campaign").length} camp · ${g.entities.filter((e) => e.level === "adset").length} groups · ${g.entities.filter((e) => e.level === "ad").length} ads`} />
      </div>
      <div className="mt-10">
        <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink/40">Hierarquia completa</p>
        <HierarchyTable entities={g.entities} channel="google" />
      </div>
    </PlatformShell>
  );
}

function Ga4Tab({ current, compare }: { current: DashboardSummary; compare: DashboardSummary | null }) {
  const g = current.ga4;
  const p = compare?.ga4;
  return (
    <PlatformShell title="Google Analytics 4" status={g.status} error={g.error} subtitle="Sessões · eventos · páginas · fontes">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat label="Sessões" value={formatNumber(g.sessions)} previous={p ? formatNumber(p.sessions) : undefined} delta={deltaRatio(g.sessions, p?.sessions)} />
        <KpiStat label="Engajadas" value={formatNumber(g.engagedSessions)} previous={p ? formatNumber(p.engagedSessions) : undefined} delta={deltaRatio(g.engagedSessions, p?.engagedSessions)} />
        <KpiStat label="WhatsApp" value={formatNumber(g.whatsapp)} previous={p ? formatNumber(p.whatsapp) : undefined} delta={deltaRatio(g.whatsapp, p?.whatsapp)} />
        <KpiStat label="generate_lead" value={formatNumber(g.generateLead)} previous={p ? formatNumber(p.generateLead) : undefined} delta={deltaRatio(g.generateLead, p?.generateLead)} />
        <KpiStat label="proposal" value={formatNumber(g.proposal)} />
        <KpiStat label="purchase" value={formatNumber(g.purchase)} previous={p ? formatNumber(p.purchase) : undefined} delta={deltaRatio(g.purchase, p?.purchase)} />
        <KpiStat label="Bounce rate" value={g.bounceRate == null ? "—" : formatPct(g.bounceRate, 1)} />
        <KpiStat label="Duração média" value={g.avgSessionDuration == null ? "—" : `${Math.round(g.avgSessionDuration)}s`} />
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <ListCard title="Top fontes" rows={g.topSources.map((s) => ({ left: `${s.source} / ${s.medium}`, right: formatNumber(s.sessions) }))} />
        <ListCard title="Top páginas" rows={g.topPages.map((s) => ({ left: s.page, right: formatNumber(s.views) }))} />
        <ListCard title="Eventos" rows={g.events.map((s) => ({ left: s.name, right: formatNumber(s.count) }))} />
      </div>
    </PlatformShell>
  );
}

function KommoTab({ current, compare }: { current: DashboardSummary; compare: DashboardSummary | null }) {
  const k = current.kommo;
  const p = compare?.kommo;
  return (
    <PlatformShell title="Kommo" status={k.status} error={k.error} subtitle="Pipeline · leads · vendas · receita">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiStat label="Novos leads" value={formatNumber(k.newLeads)} previous={p ? formatNumber(p.newLeads) : undefined} delta={deltaRatio(k.newLeads, p?.newLeads)} />
        <KpiStat label="Vendas" value={formatNumber(k.sales)} previous={p ? formatNumber(p.sales) : undefined} delta={deltaRatio(k.sales, p?.sales)} />
        <KpiStat label="Receita" value={formatBRL(k.revenue)} previous={p ? formatBRL(p.revenue) : undefined} delta={deltaRatio(k.revenue, p?.revenue)} />
        <KpiStat label="Perdidas" value={formatNumber(k.lost)} previous={p ? formatNumber(p.lost) : undefined} delta={deltaRatio(k.lost, p?.lost)} invertDelta />
        <KpiStat label="Ticket médio" value={formatBRL(k.avgTicket)} />
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <ListCard title="Pipeline (snapshot)" rows={k.pipeline.map((s) => ({ left: s.stage, right: formatNumber(s.count) }))} />
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Leads recentes do período</p>
          <div className="mt-4">
            <DataTable headers={["ID", "Nome", "Status", "Valor"]}>
              {k.leads.map((l) => (
                <DataRow key={l.id}>
                  <td className="px-4 py-2 text-ink/50">{l.id}</td>
                  <td className="px-4 py-2">{l.name}</td>
                  <td className="px-4 py-2 text-ink/60">{l.status}</td>
                  <td className="px-4 py-2 tabular-nums">{formatBRL(l.price)}</td>
                </DataRow>
              ))}
            </DataTable>
            {!k.leads.length ? <p className="dash-surface mt-0 px-4 py-4 text-sm text-ink/40">Sem leads listados</p> : null}
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}

function BrandTab({ current, compare }: { current: DashboardSummary; compare: DashboardSummary | null }) {
  const i = current.instagram;
  const p = compare?.instagram;
  return (
    <PlatformShell
      title="Marca & alcance"
      status={i.status}
      error={i.error}
      subtitle={`${i.username ? `@${i.username}` : "Instagram / Page"} · ${i.source === "reportei" ? "Reportei" : "Meta"}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiStat label="Seguidores" value={formatNumber(i.followers)} previous={p ? formatNumber(p.followers) : undefined} delta={deltaRatio(i.followers, p?.followers)} />
        <KpiStat label="+ baseline H2" value={formatNumber(i.followersDeltaH2)} hint="meta +2.100" />
        <KpiStat label="Alcance" value={formatNumber(i.reach)} previous={p ? formatNumber(p.reach) : undefined} delta={deltaRatio(i.reach, p?.reach)} />
        <KpiStat label="Interações" value={formatNumber(i.engagement)} previous={p ? formatNumber(p.engagement) : undefined} delta={deltaRatio(i.engagement, p?.engagement)} />
        <KpiStat label="Mídias" value={formatNumber(i.mediaCount)} />
      </div>
      {i.recentMedia.length ? (
        <div className="mt-10">
          <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink/40">Posts recentes</p>
          <DataTable headers={["Caption", "Likes", "Comentários", "Data"]}>
            {i.recentMedia.map((m) => (
              <DataRow key={m.id}>
                <td className="max-w-md truncate px-4 py-2">
                  {m.permalink ? (
                    <a href={m.permalink} target="_blank" rel="noreferrer" className="hover:underline">
                      {m.caption || m.id}
                    </a>
                  ) : (
                    m.caption || m.id
                  )}
                </td>
                <td className="px-4 py-2 tabular-nums">{formatNumber(m.likeCount)}</td>
                <td className="px-4 py-2 tabular-nums">{formatNumber(m.commentsCount)}</td>
                <td className="px-4 py-2 text-ink/50">{m.timestamp ? m.timestamp.slice(0, 10) : "—"}</td>
              </DataRow>
            ))}
          </DataTable>
        </div>
      ) : null}
    </PlatformShell>
  );
}

function YouTubeTab({ current, compare }: { current: DashboardSummary; compare: DashboardSummary | null }) {
  const y = current.youtube;
  const p = compare?.youtube;
  return (
    <PlatformShell title="YouTube" status={y.status} error={y.error} subtitle={y.title || "Canal Valutin"}>
      <p className="mb-6 max-w-2xl text-xs leading-relaxed text-ink/45">
        Dados públicos do canal. Relatórios privados de audiência e desempenho por período exigem OAuth do proprietário no YouTube Analytics.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiStat label="Inscritos" value={formatNumber(y.subscribers)} previous={p ? formatNumber(p.subscribers) : undefined} delta={deltaRatio(y.subscribers, p?.subscribers)} />
        <KpiStat label="Views lifetime" value={formatNumber(y.viewsLifetime)} previous={p ? formatNumber(p.viewsLifetime) : undefined} delta={deltaRatio(y.viewsLifetime, p?.viewsLifetime)} />
        <KpiStat label="Vídeos" value={formatNumber(y.videoCount)} />
        <KpiStat label="Publicados no período" value={formatNumber(y.periodVideoCount || 0)} />
        <KpiStat label="Channel ID" value={y.channelId ? y.channelId.slice(0, 12) + "…" : "—"} hint={y.customUrl || undefined} />
      </div>
      {y.recentVideos.length ? (
        <div className="mt-10">
          <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink/40">Vídeos recentes</p>
          <DataTable headers={["Título", "Views", "Likes", "Comentários", "Data"]}>
            {y.recentVideos.map((v) => (
              <DataRow key={v.id}>
                <td className="max-w-md truncate px-4 py-2">
                  <a href={v.url} target="_blank" rel="noreferrer" className="hover:underline">
                    {v.title}
                  </a>
                </td>
                <td className="px-4 py-2 tabular-nums">{formatNumber(v.views)}</td>
                <td className="px-4 py-2 tabular-nums">{formatNumber(v.likes)}</td>
                <td className="px-4 py-2 tabular-nums">{formatNumber(v.comments)}</td>
                <td className="px-4 py-2 text-ink/50">{v.publishedAt ? v.publishedAt.slice(0, 10) : "—"}</td>
              </DataRow>
            ))}
          </DataTable>
        </div>
      ) : null}
    </PlatformShell>
  );
}

function GmbTab({ current, compare }: { current: DashboardSummary; compare: DashboardSummary | null }) {
  const g = current.gmb;
  const p = compare?.gmb;
  const impressions = g.impressions || 0;
  const prevImp = p?.impressions || 0;
  return (
    <PlatformShell title="Google Meu Negócio" status={g.status} error={g.error} subtitle={g.address || g.title || "Perfil da loja"}>
      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        {g.mapsUrl ? (
          <a href={g.mapsUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">
            Abrir no Google Maps
          </a>
        ) : null}
        {g.phone ? <span className="text-ink/50">{g.phone}</span> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiStat label="Rating" value={g.rating == null ? "—" : g.rating.toFixed(1)} previous={p?.rating != null ? p.rating.toFixed(1) : undefined} />
        <KpiStat label="Reviews" value={formatNumber(g.reviewCount)} previous={p ? formatNumber(p.reviewCount) : undefined} delta={deltaRatio(g.reviewCount, p?.reviewCount)} />
        <KpiStat label="Impressões" value={formatNumber(impressions)} previous={p ? formatNumber(prevImp) : undefined} delta={deltaRatio(impressions, prevImp || null)} />
        <KpiStat label="Cliques site" value={formatNumber(g.metrics.websiteClicks)} previous={p ? formatNumber(p.metrics.websiteClicks) : undefined} delta={deltaRatio(g.metrics.websiteClicks, p?.metrics.websiteClicks)} />
        <KpiStat label="Pedidos de rota" value={formatNumber(g.metrics.businessDirectionRequests)} previous={p ? formatNumber(p.metrics.businessDirectionRequests) : undefined} delta={deltaRatio(g.metrics.businessDirectionRequests, p?.metrics.businessDirectionRequests)} />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat label="Maps desktop" value={formatNumber(g.metrics.businessImpressionsDesktopMaps)} />
        <KpiStat label="Maps mobile" value={formatNumber(g.metrics.businessImpressionsMobileMaps)} />
        <KpiStat label="Search desktop" value={formatNumber(g.metrics.businessImpressionsDesktopSearch)} />
        <KpiStat label="Search mobile" value={formatNumber(g.metrics.businessImpressionsMobileSearch)} />
      </div>
      {g.reviews.length ? (
        <div className="mt-10">
          <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink/40">Avaliações recentes</p>
          <ul className="dash-surface">
            {g.reviews.map((r) => (
              <li key={r.id} className="border-b border-brand-light/20 px-4 py-3 text-sm last:border-0">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{r.author}</span>
                  <span className="text-ink/50">{"★".repeat(r.stars) || "—"}</span>
                </div>
                {r.comment ? <p className="mt-1 text-ink/65">{r.comment}</p> : null}
                <p className="mt-1 text-[11px] text-ink/40">{r.createdAt ? r.createdAt.slice(0, 10) : ""}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </PlatformShell>
  );
}
