interface EditorialDividerProps {
  index: string;
  label: string;
}

export default function EditorialDivider({ index, label }: EditorialDividerProps) {
  return (
    <div className="bg-white px-6" aria-hidden="true">
      <div className="mx-auto flex max-w-6xl items-center gap-4 border-y border-brand/15 py-4 md:gap-8 md:py-5">
        <span className="font-playfair text-lg italic leading-none text-brand-strong">{index}</span>
        <span className="h-px flex-1 bg-brand/20" />
        <span className="font-poppins text-[9px] uppercase tracking-[0.28em] text-ink/45 md:text-[10px] md:tracking-[0.34em]">
          {label}
        </span>
      </div>
    </div>
  );
}
