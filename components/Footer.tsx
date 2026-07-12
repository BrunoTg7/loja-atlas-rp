"use client";

import { useState } from "react";
import styled from "styled-components";

const SocialLink = styled.a`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1714, #0d0b09);
  border: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #d4af37;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(212, 175, 55, 0.6);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.25);
    color: #ffd277;
  }

  .tip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) translateY(6px);
    background: linear-gradient(145deg, #1a1714, #0d0b0d);
    border: 1px solid rgba(212, 175, 55, 0.35);
    border-radius: 8px;
    padding: 5px 10px;
    white-space: nowrap;
    font-family: "Orbitron", sans-serif;
    font-size: 0.55rem;
    font-weight: 600;
    color: #d4af37;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
  }

  .tip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(212, 175, 55, 0.35);
  }

  &:hover .tip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer suppressHydrationWarning className="relative z-10 border-t border-[#d4af37]/30 bg-gradient-to-b from-[#0B0B0B] to-[#050308]">
        <div className="max-w-full mx-auto px-4 pt-12 pb-8">
          {/* Social */}
          <div className="text-center mb-8">
            <p className="font-orbitron text-[14px] font-bold text-[#d4af37] uppercase tracking-[0.25em] mb-1">
              Siga-nos
            </p>
            <p className="font-rajdhani text-white/80 text-[12px] mb-5">
              Fique por dentro de todas as novidades
            </p>

            <div className="flex justify-center gap-3 flex-wrap">
              <SocialLink href="https://discord.gg/e426pZyTCp" target="_blank" rel="noopener noreferrer" suppressHydrationWarning>
                <span className="tip">Discord</span>
                <svg viewBox="0 0 16 16" height={20} width={20} fill="currentColor">
                  <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
                </svg>
              </SocialLink>

              <SocialLink href="https://www.instagram.com/atlasrp__/" target="_blank" rel="noopener noreferrer" suppressHydrationWarning>
                <span className="tip">Instagram</span>
                <svg viewBox="0 0 24 24" height={20} width={20} fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mb-6" />

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="font-rajdhani text-white/90 text-[14px]">
                &copy; 2026 <span className="text-[#d4af37]/80">Atlas RP</span>. Todos os direitos reservados.
              </p>
              <p className="font-rajdhani text-white/70 text-[12px] mt-0.5">
                Este produto não é afiliado, endossado ou patrocinado pela Rockstar Games.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <button
                onClick={() => setShowTerms(true)}
                className="font-rajdhani text-white/70 hover:text-[#d4af37] transition-colors text-[12px]"
              >
                Termos de Uso
              </button>
              <button
                onClick={() => setShowPrivacy(true)}
                className="font-rajdhani text-white/70 hover:text-[#d4af37] transition-colors text-[12px]"
              >
                Política de Privacidade
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0B1725] border border-[#d4af37]/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-orbitron text-sm md:text-lg font-bold text-[#d4af37]">TERMOS DE USO</h2>
                <button onClick={() => setShowTerms(false)} className="text-white/40 hover:text-[#d4af37] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="font-rajdhani text-white/50 space-y-4 text-sm leading-relaxed">
                <p><strong className="text-white/70">1. Aceitação dos Termos:</strong> Ao acessar e utilizar a loja Atlas RP, você concorda com estes termos de uso. Se não concordar, não utilize nossos serviços.</p>
                <p><strong className="text-white/70">2. Produtos Digitais:</strong> Todos os produtos vendidos são digitais e destinados a jogos de roleplay. Não oferecemos reembolso após a entrega do produto digital, salvo em casos de defeito comprovado.</p>
                <p><strong className="text-white/70">3. Uso Responsável:</strong> Os produtos adquiridos são para uso pessoal e intransferível. É proibida a revenda, compartilhamento de contas ou qualquer uso que viole as regras do servidor.</p>
                <p><strong className="text-white/70">4. Pagamento:</strong> Aceitamos pagamentos via PIX e cartão de crédito. O acesso aos produtos será liberado apenas após a confirmação definitiva do pagamento.</p>
                <p><strong className="text-white/70">5. Suporte:</strong> Em caso de problemas, entre em contato através do nosso canal de suporte no Discord. Nos comprometemos a responder em até 24 horas.</p>
                <p><strong className="text-white/70">6. Isenção de Responsabilidade:</strong> A Atlas RP não se responsabiliza por alterações feitas pelos desenvolvedores do jogo que possam afetar o funcionamento dos produtos adquiridos.</p>
                <p><strong className="text-white/70">7. Modificações:</strong> Reservamos o direito de alterar estes termos a qualquer momento. O uso continuado da loja após alterações constitui aceitação dos novos termos.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0B1725] border border-[#d4af37]/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-orbitron text-sm md:text-lg font-bold text-[#d4af37]">POLÍTICA DE PRIVACIDADE</h2>
                <button onClick={() => setShowPrivacy(false)} className="text-white/40 hover:text-[#d4af37] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="font-rajdhani text-white/50 space-y-4 text-sm leading-relaxed">
                <p><strong className="text-white/70">1. Coleta de Dados:</strong> Coletamos apenas os dados necessários para processar suas compras, como nome de usuário Steam, avatar e informações de pagamento.</p>
                <p><strong className="text-white/70">2. Uso de Dados:</strong> Seus dados são utilizados exclusivamente para entregar os produtos adquiridos, autenticar sua conta e melhorar sua experiência na loja.</p>
                <p><strong className="text-white/70">3. Compartilhamento:</strong> Não compartilhamos seus dados pessoais com terceiros, exceto quando necessário para processar pagamentos ou conforme exigido por lei.</p>
                <p><strong className="text-white/70">4. Segurança:</strong> Implementamos medidas de segurança técnicas e administrativas para proteger suas informações contra acesso não autorizado, incluindo criptografia JWT e cookies HttpOnly.</p>
                <p><strong className="text-white/70">5. Cookies:</strong> Utilizamos cookies essenciais para manter sua sessão de login ativa e melhorar a navegação no site. Não utilizamos cookies de rastreamento ou analytics de terceiros. Você pode gerenciar suas preferências de cookies a qualquer momento.</p>
                <p><strong className="text-white/70">6. Retenção de Dados:</strong> Seus dados são mantidos pelo tempo necessário para fornecer nossos serviços. Você pode solicitar a exclusão dos seus dados a qualquer momento entrando em contato connosco.</p>
                <p><strong className="text-white/70">7. Seus Direitos:</strong> Você tem direito de acessar, corrigir ou solicitar a exclusão dos seus dados pessoais. Entre em contato através do nosso Discord para exercer esses direitos.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
