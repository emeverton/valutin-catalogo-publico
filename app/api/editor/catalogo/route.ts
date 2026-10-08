import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { EDITOR_COOKIE, sameOrigin, verifyEditorSession } from "../../../lib/editor/auth";
import { catalogMediaProducts, getCatalogRow, publishCatalogDraft, saveCatalogDraft } from "../../../lib/editor/catalog-store";
import { editorStorageConfigured } from "../../../lib/editor/store";

const headers = { "Cache-Control": "private, no-store" };
async function authorized() { return verifyEditorSession(cookies().get(EDITOR_COOKIE)?.value); }

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!editorStorageConfigured()) return NextResponse.json({ error: "Armazenamento não configurado" }, { status: 503 });
  try { return NextResponse.json({ ...await getCatalogRow(), products: catalogMediaProducts }, { headers }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar as fotos do catálogo" }, { status: 503 }); }
}

export async function PUT(request: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  try {
    const body = await request.json();
    if (!Number.isSafeInteger(body.version) || body.version < 0) return NextResponse.json({ error: "Versão inválida" }, { status: 400 });
    return NextResponse.json(await saveCatalogDraft(body.content, body.version), { headers });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao salvar" }, { status: 409 }); }
}

export async function POST(request: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  try {
    const body = await request.json();
    if (!Number.isSafeInteger(body.version) || body.version < 1) return NextResponse.json({ error: "Salve o rascunho antes de publicar" }, { status: 400 });
    const row = await publishCatalogDraft(body.version);
    revalidatePath("/catalogo", "layout");
    return NextResponse.json(row, { headers });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao publicar" }, { status: 409 }); }
}
