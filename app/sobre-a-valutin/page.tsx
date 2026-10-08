import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InfoPage from "../components/InfoPage";
import { ADDRESS, INSTAGRAM_URL, LEGAL_ENTITY, MAPS_DIR_URL } from "../lib/constants";

export const metadata: Metadata = {
  title: "Sobre a Valutin | Moda infantil em São Paulo",
  description: "Conheça a curadoria e o atendimento pessoal da Valutin, moda infantil em Vila Nova Conceição desde 1998.",
  alternates: { canonical: "/sobre-a-valutin" },
};

export default function AboutPage() {
  return <InfoPage
    eyebrow="Conheça a Valutin"
    title="Nossa história"
    intro="Desde 1998, a Valutin acompanha a infância com peças escolhidas para os dias comuns e para as ocasiões que ficam na memória."
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-[#eee9e2] sm:aspect-[16/9]">
      <Image src="/fachada-valutin-20260929.jpeg" alt="Fachada da loja Valutin, com vitrines e toldos claros" fill sizes="(max-width: 768px) 100vw, 768px" className="object-contain" />
    </div>
    <section>
      <h2>Uma curadoria próxima de cada família</h2>
      <p>Na Valutin, a escolha de uma roupa começa pela criança e pelo momento que ela vai viver. Nossa equipe ajuda a encontrar modelos, tamanhos e combinações para o cotidiano, para presentear e para celebrações.</p>
      <p>O catálogo apresenta a coleção para você explorar com calma. Disponibilidade, variante e condições de compra são confirmadas no atendimento, antes de qualquer pedido ser concluído.</p>
    </section>
    <section>
      <h2>Perto de você, online ou na loja</h2>
      <p>Recebemos as famílias na {ADDRESS.street}, {ADDRESS.neighborhood}, CEP {LEGAL_ENTITY.postalCode}. Se preferir, você pode começar pelo catálogo e conversar com a equipe pelo WhatsApp.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/catalogo" className="info-page-button">Explorar o catálogo →</Link>
        <a href={MAPS_DIR_URL} target="_blank" rel="noopener noreferrer" className="info-page-button-outline">Como chegar ↗</a>
      </div>
    </section>
    <section>
      <h2>Acompanhe a Valutin</h2>
      <p>Novidades da coleção, detalhes das peças e ideias para os próximos momentos também estão no <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram oficial da Valutin ↗</a>.</p>
    </section>
  </InfoPage>;
}
