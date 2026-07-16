import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A História de Atlas RP",
  description: "Conheça a história e a lore do servidor Atlas RP. Uma narrativa épica de poder, traição e sobrevivência no mundo do GTA RP.",
  alternates: {
    canonical: "https://loja-atlas-rp.vercel.app/historia",
  },
  openGraph: {
    title: "A História de Atlas RP",
    description: "Conheça a história e a lore do servidor Atlas RP.",
    url: "https://loja-atlas-rp.vercel.app/historia",
  },
};

export default function HistoriaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
