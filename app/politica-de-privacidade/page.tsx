import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "../components/InfoPage";
import { ADDRESS, LEGAL_ENTITY } from "../lib/constants";

export const metadata: Metadata = {
  title: "Política de Privacidade | Valutin",
  description: "Saiba quais dados a Valutin utiliza no catálogo e no atendimento e como exercer seus direitos de privacidade.",
  alternates: { canonical: "/politica-de-privacidade" },
};

export default function PrivacyPage() {
  return <InfoPage
    eyebrow="Seus dados, suas escolhas"
    title="Política de Privacidade"
    intro="Esta página explica, em linguagem clara, o tratamento de dados na experiência de catálogo e atendimento Valutin. Atualizada em 24 de setembro de 2026."
  >
    <section>
      <h2>Quem atende você</h2>
      <p>O atendimento é realizado por {LEGAL_ENTITY.name}, CNPJ {LEGAL_ENTITY.cnpj}, com endereço na {ADDRESS.street}, {ADDRESS.neighborhood}, CEP {LEGAL_ENTITY.postalCode}. Para dúvidas sobre seus dados ou para exercer seus direitos, escreva para <a href={`mailto:${LEGAL_ENTITY.email}`}>{LEGAL_ENTITY.email}</a> ou use o <Link href="/atendimento">canal de atendimento</Link> e indique que a solicitação é de privacidade.</p>
    </section>
    <section>
      <h2>Dados usados no atendimento</h2>
      <p>Quando você pede atendimento, recebemos seu nome e número de WhatsApp. Se informadas por você, também recebemos preferências de peça, tamanho, ocasião e faixa de investimento. Para dar continuidade à conversa, podemos associar à solicitação o produto consultado, a origem da visita e identificadores técnicos necessários à operação e segurança.</p>
      <p>Não pedimos dados da criança para navegar pelo catálogo. Se você compartilhar informações sobre ela durante uma conversa, use apenas o necessário para que a equipe possa ajudá-la.</p>
    </section>
    <section>
      <h2>Para que usamos esses dados</h2>
      <ul>
        <li>Responder à sua consulta, confirmar estoque, tamanho e condições de compra.</li>
        <li>Organizar a continuidade do atendimento e evitar solicitações duplicadas ou abusivas.</li>
        <li>Cumprir obrigações relacionadas à compra e a eventuais solicitações posteriores.</li>
        <li>Medir o uso do site e melhorar campanhas apenas quando as ferramentas opcionais estiverem autorizadas, conforme a <Link href="/politica-de-cookies">Política de Cookies</Link>.</li>
      </ul>
    </section>
    <section>
      <h2>Com quem os dados podem ser compartilhados</h2>
      <p>Informações necessárias ao atendimento podem transitar pelos serviços técnicos que operam o formulário, a automação de atendimento e a conversa no WhatsApp. Ferramentas de análise e publicidade configuradas no Google Tag Manager só são carregadas mediante a escolha opcional de cookies no site. A Valutin não publica seus dados de contato no catálogo.</p>
      <p>Ao abrir mapas, Instagram ou outros serviços externos por meio de links, você passa a utilizar o ambiente e as políticas desses serviços.</p>
    </section>
    <section>
      <h2>Conservação e segurança</h2>
      <p>Os dados são mantidos pelo período necessário às finalidades de atendimento e compra e pelo tempo exigido para cumprir obrigações legais ou resguardar direitos. O acesso deve ficar restrito a quem precisa dessas informações, com medidas técnicas e organizacionais adequadas à proteção dos dados.</p>
    </section>
    <section>
      <h2>Seus direitos</h2>
      <p>Você pode solicitar informações sobre o tratamento, acesso, correção, eliminação nas hipóteses cabíveis, portabilidade quando aplicável e revisão das suas escolhas de consentimento. Também pode se opor a tratamentos nas hipóteses previstas em lei. Para começar, <Link href="/atendimento">fale com a equipe</Link>. Podemos pedir informações proporcionais para confirmar sua identidade antes de responder.</p>
      <p>As preferências das ferramentas opcionais podem ser alteradas em <Link href="/politica-de-cookies#preferencias">Preferências de Cookies</Link>.</p>
    </section>
  </InfoPage>;
}
