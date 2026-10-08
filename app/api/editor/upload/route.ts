import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { EDITOR_COOKIE, sameOrigin, verifyEditorSession } from "../../../lib/editor/auth";
import { storageCredentials } from "../../../lib/editor/store";

export const runtime = "nodejs";

const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4" };

export async function POST(request: NextRequest) {
  if (!(await verifyEditorSession(cookies().get(EDITOR_COOKIE)?.value))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Selecione um arquivo" }, { status: 400 });
    const scope = form.get("scope") === "catalogo" ? "catalogo" : "primavera-verao";
    const extension = types[file.type];
    if (scope === "catalogo" && !file.type.startsWith("image/")) return NextResponse.json({ error: "O catálogo aceita somente imagens" }, { status: 400 });
    if (!extension || file.size < 1 || file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Use JPG, PNG, WebP ou MP4 de até 4 MB" }, { status: 400 });
    const path = `${scope}/${randomUUID()}.${extension}`;
    const { url, key } = storageCredentials();
    const uploaded = await fetch(`${url}/storage/v1/object/valutin-page-editor/${path}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": file.type, "x-upsert": "false" },
      body: await file.arrayBuffer(),
    });
    if (!uploaded.ok) throw new Error("Falha ao enviar arquivo. Confira o bucket do editor.");
    return NextResponse.json({ url: `/api/editor/media?path=${path}` }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Falha no envio" }, { status: 503 }); }
}
