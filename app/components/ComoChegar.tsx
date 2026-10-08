import {
  ADDRESS,
  COMO_CHEGAR_COPY,
  MAPS_DIR_URL,
  MAPS_EMBED_SRC,
  UBER_URL,
  WAZE_URL,
} from "../lib/constants";
import WhatsAppCta from "./WhatsAppCta";

const ROUTE_OPTIONS = [
  { label: "Google Maps", href: MAPS_DIR_URL },
  { label: "Waze", href: WAZE_URL },
  { label: "Uber", href: UBER_URL },
] as const;

export default function ComoChegar() {
  return (
    <section className="bg-cream/20 px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden border border-brand/20 bg-white md:grid-cols-12">
        <div className="p-8 sm:p-10 md:col-span-5 md:p-12 lg:p-14">
          <p className="font-poppins text-[11px] uppercase tracking-[0.2em] text-brand-strong mb-6">
            {COMO_CHEGAR_COPY.label}
          </p>
          <h2 className="font-playfair text-[42px] italic leading-none text-ink mb-8 md:text-[50px]">Nossa Loja</h2>

          <div className="font-poppins text-sm text-ink/70 space-y-1 mb-8">
            <p>{ADDRESS.street}</p>
            <p>{ADDRESS.neighborhood}</p>
            <p className="pt-4 text-xs uppercase tracking-widest text-ink/65">Horários</p>
            <p>{ADDRESS.hoursWeekdays}</p>
            <p>{ADDRESS.hoursSaturday}</p>
          </div>

          <p className="mb-3 font-poppins text-[11px] uppercase tracking-[0.18em] text-brand-strong">
            Como chegar
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {ROUTE_OPTIONS.map((route) => (
              <a
                key={route.label}
                href={route.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-brand px-4 py-2.5 font-poppins text-xs font-medium text-brand-strong transition-all duration-200 hover:bg-brand-strong hover:text-white"
              >
                {route.label}
              </a>
            ))}
          </div>

          <WhatsAppCta
            src="como-chegar"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-strong px-5 py-3 font-poppins text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.522 5.843L.057 23.143a.75.75 0 0 0 .928.908l5.406-1.435A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.715 9.715 0 0 1-4.96-1.36l-.356-.213-3.707.984.993-3.617-.232-.373A9.714 9.714 0 0 1 2.25 12C2.25 6.61 6.61 2.25 12 2.25S21.75 6.61 21.75 12 17.39 21.75 12 21.75z" />
            </svg>
            Falar com a concierge
          </WhatsAppCta>
          <p className="mt-4 font-poppins text-[13px] text-gray-500">
            {COMO_CHEGAR_COPY.online}
          </p>
        </div>

        <div className="h-80 w-full overflow-hidden border-t border-brand/15 md:col-span-7 md:h-auto md:min-h-[560px] md:border-l md:border-t-0">
          <iframe
            title="Localização Valutin"
            src={MAPS_EMBED_SRC}
            width="100%"
            height="100%"
            className="border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
