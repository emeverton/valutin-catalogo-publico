import { ACCOUNT_IDS } from "../goals";
import type { DateRange, KommoSnapshot } from "../types";

const STAGES: Array<{ id: number; name: string }> = [
  { id: 84421839, name: "Incoming" },
  { id: 109054679, name: "Qualificação" },
  { id: 84470283, name: "Em Atendimento" },
  { id: 84470287, name: "Negociando" },
  { id: 109054683, name: "Venda ganha" },
  { id: 109054703, name: "Perdida" },
  { id: 109054663, name: "Recompra" },
];

const WON_STATUS = 109054683;
const LOST_STATUS = 109054703;
const LEAD_VALUE_FIELD = 808440;
const STAGE_BY_ID = Object.fromEntries(STAGES.map((s) => [s.id, s.name]));

function baseUrl(): string {
  return (
    process.env.KOMMO_BASE_URL ||
    `https://${process.env.KOMMO_SUBDOMAIN || "carolinacastelo"}.kommo.com`
  ).replace(/\/$/, "");
}

function authHeaders(): HeadersInit | null {
  const token = process.env.KOMMO_LONG_LIVED_TOKEN;
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function toUnix(dateStr: string, endOfDay = false): number {
  const d = new Date(`${dateStr}T${endOfDay ? "23:59:59" : "00:00:00"}-03:00`);
  return Math.floor(d.getTime() / 1000);
}

async function readJson(res: Response): Promise<unknown | null> {
  const raw = await res.text();
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchLeadsPage(
  headers: HeadersInit,
  params: Record<string, string>
): Promise<{ leads: Array<Record<string, unknown>>; totalHint: number }> {
  const url = new URL(`${baseUrl()}/api/v4/leads`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers, next: { revalidate: 300 } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Kommo ${res.status}: ${t.slice(0, 160)}`);
  }
  const json = (await readJson(res)) as {
    _embedded?: { leads?: Array<Record<string, unknown>> };
    _total_items?: number;
  } | null;
  const leads = json?._embedded?.leads || [];
  const totalHeader = res.headers.get("X-Total-Count");
  const totalHint = totalHeader
    ? Number(totalHeader)
    : Number(json?._total_items || leads.length);
  return { leads, totalHint };
}

function leadRevenue(lead: Record<string, unknown>): number {
  const cfs = lead.custom_fields_values as
    | Array<{ field_id: number; values: Array<{ value: string | number }> }>
    | undefined;
  const cf = cfs?.find((f) => f.field_id === LEAD_VALUE_FIELD);
  const customVal = Number(cf?.values?.[0]?.value || 0);
  return customVal || Number(lead.price || 0);
}

export async function fetchKommoSnapshot(range: DateRange): Promise<KommoSnapshot> {
  const headers = authHeaders();
  if (!headers) return empty("KOMMO_LONG_LIVED_TOKEN ausente");

  const pipelineId = Number(
    process.env.VALUTIN_KOMMO_PIPELINE_ID || ACCOUNT_IDS.kommoPipelineId
  );
  const since = toUnix(range.since);
  const until = toUnix(range.until, true);

  try {
    const accountRes = await fetch(`${baseUrl()}/api/v4/account`, {
      headers,
      next: { revalidate: 300 },
    });
    if (!accountRes.ok) {
      const t = await accountRes.text();
      return empty(`Kommo auth ${accountRes.status}: ${t.slice(0, 160)}`);
    }

    const pipeline: KommoSnapshot["pipeline"] = [];
    for (const stage of STAGES) {
      try {
        const { totalHint, leads } = await fetchLeadsPage(headers, {
          "filter[pipeline_id]": String(pipelineId),
          "filter[statuses][0][pipeline_id]": String(pipelineId),
          "filter[statuses][0][status_id]": String(stage.id),
          limit: "1",
        });
        pipeline.push({
          stage: stage.name,
          statusId: stage.id,
          count: totalHint || leads.length,
        });
      } catch {
        pipeline.push({ stage: stage.name, statusId: stage.id, count: 0 });
      }
    }

    let newLeads = 0;
    const recentLeads: KommoSnapshot["leads"] = [];
    let page = 1;
    while (page <= 20) {
      const { leads } = await fetchLeadsPage(headers, {
        "filter[pipeline_id]": String(pipelineId),
        "filter[created_at][from]": String(since),
        "filter[created_at][to]": String(until),
        limit: "250",
        page: String(page),
        with: "custom_fields",
      });
      newLeads += leads.length;
      for (const lead of leads) {
        if (recentLeads.length < 50) {
          const created = Number(lead.created_at || 0);
          recentLeads.push({
            id: Number(lead.id),
            name: String(lead.name || `#${lead.id}`),
            status: STAGE_BY_ID[Number(lead.status_id)] || String(lead.status_id || ""),
            price: leadRevenue(lead),
            createdAt: created
              ? new Date(created * 1000).toISOString()
              : "",
          });
        }
      }
      if (leads.length < 250) break;
      page += 1;
    }

    const countStatus = async (
      statusId: number,
      preferClosedAt: boolean
    ): Promise<{ sales: number; revenue: number }> => {
      let sales = 0;
      let revenue = 0;
      let pageN = 1;
      const filterKey = preferClosedAt ? "closed_at" : "updated_at";
      while (pageN <= 20) {
        try {
          const { leads } = await fetchLeadsPage(headers as HeadersInit, {
            "filter[pipeline_id]": String(pipelineId),
            "filter[statuses][0][pipeline_id]": String(pipelineId),
            "filter[statuses][0][status_id]": String(statusId),
            [`filter[${filterKey}][from]`]: String(since),
            [`filter[${filterKey}][to]`]: String(until),
            limit: "250",
            page: String(pageN),
          });
          for (const lead of leads) {
            sales += 1;
            revenue += leadRevenue(lead);
          }
          if (leads.length < 250) break;
          pageN += 1;
        } catch {
          if (preferClosedAt) return countStatus(statusId, false);
          break;
        }
      }
      return { sales, revenue };
    };

    const won = await countStatus(WON_STATUS, true);
    const lostRes = await countStatus(LOST_STATUS, true);

    return {
      newLeads,
      pipeline,
      sales: won.sales,
      revenue: won.revenue,
      lost: lostRes.sales,
      avgTicket: won.sales > 0 ? won.revenue / won.sales : null,
      leads: recentLeads,
      status: "ok",
    };
  } catch (err) {
    return empty(err instanceof Error ? err.message : "Kommo fetch failed");
  }
}

function empty(error: string): KommoSnapshot {
  return {
    newLeads: 0,
    pipeline: [],
    sales: 0,
    revenue: 0,
    lost: 0,
    avgTicket: null,
    leads: [],
    status: "unavailable",
    error,
  };
}
