import { NextRequest, NextResponse } from "next/server";
import { DASH_COOKIE, verifySession } from "./app/lib/dashboard/auth";
import { EDITOR_COOKIE, verifyEditorSession } from "./app/lib/editor/auth";
import { ATTR_KEYS, COOKIE_ATTR, COOKIE_MAX_AGE } from "./app/lib/whatsapp/config";
import { mergeAttrFirstTouch } from "./app/lib/whatsapp/attr-merge";

function withAttribution(req: NextRequest, res: NextResponse): NextResponse {
  const incoming: Record<string, string> = {};
  for (const key of ATTR_KEYS) {
    const v = req.nextUrl.searchParams.get(key);
    if (v) incoming[key] = v.slice(0, 200);
  }
  if (!Object.keys(incoming).length) return res;
  let existing: Record<string, string> = {};
  try {
    const raw = req.cookies.get(COOKIE_ATTR)?.value;
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string" && v.trim()) existing[k] = v.trim().slice(0, 200);
      }
    }
  } catch { existing = {}; }
  const attr = mergeAttrFirstTouch(existing, incoming);
  // Only write when we added something new (first-touch fill-empty).
  if (JSON.stringify(attr) !== JSON.stringify(existing)) {
    res.cookies.set(COOKIE_ATTR, JSON.stringify(attr), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }
  return res;
}

const WA_GATE_PATHS = new Set(["/wa", "/whatsapp", "/api/whatsapp"]);

function preservePublicParams(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete("retail");
  params.delete("retail_confirmed");
  params.delete("blocked");
  const q = params.toString();
  return q ? `?${q}` : "";
}

function looksWholesale(search: string): boolean {
  const raw = Array.from(new URLSearchParams(search).values()).join(" ").toLowerCase();
  return (
    raw.includes("atacado") ||
    raw.includes("revenda") ||
    raw.includes("revender") ||
    raw.includes("lojista") ||
    raw.includes("grade fechada")
  );
}

function redirectAtendimento(req: NextRequest, extra = ""): NextResponse {
  const dest = req.nextUrl.clone();
  dest.pathname = "/atendimento";
  dest.search = preservePublicParams(req.nextUrl.search);
  if (extra) {
    const params = new URLSearchParams(dest.search.startsWith("?") ? dest.search.slice(1) : dest.search);
    extra.split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k) params.set(k, v || "1");
    });
    dest.search = params.toString() ? `?${params.toString()}` : "";
  }
  const res = NextResponse.redirect(dest, 302);
  res.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
  res.headers.set("CDN-Cache-Control", "no-store");
  res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  res.headers.set("Vary", "Cookie");
  res.headers.set("X-Valutin-Gate", extra ? "wholesale" : "missing_retail_token");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (WA_GATE_PATHS.has(pathname)) {
    if (looksWholesale(req.nextUrl.search)) {
      return redirectAtendimento(req, "blocked=wholesale");
    }
    const token = req.cookies.get("vlt_retail_ok")?.value;
    if (!token) {
      return redirectAtendimento(req);
    }
  }

  const isDashApi = pathname.startsWith("/api/dashboard");
  const isDashPage = pathname.startsWith("/dashboard");
  const isEditorApi = pathname.startsWith("/api/editor");
  const isEditorPage = pathname === "/editor" || pathname.startsWith("/editor/");
  if (pathname === "/editor/login" || pathname === "/api/editor/login" || pathname === "/api/editor/media") {
    return withAttribution(req, NextResponse.next());
  }
  if (isEditorApi || isEditorPage) {
    if (await verifyEditorSession(req.cookies.get(EDITOR_COOKIE)?.value)) {
      return NextResponse.next();
    }
    if (isEditorApi) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const editorLogin = req.nextUrl.clone();
    editorLogin.pathname = "/editor/login";
    editorLogin.search = "";
    return NextResponse.redirect(editorLogin);
  }
  const isLogin = pathname === "/login";
  const isAuthApi =
    pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/logout");

  if (isAuthApi || isLogin) {
    return withAttribution(req, NextResponse.next());
  }

  if (!isDashApi && !isDashPage) {
    return withAttribution(req, NextResponse.next());
  }

  const token = req.cookies.get(DASH_COOKIE)?.value;
  if (await verifySession(token)) {
    return NextResponse.next();
  }

  if (isDashApi) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
