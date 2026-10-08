import { NextResponse } from "next/server";
import { DASH_COOKIE } from "@/app/lib/dashboard/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: DASH_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
