import type { Metadata } from "next";
import EditorClient from "./EditorClient";

export const metadata: Metadata = { title: "Editor da página | Valutin", robots: { index: false, follow: false } };

export default function EditorPage() { return <EditorClient />; }
