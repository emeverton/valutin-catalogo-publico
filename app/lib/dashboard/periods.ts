import { H2_GOALS } from "./goals";
import type { DateRange, PeriodKey } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function diffDaysInclusive(since: string, until: string): number {
  const a = parseDate(since).getTime();
  const b = parseDate(until).getTime();
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export function resolvePeriod(key: PeriodKey, now = new Date()): DateRange {
  const until = formatDate(now);

  if (key === "today") {
    return { key, since: until, until, label: "Hoje" };
  }

  if (key === "7d") {
    const start = addDays(now, -6);
    return { key, since: formatDate(start), until, label: "Últimos 7 dias" };
  }

  if (key === "30d") {
    const start = addDays(now, -29);
    return { key, since: formatDate(start), until, label: "Últimos 30 dias" };
  }

  if (key === "mtd") {
    return {
      key,
      since: formatDate(startOfMonth(now)),
      until,
      label: "Mês até hoje",
    };
  }

  if (key === "h2") {
    return {
      key,
      since: H2_GOALS.h2Start,
      until: until < H2_GOALS.h2End ? until : H2_GOALS.h2End,
      label: "H2 2026 (jul–dez)",
    };
  }

  // custom fallback = mtd
  return resolvePeriod("mtd", now);
}

export function resolveCustomRange(since: string, until: string): DateRange {
  const a = since <= until ? since : until;
  const b = since <= until ? until : since;
  return {
    key: "custom",
    since: a,
    until: b,
    label: `${fmtBr(a)} – ${fmtBr(b)}`,
  };
}

function fmtBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Janela imediatamente anterior, mesmo nº de dias. */
export function previousRange(range: DateRange): DateRange {
  const days = diffDaysInclusive(range.since, range.until);
  const prevUntil = addDays(parseDate(range.since), -1);
  const prevSince = addDays(prevUntil, -(days - 1));
  const since = formatDate(prevSince);
  const until = formatDate(prevUntil);
  return {
    key: "custom",
    since,
    until,
    label: `Anterior (${fmtBr(since)} – ${fmtBr(until)})`,
  };
}

export function parsePeriodKey(raw: string | null | undefined): PeriodKey {
  if (
    raw === "today" ||
    raw === "7d" ||
    raw === "30d" ||
    raw === "mtd" ||
    raw === "h2" ||
    raw === "custom"
  ) {
    return raw;
  }
  return "mtd";
}

export function isValidIsoDate(value: string | null | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = parseDate(value);
  return !Number.isNaN(d.getTime()) && formatDate(d) === value;
}
