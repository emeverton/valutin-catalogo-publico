/** Persistência local (estilo Reportei) — goals, automações, timeline. */

export type OpsGoal = {
  id: string;
  title: string;
  metric: string;
  target: number;
  current: number;
  unit: "count" | "currency" | "percent";
  platform: string;
  deadline?: string;
};

export type OpsAutomation = {
  id: string;
  title: string;
  channel: "email" | "whatsapp" | "in_app";
  frequency: "daily" | "weekly" | "monthly";
  platforms: string[];
  active: boolean;
  webhookUrl?: string;
  createdAt: string;
};

export type OpsTimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: "campanha" | "loja" | "criativo" | "ops" | "milestone";
};

const GOALS_KEY = "vl_dash_ops_goals_v1";
const AUTO_KEY = "vl_dash_ops_auto_v1";
const TIME_KEY = "vl_dash_ops_timeline_v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function newOpsId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function listOpsGoals(): OpsGoal[] {
  return read(GOALS_KEY, [] as OpsGoal[]);
}
export function saveOpsGoals(goals: OpsGoal[]): void {
  write(GOALS_KEY, goals);
}

export function listAutomations(): OpsAutomation[] {
  return read(AUTO_KEY, [] as OpsAutomation[]);
}
export function saveAutomations(items: OpsAutomation[]): void {
  write(AUTO_KEY, items);
}

export function listTimeline(): OpsTimelineEvent[] {
  return read(TIME_KEY, [] as OpsTimelineEvent[]);
}
export function saveTimeline(items: OpsTimelineEvent[]): void {
  write(TIME_KEY, items);
}

export const DEFAULT_SEED_GOALS: OpsGoal[] = [
  { id: "h2_leads", title: "Leads H2", metric: "leads", target: 970, current: 0, unit: "count", platform: "kommo", deadline: "2026-12-31" },
  { id: "h2_sales", title: "Vendas H2", metric: "sales", target: 117, current: 0, unit: "count", platform: "kommo", deadline: "2026-12-31" },
  { id: "h2_followers", title: "Crescimento seguidores H2", metric: "followers", target: 2100, current: 0, unit: "count", platform: "instagram", deadline: "2026-12-31" },
];
