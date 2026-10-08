import { StatusDot } from "./StatusDot";

export function ChannelTile({
  name,
  status,
  primary,
  primaryLabel,
  secondary,
  secondaryLabel,
  onClick,
}: {
  name: string;
  status: string;
  primary: string;
  primaryLabel: string;
  secondary: string;
  secondaryLabel: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`dash-surface w-full px-5 py-5 text-left transition ${
        onClick ? "hover:border-brand/50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-playfair text-xl text-ink">{name}</p>
        <StatusDot status={status} />
      </div>
      <p className="mt-4 font-playfair text-2xl tabular-nums text-ink">{primary}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink/40">{primaryLabel}</p>
      <p className="mt-3 text-sm text-ink/70">
        {secondary} <span className="text-ink/40">{secondaryLabel}</span>
      </p>
    </Tag>
  );
}
