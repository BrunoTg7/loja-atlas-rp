"use client";

import { useState } from "react";
import styled from "styled-components";
import TicketHolografico from "./TicketHolografico";
import WhitelistModal from "./WhitelistModal";

const FadeIn = styled.div<{ $visible: boolean }>`
  opacity: ${p => p.$visible ? 1 : 0};
  transform: translateY(${p => p.$visible ? 0 : 20}px);
  transition: all 0.6s ease;
`;

const StepCircle = styled.div<{ $done: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'anton', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.3s ease;
  background: ${p => p.$done
    ? "linear-gradient(135deg, #d4af37, #b8941f)"
    : "rgba(255,255,255,0.05)"};
  border: 1.5px solid ${p => p.$done ? "#d4af37" : "rgba(255,255,255,0.15)"};
  color: ${p => p.$done ? "#0d0b09" : "rgba(255,255,255,0.4)"};
`;

const CheckItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
`;

const BenefitBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(212,175,55,0.1);
  border-radius: 8px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  white-space: nowrap;
`;

const CTAButton = styled.span`
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #d4af37, #b8941f);
  border: none;
  border-radius: 10px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0d0b09;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(212,175,55,0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(212,175,55,0.45);
  }

  &:active {
    transform: translateY(0);
  }
`;

const steps = [
  { num: 1, title: "Preencha o formulário", desc: "Regras + noções básicas de RP" },
  { num: 2, title: "Aguarde a aprovação", desc: "Prazo estimado: até 24h" },
  { num: 3, title: "Aprovado!", desc: "Gere seu Ticket de Acesso" },
];

const benefits = [
  { icon: "🎭", label: "Roleplay de verdade" },
  { icon: "💰", label: "Economia realista" },
  { icon: "⚔️", label: "Facções ativas" },
  { icon: "👥", label: "Comunidade ativa" },
];

export default function CTASection() {
  const [ticketState, setTicketState] = useState<"locked" | "analyzing" | "unlocked">("locked");
  const [whitelistOpen, setWhitelistOpen] = useState(false);
  const [fiveMOpen, setFiveMOpen] = useState(false);

  const handleSimulate = () => {
    setTicketState("unlocked");
  };

  const handleConnect = () => {
    setFiveMOpen(true);
    window.location.href = "fivem://connect/6myob4d";
  };

  return (
    <>
      <section className="py-20 px-4 relative overflow-hidden bg-[#05080F]">
        <div className="max-w-7xl mx-auto">
          {/* Welcome text */}
          <div className="text-center mb-16">
            <p className="font-anton text-xs font-bold text-[#d4af37] uppercase tracking-[0.3em] mb-3">
              Comece sua jornada
            </p>
            <h2 className="font-anton text-3xl md:text-4xl font-bold text-white mb-4">
              Sua história em <span className="text-[#d4af37]">Atlas RP</span> começa aqui
            </h2>
            <p className="font-rajdhani text-lg text-white/60 max-w-2xl mx-auto">
              Uma cidade viva com economia realista, facções rivais, eventos semanais e uma comunidade que valoriza o roleplay de verdade.
            </p>
          </div>

          {/* Main content - 2 columns */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left - Text / Whitelist */}
            <div className="flex-1 order-2 lg:order-1">
              {/* Whitelist explanation */}
              <div className="mb-8">
                <h3 className="font-anton text-lg font-bold text-white mb-3">
                  O que é a <span className="text-[#d4af37]">Whitelist</span>?
                </h3>
                <p className="font-rajdhani text-white/50 leading-relaxed">
                  Para manter o roleplay sério e imersivo, todo novo jogador passa por uma whitelist rápida antes de entrar na cidade. Não é uma barreira chata — é uma garantia de qualidade do RP para todos.
                </p>
              </div>

              {/* Steps */}
              <div className="mb-8">
                <h4 className="font-anton text-sm font-bold text-white/70 uppercase tracking-wider mb-4">
                  Etapas
                </h4>
                <div className="space-y-1">
                  {steps.map((step) => {
                    const done = (ticketState === "analyzing" && step.num <= 2) || (ticketState === "unlocked");
                    return (
                      <CheckItem key={step.num}>
                        <StepCircle $done={done}>
                          {done && ticketState === "unlocked" ? "✓" : step.num}
                        </StepCircle>
                        <div>
                          <p className={`font-rajdhani font-semibold text-sm ${done ? "text-[#d4af37]" : "text-white/70"}`}>
                            {step.title}
                          </p>
                          <p className="font-rajdhani text-xs text-white/35">
                            {step.desc}
                          </p>
                        </div>
                      </CheckItem>
                    );
                  })}
                </div>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap gap-2 mb-8">
                {benefits.map((b) => (
                  <BenefitBadge key={b.label}>
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </BenefitBadge>
                ))}
              </div>

              {/* CTA Button */}
              {ticketState === "locked" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setWhitelistOpen(true)}
                    className="cursor-pointer"
                  >
                    <CTAButton as="span">
                      Fazer Whitelist Agora
                    </CTAButton>
                  </button>
                  <button
                    onClick={handleConnect}
                    className="cursor-pointer"
                  >
                    <CTAButton as="span">
                      🔗 Conectar ao servidor
                    </CTAButton>
                  </button>
                </div>
              )}

              {ticketState === "analyzing" && (
                <FadeIn $visible={true}>
                  <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl p-5">
                    <p className="font-anton text-sm font-bold text-[#d4af37] mb-1">
                      Em análise...
                    </p>
                    <p className="font-rajdhani text-sm text-white/50">
                      Sua whitelist está sendo revisada pela equipe. Prazo estimado: até 24h.
                    </p>
                    <button
                      onClick={handleSimulate}
                      className="mt-3 font-rajdhani text-xs text-white/30 hover:text-[#d4af37] underline transition-colors"
                    >
                      (Simular aprovação)
                    </button>
                  </div>
                </FadeIn>
              )}

              {ticketState === "unlocked" && (
                <FadeIn $visible={true}>
                  <a
                    href="https://discord.gg/e426pZyTCp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <CTAButton as="a">
                      Entrar no Discord e Jogar
                    </CTAButton>
                  </a>
                </FadeIn>
              )}
            </div>

            {/* Right - Ticket */}
            <div className="order-1 lg:order-2 flex justify-center">
              <TicketHolografico unlocked={ticketState === "unlocked"} />
            </div>
          </div>
        </div>
      </section>

      <WhitelistModal open={whitelistOpen} onClose={() => setWhitelistOpen(false)} />

      {fiveMOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0b09] border border-[#d4af37]/20 rounded-2xl p-8 max-w-md mx-4 text-center">
            <h3 className="font-anton text-xl font-bold text-white mb-4">
              Conectar ao Servidor
            </h3>
            <p className="font-rajdhani text-white/60 mb-2">
              Certifique-se de que o <span className="text-[#d4af37] font-bold">FiveM</span> está aberto no seu computador.
            </p>
            <p className="font-rajdhani text-white/40 text-sm mb-6">
              Se o FiveM não estiver rodando, abra o aplicativo primeiro e tente novamente.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConnect}
                className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] rounded-lg font-anton text-sm font-bold text-[#0d0b09] uppercase tracking-wider cursor-pointer transition-all hover:shadow-[0_6px_30px_rgba(212,175,55,0.45)]"
              >
                Tentar Conectar Novamente
              </button>
              <button
                onClick={() => setFiveMOpen(false)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-rajdhani text-sm text-white/60 cursor-pointer transition-all hover:bg-white/10 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
