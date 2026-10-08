import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function EditorPreview() { redirect("/catalogo/primavera-verao?editor_preview=1"); }
