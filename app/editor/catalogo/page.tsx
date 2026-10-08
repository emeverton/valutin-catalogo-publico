import type { Metadata } from "next";
import CatalogPhotoEditor from "./CatalogPhotoEditor";

export const metadata: Metadata = { title: "Fotos do catálogo | Valutin", robots: { index: false, follow: false } };

export default function CatalogPhotoEditorPage() { return <CatalogPhotoEditor />; }
