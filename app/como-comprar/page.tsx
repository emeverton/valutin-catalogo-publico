import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../components/InfoPage";

export const metadata: Metadata = {
  title: "Como comprar | Valutin",
  description: "Veja como escolher peças, confirmar tamanhos e concluir sua compra com o atendimento pessoal da Valutin.",
  alternates: { canonical: "/como-comprar" },
};

export default function HowToBuyPage() {
  return <InfoPage
    eyebrow="Sua experiência"
    title="Como comprar"
    intro="A compra começa no catálogo e é concluída com a equipe Valutin, que confirma os detalhes da peça antes de você decidir."
  >
    <ol className="grid gap-4 sm:grid-cols-3">
      {[
        ["01", "Escolha uma peça", "Explore o catálogo e abra a página do produto para ver fotos, descrição e tamanhos apresentados."],
        ["02", "Converse com a equipe", "Envie sua consulta. Confirmamos variante, estoque, preço atual e condições para a sua região."],
        ["03", "Combine a compra", "Antes de concluir, a equipe informa pagamento, entrega ou retirada e os prazos aplicáveis."],
      ].map(([number, title, body]) => <li key={number} className="border border-ink/15 bg-white p-6"><span className="font-playfair text-3xl text-brand-strong/65">{number}</span><h2 className="mt-4 font-playfair text-2xl text-ink">{title}</h2><p className="mt-3 font-poppins text-sm leading-7 text-ink/70">{body}</p></li>)}
    </ol>
    <section>
      <h2>O catálogo não é um checkout</h2>
      <p>Adicionar uma peça à consulta ou iniciar uma conversa não confirma um pedido nem gera cobrança. Preços exibidos servem como referência; disponibilidade, valor final e eventuais custos de entrega são confirmados pela equipe antes da compra.</p>
    </section>
    <section>
      <h2>Precisa de ajuda com um presente ou ocasião especial?</h2>
      <p>Conte a idade da criança e a ocasião. A equipe pode ajudar com tamanho e combinações, sem compromisso de compra.</p>
      <Link href="/catalogo" className="info-page-button mt-5">Conhecer as peças →</Link>
    </section>
  </InfoPage>;
}
