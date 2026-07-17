"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export default function HeroSectionV2() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  const image1ClipLeft = useTransform(smoothProgress, [0, 0.15], ["100%", "0%"]);
  const image2Y = useTransform(smoothProgress, [0.3, 0.45], ["100%", "0%"]);
  const image2Opacity = useTransform(smoothProgress, [0.3, 0.4], [0, 1]);
  const textOpacity = useTransform(smoothProgress, [0.6, 0.7], [0, 1]);
  const textY = useTransform(smoothProgress, [0.6, 0.7], [60, 0]);
  const bgScale = useTransform(smoothProgress, [0, 0.15], [1.2, 1]);
  const scrollIndicatorOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);
  const heroOpacity = useTransform(smoothProgress, [0.95, 1], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative h-[600vh] -mt-2"
    >
      <motion.div
        className="sticky top-[54px] md:top-[64px] h-[calc(100vh-54px)] md:h-[calc(100vh-64px)] w-full overflow-hidden"
        style={{ opacity: heroOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#05080F] via-[#0B1725] to-[#05080F]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 50% 30%, rgba(212,175,55,0.25) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(15,18,27,0.8) 0%, transparent 50%)` }} />

        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${image1ClipLeft} 0 0)`,
          }}
        >
          <motion.div
            className="relative w-full h-full"
            style={{ scale: bgScale }}
          >
            <img
              src="/Imagens/fundo1.webp"
              alt="Atlas RP Background"
              className="w-full h-full object-cover object-top"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/5  w-full max-w-6xl z-10"

          style={{
            y: image2Y,
            opacity: image2Opacity,
          }}
        >
          <img
            src="/Imagens/personagem1.webp"
            alt="Atlas RP Character"
            className="w-full h-auto max-h-[85vh] object-contain object-bottom drop-shadow-[0_0_50px_rgba(212,175,55,0.3)]"
          />
        </motion.div>
        {/* Dark gradient overlay for readability - fades in with text */}
<motion.div
          className="absolute inset-0 pointer-events-none z-19"
          style={{ opacity: textOpacity }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to right, rgba(5,8,15,0.9) 0%, rgba(5,8,15,0.7) 30%, rgba(5,8,15,0.35) 55%, transparent 75%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none md:hidden"
            style={{
              background: "rgba(5,8,15,0.50)",
            }}
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center z-20 pointer-events-none"
          style={{
            opacity: textOpacity,
            y: textY,
          }}
        >
          
          <div className="w-full max-w-4xl px-6 md:px-10 flex flex-col items-center text-center gap-5 pointer-events-auto relative z-10">

            {/* Selo/eyebrow ornamentado */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-4"
            >
              <span className="w-10 md:w-16 h-px bg-gradient-to-r from-transparent to-[#FFD700]/70" />
              <span className="font-rajdhani text-[10px] md:text-xs text-[#FFD700] uppercase tracking-[0.5em]">
                Sua história · Suas regras<span className="hidden md:inline"> · </span><br className="md:hidden" />Seu legado
              </span>
              <span className="w-10 md:w-16 h-px bg-gradient-to-l from-transparent to-[#FFD700]/70" />
            </motion.div>

            {/* Bloco de impacto principal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="mt-2"
            >
              <p className="font-rajdhani text-base md:text-xl text-white/90 tracking-wide">
                Há lugares que surgem, crescem e se tornam grandes.
              </p>
              <p className="font-rajdhani text-base md:text-xl text-white/90 tracking-wide">
                E há lugares que nascem com um propósito maior.
              </p>

              <p className="font-rajdhani text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] via-[#C9A227] to-[#8B6914] drop-shadow-[0_4px_30px_rgba(201,162,39,0.4)] mt-4 mb-4">
                Atlas RP é o seu lugar
              </p>

              <p className="font-rajdhani text-lg md:text-2xl text-white/90 leading-relaxed max-w-2xl">
                Inspirada na força do Titã que carregava os céus sobre os
                ombros, nossa cidade foi erguida sobre pilares que sustentam
                mais que prédios:{' '}
                <span className="text-[#FFD700] font-semibold">
                  sustentam sonhos, escolhas e o futuro.
                </span>
              </p>
            </motion.div>

            {/* Divisor ornamental */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex items-center gap-3 mt-2"
            >
              <span className="w-1.5 h-1.5 rotate-45 bg-[#FFD700]/70" />
              <span className="w-24 md:w-32 h-px bg-gradient-to-r from-[#FFD700]/60 via-[#FFD700]/60 to-transparent" />
              <span className="w-1.5 h-1.5 rotate-45 bg-[#FFD700]/70" />
            </motion.div>

            {/* Linha de regras + assinatura da staff */}
            <motion.p
              className="font-rajdhani text-sm md:text-base text-white italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Respeite as regras, valorize o RP e construa sua jornada com a gente.
            </motion.p>

            <motion.p
              className="font-rajdhani text-xs md:text-sm text-[#FFD700] uppercase tracking-[0.35em] mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              ★ A Staff deseja uma ótima jornada a todos ★
            </motion.p>
          </div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            style={{ opacity: scrollIndicatorOpacity }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-rajdhani text-xs text-white uppercase tracking-widest">
                Role para baixo
              </span>
              <motion.div
                className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-1 h-1.5 bg-[#FFD700] rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute top-6 left-6 w-16 h-16 border-l border-t border-[#FF2E44]/20 z-30" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r border-t border-[#FF2E44]/20 z-30" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l border-b border-[#FF2E44]/20 z-30" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r border-b border-[#FF2E44]/20 z-30" />

        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden opacity-[0.03]">
          <div
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-[#FF2E44] to-transparent"
            style={{
              animation: "scanline 8s linear infinite",
            }}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 z-40">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF2E44] via-[#FFCC00] to-[#d4af37]"
            style={{ scaleX: smoothProgress, transformOrigin: "left" }}
          />
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes scanline {
          0% {
            top: -2px;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </div>
  );
}
