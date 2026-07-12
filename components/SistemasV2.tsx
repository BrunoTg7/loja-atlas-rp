"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function GoldenParticles() {
  const [particles, setParticles] = useState<{ left: string; yEnd: number; xEnd: number; duration: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 8 }).map(() => ({
        left: `${8 + Math.random() * 84}%`,
        yEnd: -600 - Math.random() * 200,
        xEnd: (Math.random() - 0.5) * 40,
        duration: 8 + Math.random() * 4,
      }))
    );
  }, []);

  if (particles.length === 0) return <div className="absolute inset-0 pointer-events-none overflow-hidden" />;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#C9A227]/20"
          style={{ left: p.left, bottom: "-3%" }}
          animate={{ y: [0, p.yEnd], opacity: [0, 0.4, 0], x: [0, p.xEnd] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function GoldenDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-12 md:my-16">
      <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#C9A227]/40" />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="8" y="0" width="8" height="8" fill="rgba(201,162,39,0.3)" transform="rotate(45 8 8)" />
      </svg>
      <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#C9A227]/40" />
    </div>
  );
}

function PillarIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-10 h-10 md:w-20 md:h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <circle cx="40" cy="40" r="38" stroke="rgba(201,162,39,0.3)" strokeWidth="1.5" />
        <circle cx="40" cy="40" r="34" stroke="rgba(201,162,39,0.15)" strokeWidth="0.5" />
        <circle cx="40" cy="2" r="1.5" fill="rgba(201,162,39,0.4)" />
        <circle cx="40" cy="78" r="1.5" fill="rgba(201,162,39,0.4)" />
        <circle cx="2" cy="40" r="1.5" fill="rgba(201,162,39,0.4)" />
        <circle cx="78" cy="40" r="1.5" fill="rgba(201,162,39,0.4)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[#C9A227]">
        {children}
      </div>
    </div>
  );
}

function PillarCard({
  title,
  description,
  featured,
  accentColor,
}: {
  title: string;
  description: string;
  featured?: boolean;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`relative group ${featured ? "md:col-span-2" : ""}`}
    >
      <div
        className="relative h-full p-3 md:p-6 overflow-hidden rounded-sm"
        style={{
          background: `linear-gradient(170deg, rgba(11,15,26,0.95), rgba(5,8,16,0.98))`,
          border: `1.5px solid ${accentColor}25`,
        }}
      >
        {/* Stone texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top golden line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
          }}
        />

        <div className={`relative z-10 ${featured ? "flex items-start gap-5" : "flex flex-col items-center text-center"}`}>
          <PillarIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="md:w-7 md:h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </PillarIcon>
          <div className={featured ? "flex-1" : ""}>
            <h3
              className="text-base md:text-lg font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              {title}
            </h3>
            <p className="font-rajdhani text-sm md:text-base text-white/50 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Bottom ornament for featured */}
        {featured && (
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}30, transparent)`,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

export default function SistemasV2() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 px-4"
      style={{
        background: "linear-gradient(to bottom, #0B1A3B, #0D1225 30%, #111828 70%, #080C18)",
      }}
    >
      <GoldenParticles />
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A227]/50" />
            <span
              className="text-xs text-[#C9A227] uppercase"
              style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.4em" }}
            >
              Funcionalidades
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A227]/50" />
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            NOSSOS{" "}
            <span
              className="text-[#C9A227]"
              style={{ textShadow: "0 0 20px rgba(201,162,39,0.3)" }}
            >
              SISTEMAS
            </span>
          </h2>
          <p className="font-rajdhani text-lg text-white/40 max-w-2xl mx-auto">
            Tudo o que você precisa para a melhor experiência de Roleplay
          </p>
        </motion.div>

        {/* Experience de Jogo subsection */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#C9A227]" />
            <h3
              className="text-sm uppercase text-[#C9A227]"
              style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.2em" }}
            >
              Experiência de Jogo
            </h3>
            <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-[#C9A227]/20 to-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-5">
            <PillarCard
              title="SISTEMA DE TRABALHOS"
              description="Dezenas de profissões únicas — de mecânico a advogado — com missões dinâmicas, progressão de carreira e recompensas que impactam diretamente sua jornada na cidade."
              featured
              accentColor="#C9A227"
            />
            <PillarCard
              title="SISTEMA DE VEÍCULOS"
              description="Concessionária com veículos exclusivos, customização completa e sistema de revisão realista."
              accentColor="#C9A227"
            />
            <PillarCard
              title="ANIMAÇÕES EXCLUSIVAS"
              description="Centenas de animações customizadas para cada ação — de interações sociais a ações de combate."
              accentColor="#C9A227"
            />
            <PillarCard
              title="SISTEMA DE IMÓVEIS"
              description="Compre, alugue e personalize residências e estabelecimentos. Cada imóvel tem localização estratégica no mapa e impacta diretamente seu estilo de jogo."
              featured
              accentColor="#C9A227"
            />
          </div>
        </div>

        <GoldenDivider />

        {/* Infraestrutura subsection */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#8B6914]" />
            <h3
              className="text-sm uppercase text-[#8B6914]"
              style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.2em" }}
            >
              Infraestrutura e Qualidade
            </h3>
            <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-[#8B6914]/20 to-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-5">
            <PillarCard
              title="OTIMIZAÇÃO FPS"
              description="Servidor otimizado com streaming de assets, occlusion culling e gerenciamento inteligente de memória para garantir alto FPS mesmo em cenários com muitos jogadores."
              featured
              accentColor="#8B6914"
            />
            <PillarCard
              title="ANTI-CHEAT"
              description="Proteção avançada contra trapaças, exploits e scripts maliciosos. Jogo limpo para todos."
              accentColor="#8B6914"
            />
            <PillarCard
              title="MODS EXCLUSIVOS"
              description="Modificações customizadas que expandem as possibilidades do jogo base com novos recursos e funcionalidades."
              accentColor="#8B6914"
            />
            <PillarCard
              title="CONTENT EXCLUSIVO"
              description="Mapas, veículos e recursos únicos criados exclusivamente para a experiência do Atlas RP."
              featured
              accentColor="#8B6914"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
