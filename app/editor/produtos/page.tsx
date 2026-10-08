import type { Metadata } from "next";
import ProductEditor from "./ProductEditor";

export const metadata: Metadata = { title: "Produtos e preços | Valutin", robots: { index: false, follow: false } };

export default function ProductsPage() { return <ProductEditor />; }
