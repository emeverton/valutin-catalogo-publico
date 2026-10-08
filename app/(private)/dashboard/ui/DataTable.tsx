export function DataTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: React.ReactNode;
  empty?: string;
}) {
  return (
    <div className="dash-surface overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-brand-light/30 text-[10px] uppercase tracking-[0.14em] text-ink/40">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {!children ? (
        <p className="px-4 py-4 text-sm text-ink/40">{empty || "Vazio"}</p>
      ) : null}
    </div>
  );
}

export function DataRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-brand-light/15 last:border-0">{children}</tr>;
}

export function ListCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ left: string; right: string }>;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">{title}</p>
      <ul className="dash-surface mt-4">
        {rows.map((r) => (
          <li
            key={r.left + r.right}
            className="flex justify-between gap-3 border-b border-brand-light/20 px-4 py-2.5 text-sm last:border-0"
          >
            <span className="truncate text-ink/70">{r.left}</span>
            <span className="shrink-0 tabular-nums text-ink">{r.right}</span>
          </li>
        ))}
        {!rows.length ? <li className="px-4 py-3 text-sm text-ink/40">Vazio</li> : null}
      </ul>
    </div>
  );
}
