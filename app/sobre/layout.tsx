import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre | Atlas RP",
  description: "Conheça o Atlas RP: equipe, história e os valores que sustentam o maior servidor de RP do Brasil.",
  openGraph: {
    title: "Sobre | Atlas RP",
    description: "Conheça o Atlas RP: equipe, história e valores.",
  },
};

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
