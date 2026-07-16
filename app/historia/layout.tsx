import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A História de Atlas RP",
  description: "Conheça a história e a lore do servidor Atlas RP. Uma narrativa épica de poder, traição e sobrevivência no mundo do GTA RP.",
  openGraph: {
    title: "A História de Atlas RP",
    description: "Conheça a história e a lore do servidor Atlas RP.",
  },
};

export default function HistoriaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
