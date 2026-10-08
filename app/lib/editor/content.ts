export const EDITOR_FIELDS = {
  heroEyebrow: { label: "Hero · assinatura", kind: "text", max: 100 },
  heroTitle: { label: "Hero · título", kind: "text", max: 120 },
  heroDescription: { label: "Hero · descrição", kind: "text", max: 240 },
  heroCta: { label: "Hero · botão", kind: "text", max: 55 },
  heroCtaHref: { label: "Hero · destino", kind: "link", max: 100 },
  heroPoster: { label: "Hero · imagem de capa", kind: "image", max: 500 },
  heroVideo: { label: "Hero · vídeo MP4", kind: "video", max: 500 },
  outingsTitle: { label: "Passeios · título", kind: "text", max: 100 },
  outingsImage: { label: "Passeios · imagem", kind: "image", max: 500 },
  outingsAlt: { label: "Passeios · descrição da imagem", kind: "text", max: 180 },
  outingsCta: { label: "Passeios · chamada", kind: "text", max: 80 },
  outingsCtaHref: { label: "Passeios · destino", kind: "link", max: 100 },
  storyOneImage: { label: "História 1 · imagem", kind: "image", max: 500 },
  storyOneAlt: { label: "História 1 · descrição da imagem", kind: "text", max: 180 },
  storyOneEyebrow: { label: "História 1 · assinatura", kind: "text", max: 80 },
  storyOneTitle: { label: "História 1 · título", kind: "text", max: 120 },
  storyTwoImage: { label: "História 2 · imagem", kind: "image", max: 500 },
  storyTwoAlt: { label: "História 2 · descrição da imagem", kind: "text", max: 180 },
  storyTwoEyebrow: { label: "História 2 · assinatura", kind: "text", max: 80 },
  storyTwoTitle: { label: "História 2 · título", kind: "text", max: 120 },
  blueTitle: { label: "Editorial azul · título", kind: "text", max: 100 },
  blueImage: { label: "Editorial azul · imagem", kind: "image", max: 500 },
  blueAlt: { label: "Editorial azul · descrição da imagem", kind: "text", max: 180 },
  blueCta: { label: "Editorial azul · chamada", kind: "text", max: 80 },
  blueCtaHref: { label: "Editorial azul · destino", kind: "link", max: 100 },
  themeAccent: { label: "Cor de destaque", kind: "color", max: 7 },
  facadeImage: { label: "Nossa loja · foto da fachada", kind: "image", max: 500 },
  facadeAlt: { label: "Nossa loja · descrição da foto", kind: "text", max: 180 },
} as const;

export type EditorField = keyof typeof EDITOR_FIELDS;
export type PageContent = Record<EditorField, string>;

export const DEFAULT_CONTENT: PageContent = {
  heroEyebrow: "Valutin · Primavera–Verão 2026/27",
  heroTitle: "A nova coleção chegou para viver a infância.",
  heroDescription: "Algodão, linho e laise em peças leves para os dias de sol e os momentos que viram memória.",
  heroCta: "Explorar a nova coleção",
  heroCtaHref: "#destaques",
  heroPoster: "/media/valutin-spring-summer-carousel-poster.jpg",
  heroVideo: "/media/valutin-spring-summer-carousel.mp4",
  outingsTitle: "Passeios ao sol",
  outingsImage: "/campaign-spring-summer-2026/collection-flatlay-desktop.jpg",
  outingsAlt: "Conjuntos de laise e macaquinho branco da coleção Primavera–Verão",
  outingsCta: "Uma estação para descobrir",
  outingsCtaHref: "/catalogo/categoria/crianca",
  storyOneImage: "/campaign-spring-summer-2026/embroidered-detail.jpg",
  storyOneAlt: "Detalhe editorial de bordado floral em cardigan infantil",
  storyOneEyebrow: "Feito para guardar",
  storyOneTitle: "Detalhes que contam história.",
  storyTwoImage: "/campaign-spring-summer-2026/gifts-still-life.jpg",
  storyTwoAlt: "Vestido branco de laise e macaquinho branco da coleção Primavera–Verão",
  storyTwoEyebrow: "Para presentear",
  storyTwoTitle: "Uma escolha que permanece.",
  blueTitle: "O azul da estação",
  blueImage: "/campaign-spring-summer-2026/blue-dress-editorial.jpg",
  blueAlt: "Vestido azul de laise em editorial Primavera–Verão Valutin",
  blueCta: "Descubra os looks leves",
  blueCtaHref: "/catalogo/categoria/crianca",
  themeAccent: "#526c87",
  facadeImage: "/fachada-valutin-20260929.jpeg",
  facadeAlt: "Fachada da loja Valutin, com vitrines e toldos claros",
};

const MEDIA_URL = /^\/api\/editor\/media\?path=primavera-verao\/[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp|mp4)$/;
const APPROVED_LOCAL_MEDIA = new Set(Object.entries(DEFAULT_CONTENT)
  .filter(([field]) => EDITOR_FIELDS[field as EditorField].kind !== "text")
  .map(([, value]) => value));
const ALLOWED_LINKS = new Set(["#destaques", "/catalogo", "/catalogo/todos", "/catalogo/primavera-verao", "/catalogo/categoria/bebe", "/catalogo/categoria/crianca", "/catalogo/categoria/batizado", "/catalogo/categoria/presentes", "/atendimento"]);
const NEW_FIELDS = new Set<EditorField>(["heroCtaHref", "outingsCtaHref", "blueCtaHref", "themeAccent"]);

function contrastWithWhite(hex: string): number {
  const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 1.05 / (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] + 0.05);
}

export function validateContent(input: unknown): PageContent {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Conteúdo inválido");
  const record = input as Record<string, unknown>;
  if (Object.keys(record).some((key) => !(key in EDITOR_FIELDS))) throw new Error("Campo desconhecido");
  const result = {} as PageContent;
  for (const field of Object.keys(EDITOR_FIELDS) as EditorField[]) {
    const { label, kind, max } = EDITOR_FIELDS[field];
    const raw = record[field] ?? (NEW_FIELDS.has(field) ? DEFAULT_CONTENT[field] : undefined);
    if (typeof raw !== "string") throw new Error(`${label}: valor obrigatório`);
    const value = raw.trim();
    if ((!value && kind !== "video") || value.length > max) throw new Error(`${label}: valor inválido`);
    if (kind === "image" && (!/\.(jpg|jpeg|png|webp)(?:$|\?)/i.test(value) || !(APPROVED_LOCAL_MEDIA.has(value) || MEDIA_URL.test(value)))) throw new Error(`${label}: escolha uma imagem enviada ao painel`);
    if (kind === "video" && value && (!/\.mp4(?:$|\?)/i.test(value) || !(APPROVED_LOCAL_MEDIA.has(value) || MEDIA_URL.test(value)))) throw new Error(`${label}: use um vídeo MP4 enviado ao painel`);
    if (kind === "link" && !ALLOWED_LINKS.has(value)) throw new Error(`${label}: escolha um destino interno permitido`);
    if (kind === "color" && (!/^#[0-9a-f]{6}$/i.test(value) || contrastWithWhite(value) < 4.5)) throw new Error(`${label}: escolha uma cor com contraste legível sobre branco`);
    result[field] = value;
  }
  return result;
}
