import sourceProducts from "./catalog.json";

type SourceProduct = (typeof sourceProducts)[number];
type EditablePiece<T> = T extends unknown ? Omit<T, "price"> & { price: number | null; stock?: Record<string, number> | null; collection?: "primavera-verao" | "geral"; sourceHandle?: string; linxSku?: string; linxSkus?: Record<string, string> } : never;
export type CatalogItem = EditablePiece<SourceProduct>;
type Piece = { suffix: string; title: string; imageIndices: number[] };

// Each distinct color/print gets its own catalog card. Photos listed together
// below are alternate views of that same piece, not selectable variants.
const piecesByProduct: Record<string, Piece[]> = {
  "camiseta-algodao": [
    { suffix: "veleiro-01", title: "Camiseta Algodão — Veleiro 1", imageIndices: [0, 9] },
    { suffix: "veleiro-02", title: "Camiseta Algodão — Veleiro 2", imageIndices: [1, 12] },
    { suffix: "motocross-01", title: "Camiseta Algodão — Motocross 1", imageIndices: [2, 11] },
    { suffix: "motocross-02", title: "Camiseta Algodão — Motocross 2", imageIndices: [3, 10] },
    { suffix: "carro-vintage-01", title: "Camiseta Algodão — Carro vintage 1", imageIndices: [4, 16] },
    { suffix: "carro-vintage-02", title: "Camiseta Algodão — Carro vintage 2", imageIndices: [5, 13] },
    { suffix: "fuscas", title: "Camiseta Algodão — Fuscas", imageIndices: [6, 14] },
    { suffix: "aviao-aquarela", title: "Camiseta Algodão — Avião aquarela", imageIndices: [7, 15] },
    { suffix: "esportes", title: "Camiseta Algodão — Esportes", imageIndices: [8] },
  ],
  "conjunto-laise": [
    { suffix: "rosa", title: "Conjunto Laise — Rosa", imageIndices: [0] },
    { suffix: "laranja", title: "Conjunto Laise — Laranja", imageIndices: [1] },
  ],
  "vestido-de-laise": [
    { suffix: "rosa", title: "Vestido de Laise — Rosa", imageIndices: [0, 1] },
    { suffix: "azul", title: "Vestido de Laise — Azul", imageIndices: [2, 3] },
  ],
  "vestido-listrado-algodao": [
    { suffix: "listrado-rosa", title: "Vestido Listrado Algodão — Rosa", imageIndices: [0, 1] },
    { suffix: "floral", title: "Vestido Algodão — Floral", imageIndices: [2] },
  ],
  "saia-algodao": [
    { suffix: "branca", title: "Saia Algodão — Branca", imageIndices: [0] },
    { suffix: "azul", title: "Saia Algodão — Azul", imageIndices: [1] },
    { suffix: "floral", title: "Saia Algodão — Floral", imageIndices: [2] },
  ],
  "macacao-tricoline": [
    { suffix: "listra-vermelha", title: "Macacão Tricoline — Listras Vermelhas", imageIndices: [0] },
    { suffix: "listra-sage", title: "Macacão Tricoline — Listras Sage", imageIndices: [1] },
    { suffix: "ursos", title: "Macacão Tricoline — Ursos", imageIndices: [2] },
  ],
  "macacao-fustao": [
    { suffix: "floral-rosa", title: "Macacão Fustão — Floral Rosa", imageIndices: [0] },
    { suffix: "azul", title: "Macacão Fustão — Azul", imageIndices: [1] },
  ],
  "conjunto-body-shorts": [
    { suffix: "xadrez-azul", title: "Conjunto Body e Shorts — Xadrez Azul", imageIndices: [0] },
    { suffix: "xadrez-rosa", title: "Conjunto Body e Shorts — Xadrez Rosa", imageIndices: [1] },
    { suffix: "floral", title: "Conjunto Body e Shorts — Floral", imageIndices: [2] },
  ],
  "vestido-xadrez": [
    { suffix: "azul", title: "Vestido Xadrez — Azul", imageIndices: [0, 1] },
    { suffix: "rosa", title: "Vestido Xadrez — Rosa", imageIndices: [2] },
  ],
  "cardigan-bordado-mao": [
    { suffix: "bordado-azul", title: "Cardigan Bordado à Mão — Flores Azuis", imageIndices: [0, 1] },
    { suffix: "bordado-rosa", title: "Cardigan Bordado à Mão — Flores Rosas", imageIndices: [2, 3] },
  ],
  "bermuda-linho": [
    { suffix: "verde", title: "Bermuda de Linho — Verde", imageIndices: [0] },
    { suffix: "azul-marinho", title: "Bermuda de Linho — Azul-marinho", imageIndices: [1] },
    { suffix: "caqui", title: "Bermuda de Linho — Caqui", imageIndices: [2] },
  ],
  "shorts-algodao": [
    { suffix: "azul", title: "Shorts de Algodão — Azul", imageIndices: [0] },
    { suffix: "rosa", title: "Shorts de Algodão — Rosa", imageIndices: [1] },
  ],
  "vestido-laise-novidades": [
    { suffix: "branco", title: "Vestido de Laise — Branco", imageIndices: [0] },
    { suffix: "amarelo", title: "Vestido de Laise — Amarelo", imageIndices: [1] },
  ],
  "jardineira-curta": [
    { suffix: "branca", title: "Jardineira Curta — Branca", imageIndices: [0] },
    { suffix: "off-white", title: "Jardineira Curta — Off-white", imageIndices: [1] },
  ],
  "boneco-artesanal": [
    { suffix: "rosa", title: "Boneco Artesanal — Rosa", imageIndices: [0] },
    { suffix: "verde", title: "Boneco Artesanal — Verde", imageIndices: [1] },
    { suffix: "azul", title: "Boneco Artesanal — Azul", imageIndices: [2] },
  ],
};

export const catalogProducts: CatalogItem[] = sourceProducts.flatMap((product) => {
  const pieces = piecesByProduct[product.handle];
  if (!pieces) return [product as CatalogItem];

  return pieces.map((piece): CatalogItem => ({
    ...product,
    handle: `${product.handle}-${piece.suffix}`,
    sourceHandle: product.handle,
    title: piece.title,
    colors: undefined,
    colorTitle: undefined,
    images: piece.imageIndices.map((index) => product.images[index]),
    displayImages: piece.imageIndices.map((index) => product.displayImages[index]),
    imageLabels: piece.imageIndices.map((index) => product.imageLabels[index]),
  }));
});
