import { NextRequest, NextResponse } from "next/server";
import { checkEditorPassword, editorCookie, sameOrigin, signEditorSession } from "../../../lib/editor/auth";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  let password = "";
  try { password = String((await request.json()).password || ""); } catch { /* invalid body */ }
  if (!checkEditorPassword(password)) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(editorCookie(await signEditorSession()));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
