import type {Metadata} from 'next';
import Header from '../components/Header';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import CatalogLanding from '../components/CatalogLanding';
import GtmSnippet from '../components/GtmSnippet';
export const metadata:Metadata={alternates:{canonical:'/catalogo'},openGraph:{title:'Catálogo Valutin',description:'Peças para bebês e crianças com atendimento pessoal.',url:'/catalogo',images:['/catalog/camiseta-veleiro-01.jpeg']},title:'Catálogo de moda infantil | Valutin',description:'Explore peças Valutin para bebês e crianças. Fotos, tamanhos e preços de referência, com atendimento pessoal pelo WhatsApp.'};
export default function CatalogPage(){return <><a href="#main-content" className="skip-link">Pular para o conteúdo</a><GtmSnippet/><AnnouncementBar/><Header fromCatalog/><main id="main-content" tabIndex={-1} className="bg-white pt-[142px]"><CatalogLanding/></main><Footer/></>}
