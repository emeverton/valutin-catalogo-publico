import { buildWhatsAppHref } from "../lib/whatsapp/href";
import { WA_PUBLIC_DISPLAY } from "../lib/whatsapp/config";

type Props = {
  src: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  text?: string;
};

/** Único CTA público. Destino = /atendimento (hard gate varejo). */
export default function WhatsAppCta({ src, children, className, ariaLabel, text }: Props) {
  return (
    <a
      href={buildWhatsAppHref({ src, text })}
      aria-label={ariaLabel || `Atendimento Valutin ${WA_PUBLIC_DISPLAY}`}
      className={className}
    >
      {children}
    </a>
  );
}
