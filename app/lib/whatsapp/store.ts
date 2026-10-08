import { routeTargets, type RouteBucket } from "./config";
import { hashFallbackSlot, makeRef, pickLeastLoaded, type RouteCounters } from "./balance";

export interface AssignResult {
  slot: RouteBucket;
  phone_e164: string;
  route_status: "assigned" | "sticky" | "fallback_hash";
  route_ref: string;
  assigned_clicks: number;
  confirmed_leads: number;
}

export interface RouteStore {
  assign(opts: { visitor_hash: string; sticky_slot?: RouteBucket; attr?: Record<string, string> }): Promise<AssignResult>;
  confirm(opts: { slot: RouteBucket; kommo_lead_id: string; route_ref?: string; lead_type?: string }): Promise<{ ok: boolean; already: boolean; confirmed_leads: number }>;
  report(): Promise<RouteCounters[]>;
  health(): Promise<{ db: boolean }>;
}

const memory: Record<RouteBucket, RouteCounters> = {
  A: { slot: "A", phone_e164: routeTargets()[0].e164, active: true, assigned_clicks: 0, confirmed_leads: 0, last_assignment_at: null },
  B: { slot: "B", phone_e164: routeTargets()[1].e164, active: true, assigned_clicks: 0, confirmed_leads: 0, last_assignment_at: null },
  C: { slot: "C", phone_e164: routeTargets()[2].e164, active: true, assigned_clicks: 0, confirmed_leads: 0, last_assignment_at: null },
};
const confirmed = new Set<string>();
let lock: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => T | Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.then(() => undefined, () => undefined);
  return run;
}


function asRecord(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}
function firstRow(v: unknown): Record<string, unknown> {
  if (Array.isArray(v)) return asRecord(v[0]);
  return asRecord(v);
}

export class MemoryRouteStore implements RouteStore {
  async assign(opts: { visitor_hash: string; sticky_slot?: RouteBucket }): Promise<AssignResult> {
    return withLock(() => {
      const sticky = opts.sticky_slot && memory[opts.sticky_slot]?.active ? memory[opts.sticky_slot] : null;
      const picked = sticky || pickLeastLoaded(Object.values(memory));
      if (!picked) {
        const slot = hashFallbackSlot(opts.visitor_hash);
        const row = memory[slot];
        return { slot, phone_e164: row.phone_e164, route_status: "fallback_hash", route_ref: makeRef(slot, opts.visitor_hash), assigned_clicks: row.assigned_clicks, confirmed_leads: row.confirmed_leads };
      }
      if (!sticky) {
        picked.assigned_clicks += 1;
        picked.last_assignment_at = new Date().toISOString();
      }
      return {
        slot: picked.slot,
        phone_e164: picked.phone_e164,
        route_status: sticky ? "sticky" : "assigned",
        route_ref: makeRef(picked.slot, opts.visitor_hash),
        assigned_clicks: picked.assigned_clicks,
        confirmed_leads: picked.confirmed_leads,
      };
    });
  }
  async confirm(opts: { slot: RouteBucket; kommo_lead_id: string; lead_type?: string }) {
    return withLock(() => {
      if (confirmed.has(opts.kommo_lead_id)) {
        return { ok: true, already: true, confirmed_leads: memory[opts.slot].confirmed_leads };
      }
      confirmed.add(opts.kommo_lead_id);
      const type = String(opts.lead_type || "").toUpperCase();
      if (type === "VAREJO") memory[opts.slot].confirmed_leads += 1;
      return { ok: true, already: false, confirmed_leads: memory[opts.slot].confirmed_leads };
    });
  }
  async report() { return Object.values(memory).map((r) => ({ ...r })); }
  async health() { return { db: false }; }
}

export class SupabaseRouteStore implements RouteStore {
  constructor(private url: string, private key: string) {}
  private lit(v: unknown): string {
    if (v === null || v === undefined || v === "") return "NULL";
    return "'" + String(v).replace(/'/g, "''") + "'";
  }
  private async query(sql: string) {
    const res = await fetch(`${this.url.replace(/\/$/, "")}/pg/query`, {
      method: "POST",
      headers: {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    const json = await res.json().catch(() => []);
    if (!res.ok) throw new Error(`supabase_${res.status}`);
    return json;
  }
  private async rpc(name: string, body: Record<string, unknown>) {
    const res = await fetch(`${this.url.replace(/\/$/, "")}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`supabase_${res.status}`);
    return res.json().catch(() => ({}));
  }
  async assign(opts: { visitor_hash: string; sticky_slot?: RouteBucket; attr?: Record<string, string> }): Promise<AssignResult> {
    try {
      let rows: unknown;
      try {
        rows = await this.rpc("valutin_assign_whatsapp_route", {
          p_visitor_hash: opts.visitor_hash,
          p_sticky_slot: opts.sticky_slot || null,
        });
      } catch {
        const sticky = opts.sticky_slot ? this.lit(opts.sticky_slot) : "NULL";
        rows = await this.query(
          "SELECT * FROM valutin.valutin_assign_whatsapp_route(" + this.lit(opts.visitor_hash) + ", " + sticky + ")"
        );
      }
      const row = firstRow(rows);
      return {
        slot: String(row.slot) as RouteBucket,
        phone_e164: String(row.phone_e164 || ""),
        route_status: String(row.route_status) as AssignResult["route_status"],
        route_ref: makeRef(String(row.slot) as RouteBucket, opts.visitor_hash),
        assigned_clicks: Number(row.assigned_clicks || 0),
        confirmed_leads: Number(row.confirmed_leads || 0),
      };
    } catch {
      const slot = hashFallbackSlot(opts.visitor_hash);
      const target = routeTargets().find((t) => t.bucket === slot) || routeTargets()[0];
      return { slot: target.bucket, phone_e164: target.e164, route_status: "fallback_hash", route_ref: makeRef(target.bucket, opts.visitor_hash), assigned_clicks: 0, confirmed_leads: 0 };
    }
  }
  async confirm(opts: { slot: RouteBucket; kommo_lead_id: string; route_ref?: string; lead_type?: string }) {
    let rows: unknown;
    try {
      rows = await this.rpc("valutin_confirm_whatsapp_lead", {
        p_slot: opts.slot,
        p_kommo_lead_id: opts.kommo_lead_id,
        p_route_ref: opts.route_ref || null,
        p_lead_type: opts.lead_type || "NAO_CLASSIFICADO",
      });
    } catch {
      rows = await this.query(
        "SELECT * FROM valutin.valutin_confirm_whatsapp_lead(" +
          this.lit(opts.slot) + ", " + this.lit(opts.kommo_lead_id) + ", " +
          this.lit(opts.route_ref || null) + ", " + this.lit(opts.lead_type || "NAO_CLASSIFICADO") + ")"
      );
    }
    const row = firstRow(rows);
    return { ok: Boolean(row.ok), already: Boolean(row.already), confirmed_leads: Number(row.confirmed_leads || 0) };
  }
  async report() {
    try {
      const res = await fetch(`${this.url.replace(/\/$/, "")}/rest/v1/valutin_whatsapp_routes?select=*`, {
        headers: { apikey: this.key, Authorization: `Bearer ${this.key}` },
      });
      if (!res.ok) throw new Error("rest");
      return (await res.json()) as RouteCounters[];
    } catch {
      return (await this.query(
        "SELECT slot, phone_e164, active, assigned_clicks, confirmed_leads, last_assignment_at FROM valutin.valutin_whatsapp_routes ORDER BY slot"
      )) as RouteCounters[];
    }
  }
  async health() {
    try {
      await this.report();
      return { db: true };
    } catch {
      return { db: false };
    }
  }
}

export function getRouteStore(): RouteStore {
  const url = process.env.SUPABASE_URL || process.env.VALUTIN_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VALUTIN_SUPABASE_SERVICE_ROLE_KEY || "";
  if (url && key) return new SupabaseRouteStore(url, key);
  return new MemoryRouteStore();
}
