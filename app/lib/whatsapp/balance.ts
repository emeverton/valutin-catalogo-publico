import { createHash } from "crypto";
import type { RouteBucket } from "./config";

export interface RouteCounters {
  slot: RouteBucket;
  phone_e164: string;
  active: boolean;
  assigned_clicks: number;
  confirmed_leads: number;
  last_assignment_at: string | null;
}

export function pickLeastLoaded(routes: RouteCounters[]): RouteCounters | null {
  const active = routes.filter((r) => r.active);
  if (!active.length) return null;
  return active.slice().sort((a, b) => {
    if (a.confirmed_leads !== b.confirmed_leads) return a.confirmed_leads - b.confirmed_leads;
    if (a.assigned_clicks !== b.assigned_clicks) return a.assigned_clicks - b.assigned_clicks;
    const ta = a.last_assignment_at ? Date.parse(a.last_assignment_at) : 0;
    const tb = b.last_assignment_at ? Date.parse(b.last_assignment_at) : 0;
    if (ta !== tb) return ta - tb;
    return a.slot.localeCompare(b.slot);
  })[0];
}

export function hashFallbackSlot(visitorHash: string): RouteBucket {
  const hex = String(visitorHash || "0").replace(/[^0-9a-f]/gi, "") || "0";
  const n = parseInt(hex.slice(0, 8), 16);
  return (["A", "B", "C"] as RouteBucket[])[n % 3];
}

export function makeRef(slot: RouteBucket, visitorHash: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const digest = createHash("sha256").update(`${slot}:${visitorHash}`).digest();
  let out = "";
  for (let i = 0; i < 5; i++) out += alphabet[digest[i] % alphabet.length];
  return `VLT-${slot}${out}`;
}

export function buildPrefillText(routeRef: string): string {
  return `Olá! Vim pelo atendimento online da Valutin. Ref: ${routeRef}`;
}

export function visitorHashFrom(ipSalted: string, ua: string, leadKey: string): string {
  return createHash("sha256").update(`${ipSalted}|${ua}|${leadKey}`).digest("hex");
}
