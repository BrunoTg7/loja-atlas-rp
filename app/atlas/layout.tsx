import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atlas RP - Doações",
  description: "Adquira Atlas e desbloqueie itens exclusivos, veículos e planos VIP no servidor Atlas RP.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://loja-atlas-rp.vercel.app/atlas",
  },
  openGraph: {
    title: "Atlas RP - Doações",
    description: "Adquira Atlas e desbloqueie itens exclusivos no Atlas RP.",
    url: "https://loja-atlas-rp.vercel.app/atlas",
  },
};

export default function AtlasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
