import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ClientFooter from "@/components/ClientFooter";
import CookieBanner from "@/components/CookieBanner";
import MarketingNotification from "@/components/MarketingNotification";
import { SteamProvider } from "@/context/SteamContext";
import { CartProvider } from "@/context/CartContext";
import { MarketingProvider } from "@/context/MarketingContext";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";
import { anton, cinzel, orbitron, rajdhani } from "./fonts";

export const metadata: Metadata = {
  title: "Atlas RP - Loja Oficial",
  description: "Loja oficial do servidor Atlas RP. Adquira planos VIP e veículos exclusivos para GTA RP.",
  icons: {
    icon: "/Imagens/logo-atlas-rp.webp",
  },
  openGraph: {
    title: "Atlas RP - Loja Oficial",
    description: "Loja oficial do servidor Atlas RP. Adquira planos VIP e veículos exclusivos para GTA RP.",
    images: [
      {
        url: "/Imagens/logo-atlas-rp.webp",
        width: 512,
        height: 512,
        alt: "Atlas RP Logo",
      },
    ],
    siteName: "Atlas RP",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas RP - Loja Oficial",
    description: "Loja oficial do servidor Atlas RP. Adquira planos VIP e veículos exclusivos para GTA RP.",
    images: ["/Imagens/logo-atlas-rp.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${anton.variable} ${cinzel.variable} ${orbitron.variable} ${rajdhani.variable}`}>
      <body className="min-h-full flex flex-col">
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
          </SteamProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
