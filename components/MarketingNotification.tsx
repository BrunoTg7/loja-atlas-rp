"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMarketing } from "@/context/MarketingContext";
import { useState, FormEvent } from "react";
import BaseModal from "@/components/BaseModal";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function MarketingNotificationContent() {
  const { showNotification, showConsentForm, showConfirmation, closeAll, openConsentForm, submitConsent } = useMarketing();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!showNotification && !showConsentForm && !showConfirmation) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await doSubmit();
  };

  const doSubmit = async () => {
    if (!consent || !email.trim() || submitting) return;
    setSubmitting(true);
    await submitConsent(email, phone, consent);
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-sm md:max-w-md"
          role="dialog"
          aria-live="polite"
        >
          <div className="relative rounded-2xl border border-[rgba(201,162,39,0.15)] bg-gradient-to-br from-[#0B0F1A] to-[#151a24] p-5 shadow-[0_0_40px_rgba(201,162,39,0.06),0_25px_50px_rgba(0,0,0,0.5)]">
            <svg className="absolute top-0 left-0 w-7 h-7 pointer-events-none" viewBox="0 0 28 28" fill="none"><path d="M2 2 L12 2 L8 6 L2 6 Z" fill="rgba(201,162,39,0.12)" stroke="rgba(201,162,39,0.2)" strokeWidth="0.5" /><path d="M2 2 L2 12 L6 8 L6 2 Z" fill="rgba(201,162,39,0.08)" stroke="rgba(201,162,39,0.15)" strokeWidth="0.5" /><circle cx="3" cy="3" r="1.5" fill="rgba(201,162,39,0.25)" /></svg>
            <svg className="absolute top-0 right-0 w-7 h-7 pointer-events-none" viewBox="0 0 28 28" fill="none" style={{ transform: "rotate(90deg)" }}><path d="M2 2 L12 2 L8 6 L2 6 Z" fill="rgba(201,162,39,0.12)" stroke="rgba(201,162,39,0.2)" strokeWidth="0.5" /><path d="M2 2 L2 12 L6 8 L6 2 Z" fill="rgba(201,162,39,0.08)" stroke="rgba(201,162,39,0.15)" strokeWidth="0.5" /><circle cx="3" cy="3" r="1.5" fill="rgba(201,162,39,0.25)" /></svg>
            <svg className="absolute bottom-0 left-0 w-7 h-7 pointer-events-none" viewBox="0 0 28 28" fill="none" style={{ transform: "rotate(270deg)" }}><path d="M2 2 L12 2 L8 6 L2 6 Z" fill="rgba(201,162,39,0.12)" stroke="rgba(201,162,39,0.2)" strokeWidth="0.5" /><path d="M2 2 L2 12 L6 8 L6 2 Z" fill="rgba(201,162,39,0.08)" stroke="rgba(201,162,39,0.15)" strokeWidth="0.5" /><circle cx="3" cy="3" r="1.5" fill="rgba(201,162,39,0.25)" /></svg>
            <svg className="absolute bottom-0 right-0 w-7 h-7 pointer-events-none" viewBox="0 0 28 28" fill="none" style={{ transform: "rotate(180deg)" }}><path d="M2 2 L12 2 L8 6 L2 6 Z" fill="rgba(201,162,39,0.12)" stroke="rgba(201,162,39,0.2)" strokeWidth="0.5" /><path d="M2 2 L2 12 L6 8 L6 2 Z" fill="rgba(201,162,39,0.08)" stroke="rgba(201,162,39,0.15)" strokeWidth="0.5" /><circle cx="3" cy="3" r="1.5" fill="rgba(201,162,39,0.25)" /></svg>

            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(201,162,39,0.1)] border border-[rgba(201,162,39,0.2)]">
                <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-cinzel text-sm font-bold text-[#d4af37] tracking-wide">Quer novidades da cidade?</h3>
                <p className="mt-1 font-rajdhani text-xs text-white/50 leading-relaxed">
                  Deixe seu contato para receber atualizações, eventos e promoções do Atlas RP.
                </p>
              </div>
              <button
                onClick={closeAll}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Fechar"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={closeAll}
                className="flex-1 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 text-xs font-bold uppercase tracking-wider font-cinzel transition-all"
              >
                Agora não
              </button>
              <button
                onClick={openConsentForm}
                className="flex-1 h-9 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] hover:from-[#e8c84a] hover:to-[#e8c84a] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider font-cinzel transition-all shadow-[0_2px_12px_rgba(212,175,55,0.25)]"
              >
                Quero receber
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showConsentForm && (
        <BaseModal
          open={showConsentForm}
          onClose={closeAll}
          title="Quer novidades da cidade?"
          maxWidth="md"
          icon={
            <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          }
          footer={
            <>
              <BaseModal.SecondaryButton onClick={closeAll}>Cancelar</BaseModal.SecondaryButton>
              <BaseModal.PrimaryButton onClick={doSubmit} disabled={!consent || !email.trim() || submitting}>
                {submitting && <span className="h-3.5 w-3.5 rounded-full border-2 border-[#0a0a0a]/40 border-t-[#0a0a0a] animate-spin" />}
                {submitting ? "Salvando..." : "Quero receber"}
              </BaseModal.PrimaryButton>
            </>
          }
        >
          <p className="font-rajdhani text-sm text-white/50 leading-relaxed mb-5">
            Deixe seu contato para receber atualizações, eventos e promoções do Atlas RP.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="marketing-email" className="block text-sm font-medium text-white mb-1.5">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                id="marketing-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[rgba(201,162,39,0.4)] focus:ring-1 focus:ring-[rgba(201,162,39,0.2)] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="marketing-phone" className="block text-sm font-medium text-white mb-1.5">
                Telefone/WhatsApp <span className="text-white/30">(opcional)</span>
              </label>
              <input
                id="marketing-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                maxLength={16}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[rgba(201,162,39,0.4)] focus:ring-1 focus:ring-[rgba(201,162,39,0.2)] transition-colors"
              />
            </div>

            <div className="flex items-start gap-2.5">
              <label htmlFor="marketing-consent" className="relative mt-0.5 flex items-center justify-center cursor-pointer">
                <input
                  id="marketing-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="peer sr-only"
                  required
                />
                <div className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 peer-checked:border-[#d4af37] peer-checked:bg-[#d4af37] transition-all duration-200 flex items-center justify-center">
                  {consent && (
                    <svg className="w-3 h-3 text-[#0a0a0a]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </label>
              <label htmlFor="marketing-consent" className="font-rajdhani text-xs text-white/60 leading-relaxed cursor-pointer pt-0.5">
                Aceito receber mensagens de marketing do Atlas RP sobre eventos, novidades e promoções.
              </label>
            </div>
          </form>

          <p className="mt-4 text-center font-rajdhani text-[10px] text-white/30">
            Seus dados serão usados exclusivamente para comunicações do Atlas RP.
            Você pode cancelar a qualquer momento respondendo &ldquo;SAIR&rdquo;.
          </p>
        </BaseModal>
      )}

      {showConfirmation && (
        <BaseModal
          open={showConfirmation}
          onClose={closeAll}
          title="Combinado!"
          maxWidth="md"
          icon={
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          footer={
            <BaseModal.PrimaryButton onClick={closeAll}>Entendido</BaseModal.PrimaryButton>
          }
        >
          <p className="font-rajdhani text-sm text-white/50 leading-relaxed">
            A partir de agora você pode receber novidades, eventos e promoções do Atlas RP no
            contato informado. Você pode cancelar esse recebimento quando quiser, respondendo
            &ldquo;SAIR&rdquo; em qualquer mensagem enviada.
          </p>
        </BaseModal>
      )}
    </AnimatePresence>
  );
}

export default function MarketingNotification() {
  if (typeof window === "undefined") return null;

  return <MarketingNotificationContent />;
}