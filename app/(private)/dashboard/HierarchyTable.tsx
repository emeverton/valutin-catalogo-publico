"use client";

import { useMemo, useState } from "react";
import {
  formatBRL,
  formatNumber,
  formatPct,
} from "@/app/lib/dashboard/format";
import type { MediaEntity, MediaMetrics } from "@/app/lib/dashboard/types";

const LEVEL_ORDER = { campaign: 0, adset: 1, ad: 2 } as const;

type ColId =
  | "spend"
  | "impressions"
  | "reach"
  | "clicks"
  | "ctr"
  | "cpc"
  | "cpm"
  | "conversions"
  | "results"
  | "messaging"
  | "link_clicks"
  | "costPerConversion";

const ALL_COLS: Array<{ id: ColId; label: string; metaOnly?: boolean }> = [
  { id: "spend", label: "Spend" },
  { id: "impressions", label: "Impr." },
  { id: "reach", label: "Alcance", metaOnly: true },
  { id: "clicks", label: "Cliques" },
  { id: "ctr", label: "CTR" },
  { id: "cpc", label: "CPC" },
  { id: "cpm", label: "CPM" },
  { id: "conversions", label: "Conv." },
  { id: "results", label: "Result." },
  { id: "messaging", label: "WA", metaOnly: true },
  { id: "link_clicks", label: "Link clk", metaOnly: true },
  { id: "costPerConversion", label: "Custo/conv" },
];

function cell(m: MediaMetrics, id: ColId): string {
  switch (id) {
    case "spend":
      return formatBRL(m.spend);
    case "impressions":
      return formatNumber(m.impressions);
    case "reach":
      return formatNumber(m.reach);
    case "clicks":
      return formatNumber(m.clicks);
    case "ctr":
      return m.ctr == null ? "—" : formatPct(m.ctr, 2);
    case "cpc":
      return formatBRL(m.cpc);
    case "cpm":
      return formatBRL(m.cpm);
    case "conversions":
      return formatNumber(m.conversions);
    case "results":
      return `${formatNumber(m.results)}`;
    case "messaging":
      return formatNumber(m.extras.messaging || 0);
    case "link_clicks":
      return formatNumber(m.extras.link_clicks || 0);
    case "costPerConversion":
      return formatBRL(m.costPerConversion);
    default:
      return "—";
  }
}

export function HierarchyTable({
  entities,
  channel,
  visibleCols,
}: {
  entities: MediaEntity[];
  channel: "meta" | "google";
  visibleCols?: ColId[];
}) {
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedAdsets, setExpandedAdsets] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const cols = useMemo(() => {
    const allowed = visibleCols?.length
      ? ALL_COLS.filter((c) => visibleCols.includes(c.id))
      : ALL_COLS;
    return allowed.filter((c) => !(c.metaOnly && channel === "google"));
  }, [visibleCols, channel]);

  const campaigns = useMemo(
    () =>
      entities
        .filter((e) => e.level === "campaign")
        .filter((e) => statusFilter === "ALL" || e.status === statusFilter)
        .filter((e) => !filter || e.name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => b.metrics.spend - a.metrics.spend),
    [entities, filter, statusFilter]
  );

  const adsetsByCampaign = useMemo(() => {
    const map = new Map<string, MediaEntity[]>();
    for (const e of entities.filter((x) => x.level === "adset")) {
      const key = e.campaignId || e.parentId || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    for (const [, list] of Array.from(map.entries())) {
      list.sort((a, b) => b.metrics.spend - a.metrics.spend);
    }
    return map;
  }, [entities]);

  const adsByAdset = useMemo(() => {
    const map = new Map<string, MediaEntity[]>();
    for (const e of entities.filter((x) => x.level === "ad")) {
      const key = e.adsetId || e.parentId || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    for (const [, list] of Array.from(map.entries())) {
      list.sort((a, b) => b.metrics.spend - a.metrics.spend);
    }
    return map;
  }, [entities]);

  const statuses = useMemo(() => {
    const set = new Set(entities.map((e) => e.status).filter(Boolean));
    return Array.from(set).sort();
  }, [entities]);

  function toggleCamp(id: string) {
    setExpandedCampaigns((s) => ({ ...s, [id]: !s[id] }));
  }
  function toggleAdset(id: string) {
    setExpandedAdsets((s) => ({ ...s, [id]: !s[id] }));
  }

  function expandAll() {
    const c: Record<string, boolean> = {};
    const a: Record<string, boolean> = {};
    for (const camp of campaigns) c[camp.id] = true;
    for (const e of entities.filter((x) => x.level === "adset")) a[e.id] = true;
    setExpandedCampaigns(c);
    setExpandedAdsets(a);
  }

  function collapseAll() {
    setExpandedCampaigns({});
    setExpandedAdsets({});
  }

  if (!entities.length) {
    return <p className="text-sm text-ink/40">Sem entidades no período</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar por nome…"
          className="border border-brand-light/40 bg-white/80 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-brand-light/40 bg-white/80 px-3 py-2 text-sm outline-none"
        >
          <option value="ALL">Todos status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={expandAll}
          className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink/60 hover:text-ink"
        >
          Expandir tudo
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink/60 hover:text-ink"
        >
          Recolher
        </button>
        <span className="text-xs text-ink/40">
          {entities.filter((e) => e.level === "campaign").length} camp. ·{" "}
          {entities.filter((e) => e.level === "adset").length} conj. ·{" "}
          {entities.filter((e) => e.level === "ad").length} anúncios
        </span>
      </div>

      <div className="overflow-x-auto border border-brand-light/35 bg-white/60">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-light/30 text-[10px] uppercase tracking-[0.12em] text-ink/40">
              <th className="px-3 py-3 font-medium">Entidade</th>
              <th className="px-3 py-3 font-medium">Nível</th>
              <th className="px-3 py-3 font-medium">Status</th>
              {cols.map((c) => (
                <th key={c.id} className="px-3 py-3 font-medium whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp) => {
              const open = !!expandedCampaigns[camp.id];
              const adsets = adsetsByCampaign.get(camp.id) || [];
              return (
                <EntityGroup
                  key={camp.id}
                  entity={camp}
                  open={open}
                  onToggle={() => toggleCamp(camp.id)}
                  cols={cols}
                  depth={0}
                  childCount={adsets.length}
                >
                  {open
                    ? adsets.map((as) => {
                        const asOpen = !!expandedAdsets[as.id];
                        const ads = adsByAdset.get(as.id) || [];
                        return (
                          <EntityGroup
                            key={as.id}
                            entity={as}
                            open={asOpen}
                            onToggle={() => toggleAdset(as.id)}
                            cols={cols}
                            depth={1}
                            childCount={ads.length}
                          >
                            {asOpen
                              ? ads.map((ad) => (
                                  <EntityRow key={ad.id} entity={ad} cols={cols} depth={2} />
                                ))
                              : null}
                          </EntityGroup>
                        );
                      })
                    : null}
                </EntityGroup>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EntityGroup({
  entity,
  open,
  onToggle,
  cols,
  depth,
  childCount,
  children,
}: {
  entity: MediaEntity;
  open: boolean;
  onToggle: () => void;
  cols: Array<{ id: ColId; label: string }>;
  depth: number;
  childCount: number;
  children?: React.ReactNode;
}) {
  return (
    <>
      <tr className="border-b border-brand-light/15 hover:bg-cream/40">
        <td className="px-3 py-2.5" style={{ paddingLeft: 12 + depth * 18 }}>
          <button
            type="button"
            onClick={onToggle}
            className="mr-2 inline-flex h-5 w-5 items-center justify-center border border-ink/15 text-[10px] text-ink/60"
            aria-label={open ? "Recolher" : "Expandir"}
          >
            {childCount ? (open ? "−" : "+") : "·"}
          </button>
          <span className="text-ink/85">{entity.name}</span>
          {childCount ? (
            <span className="ml-2 text-[10px] text-ink/35">{childCount}</span>
          ) : null}
        </td>
        <td className="px-3 py-2.5 text-[11px] uppercase tracking-[0.1em] text-ink/40">
          {entity.level === "campaign" ? "Campanha" : entity.level === "adset" ? "Conjunto" : "Anúncio"}
        </td>
        <td className="px-3 py-2.5 text-ink/50">{entity.status}</td>
        {cols.map((c) => (
          <td key={c.id} className="px-3 py-2.5 whitespace-nowrap tabular-nums">
            {cell(entity.metrics, c.id)}
          </td>
        ))}
      </tr>
      {children}
    </>
  );
}

function EntityRow({
  entity,
  cols,
  depth,
}: {
  entity: MediaEntity;
  cols: Array<{ id: ColId; label: string }>;
  depth: number;
}) {
  return (
    <tr className="border-b border-brand-light/10 bg-white/40">
      <td className="px-3 py-2 text-ink/70" style={{ paddingLeft: 12 + depth * 18 }}>
        <span className="mr-2 inline-block w-5 text-center text-ink/25">↳</span>
        {entity.name}
      </td>
      <td className="px-3 py-2 text-[11px] uppercase tracking-[0.1em] text-ink/40">Anúncio</td>
      <td className="px-3 py-2 text-ink/50">{entity.status}</td>
      {cols.map((c) => (
        <td key={c.id} className="px-3 py-2 whitespace-nowrap tabular-nums text-ink/80">
          {cell(entity.metrics, c.id)}
        </td>
      ))}
    </tr>
  );
}

// silence unused
void LEVEL_ORDER;
