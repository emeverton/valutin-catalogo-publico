import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Valutin · Performance",
  description: "Dashboard executivo Valutin — mídia, CRM e metas H2.",
  robots: { index: false, follow: false },
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-cream text-ink font-poppins antialiased">{children}</div>;
}
