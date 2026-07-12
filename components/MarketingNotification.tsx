"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMarketing } from "@/context/MarketingContext";
import { useState, FormEvent } from "react";

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
    if (!consent || !email.trim()) return;
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
          <div className="bg-[#121622] border border-[#d4af37]/30 rounded-2xl p-5 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37]/10">
                <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-orbitron text-sm font-bold text-white">📬 Quer novidades da cidade?</h3>
                <p className="mt-1 font-rajdhani text-xs text-white/60 leading-relaxed">
                  Deixe seu contato para receber atualizações, eventos e promoções do Atlas RP.
                </p>
              </div>
              <button
                onClick={closeAll}
                className="shrink-0 text-white/40 hover:text-white/70 transition-colors"
                aria-label="Fechar notificação"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={closeAll}
                className="flex-1 px-4 py-2 text-xs font-rajdhani font-semibold uppercase tracking-wider text-white/60 hover:text-white/80 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                Agora não
              </button>
              <button
                onClick={openConsentForm}
                className="flex-1 px-4 py-2 text-xs font-rajdhani font-semibold uppercase tracking-wider text-[#0d0b09] bg-gradient-to-r from-[#d4af37] to-[#b8941f] rounded-xl hover:from-[#e5c04a] hover:to-[#c9a31f] transition-all shadow-lg shadow-[#d4af37]/20"
              >
                Quero receber
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showConsentForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onMouseDown={(e) => e.target === e.currentTarget && closeAll()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="marketing-consent-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="w-full max-w-md bg-[#18181c] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">📬</span>
                <h2 id="marketing-consent-title" className="text-lg font-semibold text-white">
                  Quer novidades da cidade?
                </h2>
              </div>
              <button
                onClick={closeAll}
                aria-label="Fechar formulário"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <p className="font-rajdhani text-sm text-gray-400 mb-5 leading-relaxed">
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
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f12] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="marketing-phone" className="block text-sm font-medium text-white mb-1.5">
                  Telefone/WhatsApp <span className="text-gray-500">(opcional)</span>
                </label>
                <input
                  id="marketing-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={16}
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f12] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="marketing-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400 border-white/20 bg-[#0f0f12] cursor-pointer"
                  required
                />
                <label htmlFor="marketing-consent" className="font-rajdhani text-xs text-white/80 leading-relaxed cursor-pointer">
                  Aceito receber mensagens de marketing do Atlas RP sobre eventos, novidades e promoções.
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAll}
                  className="flex-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white text-sm font-medium py-2.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!consent || !email.trim() || submitting}
                  className="flex-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium py-2.5 flex items-center justify-center gap-2"
                >
                  {submitting && <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                  {submitting ? "Salvando..." : "Quero receber"}
                </button>
              </div>
            </form>

            <p className="mt-4 text-center font-rajdhani text-[10px] text-gray-500">
              Seus dados serão usados exclusivamente para comunicações do Atlas RP.
              Você pode cancelar a qualquer momento respondendo &ldquo;SAIR&rdquo;.
            </p>
          </motion.div>
        </motion.div>
      )}

      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onMouseDown={(e) => e.target === e.currentTarget && closeAll()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="marketing-confirm-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="w-full max-w-md bg-[#18181c] border border-white/10 rounded-2xl p-6 shadow-2xl text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="marketing-confirm-title" className="text-lg font-semibold text-white mb-2">
              Combinado!
            </h2>
            <p className="font-rajdhani text-sm text-gray-400 mb-6 leading-relaxed">
              A partir de agora você pode receber novidades, eventos e promoções do Atlas RP no
              contato informado. Você pode cancelar esse recebimento quando quiser, respondendo
              &ldquo;SAIR&rdquo; em qualquer mensagem enviada.
            </p>
            <button
              onClick={closeAll}
              className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 transition-colors text-white font-medium py-2.5"
            >
              Entendido
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MarketingNotification() {
  if (typeof window === "undefined") return null;

  return <MarketingNotificationContent />;
}