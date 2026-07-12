"use client";

import { useEffect, useState } from "react";
import { getEncryptedCookie, setEncryptedCookie } from "@/lib/cookies";

const COOKIE_KEY = "hT4rC6yV9sA1dF8";
const COOKIE_DAYS = 365;

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getEncryptedCookie(COOKIE_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    setEncryptedCookie(COOKIE_KEY, "accepted", COOKIE_DAYS);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-[#0B1725]/95 backdrop-blur-md border border-[#d4af37]/20 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/50">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#d4af37]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-orbitron text-sm font-bold text-[#d4af37] mb-1">
              Privacidade e Cookies
            </h3>
            <p className="font-rajdhani text-white/60 text-sm leading-relaxed">
              Utilizamos cookies apenas para manter sua sessão ativa e melhorar a navegação no site.
              Ao continuar navegando, você concorda com nossa{" "}
              <span className="text-[#d4af37]/80">Política de Privacidade</span> e{" "}
              <span className="text-[#d4af37]/80">Termos de Uso</span>.
            </p>
          </div>

          <button
            onClick={acceptCookies}
            className="shrink-0 px-6 py-2.5 bg-[#d4af37] hover:bg-[#e5c04a] text-[#0B1725] font-orbitron font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#d4af37]/20"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}