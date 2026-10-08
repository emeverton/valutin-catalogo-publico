import { deltaRatio, formatNumber, progressPct } from "@/app/lib/dashboard/format";
import { DeltaLine } from "./KpiStat";

export function GoalMeter({
  title,
  current,
  target,
  previous,
}: {
  title: string;
  current: number;
  target: number;
  previous?: number;
}) {
  const pct = progressPct(current, target);
  const ratio = previous != null ? deltaRatio(current, previous) : null;
  return (
    <div className="dash-surface px-6 py-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-ink/40">{title}</p>
      <p className="mt-4 font-playfair text-4xl tabular-nums text-ink md:text-5xl">
        {formatNumber(current)}
      </p>
      <p className="mt-1 text-sm text-ink/50">meta {formatNumber(target)}</p>
      {ratio != null ? <DeltaLine ratio={ratio} /> : null}
      <div className="mt-6 h-px w-full bg-brand-light/40">
        <div className="h-px bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-ink/40">{pct}% do alvo</p>
    </div>
  );
}
