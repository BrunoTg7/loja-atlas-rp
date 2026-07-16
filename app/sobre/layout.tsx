import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre | Atlas RP",
  description: "Conheça o Atlas RP: equipe, história e os valores que sustentam o maior servidor de RP do Brasil.",
  alternates: {
    canonical: "https://loja-atlas-rp.vercel.app/sobre",
  },
  openGraph: {
    title: "Sobre | Atlas RP",
    description: "Conheça o Atlas RP: equipe, história e valores.",
    url: "https://loja-atlas-rp.vercel.app/sobre",
  },
};

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
