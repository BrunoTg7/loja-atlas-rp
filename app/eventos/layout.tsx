import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eventos | Atlas RP",
  description: "Confira os eventos exclusivos do Atlas RP. Participação, premiações e experiências únicas no servidor.",
  openGraph: {
    title: "Eventos | Atlas RP",
    description: "Confira os eventos exclusivos do Atlas RP.",
  },
};

export default function EventosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
