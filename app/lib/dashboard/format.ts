export function formatBRL(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

export function formatPct(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatRoas(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}x`;
}

export function progressPct(current: number, target: number): number {
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return "agora";
  if (mins === 1) return "há 1 min";
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  return hours === 1 ? "há 1 h" : `há ${hours} h`;
}

/** Variação percentual current vs previous. null se previous=0 e current=0. */
export function deltaRatio(
  current: number | null | undefined,
  previous: number | null | undefined
): number | null {
  const c = current ?? 0;
  const p = previous ?? 0;
  if (p === 0 && c === 0) return 0;
  if (p === 0) return c > 0 ? 1 : null;
  return (c - p) / Math.abs(p);
}

export function formatDelta(ratio: number | null | undefined): string {
  if (ratio == null || Number.isNaN(ratio)) return "—";
  const pct = ratio * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}
