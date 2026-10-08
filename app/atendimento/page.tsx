"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import products from "../lib/catalog.json";
import QualificationModal from "../components/QualificationModal";
import GtmSnippet from "../components/GtmSnippet";
import { RETAIL_ONLY_COPY } from "../lib/constants";
export default function AtendimentoPage(){
 const [blocked,setBlocked]=useState(false);
 const [productTitle,setProductTitle]=useState("");
 useEffect(()=>{const q=new URLSearchParams(window.location.search);setProductTitle(q.get("peca")||products.find(p=>p.handle===q.get("produto"))?.title||"");setBlocked(["wholesale","1"].includes(q.get("blocked")||""));},[]);
 return <><a href="#main-content" className="skip-link">Pular para o conteúdo</a><GtmSnippet/><main id="main-content" tabIndex={-1} className="min-h-screen bg-cream px-5 py-10 sm:py-16"><div className="mx-auto max-w-xl"><Link href="/" className="font-poppins text-xs uppercase tracking-[0.2em] text-[#526c87]">← Valutin</Link><p className="mt-9 text-xs uppercase tracking-widest text-[#526c87]">Atendimento pessoal</p><h1 className="mt-3 font-playfair text-3xl leading-tight sm:text-4xl">{blocked?"Atendimento exclusivo ao varejo":"Vamos encontrar o próximo look?"}</h1><p className="mt-4 mb-7 font-poppins text-sm leading-relaxed text-ink/70">{blocked?RETAIL_ONLY_COPY.blocked:"Deixe seu nome e WhatsApp para conversar com nossa equipe. As preferências de peças podem ser combinadas durante o atendimento."}</p>{productTitle&&!blocked&&<p className="mb-5 rounded-xl border border-brand/25 p-4 text-sm">Seu interesse: <strong>{productTitle}</strong>. Vamos ajudar com tamanho, cor e disponibilidade.</p>}{!blocked&&<div className="rounded-2xl bg-white p-5 font-poppins shadow-sm sm:p-7"><QualificationModal isOpen inline onClose={()=>{}}/></div>}<Link href="/catalogo" className="mt-6 block text-center font-poppins text-sm text-[#526c87] underline underline-offset-4">Prefere explorar primeiro? Ver catálogo</Link></div></main></>;
}
