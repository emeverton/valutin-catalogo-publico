"use client";

import Image from "next/image";
import { LOGO_SRC } from "@/app/lib/constants";
import type { DashboardTab, PeriodKey } from "@/app/lib/dashboard/types";

export type NavGroupId = "visao" | "canais" | "studio";

export const NAV_GROUPS: Array<{
  id: NavGroupId;
  label: string;
  tabs: Array<{ id: DashboardTab; label: string }>;
}> = [
  {
    id: "visao",
    label: "Visão",
    tabs: [
      { id: "geral", label: "Geral" },
      { id: "insights", label: "Insights" },
    ],
  },
  {
    id: "canais",
    label: "Canais",
    tabs: [
      { id: "meta", label: "Meta" },
      { id: "google", label: "Google" },
      { id: "ga4", label: "GA4" },
      { id: "kommo", label: "Kommo" },
      { id: "instagram", label: "Marca" },
      { id: "youtube", label: "YouTube" },
      { id: "gmb", label: "Meu Negócio" },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    tabs: [
      { id: "studio", label: "Studio" },
      { id: "ops", label: "Ops" },
      { id: "metricas", label: "Métricas" },
    ],
  },
];

export function groupForTab(tab: DashboardTab): NavGroupId {
  for (const g of NAV_GROUPS) {
    if (g.tabs.some((t) => t.id === tab)) return g.id;
  }
  return "visao";
}

const PRESETS: Array<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "mtd", label: "Mês" },
  { key: "h2", label: "H2" },
  { key: "custom", label: "Custom" },
];

type CompareMode = "off" | "previous" | "custom";

export function DashShell({
  children,
  freshness,
  loading,
  onRefresh,
  onLogout,
  periodKey,
  setPeriodKey,
  customSince,
  setCustomSince,
  customUntil,
  setCustomUntil,
  compareMode,
  setCompareMode,
  compareSince,
  setCompareSince,
  compareUntil,
  setCompareUntil,
  periodLabel,
  compareLabel,
  tab,
  setTab,
  navGroup,
  setNavGroup,
}: {
  children: React.ReactNode;
  freshness: string;
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  periodKey: PeriodKey;
  setPeriodKey: (k: PeriodKey) => void;
  customSince: string;
  setCustomSince: (v: string) => void;
  customUntil: string;
  setCustomUntil: (v: string) => void;
  compareMode: CompareMode;
  setCompareMode: (m: CompareMode) => void;
  compareSince: string;
  setCompareSince: (v: string) => void;
  compareUntil: string;
  setCompareUntil: (v: string) => void;
  periodLabel?: string;
  compareLabel?: string;
  tab: DashboardTab;
  setTab: (t: DashboardTab) => void;
  navGroup: NavGroupId;
  setNavGroup: (g: NavGroupId) => void;
}) {
  const activeGroup = NAV_GROUPS.find((g) => g.id === navGroup) || NAV_GROUPS[0];

  function selectGroup(id: NavGroupId) {
    setNavGroup(id);
    const g = NAV_GROUPS.find((x) => x.id === id);
    if (!g) return;
    if (!g.tabs.some((t) => t.id === tab)) {
      setTab(g.tabs[0].id);
    }
  }

  return (
    <div className="dash-paper relative">
      <div className="relative z-[1]">
        <header className="dash-masthead sticky top-0 z-30">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-5">
              <Image
                src={LOGO_SRC}
                alt="Valutin"
                width={148}
                height={44}
                className="h-9 w-auto object-contain"
                priority
              />
              <div className="hidden h-8 w-px bg-brand-light/50 sm:block" />
              <div className="hidden sm:block">
                <p className="font-playfair text-xl leading-none text-ink">Performance</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-ink/40">
                  Painel executivo · Valutin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-ink/45">
              <span>{loading && !freshness ? "Carregando…" : freshness}</span>
              <button
                type="button"
                onClick={onRefresh}
                className="border border-ink/15 px-3 py-1.5 hover:border-brand hover:text-ink"
              >
                Atualizar
              </button>
              <button type="button" onClick={onLogout} className="hover:text-ink">
                Sair
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-[1180px] space-y-4 px-6 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Período</span>
              <div className="dash-segment">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    data-active={periodKey === p.key ? "true" : undefined}
                    onClick={() => setPeriodKey(p.key)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            {periodKey === "custom" ? (
              <div className="flex flex-wrap gap-3">
                <DateField label="De" value={customSince} onChange={setCustomSince} />
                <DateField label="Até" value={customUntil} onChange={setCustomUntil} />
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 border-t border-brand-light/25 pt-3">
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink/40">Comparar</span>
              <div className="dash-segment">
                {(
                  [
                    ["off", "Off"],
                    ["previous", "Anterior"],
                    ["custom", "Custom"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    data-active={
                      compareMode === mode ? (mode === "off" ? "true" : "brand") : undefined
                    }
                    onClick={() => setCompareMode(mode)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {compareMode === "custom" ? (
              <div className="flex flex-wrap gap-3">
                <DateField label="Comparar de" value={compareSince} onChange={setCompareSince} />
                <DateField label="Comparar até" value={compareUntil} onChange={setCompareUntil} />
              </div>
            ) : null}
            {periodLabel ? (
              <p className="text-xs text-ink/50">
                Atual: <span className="text-ink/80">{periodLabel}</span>
                {compareLabel ? (
                  <>
                    {" "}
                    · vs <span className="text-ink/80">{compareLabel}</span>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className="border-t border-brand-light/25">
            <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
              {NAV_GROUPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => selectGroup(g.id)}
                  className={`text-[11px] uppercase tracking-[0.2em] ${
                    navGroup === g.id ? "text-ink" : "text-ink/35 hover:text-ink/65"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <nav className="mx-auto flex max-w-[1180px] gap-0 overflow-x-auto px-6">
              {activeGroup.tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="dash-subtab"
                  data-active={tab === t.id ? "true" : undefined}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-[1180px] px-6 py-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.16em] text-ink/40">
      {label}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block border border-brand-light/40 bg-white/80 px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}
