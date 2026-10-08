export function StatusDot({ status }: { status: string }) {
  const tone =
    status === "ok" ? "bg-emerald-700" : status === "partial" ? "bg-amber-700" : "bg-ink/25";
  const label = status === "ok" ? "live" : status === "partial" ? "parcial" : "off";
  return (
    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink/40">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} aria-hidden />
      {label}
    </span>
  );
}
