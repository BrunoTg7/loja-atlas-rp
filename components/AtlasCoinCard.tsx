"use client";

import { motion, useReducedMotion } from "framer-motion";
import styled from 'styled-components';

interface CoinPackage {
  id: string;
  amount: number;
  price: number;
  tier: "small" | "featured" | "popular" | "bestValue";
  badge?: string;
  pixDiscount?: string;
  buttonColor?: string;
}

const featuredPackages: CoinPackage[] = [
  { id: "c5000", amount: 5000, price: 199.90, tier: "featured", pixDiscount: "10% de desconto com PIX acima de R$ 99,90", buttonColor: "from-purple-600 via-purple-500 to-purple-700" },
  { id: "c2000", amount: 2000, price: 94.90, tier: "popular", badge: "POPULAR", pixDiscount: "10% de desconto com PIX acima de R$ 99,90", buttonColor: "from-[#d4af37] via-[#e8c84a] to-[#8b7021]" },
  { id: "c1500", amount: 1500, price: 79.90, tier: "featured", pixDiscount: "10% de desconto com PIX acima de R$ 99,90", buttonColor: "from-blue-600 via-blue-500 to-blue-700" },
  { id: "c10000", amount: 10000, price: 349.90, tier: "bestValue", badge: "MELHOR CUSTO BENEFÍCIO", pixDiscount: "10% de desconto com PIX acima de R$ 99,90", buttonColor: "from-red-600 via-red-500 to-red-700" },
];

const secondaryPackages: CoinPackage[] = [
  { id: "c100", amount: 100, price: 6.90, tier: "small" },
  { id: "c250", amount: 250, price: 14.90, tier: "small" },
  { id: "c500", amount: 500, price: 27.90, tier: "small" },
  { id: "c600", amount: 600, price: 32.90, tier: "small" },
  { id: "c1000", amount: 1000, price: 54.90, tier: "small" },
  { id: "c1500s", amount: 1500, price: 79.90, tier: "small" },
  { id: "c2000s", amount: 2000, price: 94.90, tier: "small" },
  { id: "c5000s", amount: 5000, price: 199.90, tier: "small" },
];

/* ─── STYLED BUTTON ─── */
const GoldButton = styled.button<{ $text?: string }>`
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(to right, #77530a, #ffd277, #77530a, #77530a, #ffd277, #77530a);
  background-size: 250%;
  background-position: left;
  color: #ffd277;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition-duration: 1s;
  overflow: hidden;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;

  &::before {
    position: absolute;
    content: "${({ $text }) => $text || 'COMPRAR AGORA'}";
    color: #ffd277;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 97%;
    height: 90%;
    border-radius: 10px;
    transition-duration: 1s;
    background-color: rgba(0, 0, 0, 0.842);
    background-size: 200%;
  }

  &:hover {
    background-position: right;
    transition-duration: 1s;
  }

  &:hover::before {
    background-position: right;
    transition-duration: 1s;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const GoldButtonSmall = styled(GoldButton)`
  height: 44px;
  font-size: 0.7rem;
  letter-spacing: 2px;

  &::before {
    content: "${({ $text }) => $text || 'COMPRAR'}";
  }
`;

/* ─── DETAILED 3D COIN (pure CSS) ─── */
function Coin3D({ size = 96, className = "" }: { size?: number; className?: string }) {
  const s = size;
  const inner = s * 0.65;

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: s, height: s }}>
      {/* Contact shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%] bg-black/50 blur-[6px]" style={{ width: s * 0.7, height: s * 0.12 }} />
      
      {/* Main coin */}
      <div className="absolute rounded-full overflow-hidden" style={{
        width: s,
        height: s,
        bottom: 0,
        left: 0,
        background: `
          radial-gradient(ellipse at 32% 28%, rgba(212,175,55,0.8) 0%, transparent 35%),
          radial-gradient(ellipse at 25% 20%, rgba(255,210,119,0.35) 0%, transparent 25%),
          radial-gradient(ellipse at 72% 72%, rgba(135, 105, 35, 0.9) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.3) 0%, transparent 60%),
          linear-gradient(145deg, #e1c20fff 0%, #e0b430ff 15%, #ac8a1cff 35%, #cea322ff 60%, #987b24ff 85%, #7a5c1a 100%)
        `,
        boxShadow: `
          inset 0 3px 6px rgba(255,240,190,0.5),
          inset 0 -3px 6px rgba(90,68,18,0.6),
          inset 3px 0 8px rgba(255,220,100,0.2),
          inset -3px 0 8px rgba(90,68,18,0.3),
          0 4px 12px rgba(0,0,0,0.5),
          0 2px 4px rgba(0,0,0,0.3)
        `,
      }}>
        {/* Serrations / edge detail */}
        {Array.from({ length: 48 }).map((_, i) => {
          const angle = (i * 360) / 48;
          const isEven = i % 2 === 0;
          return (
            <div key={i} className="absolute" style={{
              width: 1.5,
              height: s * 0.05,
              background: isEven ? "rgba(255,235,170,0.2)" : "rgba(90,68,18,0.15)",
              top: "50%",
              left: "50%",
              transformOrigin: `0 ${s * 0.48}px`,
              transform: `rotate(${angle}deg)`,
            }} />
          );
        })}
        
        {/* Outer ring */}
        <div className="absolute rounded-full border-2 border-[rgba(255,235,170,0.25)]" style={{
          top: '6%',
          left: '6%',
          right: '6%',
          bottom: '6%',
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.25)`,
        }} />
        
        {/* Inner dark circle - embossed effect */}
        <div className="absolute rounded-full" style={{
          top: '12%',
          left: '12%',
          right: '12%',
          bottom: '12%',
          background: `radial-gradient(circle, rgba(90,68,18,0.4) 0%, rgba(60,45,12,0.6) 60%, rgba(40,30,8,0.7) 100%)`,
          boxShadow: `inset 0 2px 8px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(255,235,170,0.1)`,
        }} />
        
        {/* Inner ring border */}
        <div className="absolute rounded-full border-[1.5px] border-[rgba(255,235,170,0.15)]" style={{
          top: '12%',
          left: '12%',
          right: '12%',
          bottom: '12%',
        }} />
        
        {/* Letter A */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: -s * 0.1 }}>
          <svg width={inner} height={inner} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 2px 3px rgba(139,112,33,0.6))" }}>
            <defs>
              <linearGradient id="goldA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#b8941f" />
                <stop offset="100%" stopColor="#8b7021" />
              </linearGradient>
            </defs>
            <path d="M50 2 L92 95 L72 95 L62 65 L38 65 L28 95 L8 95 Z M58 55 L50 22 L42 55 Z" 
                  fill="url(#goldA)" fillRule="evenodd" />
          </svg>
        </div>
        
        {/* Top specular highlight */}
        <div className="absolute rounded-full" style={{
          top: '8%',
          left: '15%',
          width: '35%',
          height: '18%',
          background: "radial-gradient(ellipse, rgba(255,250,220,0.5) 0%, transparent 70%)",
          filter: "blur(3px)",
        }} />
      </div>
      
      {/* Hover shine */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,250,200,0.3) 50%, transparent 60%)",
          animation: "coinShine 0.6s ease-out forwards",
        }} />
      </div>
    </div>
  );
}

/* ─── FEATURED CARD ─── */
function FeaturedCard({ pkg, index }: { pkg: CoinPackage; index: number }) {
  const shouldReduceMotion = useReducedMotion();

  const handleAdd = () => {
    alert(`Pacote de ${pkg.amount.toLocaleString("pt-BR")} Atlas Coins - R$ ${pkg.price.toFixed(2)}`);
  };

  const isBestValue = pkg.tier === "bestValue";
  const isPopular = pkg.tier === "popular";

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative group"
    >
      {/* Card */}
      <div className={`text-white rounded-3xl border bg-gradient-to-tr from-[#0F0F0F] to-[#0B0B0B] shadow-2xl duration-700 z-10 relative backdrop-blur-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-rotate-1 ${isBestValue ? "border-[#d4af37]/50 hover:border-[#d4af37]/80 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]" : "border-[#d4af37]/20 hover:border-[#d4af37]/40 hover:shadow-[#d4af37]/10 hover:shadow-3xl"}`}>
        {/* Popular ribbon - INSIDE card so it moves with transform */}
        {isPopular && (
          <div className="absolute -top-1 -right-1 z-20 overflow-hidden w-28 h-28 pointer-events-none">
            <div className="absolute top-[22px] right-[-35px] w-[140px] py-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-center rotate-45 shadow-lg" style={{ boxShadow: "0 4px 15px rgba(220,38,38,0.5)" }}>
              <span className="text-[9px] font-bold text-white uppercase tracking-widest font-orbitron">{pkg.badge}</span>
            </div>
          </div>
        )}

        {/* Best Value badge - INSIDE card */}
        {isBestValue && (
          <div className="flex justify-center mb-3 pt-4">
            <div className="px-5 py-1.5 bg-gradient-to-r from-[#d4af37] via-[#f4e4bc] to-[#d4af37] text-[#0a0a0a] font-orbitron text-[10px] font-extrabold uppercase tracking-[0.15em] rounded-sm shadow-[0_4px_20px_rgba(212,175,55,0.6)]">
              ★ {pkg.badge} ★
            </div>
          </div>
        )}

        {/* Background effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/5 to-[#d4af37]/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-[#d4af37]/10 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
        </div>

        <div className="relative z-10 p-8">
          {/* Coin */}
          <div className="flex justify-center mb-5">
            <Coin3D size={100} />
          </div>

          {/* Amount */}
          <div className="text-center mb-2">
            <div className="font-orbitron font-black text-4xl text-white tracking-tight leading-none mb-1">
              {pkg.amount.toLocaleString("pt-BR")}
            </div>
            <div className="text-[11px] font-semibold text-[#d4af37]/60 uppercase tracking-[0.2em] mb-4">
              Atlas Coins
            </div>
          </div>

          {/* PIX Discount badge */}
          {pkg.pixDiscount && (
            <div className="flex justify-center mb-4">
              <div className="relative px-4 py-2 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-500/20 border border-emerald-500/30 rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                <div className="relative flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{pkg.pixDiscount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-sm text-white/40 font-medium">R$</span>
              <span className="font-orbitron font-bold text-4xl text-white">{pkg.price.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          {/* Button - Gold Styled */}
          <GoldButton onClick={handleAdd} />
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#d4af37]/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

/* ─── SECONDARY CARD ─── */
function SecondaryCard({ pkg, index }: { pkg: CoinPackage; index: number }) {
  const shouldReduceMotion = useReducedMotion();

  const handleAdd = () => {
    alert(`Pacote de ${pkg.amount.toLocaleString("pt-BR")} Atlas Coins - R$ ${pkg.price.toFixed(2)}`);
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative group w-full"
    >
      <div className="text-white rounded-3xl border border-[#d4af37]/15 bg-gradient-to-br from-[#131318] to-[#0B0B0B] shadow-xl duration-500 z-10 relative backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-[#d4af37]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_0_1px_rgba(212,175,55,0.1)] hover:-translate-y-1 w-full h-full">
        {/* Background glow */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="relative z-10 p-7 text-center">
          {/* Mini Coin */}
          <div className="flex justify-center mb-4">
            <Coin3D size={72} />
          </div>

          {/* Amount */}
          <div className="font-orbitron font-black text-2xl text-white tracking-tight leading-none mb-1">
            {pkg.amount.toLocaleString("pt-BR")}
          </div>
          <div className="text-[10px] font-semibold text-[#d4af37]/50 uppercase tracking-[0.15em] mb-4">
            Atlas Coins
          </div>

          {/* Price */}
          <div className="mb-5">
            <span className="text-xs text-white/30 font-medium mr-0.5">R$</span>
            <span className="font-orbitron font-bold text-2xl text-white">{pkg.price.toFixed(2).replace(".", ",")}</span>
          </div>

          {/* Button - Gold Styled Small */}
          <GoldButtonSmall onClick={handleAdd} />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── PAGE ─── */
export default function PaginaAtlasCoins() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Background texture */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#0c0c10] to-[#09090b]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(212,175,55,0.08) 0%, transparent 40%)` }} />
      </div>

      <div className="relative z-10">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. HEADER */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="pt-20 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              {/* Left: Vantagens */}
              <div className="flex flex-col gap-5 lg:w-1/3">
                {/* Shield - 100% segura */}
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/20 flex items-center justify-center group-hover:border-[#d4af37]/40 transition-all duration-300">
                    <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">100% segura e confiável</p>
                    <p className="text-white/40 text-xs">Compra protegida</p>
                  </div>
                </div>

                {/* Lightning - Automática */}
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/20 flex items-center justify-center group-hover:border-[#d4af37]/40 transition-all duration-300">
                    <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Automática e imediata</p>
                    <p className="text-white/40 text-xs">Entrega instantânea</p>
                  </div>
                </div>

                {/* Gift - Exclusivos */}
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/20 flex items-center justify-center group-hover:border-[#d4af37]/40 transition-all duration-300">
                    <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Exclusivos na cidade</p>
                    <p className="text-white/40 text-xs">Conteúdo premium</p>
                  </div>
                </div>

                {/* Crown - Investimento */}
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/20 flex items-center justify-center group-hover:border-[#d4af37]/40 transition-all duration-300">
                    <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l4 5 4-3 4 3 4-5v14H5V3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" /></svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Investimento que eleva sua jornada</p>
                    <p className="text-white/40 text-xs">Evolua no jogo</p>
                  </div>
                </div>
              </div>

              {/* Center: Title */}
              <div className="text-center lg:w-1/3">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-10 h-px bg-[#d4af37]/40" />
                  <span className="text-[10px] font-bold text-[#d4af37]/70 uppercase tracking-[0.3em]">Loja Oficial</span>
                  <div className="w-10 h-px bg-[#d4af37]/40" />
                </div>
                <h1 className="font-orbitron text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                  COMPRE <span className="text-[#d4af37]">ATLAS COINS</span> E IMPULSIONE SUA <span className="text-[#d4af37]">EXPERIÊNCIA!</span>
                </h1>
              </div>

              {/* Right: Logo + Coin */}
              <div className="flex flex-col items-center gap-4 lg:w-1/3">
                <div className="text-center">
                  <h2 className="font-anton text-3xl font-black tracking-wider" style={{ background: "linear-gradient(135deg, #f5d06b 0%, #d4af37 40%, #8b7021 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    ATLAS COINS
                  </h2>
                </div>
                <Coin3D size={140} />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 2. FEATURED PACKAGES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="pb-6 px-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="w-16 h-px bg-[#d4af37]/30" />
              <span className="text-[11px] font-bold text-[#d4af37]/60 uppercase tracking-[0.25em]">Pacotes em Destaque</span>
              <div className="w-16 h-px bg-[#d4af37]/30" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
              {featuredPackages.map((pkg, i) => (
                <FeaturedCard key={pkg.id} pkg={pkg} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3. SECONDARY PACKAGES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="w-16 h-px bg-[#d4af37]/30" />
              <span className="text-[11px] font-bold text-[#d4af37]/60 uppercase tracking-[0.25em]">Outros Pacotes</span>
              <div className="w-16 h-px bg-[#d4af37]/30" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5">
              {secondaryPackages.map((pkg, i) => (
                <SecondaryCard key={pkg.id} pkg={pkg} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 4. FOOTER / PAYMENT / SECURITY */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="pb-10 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Payment & Security Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Payment Methods */}
              <div className="rounded-2xl border border-[#d4af37]/15 bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-6 backdrop-blur-xl">
                <h3 className="font-orbitron text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-4">Formas de Pagamento</h3>
                <div className="space-y-4">
                  {/* Credit Card */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Cartão de Crédito</p>
                      <p className="text-white/40 text-xs">Parcele em até 18x</p>
                    </div>
                  </div>
                  {/* PIX */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">PIX</p>
                      <p className="text-emerald-400/70 text-xs font-semibold">10% OFF acima de R$ 99,90</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Shield */}
              <div className="rounded-2xl border border-[#d4af37]/25 bg-gradient-to-br from-[#1a1714] to-[#0d0b09] p-6 backdrop-blur-xl text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border-2 border-[#d4af37]/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="font-orbitron text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-2">SUA COMPRA É PROTEGIDA!</h3>
                <p className="text-white/50 text-xs leading-relaxed">Ambiente 100% seguro, dados protegidos, entrega automática.</p>
              </div>

              {/* Rating Seal */}
              <div className="rounded-2xl border border-[#d4af37]/15 bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-6 backdrop-blur-xl text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <h3 className="font-orbitron text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">ATLAS COINS</h3>
                <p className="text-white/50 text-xs leading-relaxed">Mais que moedas, sua evolução!</p>
              </div>
            </div>

            {/* Final Bar */}
            <div className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#131318] via-[#1a1714] to-[#131318] p-6 text-center backdrop-blur-xl">
              <p className="font-orbitron text-sm md:text-base font-bold text-white mb-4 tracking-wide">
                COMPRE COM SEGURANÇA, RAPIDEZ E ECONOMIZE!
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-white/50 text-sm">DÚVIDAS?</span>
               <GoldButtonSmall
  onClick={() => window.open("https://discord.com/channels/856691311264661515/856691312152543232", "_blank")}
  $text="🎧 CHAME UM ATENDENTE!"
  style={{ width: 'auto', minWidth: '220px', height: '40px' }}
/>
             </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes coinShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
