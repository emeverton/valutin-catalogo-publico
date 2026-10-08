import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../components/InfoPage";
import { ADDRESS, MAPS_DIR_URL } from "../lib/constants";

export const metadata: Metadata = {
  title: "Entregas e retirada | Valutin",
  description: "Saiba como combinar entrega ou retirada de peças Valutin com a equipe antes de concluir a compra.",
  alternates: { canonical: "/entregas-e-retirada" },
};

export default function DeliveryPage() {
  return <InfoPage
    eyebrow="Receba do seu jeito"
    title="Entregas e retirada"
    intro="Cada pedido é combinado com a equipe. Assim, você conhece as opções disponíveis, os custos e os prazos antes de concluir a compra."
  >
    <section>
      <h2>Entrega</h2>
      <p>Informe o endereço de destino durante o atendimento. A equipe confirma se há entrega para sua região, o valor do frete, o prazo estimado e a forma de envio aplicável ao pedido. Não há uma tarifa ou prazo único para todas as localidades.</p>
    </section>
    <section>
      <h2>Retirada na loja</h2>
      <p>Se preferir retirar, confirme com a equipe quando a peça estará disponível antes de ir à loja. Nosso endereço é {ADDRESS.street}, {ADDRESS.neighborhood}.</p>
      <p>Atendimento na loja: {ADDRESS.hoursWeekdays}; {ADDRESS.hoursSaturday}. Horários excepcionais podem ser confirmados antes da visita.</p>
      <a href={MAPS_DIR_URL} target="_blank" rel="noopener noreferrer" className="info-page-button-outline mt-5">Abrir rota no Google Maps ↗</a>
    </section>
    <section>
      <h2>Antes da confirmação</h2>
      <p>Peça à equipe o resumo das condições de entrega ou retirada e guarde a confirmação recebida no atendimento. Se precisar alterar o destino ou combinar outro momento, entre em contato o quanto antes.</p>
      <Link href="/atendimento" className="info-page-button mt-5">Falar com a Valutin →</Link>
    </section>
  </InfoPage>;
}
