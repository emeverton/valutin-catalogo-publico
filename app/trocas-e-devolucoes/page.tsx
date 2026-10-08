import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../components/InfoPage";

export const metadata: Metadata = {
  title: "Trocas e devoluções | Valutin",
  description: "Orientações para solicitar troca, devolução ou exercer o direito de arrependimento em compras Valutin.",
  alternates: { canonical: "/trocas-e-devolucoes" },
};

export default function ReturnsPage() {
  return <InfoPage
    eyebrow="Cuidado também depois da compra"
    title="Trocas e devoluções"
    intro="Se houver qualquer problema com a peça ou se você precisar rever uma compra, fale com a equipe. Vamos orientar os próximos passos de acordo com a forma de contratação e a legislação aplicável."
  >
    <section>
      <h2>Desistência em compras à distância</h2>
      <p>Para compras concluídas fora da loja física, como por meio eletrônico ou telefone, você pode exercer o direito de arrependimento em até 7 dias contados da assinatura ou do recebimento do produto, conforme o Código de Defesa do Consumidor. Avise a Valutin pelo canal de atendimento dentro desse prazo para receber orientação sobre a devolução e o reembolso dos valores pagos.</p>
      <p>O exercício desse direito não deve gerar custo para você. Guarde o comprovante da compra e, quando possível, preserve etiquetas e acessórios para facilitar a identificação da peça. A ausência de embalagem original, por si só, não elimina direitos previstos em lei.</p>
    </section>
    <section>
      <h2>Peça com defeito ou divergência</h2>
      <p>Se a peça apresentar defeito ou for diferente do que foi combinado, entre em contato com o comprovante da compra e uma descrição do ocorrido. A equipe vai orientar a análise e a solução cabível, respeitando os prazos e direitos assegurados pela legislação de consumo.</p>
    </section>
    <section>
      <h2>Troca por preferência</h2>
      <p>Para mudanças de tamanho, cor ou preferência em compras feitas na loja física, consulte as condições comerciais informadas pela equipe no momento da compra. Essas condições não substituem os direitos legais em caso de defeito ou divergência.</p>
    </section>
    <section>
      <h2>Como solicitar</h2>
      <p>Informe seu nome, a peça, a data da compra e o motivo da solicitação. Não envie dados bancários ou documentos pessoais por mensagens públicas. A equipe indicará o procedimento adequado e o canal seguro para eventuais informações adicionais.</p>
      <Link href="/atendimento" className="info-page-button mt-5">Iniciar atendimento →</Link>
    </section>
  </InfoPage>;
}
