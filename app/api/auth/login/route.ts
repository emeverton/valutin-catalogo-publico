import { NextRequest, NextResponse } from "next/server";
import { checkPassword, cookieOptions, signSession } from "@/app/lib/dashboard/auth";

export async function POST(req: NextRequest) {
  let password = "";
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { password?: string };
    password = body.password || "";
  } else {
    const form = await req.formData();
    password = String(form.get("password") || "");
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "Senha inválida" }, { status: 401 });
  }

  const token = await signSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieOptions(token));
  return res;
}
