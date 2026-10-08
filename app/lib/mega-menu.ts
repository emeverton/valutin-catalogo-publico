import { categoryHref, productHref } from "./catalog-navigation";

type MenuLink = { label: string; href: string };
type MenuColumn = { title: string; links: MenuLink[] };
type MenuPromo = { handle: string; label: string };

export type MegaMenuSection = {
  key: string;
  label: string;
  href: string;
  eyebrow: string;
  title: string;
  columns: MenuColumn[];
  promos: MenuPromo[];
};

const category = (slug: string, label: string): MenuLink => ({ label, href: categoryHref(slug) });
const product = (handle: string, label: string): MenuLink => ({ label, href: productHref(handle) });

export const megaMenuSections: MegaMenuSection[] = [
  {
    key: "primavera-verao", label: "Primavera–Verão", href: "/catalogo/primavera-verao",
    eyebrow: "Nova estação · 2026/27", title: "Primavera–Verão Valutin",
    columns: [
      { title: "Descubra a estação", links: [
        { label: "Toda a seleção Primavera–Verão", href: "/catalogo/primavera-verao" },
        category("vestidos", "Vestidos leves"),
        category("camisetas-e-camisas", "Camisetas e camisas"),
        category("saias-shorts-e-bermudas", "Saias, shorts e bermudas"),
      ] },
      { title: "Para cada momento", links: [
        category("bebe", "Bebês"), category("crianca", "Crianças"),
        category("batizado", "Batizado e cerimônia"),
        category("presentes", "Presentes"),
      ] },
      { title: "Peças em destaque", links: [
        product("vestido-laise-novidades-amarelo", "Vestido de laise amarelo"),
        product("bermuda-linho-verde", "Bermuda de linho verde"),
        product("macacao-tricoline-listra-sage", "Macacão listrado sage"),
      ] },
    ],
    promos: [
      { handle: "vestido-laise-novidades-amarelo", label: "Leveza em laise" },
      { handle: "macacao-tricoline-listra-sage", label: "Primeiros dias de sol" },
    ],
  },
  {
    key: "bebe", label: "Bebês", href: categoryHref("bebe"),
    eyebrow: "Dos primeiros dias às descobertas", title: "O universo bebê",
    columns: [
      { title: "Comprar por categoria", links: [
        category("bodys-e-conjuntos", "Bodys e conjuntos"),
        category("macacoes-e-jardineiras", "Macacões e jardineiras"),
        category("saias-shorts-e-bermudas", "Bloomers e shorts"),
        category("tricos-e-casacos", "Tricôs e casacos"),
      ] },
      { title: "Descobrir", links: [
        category("bebe", "Todas as peças para bebês"),
        category("presentes", "Presentes para bebês"),
        category("batizado", "Batizado e cerimônia"),
      ] },
      { title: "Peças em destaque", links: [
        product("macacao-tricoline-listra-sage", "Macacão de tricoline"),
        product("conjunto-body-shorts-xadrez-azul", "Body e shorts xadrez"),
        product("jardineira-ursos", "Jardineira de ursinhos"),
      ] },
    ],
    promos: [
      { handle: "macacao-tricoline-listra-sage", label: "Macacões para a estação" },
      { handle: "conjunto-body-shorts-xadrez-azul", label: "Conjuntos para descobrir" },
    ],
  },
  {
    key: "crianca", label: "Crianças", href: categoryHref("crianca"),
    eyebrow: "Peças para viver a infância", title: "Para meninas e meninos",
    columns: [
      { title: "Comprar por categoria", links: [
        category("vestidos", "Vestidos"),
        category("camisetas-e-camisas", "Camisetas e camisas"),
        category("saias-shorts-e-bermudas", "Saias, shorts e bermudas"),
        category("bodys-e-conjuntos", "Conjuntos"),
      ] },
      { title: "Descobrir", links: [
        category("crianca", "Todas as peças infantis"),
        { label: "Primavera–Verão", href: "/catalogo/primavera-verao" },
        category("batizado", "Ocasiões especiais"),
      ] },
      { title: "Peças em destaque", links: [
        product("vestido-de-laise-rosa", "Vestido de laise rosa"),
        product("camiseta-algodao-veleiro-01", "Camiseta de veleiro"),
        product("bermuda-linho-verde", "Bermuda de linho"),
      ] },
    ],
    promos: [
      { handle: "vestido-de-laise-rosa", label: "Vestidos da estação" },
      { handle: "camiseta-algodao-veleiro-01", label: "Essenciais com imaginação" },
    ],
  },
  {
    key: "batizado", label: "Batizado", href: categoryHref("batizado"),
    eyebrow: "Memórias para guardar", title: "Batizado e cerimônia",
    columns: [
      { title: "Para celebrar", links: [
        category("batizado", "Toda a coleção de batizado"),
        category("batizado-e-cerimonia", "Roupas de cerimônia"),
        product("vestido-linho-batizado", "Vestido de linho"),
        product("mandriao-masculino", "Mandrião masculino"),
      ] },
      { title: "Para completar", links: [
        category("presentes", "Presentes e lembranças"),
        product("toalha-batizado", "Toalha de batizado"),
        product("vela-batizado", "Vela de batizado"),
      ] },
      { title: "Atendimento", links: [
        { label: "Ajuda para escolher a peça", href: "/atendimento" },
        { label: "Ver todas as peças", href: "/catalogo" },
      ] },
    ],
    promos: [
      { handle: "vestido-linho-batizado", label: "Vestidos de cerimônia" },
      { handle: "mandriao-masculino", label: "Os primeiros momentos" },
    ],
  },
  {
    key: "presentes", label: "Presentes", href: categoryHref("presentes"),
    eyebrow: "Escolhas com carinho", title: "Presentes Valutin",
    columns: [
      { title: "Ideias para presentear", links: [
        category("presentes", "Todos os presentes"),
        product("boneco-artesanal-rosa", "Bonecos artesanais"),
        product("boneco-bem", "Boneco BEM"),
      ] },
      { title: "Para ocasiões especiais", links: [
        category("batizado", "Batizado e cerimônia"),
        product("toalha-batizado", "Toalha de batizado"),
        product("vela-batizado", "Vela de batizado"),
      ] },
      { title: "Precisa de ajuda?", links: [
        { label: "Atendimento pessoal", href: "/atendimento" },
        { label: "Ver toda a coleção", href: "/catalogo" },
      ] },
    ],
    promos: [
      { handle: "boneco-artesanal-rosa", label: "Bonecos para guardar" },
      { handle: "toalha-batizado", label: "Peças para celebrar" },
    ],
  },
  {
    key: "colecao", label: "Toda a coleção", href: "/catalogo",
    eyebrow: "O catálogo Valutin", title: "Encontre a próxima lembrança",
    columns: [
      { title: "Por categoria", links: [
        category("vestidos", "Vestidos"),
        category("macacoes-e-jardineiras", "Macacões e jardineiras"),
        category("bodys-e-conjuntos", "Bodys e conjuntos"),
        category("camisetas-e-camisas", "Camisetas e camisas"),
      ] },
      { title: "Mais peças", links: [
        category("saias-shorts-e-bermudas", "Saias, shorts e bermudas"),
        category("tricos-e-casacos", "Tricôs e casacos"),
        category("batizado-e-cerimonia", "Batizado e cerimônia"),
        category("presentes-e-lembrancas", "Presentes e lembranças"),
      ] },
      { title: "Descobrir", links: [
        { label: "Primavera–Verão", href: "/catalogo/primavera-verao" },
        category("bebe", "Bebês"), category("crianca", "Crianças"),
        { label: "Ver todo o catálogo", href: "/catalogo" },
      ] },
    ],
    promos: [
      { handle: "vestido-percal-tricolor", label: "A curadoria Valutin" },
      { handle: "jardineira-ursos", label: "Primeiras descobertas" },
    ],
  },
];
