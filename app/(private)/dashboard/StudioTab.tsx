"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AiAnalysisResult,
  DashboardSummary,
  PeriodKey,
  StudioDocType,
  StudioDocument,
  StudioPlatform,
  StudioTemplateId,
} from "@/app/lib/dashboard/types";
import { STUDIO_TEMPLATES } from "@/app/lib/dashboard/studio-templates";
import {
  deleteStudioDoc,
  listStudioDocs,
  newStudioId,
  saveStudioDoc,
} from "@/app/lib/dashboard/studio-store";
import { formatBRL, formatNumber } from "@/app/lib/dashboard/format";

const PLATFORMS: Array<{ id: StudioPlatform; label: string }> = [
  { id: "meta", label: "Meta Ads" },
  { id: "google", label: "Google Ads" },
  { id: "ga4", label: "GA4" },
  { id: "kommo", label: "Kommo" },
  { id: "instagram", label: "Marca" },
  { id: "youtube", label: "YouTube" },
  { id: "gmb", label: "Meu Negócio" },
];

const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "mtd", label: "Mês" },
  { key: "h2", label: "H2" },
  { key: "custom", label: "Personalizado" },
];

type WizardStep = "type" | "config" | "done";

export function StudioTab({
  current,
  compare,
  onApplyDashboard,
}: {
  current: DashboardSummary;
  compare: DashboardSummary | null;
  onApplyDashboard: (doc: StudioDocument) => void;
}) {
  const [docs, setDocs] = useState<StudioDocument[]>([]);
  const [mode, setMode] = useState<"list" | "create" | "ai" | "view">("list");
  const [step, setStep] = useState<WizardStep>("type");
  const [docType, setDocType] = useState<StudioDocType>("dashboard");
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState<StudioTemplateId>("executivo");
  const [platforms, setPlatforms] = useState<StudioPlatform[]>([
    "meta",
    "google",
    "ga4",
    "kommo",
  ]);
  const [periodKey, setPeriodKey] = useState<PeriodKey>("mtd");
  const [customSince, setCustomSince] = useState(current.period.since);
  const [customUntil, setCustomUntil] = useState(current.period.until);
  const [compareMode, setCompareMode] = useState<"off" | "previous" | "custom">(
    "previous"
  );
  const [includeAi, setIncludeAi] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [viewDoc, setViewDoc] = useState<StudioDocument | null>(null);

  const refresh = useCallback(() => {
    setDocs(listStudioDocs());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const templates = useMemo(
    () =>
      STUDIO_TEMPLATES.filter(
        (t) => t.kind === "both" || t.kind === docType
      ),
    [docType]
  );

  function startCreate(type: StudioDocType) {
    setDocType(type);
    setTitle(
      type === "dashboard"
        ? `Dashboard Valutin · ${current.period.label}`
        : `Relatório Valutin · ${current.period.label}`
    );
    setTemplateId("executivo");
    const tpl = STUDIO_TEMPLATES.find((t) => t.id === "executivo");
    setPlatforms(tpl?.defaultPlatforms || ["meta", "google", "ga4", "kommo"]);
    setPeriodKey("mtd");
    setCompareMode("previous");
    setIncludeAi(true);
    setStep("type");
    setError("");
    setMode("create");
  }

  function togglePlatform(id: StudioPlatform) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function onPickTemplate(id: StudioTemplateId) {
    setTemplateId(id);
    const tpl = STUDIO_TEMPLATES.find((t) => t.id === id);
    if (tpl) setPlatforms(tpl.defaultPlatforms);
  }

  async function runAi(): Promise<AiAnalysisResult | null> {
    const res = await fetch("/api/dashboard/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        period: periodKey === "custom" ? undefined : periodKey,
        since: periodKey === "custom" ? customSince : undefined,
        until: periodKey === "custom" ? customUntil : undefined,
        compare: compareMode,
        platforms,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t.slice(0, 160));
    }
    const json = (await res.json()) as { analysis: AiAnalysisResult };
    return json.analysis;
  }

  async function createDocument() {
    if (!title.trim()) {
      setError("Informe um título");
      return;
    }
    if (!platforms.length) {
      setError("Selecione ao menos uma plataforma");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let analysis: AiAnalysisResult | undefined;
      if (includeAi) {
        analysis = (await runAi()) || undefined;
      }

      const now = new Date().toISOString();
      const doc: StudioDocument = {
        id: newStudioId(docType === "dashboard" ? "dash" : "rpt"),
        type: docType,
        title: title.trim(),
        subtitle: STUDIO_TEMPLATES.find((t) => t.id === templateId)?.title,
        templateId,
        platforms,
        periodKey,
        customSince: periodKey === "custom" ? customSince : undefined,
        customUntil: periodKey === "custom" ? customUntil : undefined,
        compareMode,
        includeAi,
        createdAt: now,
        updatedAt: now,
      };

      if (docType === "report") {
        doc.snapshot = {
          generatedAt: now,
          periodLabel: current.period.label,
          compareLabel: compare?.period.label,
          kpis: {
            spendTotal: current.efficiency.spendTotal,
            spendMeta: current.efficiency.spendMeta,
            spendGoogle: current.efficiency.spendGoogle,
            leads: current.efficiency.leads,
            sales: current.efficiency.sales,
            revenue: current.efficiency.revenue,
            cpl: current.efficiency.cpl,
            cpa: current.efficiency.cpa,
            roas: current.efficiency.roas,
          },
          notes: current.notes,
          aiAnalysis: analysis,
        };
      }

      saveStudioDoc(doc);
      refresh();
      setStep("done");
      setViewDoc(doc);
      if (analysis) setAiResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar");
    } finally {
      setBusy(false);
    }
  }

  async function generateStandaloneAi() {
    setBusy(true);
    setError("");
    try {
      const analysis = await runAi();
      setAiResult(analysis);
      setMode("ai");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na análise IA");
    } finally {
      setBusy(false);
    }
  }

  function removeDoc(id: string) {
    deleteStudioDoc(id);
    refresh();
    if (viewDoc?.id === id) {
      setViewDoc(null);
      setMode("list");
    }
  }

  const dashboards = docs.filter((d) => d.type === "dashboard");
  const reports = docs.filter((d) => d.type === "report");

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Studio</p>
          <h2 className="mt-2 font-playfair text-3xl md:text-4xl text-ink">
            Dashboards, relatórios & IA
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink/55">
            Fluxo no padrão Reportei: dashboard live, relatório estático (snapshot) e análise
            automática com insights C-level.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => startCreate("dashboard")}
            className="bg-ink px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-cream hover:bg-brand"
          >
            Novo dashboard
          </button>
          <button
            type="button"
            onClick={() => startCreate("report")}
            className="border border-ink/20 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ink hover:border-brand"
          >
            Novo relatório
          </button>
          <button
            type="button"
            onClick={() => void generateStandaloneAi()}
            disabled={busy}
            className="border border-brand/40 bg-brand/10 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ink hover:bg-brand/20 disabled:opacity-40"
          >
            {busy && mode === "ai" ? "Analisando…" : "Análise IA"}
          </button>
        </div>
      </section>

      {error ? (
        <p className="border border-red-200 bg-white px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {/* Create wizard */}
      {mode === "create" ? (
        <div className="dash-surface p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/45">
              Criar {docType === "dashboard" ? "dashboard live" : "relatório estático"} · passo{" "}
              {step === "type" ? "1/2" : step === "config" ? "2/2" : "ok"}
            </p>
            <button
              type="button"
              onClick={() => setMode("list")}
              className="text-xs uppercase tracking-[0.14em] text-ink/40 hover:text-ink"
            >
              Cancelar
            </button>
          </div>

          {step === "type" ? (
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.16em] text-ink/40">Título</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-lg outline-none focus:border-brand"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">Template</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onPickTemplate(t.id)}
                      className={`border p-4 text-left transition ${
                        templateId === t.id
                          ? "border-ink bg-cream/80"
                          : "border-brand-light/40 hover:border-brand"
                      }`}
                    >
                      <p className="font-playfair text-lg text-ink">{t.title}</p>
                      <p className="mt-2 text-xs text-ink/55">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep("config")}
                className="bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-cream"
              >
                Continuar
              </button>
            </div>
          ) : null}

          {step === "config" ? (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">
                  Plataformas (integrações)
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const on = platforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`px-3 py-2 text-xs uppercase tracking-[0.12em] ${
                          on ? "bg-brand text-white" : "border border-ink/15 text-ink/55"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">Período</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PERIODS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPeriodKey(p.key)}
                      className={`px-3 py-2 text-xs uppercase tracking-[0.12em] ${
                        periodKey === p.key ? "bg-ink text-cream" : "text-ink/55"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {periodKey === "custom" ? (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <DateField label="De" value={customSince} onChange={setCustomSince} />
                    <DateField label="Até" value={customUntil} onChange={setCustomUntil} />
                  </div>
                ) : null}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">Comparação</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      ["off", "Off"],
                      ["previous", "Período anterior"],
                      ["custom", "Custom"],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setCompareMode(k)}
                      className={`px-3 py-2 text-xs uppercase tracking-[0.12em] ${
                        compareMode === k ? "bg-brand text-white" : "text-ink/55"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-ink/70">
                <input
                  type="checkbox"
                  checked={includeAi}
                  onChange={(e) => setIncludeAi(e.target.checked)}
                  className="h-4 w-4 accent-[rgb(133,160,190)]"
                />
                Incluir análise IA (estilo Reportei AI)
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStep("type")}
                  className="border border-ink/15 px-4 py-3 text-[11px] uppercase tracking-[0.14em]"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void createDocument()}
                  className="bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-cream disabled:opacity-40"
                >
                  {busy
                    ? "Gerando…"
                    : docType === "dashboard"
                      ? "Criar dashboard"
                      : "Gerar relatório"}
                </button>
              </div>
            </div>
          ) : null}

          {step === "done" && viewDoc ? (
            <div className="space-y-4">
              <p className="font-playfair text-2xl text-ink">Pronto: {viewDoc.title}</p>
              <p className="text-sm text-ink/55">
                {viewDoc.type === "dashboard"
                  ? "Dashboard live salvo. Você pode aplicá-lo ao painel ou abri-lo depois."
                  : "Relatório estático gerado com snapshot do período."}
              </p>
              <div className="flex flex-wrap gap-2">
                {viewDoc.type === "dashboard" ? (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyDashboard(viewDoc);
                      setMode("list");
                    }}
                    className="bg-brand px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-white"
                  >
                    Aplicar ao painel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    className="bg-brand px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-white"
                  >
                    Ver relatório
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMode("list")}
                  className="border border-ink/15 px-4 py-3 text-[11px] uppercase tracking-[0.14em]"
                >
                  Voltar à lista
                </button>
              </div>
              {viewDoc.snapshot?.aiAnalysis ? (
                <AiCard analysis={viewDoc.snapshot.aiAnalysis} />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* AI standalone */}
      {mode === "ai" && aiResult ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/45">Análise IA · sessão</p>
            <button
              type="button"
              onClick={() => setMode("list")}
              className="text-xs uppercase tracking-[0.14em] text-ink/40 hover:text-ink"
            >
              Fechar
            </button>
          </div>
          <AiCard analysis={aiResult} />
        </div>
      ) : null}

      {/* View report */}
      {mode === "view" && viewDoc?.snapshot ? (
        <ReportView doc={viewDoc} onClose={() => setMode("list")} />
      ) : null}

      {/* Lists */}
      {mode === "list" ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <DocList
            title="Dashboards live"
            empty="Nenhum dashboard ainda — crie como no Reportei (período + plataformas + template)."
            docs={dashboards}
            onOpen={(d) => {
              onApplyDashboard(d);
            }}
            onView={(d) => {
              setViewDoc(d);
              setMode("view");
            }}
            onDelete={removeDoc}
            primaryActionLabel="Aplicar"
          />
          <DocList
            title="Relatórios estáticos"
            empty="Nenhum relatório — gere um snapshot com análise IA opcional."
            docs={reports}
            onOpen={(d) => {
              setViewDoc(d);
              setMode("view");
            }}
            onView={(d) => {
              setViewDoc(d);
              setMode("view");
            }}
            onDelete={removeDoc}
            primaryActionLabel="Abrir"
          />
        </div>
      ) : null}

      {/* How it maps to Reportei */}
      {mode === "list" ? (
        <section className="border-t border-brand-light/30 pt-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink/40">Como no Reportei</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Dashboard"
              body="Visão live: ao aplicar, o painel usa o período/plataformas salvos e atualiza a cada refresh."
            />
            <InfoCard
              title="Relatório"
              body="Snapshot estático no momento da criação — KPIs + notas + análise IA gravados para compartilhar."
            />
            <InfoCard
              title="Análise IA"
              body="Score de oportunidade, resumo executivo, riscos e recomendações por canal (regras Valutin + OpenAI se configurado)."
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DocList({
  title,
  empty,
  docs,
  onOpen,
  onView,
  onDelete,
  primaryActionLabel,
}: {
  title: string;
  empty: string;
  docs: StudioDocument[];
  onOpen: (d: StudioDocument) => void;
  onView: (d: StudioDocument) => void;
  onDelete: (id: string) => void;
  primaryActionLabel: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40">{title}</p>
      <ul className="mt-4 dash-surface">
        {docs.map((d) => (
          <li
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-light/20 px-4 py-3 last:border-0"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{d.title}</p>
              <p className="mt-1 text-[11px] text-ink/45">
                {d.subtitle} · {d.platforms.join(", ")} ·{" "}
                {new Date(d.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onOpen(d)}
                className="px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-brand hover:underline"
              >
                {primaryActionLabel}
              </button>
              {d.type === "report" ? (
                <button
                  type="button"
                  onClick={() => onView(d)}
                  className="px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ink/50 hover:text-ink"
                >
                  Ver
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onDelete(d.id)}
                className="px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ink/35 hover:text-red-700"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
        {!docs.length ? <li className="px-4 py-5 text-sm text-ink/40">{empty}</li> : null}
      </ul>
    </div>
  );
}

function ReportView({ doc, onClose }: { doc: StudioDocument; onClose: () => void }) {
  const snap = doc.snapshot;
  if (!snap) {
    return (
      <div className="dash-surface p-6">
        <p className="text-sm text-ink/55">
          Este é um dashboard live — use &quot;Aplicar&quot; para carregar no painel.
        </p>
        <button type="button" onClick={onClose} className="mt-4 text-xs uppercase tracking-[0.14em]">
          Fechar
        </button>
      </div>
    );
  }
  return (
    <div className="border border-brand-light/40 bg-white/80 p-6 md:p-8 print:border-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40">Relatório estático</p>
          <h3 className="mt-2 font-playfair text-3xl text-ink">{doc.title}</h3>
          <p className="mt-2 text-sm text-ink/55">
            {snap.periodLabel}
            {snap.compareLabel ? ` · vs ${snap.compareLabel}` : ""} · gerado{" "}
            {new Date(snap.generatedAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="border border-ink/15 px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
          >
            Imprimir / PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] uppercase tracking-[0.14em] text-ink/40"
          >
            Fechar
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SnapKpi label="Investimento" value={formatBRL(snap.kpis.spendTotal)} />
        <SnapKpi label="Leads" value={formatNumber(snap.kpis.leads || 0)} />
        <SnapKpi label="Vendas" value={formatNumber(snap.kpis.sales || 0)} />
        <SnapKpi label="Receita" value={formatBRL(snap.kpis.revenue)} />
        <SnapKpi label="CPL" value={formatBRL(snap.kpis.cpl)} />
        <SnapKpi label="CPA" value={formatBRL(snap.kpis.cpa)} />
        <SnapKpi
          label="ROAS"
          value={snap.kpis.roas == null ? "—" : `${Number(snap.kpis.roas).toFixed(1)}x`}
        />
        <SnapKpi label="Meta / Google" value={`${formatBRL(snap.kpis.spendMeta)} · ${formatBRL(snap.kpis.spendGoogle)}`} />
      </div>

      {snap.aiAnalysis ? (
        <div className="mt-10">
          <AiCard analysis={snap.aiAnalysis} />
        </div>
      ) : null}
    </div>
  );
}

function AiCard({ analysis }: { analysis: AiAnalysisResult }) {
  return (
    <div className="border border-brand-light/40 bg-cream/50 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40">Análise IA</p>
          <p className="mt-1 text-xs text-ink/45">
            modelo {analysis.model} · {new Date(analysis.generatedAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">Opportunity score</p>
          <p className="font-playfair text-4xl text-ink">{analysis.opportunityScore}</p>
        </div>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-ink/80">{analysis.executiveSummary}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">Destaques</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            {analysis.highlights.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">Riscos</p>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            {analysis.risks.length ? analysis.risks.map((h) => <li key={h}>· {h}</li>) : <li>· Nenhum risco crítico</li>}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">Recomendações</p>
        <ul className="mt-3 space-y-3">
          {analysis.recommendations.map((r) => (
            <li key={r.channel + r.action} className="border-b border-brand-light/30 pb-3 text-sm">
              <span className="text-[10px] uppercase tracking-[0.12em] text-brand">{r.priority}</span>
              <span className="mx-2 text-ink/40">·</span>
              <span className="font-medium text-ink">{r.channel}</span>
              <p className="mt-1 text-ink/70">{r.action}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">Por canal</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {analysis.channelNotes.map((c) => (
            <div key={c.channel} className="border border-brand-light/30 bg-white/60 p-4">
              <p className="font-playfair text-lg text-ink">{c.channel}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink/40">{c.verdict}</p>
              <p className="mt-2 text-sm text-ink/65">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SnapKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-brand-light/30 bg-white/60 p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-ink/40">{label}</p>
      <p className="mt-2 font-playfair text-xl text-ink">{value}</p>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="dash-surface p-5">
      <p className="font-playfair text-xl text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink/55">{body}</p>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-[10px] uppercase tracking-[0.16em] text-ink/40">
      {label}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block border border-brand-light/40 bg-white/80 px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}
