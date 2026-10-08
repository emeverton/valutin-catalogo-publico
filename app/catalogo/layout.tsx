import { CatalogMediaProvider } from "../components/CatalogMediaProvider";
import { getCatalogProducts } from "../lib/editor/catalog-store";

export const dynamic = "force-dynamic";

export default async function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <CatalogMediaProvider products={await getCatalogProducts()}>{children}</CatalogMediaProvider>;
}
