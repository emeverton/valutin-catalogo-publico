import { formatDelta } from "@/app/lib/dashboard/format";

function DeltaLine({
  ratio,
  invert = false,
}: {
  ratio: number | null | undefined;
  invert?: boolean;
}) {
  if (ratio == null) return null;
  const good = invert ? ratio <= 0 : ratio >= 0;
  const color = ratio === 0 ? "text-ink/40" : good ? "text-emerald-800" : "text-amber-900";
  return <p className={`mt-1.5 text-xs ${color}`}>{formatDelta(ratio)} vs comparação</p>;
}

export function KpiStat({
  label,
  value,
  previous,
  delta,
  hint,
  invertDelta = false,
  large = false,
}: {
  label: string;
  value: string;
  previous?: string;
  delta?: number | null;
  hint?: string;
  invertDelta?: boolean;
  large?: boolean;
}) {
  return (
    <div className="dash-surface px-5 py-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-ink/40">{label}</p>
      <p className={`mt-3 font-playfair text-ink tabular-nums ${large ? "text-3xl md:text-4xl" : "text-2xl md:text-[1.65rem]"}`}>
        {value}
      </p>
      {delta != null ? <DeltaLine ratio={delta} invert={invertDelta} /> : null}
      {previous ? <p className="mt-1 text-[11px] text-ink/40">ant. {previous}</p> : null}
      {hint ? <p className="mt-2 text-xs leading-snug text-ink/45">{hint}</p> : null}
    </div>
  );
}

export { DeltaLine };
