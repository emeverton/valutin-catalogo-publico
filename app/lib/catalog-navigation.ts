export const departments = [
  { slug: "bebe", label: "Bebês", title: "Para os primeiros dias", links: ["bodys-e-conjuntos", "macacoes-e-jardineiras", "tricos-e-casacos"] },
  { slug: "crianca", label: "Crianças", title: "Para acompanhar cada descoberta", links: ["vestidos", "camisetas-e-camisas", "saias-shorts-e-bermudas"] },
  { slug: "batizado", label: "Batizado", title: "Peças para momentos especiais", links: ["batizado-e-cerimonia"] },
  { slug: "presentes", label: "Presentes", title: "Para guardar na memória", links: ["presentes-e-lembrancas"] },
] as const;

export const productCategories = [
  { slug: "vestidos", label: "Vestidos" },
  { slug: "macacoes-e-jardineiras", label: "Macacões e jardineiras" },
  { slug: "bodys-e-conjuntos", label: "Bodys e conjuntos" },
  { slug: "camisetas-e-camisas", label: "Camisetas e camisas" },
  { slug: "saias-shorts-e-bermudas", label: "Saias, shorts e bermudas" },
  { slug: "tricos-e-casacos", label: "Tricôs e casacos" },
  { slug: "batizado-e-cerimonia", label: "Batizado e cerimônia" },
  { slug: "presentes-e-lembrancas", label: "Presentes e lembranças" },
] as const;

export const categoryLabel = (slug: string) => productCategories.find((category) => category.slug === slug)?.label ?? departments.find((department) => department.slug === slug)?.label ?? "A coleção";
export const isCatalogCategory = (slug: string) => productCategories.some((category) => category.slug === slug) || departments.some((department) => department.slug === slug);

export const categoryHref = (slug: string) => `/catalogo/categoria/${slug}`;
export const productHref = (handle: string) => `/catalogo/${handle}`;
