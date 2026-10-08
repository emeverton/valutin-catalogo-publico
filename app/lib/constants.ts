export const BRAND_NAME = "VALUTIN";
export const LEGAL_ENTITY = {
  name: "Valutin Comércio de Roupas Infanto Juvenil Ltda",
  cnpj: "09.011.292/0001-32",
  stateRegistration: "149.779.847.110",
  email: "contato@valutin.com.br",
  postalCode: "04508-030",
} as const;
export const LOGO_SRC = "/logo-valutin.png";
export const GTM_ID = "GTM-5WWWR8FX";

export const VIDEO_YOUTUBE_ID = "OIclPAGWXNo";
export const VIDEO_LABEL = "NOSSA HISTÓRIA";
export const VIDEO_TITLE = "Conheça a Valutin.";

export const INSTAGRAM_URL = "https://www.instagram.com/valutinoficial";
export const WHATSAPP_URL = "/atendimento";
export const WHATSAPP_DISPLAY = "+55 11 99753-4668";
export const WEBHOOK_URL = "https://webhook.ehos.com.br/webhook/valutin-leads";

export const RETAIL_ONLY_COPY = {
  notice: "Atendimento exclusivo para o consumidor final. Não trabalhamos com atacado ou revenda.",
  checkbox: "Confirmo que busco atendimento de varejo para consumo final. A Valutin não realiza vendas no atacado ou para revenda.",
  blocked: "A Valutin trabalha exclusivamente com varejo para o consumidor final. Não realizamos vendas por atacado, revenda, representação ou fornecimento para lojistas. Agradecemos o interesse.",
  gateQuestion: "Seu atendimento é para compra de peças para uso próprio ou da sua família?",
  yes: "SIM, SOU CONSUMIDOR FINAL",
  no: "NÃO, BUSCO ATACADO OU REVENDA",
  back: "Voltar ao site",
} as const;

export const MAPS_DIR_URL =
  "https://www.google.com/maps/dir//R.+Jo%C3%A3o+Louren%C3%A7o,+323+-+Vila+Nova+Concei%C3%A7%C3%A3o,+S%C3%A3o+Paulo+-+SP,+04508-030";

export const WAZE_URL =
  "https://www.waze.com/ul?ll=-23.5965%2C-46.6736&navigate=yes&zoom=17";

export const UBER_URL =
  "https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff%5Blatitude%5D=-23.5965&dropoff%5Blongitude%5D=-46.6736&dropoff%5Bnickname%5D=Valutin&dropoff%5Bformatted_address%5D=Rua%20Jo%C3%A3o%20Louren%C3%A7o%2C%20323%20%E2%80%94%20Vila%20Nova%20Concei%C3%A7%C3%A3o%2C%20S%C3%A3o%20Paulo%2FSP";

export const MAPS_EMBED_SRC =
  "https://maps.google.com/maps?q=Rua+Joao+Lourenco+323+Vila+Nova+Conceicao+Sao+Paulo&output=embed";

export const ADDRESS = {
  street: "Rua João Lourenço, 323",
  neighborhood: "Vila Nova Conceição, São Paulo – SP",
  hoursWeekdays: "Seg–Sex: 10h às 19h",
  hoursSaturday: "Sábado: 10h às 17h",
} as const;

export const COMO_CHEGAR_COPY = {
  label: "Venha nos visitar",
  online: "Ou prefere ser atendida online? Nossa equipe responde no WhatsApp.",
} as const;

export const HERO_IMAGE = "/campaign-spring-summer-2026/orange-look-desktop.jpg";

export const HERO_COPY = {
  tag: "Moda Infantil · Desde 1998 · Vila Nova Conceição",
  h1: "Moda infantil premium em Vila Nova Conceição.",
  cta: "Falar pelo WhatsApp",
  ctaSecondary: "Como chegar à loja",
  urgency: "Atendimento pessoal · Seg–Sáb 10h–19h",
} as const;

export const MANIFESTO_COPY = {
  quote:
    "Acreditamos que a infância merece ser vivida com beleza. Cada peça que criamos carrega o cuidado de quem entende que vestir uma criança é também uma forma de amor.",
  attribution: "Família Valutin · São Paulo, 1998",
} as const;

export interface ConsultoriaServiceItem {
  title: string;
  body: string;
}

export const CONSULTORIA_COPY = {
  label: "Serviço exclusivo",
  title: "Uma consultora dedicada para encontrar o look perfeito.",
  body: "Seja para um batizado, uma ocasião especial ou simplesmente para renovar o guarda-roupa do seu filho, nossa equipe está pronta para guiar você com atenção e cuidado, online ou na loja.",
  cta: "Falar pelo WhatsApp →",
} as const;

export const CONSULTORIA_ITEMS: ConsultoriaServiceItem[] = [
  { title: "Atendimento por WhatsApp", body: "resposta personalizada com curadoria de looks" },
  { title: "Visita à loja", body: "experiência completa na Vila Nova Conceição" },
  { title: "Para ocasiões especiais", body: "batizados, festas, primeira comunhão" },
];

export const CONSULTORIA_IMAGE = "/campaign-spring-summer-2026/consultation-pink-laise.jpg";

export const DEPOIMENTOS_TITLE = "O que as famílias dizem";

export interface Diferencial {
  number: string;
  title: string;
  body: string;
}

export const DIFERENCIAIS: Diferencial[] = [
  {
    number: "01",
    title: "Peças exclusivas",
    body: "Modelagem própria, sem reprodução em massa. Cada peça é pensada para ser única e durar.",
  },
  {
    number: "02",
    title: "Atendimento consultivo",
    body: "Nossa equipe ajuda a encontrar o look ideal para cada criança e cada ocasião especial.",
  },
  {
    number: "03",
    title: "Desde 1998",
    body: "Uma história vestindo a infância paulistana com sofisticação, cuidado e muito amor.",
  },
];

export interface GalleryImage {
  src: string;
  caption: string;
  alt: string;
}

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/campaign-spring-summer-2026/collection-flatlay-desktop.jpg",
    caption: "Valutin · Nova coleção",
    alt: "Looks infantis Valutin em composição editorial",
  },
  {
    src: "/campaign-spring-summer-2026/blue-dress-editorial.jpg",
    caption: "Delicadeza · Infantil",
    alt: "Look infantil azul e branco Valutin",
  },
  {
    src: "/campaign-spring-summer-2026/embroidered-detail.jpg",
    caption: "Detalhes · Feitos à mão",
    alt: "Bordado floral feito à mão em peça infantil Valutin",
  },
];

export const GALERIA_HEADER = {
  label: "Coleção Atual",
  title: "Uma elegância que pertence à infância.",
} as const;

export interface Review {
  quote: string;
  author: string;
}

export const REVIEWS: Review[] = [
  {
    quote:
      "Loja maravilhosa, roupas de muito bom gosto, com design próprio. Super indico a Valutin!",
    author: "Ana Paula M.",
  },
  {
    quote:
      "Atendimento impecável e peças lindíssimas. Minha filha adora cada roupa que compramos aqui.",
    author: "Fernanda C.",
  },
  {
    quote:
      "Desde que descobri a Valutin não compro moda infantil em outro lugar. Qualidade incomparável.",
    author: "Renata S.",
  },
];

export const REVIEW_SOURCE = "⭐ Google Avaliações";

export type Step1Value = "bebê" | "criança" | "ocasião especial";
export type Step2Value =
  | "uso do dia a dia"
  | "presente especial"
  | "batizado ou cerimônia"
  | "quero visitar a loja";
export type Step3Value = "até R$ 300" | "R$ 300 a R$ 800" | "acima de R$ 800";

export interface StepOption<T extends string> {
  emoji: string;
  label: string;
  value: T;
}

export const STEP1_OPTIONS: StepOption<Step1Value>[] = [
  { emoji: "👶", label: "Bebê (0 a 24 meses)", value: "bebê" },
  { emoji: "🧒", label: "Criança (2 a 12 anos)", value: "criança" },
  { emoji: "🎀", label: "Ocasião especial (até 16 anos)", value: "ocasião especial" },
];

export const STEP2_OPTIONS: StepOption<Step2Value>[] = [
  { emoji: "🌸", label: "Uso do dia a dia", value: "uso do dia a dia" },
  { emoji: "🎁", label: "Presente especial", value: "presente especial" },
  { emoji: "⛪", label: "Batizado ou cerimônia", value: "batizado ou cerimônia" },
  { emoji: "🏪", label: "Quero visitar a loja", value: "quero visitar a loja" },
];

export const STEP3_OPTIONS: StepOption<Step3Value>[] = [
  { emoji: "💛", label: "Até R$ 300", value: "até R$ 300" },
  { emoji: "💎", label: "R$ 300 a R$ 800", value: "R$ 300 a R$ 800" },
  { emoji: "✨", label: "Acima de R$ 800", value: "acima de R$ 800" },
];

export function buildWhatsAppMessage(
  nome: string,
  para_quem: string,
  ocasiao: string,
  investimento: string
): string {
  return `Olá! Me chamo ${nome}. Estou buscando para ${para_quem}, ocasião: ${ocasiao}, investimento: ${investimento}.`;
}
