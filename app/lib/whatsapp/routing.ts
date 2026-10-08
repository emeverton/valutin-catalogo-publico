import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { routeTargets, type RouteBucket, type RouteTarget } from "./config";

export interface Assignment {
  bucket: RouteBucket;
  e164: string;
  routingVersion: string;
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Uniforme 0–9999. Pesos 3334 / 3333 / 3333. */
export function bucketFromKey(leadKey: string, secret: string): RouteTarget {
  const digest = createHash("sha256").update(`${secret}:${leadKey}`).digest();
  const n = digest.readUInt32BE(0) % 10000;
  const targets = routeTargets();
  if (n < targets[0].weight) return targets[0];
  if (n < targets[0].weight + targets[1].weight) return targets[1];
  return targets[2];
}

export function assignSticky(leadKey: string, secret: string, version: string): Assignment {
  const target = bucketFromKey(leadKey, secret);
  return { bucket: target.bucket, e164: target.e164, routingVersion: version };
}

export function newLeadKey(): string {
  return randomUUID();
}

export function isAllowedE164(e164: string): boolean {
  return routeTargets().some((t) => t.e164 === e164);
}

export function maskPhone(e164: string): string {
  return e164.length >= 4 ? `***${e164.slice(-4)}` : "***";
}

export function parseAttrCookie(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 200);
    }
    return out;
  } catch {
    return {};
  }
}

export function timingSafeLeadKey(a: string, b: string): boolean {
  const ha = Buffer.from(sha256Hex(a));
  const hb = Buffer.from(sha256Hex(b));
  return ha.length === hb.length && timingSafeEqual(ha, hb);
}
