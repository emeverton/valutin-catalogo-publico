import { NextRequest, NextResponse } from "next/server";
import { EDITOR_COOKIE, sameOrigin } from "../../../lib/editor/auth";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: EDITOR_COOKIE, value: "", path: "/", maxAge: 0 });
  return response;
}
