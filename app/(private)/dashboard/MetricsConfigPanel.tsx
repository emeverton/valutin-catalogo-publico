"use client";

import { useEffect, useMemo, useState } from "react";
import {
  METRIC_CATALOG,
  defaultVisibleIds,
  loadVisibleMetrics,
  saveVisibleMetrics,
} from "@/app/lib/dashboard/metrics-catalog";

const GROUPS: Array<{ id: string; label: string }> = [
  { id: "delivery", label: "Entrega" },
  { id: "cost", label: "Custo" },
  { id: "results", label: "Resultados" },
  { id: "engagement", label: "Engajamento" },
  { id: "web", label: "Web / GA4" },
  { id: "crm", label: "CRM / Kommo" },
];

export function MetricsConfigPanel({
  onChange,
}: {
  onChange?: (ids: string[]) => void;
}) {
  const [visible, setVisible] = useState<string[]>(defaultVisibleIds());

  useEffect(() => {
    const ids = loadVisibleMetrics();
    setVisible(ids);
    onChange?.(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(id: string) {
    setVisible((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveVisibleMetrics(next);
      onChange?.(next);
      return next;
    });
  }

  function reset() {
    const ids = defaultVisibleIds();
    setVisible(ids);
    saveVisibleMetrics(ids);
    onChange?.(ids);
  }

  function selectAll() {
    const ids = METRIC_CATALOG.map((m) => m.id);
    setVisible(ids);
    saveVisibleMetrics(ids);
    onChange?.(ids);
  }

  const byGroup = useMemo(() => {
    const map = new Map<string, typeof METRIC_CATALOG>();
    for (const g of GROUPS) map.set(g.id, []);
    for (const m of METRIC_CATALOG) {
      if (!map.has(m.group)) map.set(m.group, []);
      map.get(m.group)!.push(m);
    }
    return map;
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Configuração</p>
          <h2 className="mt-2 font-playfair text-3xl text-ink">Métricas visíveis</h2>
          <p className="mt-2 max-w-xl text-sm text-ink/55">
            Personalize quais métricas aparecem nas abas. Preferência salva neste navegador.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="border border-ink/15 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink/70 hover:border-brand"
          >
            Todas
          </button>
          <button
            type="button"
            onClick={reset}
            className="border border-ink/15 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink/70 hover:border-brand"
          >
            Restaurar padrão
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.id} className="dash-surface p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/45">{g.label}</p>
            <ul className="mt-4 space-y-2">
              {(byGroup.get(g.id) || []).map((m) => {
                const on = visible.includes(m.id);
                return (
                  <li key={m.id}>
                    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                      <span className="text-ink/80">
                        {m.label}
                        <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-ink/35">
                          {m.platforms.join(" · ")}
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(m.id)}
                        className="h-4 w-4 accent-[rgb(133,160,190)]"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-ink/45">
        {visible.length} métricas ativas de {METRIC_CATALOG.length}
      </p>
    </div>
  );
}
