import { NextRequest, NextResponse } from "next/server";
import { storageCredentials } from "../../../lib/editor/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") || "";
  if (!/^(?:primavera-verao\/[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp|mp4)|catalogo\/[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp))$/.test(path)) return new NextResponse(null, { status: 404 });
  try {
    const { url, key } = storageCredentials();
    const result = await fetch(`${url}/storage/v1/object/authenticated/valutin-page-editor/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "force-cache",
    });
    if (!result.ok) return new NextResponse(null, { status: 404 });
    const type = result.headers.get("content-type") || "application/octet-stream";
    if (!/^(image\/(jpeg|png|webp)|video\/mp4)$/.test(type)) return new NextResponse(null, { status: 415 });
    return new NextResponse(result.body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new NextResponse(null, { status: 503 }); }
}
