import type { Metadata } from "next";
import NewProductEditor from "./NewProductEditor";

export const metadata: Metadata = { title: "Cadastrar peças | Valutin", robots: { index: false, follow: false } };

export default function NewProductsPage() { return <NewProductEditor />; }
