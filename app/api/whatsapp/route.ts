import { NextRequest } from "next/server";
import { handleWhatsAppGet } from "../../lib/whatsapp/handler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleWhatsAppGet(req);
}
