import { SectionHead } from "./SectionHead";
import { StatusDot } from "./StatusDot";

export function PlatformShell({
  title,
  subtitle,
  status,
  error,
  children,
}: {
  title: string;
  subtitle: string;
  status: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <SectionHead eyebrow={subtitle} title={title} action={<StatusDot status={status} />} />
      {error && status !== "ok" ? (
        <p className="dash-surface mb-6 px-4 py-3 text-xs text-ink/55">{error}</p>
      ) : null}
      {children}
    </div>
  );
}
