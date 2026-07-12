"use client";

import CTASection from "@/components/CTASection";
import ConfrontationSectionV2 from "@/components/ConfrontationSectionV2";
import HeroSectionV2 from "@/components/HeroSectionV2";
import ProfessionsSectionV2 from "@/components/ProfessionsSectionV2";
import SistemasV2 from "@/components/SistemasV2";

export default function PaginaInicial() {
  return (
    <div className="min-h-screen">
      <HeroSectionV2 />

      <SistemasV2 />

      <ConfrontationSectionV2 />

      <ProfessionsSectionV2 />

      <CTASection />
    </div>
  );
}
