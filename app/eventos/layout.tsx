import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atlas RP - Eventos",
  description: "Confira os eventos exclusivos do Atlas RP. Participação, premiações e experiências únicas no servidor.",
  alternates: {
    canonical: "https://loja-atlas-rp.vercel.app/eventos",
  },
  openGraph: {
    title: "Atlas RP - Eventos",
    description: "Confira os eventos exclusivos do Atlas RP.",
    url: "https://loja-atlas-rp.vercel.app/eventos",
  },
};

export default function EventosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
