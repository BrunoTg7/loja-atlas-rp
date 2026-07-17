import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ClientFooter from "@/components/ClientFooter";
import CookieBanner from "@/components/CookieBanner";
import MarketingNotification from "@/components/MarketingNotification";
import { SteamProvider } from "@/context/SteamContext";
import { CartProvider } from "@/context/CartContext";
import { MarketingProvider } from "@/context/MarketingContext";
import { DiscordProvider } from "@/context/DiscordContext";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";
import DevToolsProtection from "@/components/DevToolsProtection";
import { anton, cinzel, orbitron, rajdhani } from "./fonts";

const SITE_URL = "https://loja-atlas-rp.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Atlas RP - Home",
  description: "Loja oficial do servidor Atlas RP. Adquira planos VIP e veículos exclusivos para GTA RP.",
  applicationName: "Atlas RP",
  authors: [{ name: "Atlas RP" }],
  creator: "Atlas RP",
  publisher: "Atlas RP",
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: "1HEMZIn_wJ8Q0rbpOylZiRbhjQPq59J0hSLz_k6s-8Q",
  },
  icons: {
    icon: "/Imagens/logo-atlas-rp.webp",
  },
  openGraph: {
    title: "Atlas RP - Home",
    description: "Loja oficial do servidor Atlas RP. Adquira planos VIP e veículos exclusivos para GTA RP.",
    siteName: "Atlas RP",
    locale: "pt_BR",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/Imagens/logo-atlas-rp.webp`,
        width: 512,
        height: 512,
        alt: "Atlas RP Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas RP - Home",
    description: "Loja oficial do servidor Atlas RP. Adquira planos VIP e veículos exclusivos para GTA RP.",
    images: [`${SITE_URL}/Imagens/logo-atlas-rp.webp`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Atlas RP",
  url: SITE_URL,
  logo: `${SITE_URL}/Imagens/logo-atlas-rp.webp`,
  description: "Loja oficial do servidor Atlas RP. Adquira planos VIP e veículos exclusivos para GTA RP.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Portuguese",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${anton.variable} ${cinzel.variable} ${orbitron.variable} ${rajdhani.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <DevToolsProtection />
        <a
          href="/api/internal/trap"
          aria-hidden="true"
          tabIndex={-1}
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          hidden trap link
        </a>
        <StyledComponentsRegistry>
          <SteamProvider>
            <DiscordProvider>
              <CartProvider>
                <MarketingProvider>
                  <Header />
                  <main className="flex-1 pt-16">
                    {children}
                  </main>
                  <ClientFooter />
                  <CookieBanner />
                  <MarketingNotification />
                </MarketingProvider>
              </CartProvider>
            </DiscordProvider>
          </SteamProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
