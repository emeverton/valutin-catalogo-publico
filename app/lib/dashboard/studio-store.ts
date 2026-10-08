import type { StudioDocument } from "./types";

const KEY = "vl_studio_docs_v1";

export function listStudioDocs(): StudioDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudioDocument[];
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

export function saveStudioDoc(doc: StudioDocument): void {
  const all = listStudioDocs().filter((d) => d.id !== doc.id);
  all.unshift(doc);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteStudioDoc(id: string): void {
  const all = listStudioDocs().filter((d) => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getStudioDoc(id: string): StudioDocument | null {
  return listStudioDocs().find((d) => d.id === id) || null;
}

export function newStudioId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
