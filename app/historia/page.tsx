"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function HistoriaPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [0.15, 0.03]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-[#05080F] via-[#0B1725] to-[#05080F]">
      {/* ═══ HERO CINEMÁTICO ═══ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden -mt-16">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 50% 30%, rgba(212,175,55,0.25) 0%, transparent 50%)` }} />
        <motion.div className="absolute inset-0 bg-[url('/Imagens/fundo1.webp')] bg-cover bg-center" style={{ opacity: bgOpacity }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080F] via-transparent to-[#05080F]" />

        {/* Vinheta lateral */}
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 120px 0 150px -60px #05080F, inset -120px 0 150px -60px #05080F" }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <p className="font-rajdhani text-[#d4af37]/60 text-xs md:text-sm uppercase tracking-[0.5em]  mb-6">
              Sessão 1 — Atlas RP
            </p>

            <h1 className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 leading-[0.9] mb-8">
              A História
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#C9A227] to-[#8B6914]">
                de Atlas
              </span>
            </h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="w-32 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-8"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="font-rajdhani text-white/30 text-base md:text-lg italic max-w-lg mx-auto"
            >
              &ldquo;Toda cidade possui uma história. Algumas apenas enterram a verdade melhor do que
as outras&rdquo;
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-rajdhani text-white/20 text-[10px] uppercase tracking-[0.3em]">Role para baixo</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-[#d4af37]/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ PRÓLOGO — TEXTO CINEMÁTICO ═══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212,175,55,0.2) 0%, transparent 60%)` }} />

        <div className="relative max-w-3xl mx-auto space-y-24">
          {/* Bloco 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="font-cinzel text-white/8 text-[80px] md:text-[120px] font-black leading-none select-none absolute left-1/2 -translate-x-1/2 -mt-10">H</p>
            <p className="font-rajdhani text-xl md:text-2xl text-white/70 leading-relaxed relative">
              Há muitos anos, <span className="text-[#d4af37] font-semibold">Atlas</span> era apenas uma pequena cidade do interior paulista.
            </p>
          </motion.div>

          {/* Bloco 2 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="font-rajdhani text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
              Graças à sua localização estratégica, tornou-se um dos <span className="text-white/80 font-medium">maiores centros logísticos do país</span>. Empresas começaram a investir, bancos abriram filiais e grandes empresários passaram a disputar influência política.
            </p>
          </motion.div>

          {/* Linha divisória dramática */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex items-center gap-6"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4af37]/20" />
            <div className="w-2 h-2 rotate-45 bg-[#d4af37]/40" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4af37]/20" />
          </motion.div>

        

       
        </div>
      </section>

     

      {/* ═══ CAPÍTULO I — ESTILO MANUSCRITO ═══ */}
      <section className="relative px-6">

        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Header do capítulo */}
            <div className="flex items-center gap-5 mb-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8b6914] flex items-center justify-center shadow-2xl shadow-[#d4af37]/20 rotate-3">
                  <span className="font-cinzel text-2xl font-black text-[#0a0a0a]">I</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#05080F] border border-[#d4af37]/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                </div>
              </div>
              <div>
                <p className="font-rajdhani text-[#d4af37]/60 text-[10px] uppercase tracking-[0.3em] font-semibold">Capítulo Primeiro</p>
                <h2 className="font-cinzel text-3xl md:text-4xl font-black text-white">A Fundação</h2>
              </div>
            </div>

            {/* Texto do capítulo */}
            <div className="relative pl-6 border-l-2 border-[#d4af37]/15 space-y-8">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-rajdhani text-white/55 text-base md:text-lg leading-[1.8]"
              >
                Há mais de duas décadas, <span className="text-[#d4af37]/80 font-medium">Atlas</span> era apenas uma pequena cidade do interior. Graças à sua posição estratégica, tornou-se um dos maiores polos econômicos do estado. Empresas chegaram. Bancos cresceram. O dinheiro passou a circular como nunca antes.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-rajdhani text-white/40 text-base md:text-lg leading-[1.8] italic"
              >
                Mas nem toda riqueza tem origem conhecida...
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CONTINUAÇÃO EM BREVE ═══ */}
      <section className="relative py-24 px-6">

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Decoração */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-px bg-[#d4af37]/20" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]/30" />
              <div className="w-12 h-px bg-[#d4af37]/20" />
            </div>

            <div
              className="inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-gradient-to-r from-[#d4af37]/[0.03] via-[#d4af37]/[0.06] to-[#d4af37]/[0.03] border border-[#d4af37]/15"
              style={{ animation: "sway 4s ease-in-out infinite" }}
            >
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/40 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/30 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/20 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
              <span className="font-cinzel text-[#d4af37]/70 text-sm md:text-base font-bold tracking-wider uppercase">
                Continuação em breve
              </span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/20 animate-pulse" style={{ animationDelay: "0.4s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/30 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/40 animate-pulse" />
              </div>
            </div>

            <p className="font-rajdhani text-white/15 text-xs mt-6 uppercase tracking-[0.3em]">Próximo capítulo em breve</p>
          </motion.div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sway {
          0%, 100% { transform: rotate(-0.8deg) translateY(0); }
          25% { transform: rotate(0.5deg) translateY(-2px); }
          50% { transform: rotate(-0.3deg) translateY(0); }
          75% { transform: rotate(0.8deg) translateY(-1.5px); }
        }
      `}} />
    </div>
  );
}
