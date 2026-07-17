"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const equipe = [
  {
    nome: "Fundador",
    cargo: "Diretor / Fundador",
    descricao: "Criador e visionário do Atlas RP. Responsável pela direção geral do projeto.",
    avatar: null,
    discord: null,
  },
  {
    nome: "Staff",
    cargo: "Administrador",
    descricao: "Gestão diária do servidor, moderação e suporte à comunidade.",
    avatar: null,
    discord: null,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function SobrePage() {
  const [form, setForm] = useState({ nome: "", email: "", assunto: "", mensagem: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
      setEnviado(true);
      setEnviando(false);
      setForm({ nome: "", email: "", assunto: "", mensagem: "" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05080F] via-[#0B1725] to-[#05080F]">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/Imagens/fundo1.webp')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05080F]/80 via-[#0B1725]/90 to-[#05080F]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 50% 30%, rgba(212,175,55,0.25) 0%, transparent 50%)` }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8b6914] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#0a0a0a]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.5v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.64c.1 1.7 1.36 2.66 2.86 2.97V19h1.71v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.76-3.42z" />
              </svg>
            </div>
            <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#C9A227] to-[#8B6914] mb-4">
              Sobre o Atlas RP
            </h1>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mx-auto mb-6" />
            <p className="font-rajdhani text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Conheça a história, a equipe e os valores por trás do maior servidor de roleplay da plataforma.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sobre o Servidor */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-[#d4af37] mb-4">O Que é o Atlas RP</h2>
            <div className="w-16 h-px bg-[#d4af37]/30 mx-auto mb-8" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeUp} className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Nossa Essência</h3>
              <p className="font-rajdhani text-white/60 leading-relaxed">
                O Atlas RP nasceu da paixão por roleplay de qualidade. Somos um servidor dedicado a oferecer
                uma experiência imersiva, com narrativas envolventes e uma comunidade ativa e respeitosa.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Diferenciais</h3>
              <p className="font-rajdhani text-white/60 leading-relaxed">
                Mapa personalizado, sistema de economy próprio, eventos semanais,
                equipe dedicada e uma comunidade que cresce a cada dia. Aqui, cada jogador é um titã.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Comunidade</h3>
              <p className="font-rajdhani text-white/60 leading-relaxed">
                Mais que um servidor, somos uma comunidade. Eventos interativos, competições
                e momentos épicos que conectam jogadores de todo o Brasil.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white mb-3">Segurança</h3>
              <p className="font-rajdhani text-white/60 leading-relaxed">
                Politicas claras, anti-cheat avançado e uma equipe que trabalha 24/7
                para garantir que todos tenham a melhor experiência possível.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-[#0d1117] to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-[#d4af37] mb-4">Nossa Equipe</h2>
            <div className="w-16 h-px bg-[#d4af37]/30 mx-auto mb-6" />
            <p className="font-rajdhani text-white/50 max-w-xl mx-auto">
              Conheça as pessoas dedicadas que fazem o Atlas RP acontecer todos os dias.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipe.map((membro, i) => (
              <motion.div
                key={membro.nome}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl p-6 text-center hover:border-[#d4af37]/30 transition-colors"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#8b6914]/20 border-2 border-[#d4af37]/30 flex items-center justify-center">
                  {membro.avatar ? (
                    <img src={membro.avatar} alt={membro.nome} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-[#d4af37]/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-cinzel text-lg font-bold text-white mb-1">{membro.nome}</h3>
                <p className="font-rajdhani text-[#d4af37] text-sm font-semibold mb-3">{membro.cargo}</p>
                <p className="font-rajdhani text-white/50 text-sm leading-relaxed">{membro.descricao}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-[#d4af37] mb-4">Contato</h2>
            <div className="w-16 h-px bg-[#d4af37]/30 mx-auto mb-6" />
            <p className="font-rajdhani text-white/50 max-w-xl mx-auto">
              Tem dúvidas, sugestões ou quer falar conosco? Use os canais abaixo.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Canais de Contato */}
            <motion.div {...fadeUp} className="space-y-6">
              <div className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl p-6">
                <h3 className="font-cinzel text-lg font-bold text-white mb-4">Canais Diretos</h3>

                <a
                  href="https://discord.gg/e426pZyTCp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#5865F2]/40 hover:bg-[#5865F2]/5 transition-all group mb-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#5865F2]/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-rajdhani text-white font-semibold text-sm group-hover:text-[#5865F2] transition-colors">Discord</p>
                    <p className="font-rajdhani text-white/40 text-xs">Junte-se à comunidade</p>
                  </div>
                  <svg className="w-4 h-4 text-white/20 ml-auto group-hover:text-[#5865F2] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-rajdhani text-white font-semibold text-sm">E-mail</p>
                    <p className="font-rajdhani text-white/40 text-xs">suporte@atlasrp.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulário */}
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
              <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] border border-[#d4af37]/15 rounded-2xl p-6 space-y-4">
                <h3 className="font-cinzel text-lg font-bold text-white mb-2">Envie uma Mensagem</h3>

                {enviado ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-rajdhani text-white font-semibold">Mensagem enviada!</p>
                    <p className="font-rajdhani text-white/40 text-sm mt-1">Entraremos em contato em breve.</p>
                    <button
                      type="button"
                      onClick={() => setEnviado(false)}
                      className="mt-4 font-rajdhani text-[#d4af37] text-sm hover:underline"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block font-rajdhani text-white/60 text-sm mb-1">Nome</label>
                      <input
                        type="text"
                        required
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="block font-rajdhani text-white/60 text-sm mb-1">E-mail</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block font-rajdhani text-white/60 text-sm mb-1">Assunto</label>
                      <input
                        type="text"
                        required
                        value={form.assunto}
                        onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                        placeholder="Assunto da mensagem"
                      />
                    </div>
                    <div>
                      <label className="block font-rajdhani text-white/60 text-sm mb-1">Mensagem</label>
                      <textarea
                        required
                        rows={4}
                        value={form.mensagem}
                        onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-rajdhani text-sm focus:outline-none focus:border-[#d4af37]/50 transition-colors resize-none"
                        placeholder="Escreva sua mensagem aqui..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={enviando}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a0a0a] font-rajdhani font-bold text-sm uppercase tracking-wider hover:from-[#e8c84a] hover:to-[#d4af37] transition-all disabled:opacity-50"
                    >
                      {enviando ? "Enviando..." : "Enviar Mensagem"}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
