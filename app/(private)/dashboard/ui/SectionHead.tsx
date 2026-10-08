export function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 font-playfair text-3xl text-ink md:text-[2.1rem]">{title}</h2>
        <div className="mt-4 h-px w-16 bg-brand" />
      </div>
      {action}
    </div>
  );
}
