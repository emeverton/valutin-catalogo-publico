import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "./components/CookieBanner";
import { getPublishedContent } from "./lib/editor/store";
import type { CSSProperties } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.valutin.com.br"),
  title: "Valutin · Moda infantil premium em Vila Nova Conceição",
  description:
    "Curadoria, qualidade e atendimento pessoal. Loja em Vila Nova Conceição — explore o catálogo e fale com nossa equipe pelo WhatsApp.",
  alternates: { canonical: "https://www.valutin.com.br/" },
  openGraph: {
    title: "Valutin · Moda infantil premium em Vila Nova Conceição",
    description:
      "Curadoria, qualidade e atendimento pessoal. Loja em Vila Nova Conceição.",
    url: "https://www.valutin.com.br/",
    siteName: "Valutin",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/campaign-spring-summer-2026/collection-flatlay-desktop.jpg",
        width: 3840,
        height: 2160,
        alt: "Looks infantis Valutin para menina e menino",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Valutin · Moda infantil premium em Vila Nova Conceição",
    description: "Curadoria personalizada e atendimento pessoal desde 1998.",
    images: ["/campaign-spring-summer-2026/collection-flatlay-desktop.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getPublishedContent();
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${poppins.variable}`} style={{ "--color-brand-strong": content.themeAccent } as CSSProperties}>
      <body className="font-poppins antialiased bg-white text-ink">{children}
        <CookieBanner />
        <p className="veltrus-seal" id="vt-craft" data-owner="veltrus" data-vt-k="a125543b8c3291fa9cce462601bd4694"><a href="https://www.veltrus.com.br/" target="_blank" rel="noopener noreferrer">Criado por <strong>Veltrus</strong></a></p>
        <script dangerouslySetInnerHTML={{ __html: "(function(){var n=document.getElementById('vt-craft');var a=n&&n.querySelector('a');var t=n&&String(n.textContent||'').replace(/\\s+/g,' ').trim();var ok=!!(n&&a&&t==='Criado por Veltrus'&&/veltrus\\.com\\.br/i.test(a.href));document.documentElement.setAttribute('data-vt',ok?'ok':'lock');})();" }} />
        <script src="/vt-boot.js" defer></script>
      </body>
    </html>
  );
}
