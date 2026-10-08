import type { StudioPlatform, StudioTemplateId } from "./types";

export interface StudioTemplate {
  id: StudioTemplateId;
  title: string;
  kind: "dashboard" | "report" | "both";
  description: string;
  defaultPlatforms: StudioPlatform[];
}

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    id: "executivo",
    title: "Dashboard Executivo",
    kind: "both",
    description: "Visão C-level: investimento, CPL/CPA, ROAS, metas H2 e mix de canais.",
    defaultPlatforms: ["meta", "google", "ga4", "kommo"],
  },
  {
    id: "midia_paga",
    title: "Mídia Paga",
    kind: "both",
    description: "Meta + Google com hierarquia de campanhas e eficiência de mídia.",
    defaultPlatforms: ["meta", "google"],
  },
  {
    id: "funil_completo",
    title: "Funil Completo",
    kind: "both",
    description: "Topo/meio/fundo + GA4 + WhatsApp + closed loop Kommo.",
    defaultPlatforms: ["meta", "google", "ga4", "kommo"],
  },
  {
    id: "crm_loja",
    title: "CRM & Loja",
    kind: "both",
    description: "Leads, pipeline, vendas e receita Kommo com CPA.",
    defaultPlatforms: ["kommo", "ga4"],
  },
  {
    id: "marca_social",
    title: "Marca & Social",
    kind: "both",
    description: "Seguidores, alcance e presença de marca (Page/IG).",
    defaultPlatforms: ["instagram", "meta", "youtube"],
  },
  {
    id: "youtube_gmb",
    title: "YouTube & Meu Negócio",
    kind: "both",
    description: "Canal YouTube + avaliações e impressões do Google Meu Negócio.",
    defaultPlatforms: ["youtube", "gmb", "instagram"],
  },
];
