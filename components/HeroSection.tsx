"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  // === ANIMATION TIMELINE (600vh total) ===
  // 0% to 15%: Image 1 wipes in horizontally
  // 15% to 30%: HOLD - background fully visible
  // 30% to 45%: Image 2 slides up
  // 45% to 60%: HOLD - both images visible
  // 60% to 70%: Text appears
  // 70% to 95%: HOLD - everything visible (text stays long time)
  // 95% to 100%: Fade out

  // Image 1: Horizontal wipe reveal (0% to 15%)
  const image1ClipLeft = useTransform(smoothProgress, [0, 0.15], ["100%", "0%"]);

  // Image 2: Slide up from bottom (30% to 45%)
  const image2Y = useTransform(smoothProgress, [0.3, 0.45], ["100%", "0%"]);
  const image2Opacity = useTransform(smoothProgress, [0.3, 0.4], [0, 1]);

  // Text animations (60% to 70%)
  const textOpacity = useTransform(smoothProgress, [0.6, 0.7], [0, 1]);
  const textY = useTransform(smoothProgress, [0.6, 0.7], [60, 0]);

  // Scale effect for background (0% to 15%)
  const bgScale = useTransform(smoothProgress, [0, 0.15], [1.15, 1]);

  // Scroll indicator fade out when scrolling starts
  const scrollIndicatorOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);

  // Final fade out when leaving hero section (95% to 100%)
  const heroOpacity = useTransform(smoothProgress, [0.95, 1], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative h-[600vh]"
    >
      {/* Sticky container for the hero content */}
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ opacity: heroOpacity }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F121B] via-[#0B1725] to-[#05080F]" />

        {/* Image 1: Background - Horizontal Wipe Reveal */}
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
              className="w-full h-full object-cover"
            />
            {/* Overlay to darken the image */}
            <div className="absolute inset-0 bg-[#0B1725]/40" />
          </motion.div>
        </motion.div>

        {/* Image 2: Character - Slide Up */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl z-10"
          style={{
            y: image2Y,
            opacity: image2Opacity,
          }}
        >
          <img
            src="/Imagens/personagem1.webp"
            alt="Atlas RP Character"
            className="w-full h-auto max-h-[80vh] object-contain object-bottom drop-shadow-[0_0_50px_rgba(212,175,55,0.3)]"
          />
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="absolute inset-0 flex items-center z-20 pointer-events-none"
          style={{
            opacity: textOpacity,
            y: textY,
          }}
        >
          {/* Decorative lines */}
          <div className="absolute top-[15%] left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF2E44]/20 to-transparent" />
          <div className="absolute bottom-[15%] left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF2E44]/20 to-transparent" />

          {/* Main Content - Logo left, Text right */}
          <div className="w-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 pointer-events-auto">
            {/* Logo - Left side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="shrink-0 mt-12 md:mt-18 lg:mt-24 xl:mt-32 -ml-4 md:-ml-8 lg:-ml-12"
            >
              <img
                src="/Imagens/logo-atlas-rp.webp"
                alt="Atlas RP"
                className="h-56 md:h-64 lg:h-72 xl:h-[28rem] object-contain drop-shadow-[0_0_80px_rgba(255,46,68,0.5)]"
              />
            </motion.div>

            {/* Text - Right side */}
            <div className="flex flex-col text-center mt-4 ml-24 md:mt-50">
              {/* Welcome text */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-6"
              >
                <p className="font-orbitron text-xl md:text-2xl lg:text-3xl font-bold text-white leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  <span className="text-[#FF2E44]">SEJA BEM-VINDO AO ATLAS RP!</span>
                </p>
                <p className="font-rajdhani text-base md:text-lg lg:text-xl text-white/80 mt-2 leading-relaxed">
                  Uma cidade feita para você viver experiências únicas,<br />
                  criar sua história e fazer parte de algo maior!
                </p>
              </motion.div>

              {/* Rules text */}
              <motion.p
                className="font-rajdhani text-sm md:text-base text-white/60 mb-4 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Respeite as regras, valorize o RP e construa sua jornada com a gente.
              </motion.p>

              {/* Staff message */}
              <motion.p
                className="font-orbitron text-xs md:text-sm text-[#FFCC00] uppercase tracking-[0.3em] mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                ★ A Staff deseja uma ótima jornada a todos! ★
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-1 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >

                <Link
                  href="/atlas-coins"
                  className="group relative px-7 py-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-orbitron font-bold text-sm uppercase tracking-wider rounded-xl overflow-hidden transition-all duration-300 hover:bg-yellow-500/20 hover:border-yellow-500/40"
                >
                  <span className="relative z-10">ATLAS COINS</span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator - fades out when scrolling starts */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            style={{ opacity: scrollIndicatorOpacity }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-rajdhani text-xs text-white/40 uppercase tracking-widest">
                Role para baixo
              </span>
              <motion.div
                className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-1 h-1.5 bg-[#FF2E44] rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Corner decorations */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l border-t border-[#FF2E44]/20 z-30" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r border-t border-[#FF2E44]/20 z-30" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l border-b border-[#FF2E44]/20 z-30" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r border-b border-[#FF2E44]/20 z-30" />

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden opacity-[0.03]">
          <div
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-[#FF2E44] to-transparent"
            style={{
              animation: "scanline 8s linear infinite",
            }}
          />
        </div>

        {/* Progress indicator */}
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
