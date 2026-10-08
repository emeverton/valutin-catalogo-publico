import type {
  AiAnalysisResult,
  DashboardSummary,
  StudioPlatform,
} from "./types";

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

function brl(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
}

function delta(cur: number, prev: number | null | undefined): number | null {
  if (prev == null) return null;
  if (prev === 0) return cur === 0 ? 0 : 1;
  return (cur - prev) / Math.abs(prev);
}

function fmtDelta(d: number | null): string {
  if (d == null) return "sem base";
  const sign = d > 0 ? "+" : "";
  return `${sign}${(d * 100).toFixed(0)}%`;
}

/** Análise estilo Reportei AI — regras C-level sobre o summary (+ compare opcional). */
export function buildRulesAnalysis(
  current: DashboardSummary,
  compare: DashboardSummary | null,
  platforms: StudioPlatform[]
): AiAnalysisResult {
  const e = current.efficiency;
  const pe = compare?.efficiency;
  const highlights: string[] = [];
  const risks: string[] = [];
  const recommendations: AiAnalysisResult["recommendations"] = [];
  const channelNotes: AiAnalysisResult["channelNotes"] = [];

  const spendDelta = delta(e.spendTotal, pe?.spendTotal);
  const leadsDelta = delta(e.leads, pe?.leads);
  const salesDelta = delta(e.sales, pe?.sales);
  const cplDelta = delta(e.cpl ?? 0, pe?.cpl);

  if (platforms.includes("meta") || platforms.includes("google")) {
    if (spendDelta != null && spendDelta > 0.15 && (leadsDelta == null || leadsDelta < 0.05)) {
      risks.push(
        `Investimento subiu ${fmtDelta(spendDelta)} sem resposta proporcional em leads (${fmtDelta(leadsDelta)}).`
      );
      recommendations.push({
        channel: "Mídia",
        action: "Revisar criativos e públicos de maior CPL; redistribuir verba para conjuntos com melhor eficiência.",
        priority: "alta",
      });
    } else if (leadsDelta != null && leadsDelta > 0.1) {
      highlights.push(`Leads cresceram ${fmtDelta(leadsDelta)} no período versus comparação.`);
    }
  }

  if (e.cpl != null && e.cpl > 40) {
    risks.push(`CPL em ${brl(e.cpl)} acima do alvo H2 (R$ 30–34).`);
    recommendations.push({
      channel: "Aquisição",
      action: "Pausar anúncios com CPA/CPL outlier e reforçar remarketing de site 30d + lista clientes.",
      priority: "alta",
    });
  } else if (e.cpl != null && e.cpl <= 34) {
    highlights.push(`CPL em ${brl(e.cpl)} dentro/abaixo do alvo estratégico.`);
  }

  if (platforms.includes("meta") && current.meta.status === "ok") {
    const funnel = current.meta.funnel;
    for (const layer of funnel) {
      const drift = layer.share - layer.targetShare;
      if (Math.abs(drift) >= 0.08) {
        risks.push(
          `Funil Meta ${layer.label}: spend em ${pct(layer.share)} vs alvo ${pct(layer.targetShare)} (desvio ${pct(drift)}).`
        );
        recommendations.push({
          channel: "Meta",
          action: `Rebalancear CBO para aproximar ${layer.key} do split 40/35/25.`,
          priority: Math.abs(drift) > 0.12 ? "alta" : "media",
        });
      }
    }
    const waLayer = funnel.find((f) => f.key === "fundo");
    channelNotes.push({
      channel: "Meta Ads",
      verdict: current.meta.spend > 0 ? "Ativo" : "Sem spend",
      detail: `Spend ${brl(current.meta.spend)} · ${current.meta.entities.filter((x) => x.level === "campaign").length} campanhas · fundo WA ${formatNumber(waLayer?.results || 0)} resultados.`,
    });
  }

  if (platforms.includes("google") && current.google.status === "ok") {
    const conv = current.google.conversions;
    const cpa =
      conv > 0 ? current.google.spend / conv : null;
    channelNotes.push({
      channel: "Google Ads",
      verdict: conv > 0 ? "Convertendo" : "Baixa conversão",
      detail: `Spend ${brl(current.google.spend)} · ${formatNumber(conv)} conversões · ${current.google.entities.filter((x) => x.level === "campaign").length} campanhas.`,
    });
    if (cpa != null && e.cpa != null && cpa > e.cpa * 1.5) {
      recommendations.push({
        channel: "Google",
        action: "Auditar Search vs PMax: concentrar verba em termos de marca/intenção com melhor CPA.",
        priority: "media",
      });
    } else if (conv > 0) {
      highlights.push(`Google entregou ${formatNumber(conv)} conversões no período.`);
    }
  }

  if (platforms.includes("ga4") && current.ga4.status === "ok") {
    channelNotes.push({
      channel: "GA4",
      verdict: current.ga4.whatsapp > 0 ? "Eventos OK" : "Checar WhatsApp",
      detail: `${formatNumber(current.ga4.sessions)} sessões · ${formatNumber(current.ga4.whatsapp)} whatsapp · ${formatNumber(current.ga4.generateLead)} generate_lead.`,
    });
    if (current.ga4.whatsapp === 0 && e.leads > 0) {
      risks.push("Há leads no CRM, mas evento whatsapp no GA4 zerado — validar GTM/trigger.");
      recommendations.push({
        channel: "Tracking",
        action: "QA Events Manager + Preview GTM no clique WhatsApp da LP.",
        priority: "alta",
      });
    }
  }

  if (platforms.includes("kommo") && current.kommo.status === "ok") {
    const winRate =
      current.kommo.newLeads > 0
        ? current.kommo.sales / current.kommo.newLeads
        : null;
    channelNotes.push({
      channel: "Kommo",
      verdict: current.kommo.sales > 0 ? "Fechando" : "Sem vendas no período",
      detail: `${formatNumber(current.kommo.newLeads)} leads · ${formatNumber(current.kommo.sales)} vendas · receita ${brl(current.kommo.revenue)}.`,
    });
    if (winRate != null && winRate < 0.05 && current.kommo.newLeads >= 20) {
      risks.push(
        `Taxa de fechamento baixa (${pct(winRate)}) com volume de leads — gargalo de atendimento/follow-up.`
      );
      recommendations.push({
        channel: "Kommo",
        action: "Priorizar follow-up ≥2 em Em Atendimento e Negociando; registrar valor (lead_value) em toda venda.",
        priority: "alta",
      });
    } else if (salesDelta != null && salesDelta > 0) {
      highlights.push(`Vendas Kommo ${fmtDelta(salesDelta)} vs período de comparação.`);
    }
  }

  if (platforms.includes("instagram")) {
    channelNotes.push({
      channel: "Marca",
      verdict: current.instagram.status === "ok" ? "Live" : "Parcial",
      detail: `${formatNumber(current.instagram.followers)} seguidores · alcance ${formatNumber(current.instagram.reach)}.`,
    });
    if (current.instagram.status === "partial") {
      recommendations.push({
        channel: "Instagram",
        action: "Vincular @valutinoficial como IG Business na Page Valutin para insights completos.",
        priority: "baixa",
      });
    }
  }


  if (platforms.includes("youtube")) {
    channelNotes.push({
      channel: "YouTube",
      verdict: current.youtube.status === "unavailable" ? "Off" : "Live",
      detail: `${current.youtube.title || "Canal"} · ${formatNumber(current.youtube.viewsLifetime)} views lifetime · ${formatNumber(current.youtube.videoCount)} vídeos.`,
    });
    if (current.youtube.status === "unavailable") {
      recommendations.push({
        channel: "YouTube",
        action: "Confirmar YOUTUBE_CHANNEL_ID e OAuth com escopo youtube.readonly.",
        priority: "baixa",
      });
    } else if ((current.youtube.subscribers || 0) < 100) {
      recommendations.push({
        channel: "YouTube",
        action: "Empurrar Shorts dos looks VNC na bio/WA e campanhas de remarketing de video views.",
        priority: "media",
      });
    }
  }

  if (platforms.includes("gmb")) {
    channelNotes.push({
      channel: "Google Meu Negócio",
      verdict: current.gmb.status === "ok" ? "Live" : current.gmb.status === "partial" ? "Parcial" : "Off",
      detail: current.gmb.rating != null
        ? `${current.gmb.rating.toFixed(1)}★ · ${formatNumber(current.gmb.reviewCount)} reviews · ${formatNumber(current.gmb.impressions || 0)} impressões.`
        : (current.gmb.error || "Sem métricas — configure GBP_LOCATION_NAME."),
    });
    if (current.gmb.status === "unavailable") {
      recommendations.push({
        channel: "GMB",
        action: "Conceder Manager no perfil Valutin e setar GBP_LOCATION_NAME no Vercel.",
        priority: "media",
      });
    } else if ((current.gmb.reviewCount || 0) < 30) {
      recommendations.push({
        channel: "GMB",
        action: "Acelerar coleta de avaliações pós-compra (rotina H2 do Plano Operacional).",
        priority: "media",
      });
    }
  }

  // Opportunity score 0–100
  let score = 55;
  if (e.cpl != null && e.cpl <= 34) score += 12;
  if (e.cpl != null && e.cpl > 45) score -= 15;
  if (leadsDelta != null && leadsDelta > 0.1) score += 10;
  if (leadsDelta != null && leadsDelta < -0.1) score -= 10;
  if (e.roas != null && e.roas >= 2) score += 10;
  if (risks.length >= 3) score -= 10;
  if (highlights.length >= 2) score += 5;
  score = Math.max(5, Math.min(95, score));

  const executiveSummary = [
    `No período ${current.period.label}, a Valutin investiu ${brl(e.spendTotal)}`,
    ` (Meta ${brl(e.spendMeta)} · Google ${brl(e.spendGoogle)}), gerando ${formatNumber(e.leads)} leads`,
    e.sales > 0
      ? ` e ${formatNumber(e.sales)} vendas (${brl(e.revenue)}).`
      : " sem vendas registradas no CRM no recorte.",
    compare
      ? ` Versus ${compare.period.label}: spend ${fmtDelta(spendDelta)}, leads ${fmtDelta(leadsDelta)}, vendas ${fmtDelta(salesDelta)}, CPL ${fmtDelta(cplDelta)}.`
      : "",
    score >= 70
      ? " Oportunidade de escala seletiva nos canais eficientes."
      : score >= 45
        ? " Há espaço claro de otimização antes de escalar verba."
        : " Priorize correção de eficiência e tracking antes de ampliar investimento.",
  ]
    .filter(Boolean)
    .join("");

  if (!highlights.length) {
    highlights.push("Operação de mídia ativa com dados suficientes para decisão semanal.");
  }
  if (!recommendations.length) {
    recommendations.push({
      channel: "Geral",
      action: "Manter ritmo de QA diário e revisão de criativos na quarta-feira (rotina Plano 2S).",
      priority: "media",
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    opportunityScore: score,
    executiveSummary,
    highlights,
    risks,
    recommendations,
    channelNotes,
    model: "valutin-rules",
  };
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(n));
}

export async function maybeEnhanceWithOpenAI(
  base: AiAnalysisResult,
  current: DashboardSummary
): Promise<AiAnalysisResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return base;

  try {
    const prompt = {
      role: "system",
      content:
        "Você é analista C-level de performance para moda infantil premium (Valutin). Escreva em pt-BR, tom executivo, sem emoji. Retorne JSON com executiveSummary (2-4 frases), highlights (array), risks (array), recommendations (array de {channel, action, priority}).",
    };
    const user = {
      role: "user",
      content: JSON.stringify({
        period: current.period,
        efficiency: current.efficiency,
        baseAnalysis: base,
      }),
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [prompt, user],
      }),
    });
    if (!res.ok) return base;
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return base;
    const parsed = JSON.parse(content) as Partial<AiAnalysisResult>;
    return {
      ...base,
      executiveSummary: parsed.executiveSummary || base.executiveSummary,
      highlights: parsed.highlights?.length ? parsed.highlights : base.highlights,
      risks: parsed.risks?.length ? parsed.risks : base.risks,
      recommendations: parsed.recommendations?.length
        ? (parsed.recommendations as AiAnalysisResult["recommendations"])
        : base.recommendations,
      model: "openai",
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return base;
  }
}
