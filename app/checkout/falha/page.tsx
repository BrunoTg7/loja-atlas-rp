"use client";

import Link from "next/link";

export default function CheckoutFalhaPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#0c0c10] to-[#09090b]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-8 backdrop-blur-xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="font-orbitron text-xl font-bold text-white mb-3">
              Pagamento <span className="text-red-400">Não Efetuado</span>
            </h1>

            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              O pagamento não foi concluído ou houve uma falha no processamento.
              Você pode tentar novamente a compra.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/checkout"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] hover:from-[#e8c84a] hover:to-[#e8c84a] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider transition-all duration-300 font-orbitron flex items-center justify-center"
              >
                Tentar Novamente
              </Link>
              <Link
                href="/atlas-coins"
                className="w-full h-11 rounded-xl border border-white/10 hover:border-[#d4af37]/30 text-white/50 hover:text-white text-sm font-medium transition-colors flex items-center justify-center"
              >
                Voltar para a Loja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
