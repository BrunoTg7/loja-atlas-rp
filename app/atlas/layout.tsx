import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atlas Coins | Loja Atlas RP",
  description: "Adquira Atlas Coins e desbloqueie itens exclusivos, veículos e planos VIP no servidor Atlas RP.",
  openGraph: {
    title: "Atlas Coins | Loja Atlas RP",
    description: "Adquira Atlas Coins e desbloqueie itens exclusivos no Atlas RP.",
  },
};

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
