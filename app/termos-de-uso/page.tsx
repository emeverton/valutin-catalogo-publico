import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../components/InfoPage";

export const metadata: Metadata = {
  title: "Termos de uso do catálogo | Valutin",
  description: "Entenda como usar o catálogo Valutin e como a equipe confirma preços, estoque e condições antes da compra.",
  alternates: { canonical: "/termos-de-uso" },
};

export default function TermsPage() {
  return <InfoPage
    eyebrow="Informações do site"
    title="Termos de uso"
    intro="O site apresenta a coleção Valutin e facilita o contato com nossa equipe. A contratação da compra acontece no atendimento, após a confirmação das condições aplicáveis."
  >
    <section>
      <h2>Catálogo e disponibilidade</h2>
      <p>Fotos, descrições, tamanhos e preços apresentados ajudam você a conhecer as peças. Cores podem variar conforme a tela. Estoque, variante, preço final e eventuais condições especiais devem ser confirmados pela equipe antes da conclusão da compra.</p>
    </section>
    <section>
      <h2>Solicitar atendimento não conclui uma compra</h2>
      <p>O envio de um formulário, a abertura do WhatsApp ou a consulta de uma peça não representa confirmação de pedido, reserva definitiva ou cobrança. A equipe informa as condições de pagamento e recebimento no atendimento antes da sua decisão.</p>
    </section>
    <section>
      <h2>Uso adequado do site</h2>
      <p>Use o catálogo para conhecer os produtos e fazer solicitações legítimas de varejo. O atendimento Valutin é destinado ao consumidor final; não há venda no atacado ou para revenda. Não tente interferir na operação do site, obter acesso não autorizado ou usar suas imagens e textos como se fossem de sua autoria.</p>
    </section>
    <section>
      <h2>Seus direitos permanecem preservados</h2>
      <p>Estes termos não reduzem direitos previstos na legislação brasileira de proteção ao consumidor. Consulte também as páginas de <Link href="/entregas-e-retirada">entregas e retirada</Link>, <Link href="/trocas-e-devolucoes">trocas e devoluções</Link> e <Link href="/politica-de-privacidade">privacidade</Link>.</p>
    </section>
    <section>
      <h2>Dúvidas</h2>
      <p>Se alguma informação do catálogo não estiver clara, <Link href="/atendimento">fale com a equipe</Link> antes de concluir sua compra.</p>
    </section>
  </InfoPage>;
}
