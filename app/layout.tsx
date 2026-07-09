import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ClientFooter from "@/components/ClientFooter";
import CookieBanner from "@/components/CookieBanner";
import { SteamProvider } from "@/context/SteamContext";
import StyledComponentsRegistry from "@/components/StyledComponentsRegistry";
import { anton, orbitron, rajdhani } from "./fonts";

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
    <html lang="pt-BR" className={`h-full antialiased ${anton.variable} ${orbitron.variable} ${rajdhani.variable}`}>
      <body className="min-h-full flex flex-col">
        <StyledComponentsRegistry>
          <SteamProvider>
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <ClientFooter />
            <CookieBanner />
          </SteamProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
