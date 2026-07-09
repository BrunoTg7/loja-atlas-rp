import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ClientFooter from "@/components/ClientFooter";
import CookieBanner from "@/components/CookieBanner";
import { SteamProvider } from "@/context/SteamContext";

export const metadata: Metadata = {
  title: "Atlas RP - Loja Oficial",
  description: "Loja oficial do servidor Atlas RP. Adquira planos VIP e veículos exclusivos para GTA RP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SteamProvider>
          <Header />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <ClientFooter />
          <CookieBanner />
        </SteamProvider>
      </body>
    </html>
  );
}
