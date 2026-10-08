"use client";

import { createContext, useContext, type ReactNode } from "react";
import { catalogProducts, type CatalogItem } from "../lib/catalog-individual";

const Context = createContext<CatalogItem[]>(catalogProducts);

export function CatalogMediaProvider({ products, children }: { products: CatalogItem[]; children: ReactNode }) {
  return <Context.Provider value={products}>{children}</Context.Provider>;
}

export function useCatalogProducts(): CatalogItem[] {
  return useContext(Context);
}
