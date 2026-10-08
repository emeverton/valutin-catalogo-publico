import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EDITOR_COOKIE, sameOrigin, verifyEditorSession } from "../../../lib/editor/auth";
import { validateContent } from "../../../lib/editor/content";
import { editorStorageConfigured, getContentRow, publishDraft, saveDraft } from "../../../lib/editor/store";

async function authorized() { return verifyEditorSession(cookies().get(EDITOR_COOKIE)?.value); }
const noStore = { "Cache-Control": "private, no-store" };

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!editorStorageConfigured()) return NextResponse.json({ error: "Armazenamento ainda não configurado" }, { status: 503 });
  try { return NextResponse.json(await getContentRow(), { headers: noStore }); }
  catch { return NextResponse.json({ error: "Não foi possível abrir o editor. Confira a migração da tabela." }, { status: 503 }); }
}

export async function PUT(request: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  try {
    const body = await request.json();
    if (!Number.isSafeInteger(body.version) || body.version < 0) return NextResponse.json({ error: "Versão inválida" }, { status: 400 });
    const row = await saveDraft(validateContent(body.content), body.version);
    return NextResponse.json(row, { headers: noStore });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao salvar" }, { status: 409 }); }
}

export async function POST(request: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  try {
    const body = await request.json();
    if (!Number.isSafeInteger(body.version) || body.version < 1) return NextResponse.json({ error: "Salve o rascunho antes de publicar" }, { status: 400 });
    const row = await publishDraft(body.version);
    return NextResponse.json(row, { headers: noStore });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao publicar" }, { status: 409 }); }
}
