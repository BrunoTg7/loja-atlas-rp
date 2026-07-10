"use client";

import CTASection from "@/components/CTASection";
import ConfrontationSection from "@/components/ConfrontationSection";
import HeroSection from "@/components/HeroSection";
import ProfessionsSection from "@/components/ProfessionsSection";

export default function PaginaInicial() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Scroll Animations */}
      <HeroSection />

      {/* Sistemas Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-[#05080F] via-[#0B1725] to-[#05080F]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#FF2E44]" />
              <span className="font-rajdhani text-[#FF2E44] text-sm uppercase tracking-[0.3em]">
                Funcionalidades
              </span>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#FF2E44]" />
            </div>
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-4">
              NOSSOS <span className="text-[#FFCC00] text-shadow-yellow">SISTEMAS</span>
            </h2>
            <p className="font-rajdhani text-lg text-[#B3B9C1] max-w-2xl mx-auto">
              Tudo o que você precisa para a melhor experiência de Roleplay
            </p>
          </div>

          {/* Experiência de Jogo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#FF2E44] rounded-full" />
              <h3 className="font-orbitron text-sm uppercase tracking-[0.2em] text-[#FF2E44] whitespace-nowrap">
                Experiência<br/>de Jogo
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-[#FF2E44]/30 to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Featured: Sistema de Trabalhos */}
              <div className="md:col-span-2 bg-[#121622] p-4 md:p-6 clip-cut border border-[#FF2E44]/30 hover-lift reticule relative group">
                <div className="flex items-start gap-3 md:gap-5">
                  <div className="text-[#FF2E44] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg md:text-xl font-bold text-white mb-2">SISTEMA DE TRABALHOS</h3>
                    <p className="font-rajdhani text-sm md:text-base text-[#B3B9C1]">
                      Dezenas de profissões únicas — de mecânico a advogado — com missões dinâmicas, progressão de carreira e recompensas que impactam diretamente sua jornada na cidade.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sistema de Veículos */}
              <div className="bg-[#121622] p-4 md:p-6 clip-cut border border-[#FF2E44]/20 hover-lift reticule relative group">
                <div className="text-[#FF2E44] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.4L21 11M3 11h18M3 11v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6" />
                  </svg>
                </div>
                <h3 className="font-orbitron text-lg md:text-xl font-bold text-white mb-2">SISTEMA DE VEÍCULOS</h3>
                <p className="font-rajdhani text-sm md:text-base text-[#B3B9C1]">
                  Concessionária com veículos exclusivos, customização completa e sistema de revisão realista.
                </p>
              </div>

              {/* Animações Exclusivas */}
              <div className="bg-[#121622] p-4 md:p-6 clip-cut border border-[#FF2E44]/20 hover-lift reticule relative group">
                <div className="text-[#FF2E44] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-orbitron text-lg md:text-xl font-bold text-white mb-2">ANIMAÇÕES EXCLUSIVAS</h3>
                <p className="font-rajdhani text-sm md:text-base text-[#B3B9C1]">
                  Centenas de animações customizadas para cada ação — de interações sociais a ações de combate.
                </p>
              </div>

              {/* Featured: Sistema de Imóveis */}
              <div className="md:col-span-2 bg-[#121622] p-4 md:p-6 clip-cut border border-[#FF2E44]/30 hover-lift reticule relative group">
                <div className="flex items-start gap-3 md:gap-5">
                  <div className="text-[#FF2E44] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg md:text-xl font-bold text-white mb-2">SISTEMA DE IMÓVEIS</h3>
                    <p className="font-rajdhani text-sm md:text-base text-[#B3B9C1]">
                      Compre, alugue e personalize residências e estabelecimentos. Cada imóvel tem localização estratégica no mapa e impacta diretamente seu estilo de jogo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infraestrutura e Qualidade */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#FFCC00] rounded-full" />
              <h3 className="font-orbitron text-sm uppercase tracking-[0.2em] text-[#FFCC00]">
                Infraestrutura e Qualidade
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-[#FFCC00]/30 to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Featured: Otimização FPS */}
              <div className="md:col-span-2 bg-[#121622] p-4 md:p-6 clip-cut border border-[#FFCC00]/30 hover-lift reticule relative group">
                <div className="flex items-start gap-3 md:gap-5">
                  <div className="text-[#FFCC00] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg md:text-xl font-bold text-white mb-2">OTIMIZAÇÃO FPS</h3>
                    <p className="font-rajdhani text-sm md:text-base text-[#B3B9C1]">
                      Servidor otimizado com streaming de assets, occlusion culling e gerenciamento inteligente de memória para garantir alto FPS mesmo em cenários com muitos jogadores.
                    </p>
                  </div>
                </div>
              </div>

              {/* Anti-Cheat */}
              <div className="bg-[#121622] p-4 md:p-6 clip-cut border border-[#FFCC00]/20 hover-lift reticule relative group">
                <div className="text-[#FFCC00] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-orbitron text-lg md:text-xl font-bold text-white mb-2">ANTI-CHEAT</h3>
                <p className="font-rajdhani text-sm md:text-base text-[#B3B9C1]">
                  Proteção avançada contra trapaças, exploits e scripts maliciosos. Jogo limpo para todos.
                </p>
              </div>

              {/* Featured: Servidores Dedicados */}
              <div className="md:col-span-2 bg-[#121622] p-4 md:p-6 clip-cut border border-[#FFCC00]/30 hover-lift reticule relative group">
                <div className="flex items-start gap-3 md:gap-5">
                  <div className="text-[#FFCC00] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg md:text-xl font-bold text-white mb-2">SERVIDORES DEDICADOS</h3>
                    <p className="font-rajdhani text-sm md:text-base text-[#B3B9C1]">
                      Infraestrutura dedicada com alta disponibilidade, backups automáticos e suporte técnico 24h para garantir estabilidade e baixa latência.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mods Exclusivos */}
              <div className="bg-[#121622] p-4 md:p-6 clip-cut border border-[#FFCC00]/20 hover-lift reticule relative group">
                <div className="text-[#FFCC00] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="font-orbitron text-lg md:text-xl font-bold text-white mb-2">MODS EXCLUSIVOS</h3>
                <p className="font-rajdhani text-sm md:text-base text-[#B3B9C1]">
                  Modificações customizadas que expandem as possibilidades do jogo base com novos recursos e funcionalidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confrontation Section - Police vs Criminals */}
      <ConfrontationSection />

      {/* Professions Section - Mechanic vs Hospital */}
      <ProfessionsSection />

      {/* CTA / Whitelist Section */}
      <CTASection />
    </div>
  );
}
