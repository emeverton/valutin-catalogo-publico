import type { Metadata } from "next";
import AnnouncementBar from "../../components/AnnouncementBar";
import Catalog from "../../components/Catalog";
import Footer from "../../components/Footer";
import GtmSnippet from "../../components/GtmSnippet";
import Header from "../../components/Header";

export const metadata: Metadata = {
  title: "Todas as peças | Catálogo Valutin",
  description: "Veja todas as peças individuais da coleção Valutin. Busque, filtre por tamanho e explore cada categoria.",
  alternates: { canonical: "/catalogo/todos" },
};

export default function AllProductsPage() {
  return <><a href="#main-content" className="skip-link">Pular para o conteúdo</a><GtmSnippet/><AnnouncementBar/><Header fromCatalog/><main id="main-content" tabIndex={-1} className="bg-white pt-[142px]"><Catalog heading="Todas as peças" /></main><Footer/></>;
}
