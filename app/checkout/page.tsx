"use client";

import { useCart } from "@/context/CartContext";
import { useSteam } from "@/context/SteamContext";
import { usePromotions } from "@/hooks/usePromotions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type PaymentMethod = "pix" | "credit_card";

function formatCardNumber(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 16);
  return v.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 4);
  if (v.length >= 3) return v.slice(0, 2) + "/" + v.slice(2);
  return v;
}

function formatCpf(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 9) return v.slice(0, 3) + "." + v.slice(3, 6) + "." + v.slice(6, 9) + "-" + v.slice(9);
  if (v.length > 6) return v.slice(0, 3) + "." + v.slice(3, 6) + "." + v.slice(6);
  if (v.length > 3) return v.slice(0, 3) + "." + v.slice(3);
  return v;
}

function formatTimeLeft(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: loadingSession } = useSteam();
  const { getItemPrice, getCartTotal, getAllPromoInfo } = usePromotions();

  const [charId, setCharId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixOrderId, setPixOrderId] = useState<string | null>(null);
  const [pixStatus, setPixStatus] = useState<"waiting" | "approved" | "expired" | "failed">("waiting");
  const [pixTimeLeft, setPixTimeLeft] = useState(24 * 60 * 60);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardCpf, setCardCpf] = useState("");
  const [installments, setInstallments] = useState(1);

  const [cardResult, setCardResult] = useState<"approved" | "failed" | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!loadingSession && !user) {
      window.location.href = "/api/auth/steam";
    }
  }, [user, loadingSession]);

  useEffect(() => {
    if (!loadingSession && user) {
      fetch("/api/admin/check")
        .then((res) => res.json())
        .then((data) => {
          if (data.isAdmin !== true) {
            router.push("/");
          } else {
            setIsAdmin(true);
          }
        })
        .catch(() => router.push("/"));
    }
  }, [user, loadingSession, router]);

  useEffect(() => {
    if (!loadingSession && user && isAdmin && items.length === 0) {
      router.push("/atlas");
    }
  }, [user, loadingSession, isAdmin, items, router]);

  const pollPixStatus = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (data.status === "approved") {
        setPixStatus("approved");
        if (pollRef.current) clearInterval(pollRef.current);
        clearCart();
        return;
      }

      if (data.status === "expired") {
        setPixStatus("expired");
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }

      if (data.expiresIn !== undefined) {
        setPixTimeLeft(data.expiresIn);
      }
    } catch {}
  }, [clearCart]);

  useEffect(() => {
    if (pixOrderId && pixStatus === "waiting") {
      pollRef.current = setInterval(() => {
        pollPixStatus(pixOrderId);
      }, 10000);

      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [pixOrderId, pixStatus, pollPixStatus]);

  useEffect(() => {
    if (pixStatus !== "waiting" || pixTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setPixTimeLeft((prev) => {
        if (prev <= 1) {
          setPixStatus("expired");
          if (pollRef.current) clearInterval(pollRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pixStatus, pixTimeLeft]);

  const pixDiscount = totalPrice >= 99.90;
  const baseTotal = pixDiscount ? totalPrice * 0.9 : totalPrice;
  const finalTotal = paymentMethod === "pix" ? baseTotal : totalPrice;

  // Promoções
  const cartPricing = getCartTotal(items, paymentMethod);
  const promoDiscount = cartPricing.discountTotal > 0;
  const promoTotal = cartPricing.total;
  const pixTotalWithPromo = promoTotal >= 99.90 ? promoTotal * 0.9 : promoTotal;
  const finalTotalWithPromo = paymentMethod === "pix" ? pixTotalWithPromo : promoTotal;

  const maxInstallments = finalTotalWithPromo >= 200 ? 12 : finalTotalWithPromo >= 100 ? 6 : finalTotalWithPromo >= 50 ? 3 : 1;

  const handlePay = async () => {
    if (!termsAccepted) {
      setError("Você precisa aceitar os Termos de Uso e Política de Reembolso.");
      return;
    }
    if (!charId.trim()) {
      setError("Informe o ID do personagem.");
      return;
    }

    if (paymentMethod === "credit_card") {
      if (!cardName.trim()) { setError("Informe o nome no cartão."); return; }
      if (cardNumber.replace(/\s/g, "").length < 16) { setError("Número do cartão inválido."); return; }
      if (cardExpiry.length < 5) { setError("Data de validade inválida."); return; }
      if (cardCvv.length < 3) { setError("CVV inválido."); return; }
      if (cardCpf.replace(/\D/g, "").length < 11) { setError("CPF inválido."); return; }
    }

    setShowConfirmModal(true);
  };

  const confirmPay = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          char_id: charId.trim(),
          terms_accepted: true,
          payment_method: paymentMethod,
          installments,
          card_data: paymentMethod === "credit_card" ? {
            name: cardName,
            number: cardNumber.replace(/\s/g, ""),
            expiry: cardExpiry,
            cvv: cardCvv,
            cpf: cardCpf.replace(/\D/g, ""),
          } : undefined,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            amount: item.amount,
            type: item.type,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao processar pedido.");
        setLoading(false);
        return;
      }

      if (paymentMethod === "pix" && data.pixCode) {
        setPixCode(data.pixCode);
        setPixOrderId(data.orderId);
        setPixStatus("waiting");
        setLoading(false);
        return;
      }

      if (paymentMethod === "credit_card") {
        if (data.status === "approved") {
          setCardResult("approved");
          clearCart();
        } else {
          setCardResult("failed");
        }
        setLoading(false);
        return;
      }

      clearCart();
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  const copyPix = async () => {
    if (pixCode) {
      await navigator.clipboard.writeText(pixCode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    }
  };

  if (loadingSession || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="text-white/40 text-sm">Carregando...</div>
      </div>
    );
  }

  // Card approved screen
  if (cardResult === "approved") {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#0c0c10] to-[#09090b]" />
        </div>
        <div className="relative z-10 pt-24 pb-16 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-8 backdrop-blur-xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-orbitron text-xl font-bold text-white mb-3">
                Pagamento <span className="text-emerald-400">Aprovado!</span>
              </h1>
              <p className="text-white/50 text-sm mb-8">Seu cartão foi cobrado com sucesso.</p>
              <Link href="/atlas" className="w-full h-11 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider font-orbitron flex items-center justify-center">
                Voltar para a Loja
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card failed screen
  if (cardResult === "failed") {
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
                Pagamento <span className="text-red-400">Recusado</span>
              </h1>
              <p className="text-white/50 text-sm mb-8">O pagamento não foi aprovado. Verifique os dados e tente novamente.</p>
              <button onClick={() => setCardResult(null)} className="w-full h-11 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider font-orbitron">
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PIX waiting screen
  if (pixCode) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#0c0c10] to-[#09090b]" />
        </div>
        <div className="relative z-10 pt-24 pb-16 px-4">
          <div className="max-w-lg mx-auto">
            <h1 className="font-orbitron text-2xl font-bold text-white mb-8 text-center">
              Pague com <span className="text-emerald-400">PIX</span>
            </h1>
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-6 backdrop-blur-xl text-center">
              {pixStatus === "waiting" && (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-white/50 text-sm mb-2">Copie o código PIX e pague no app do banco:</p>
                  <p className="text-emerald-400 text-xs font-bold mb-4">
                    Aguardando pagamento... {formatTimeLeft(pixTimeLeft)}
                  </p>

                  <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                    <p className="text-white text-xs font-mono break-all leading-relaxed">{pixCode}</p>
                  </div>

                  <button
                    onClick={copyPix}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider transition-colors mb-3"
                  >
                    {pixCopied ? "Copiado!" : "Copiar Código PIX"}
                  </button>

                  <div className="mt-4 w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${(pixTimeLeft / (24 * 60 * 60)) * 100}%` }}
                    />
                  </div>
                  <p className="text-white/30 text-xs mt-2">
                    O código expira em {formatTimeLeft(pixTimeLeft)}
                  </p>
                </>
              )}

              {pixStatus === "approved" && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-orbitron text-xl font-bold text-white mb-3">
                    Pagamento <span className="text-emerald-400">Confirmado!</span>
                  </h2>
                  <p className="text-white/50 text-sm mb-8">Suas moedas serão entregues em breve.</p>
                  <button
                    onClick={() => { clearCart(); router.push("/atlas"); }}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider font-orbitron"
                  >
                    Voltar para a Loja
                  </button>
                </>
              )}

              {pixStatus === "expired" && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="font-orbitron text-xl font-bold text-white mb-3">
                    PIX <span className="text-red-400">Expirado</span>
                  </h2>
                  <p className="text-white/50 text-sm mb-8">O código PIX expirou. Gere um novo para continuar.</p>
                  <button
                    onClick={() => { setPixCode(null); setPixOrderId(null); setPixStatus("waiting"); }}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider font-orbitron mb-3"
                  >
                    Gerar Novo PIX
                  </button>
                 
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main checkout form
  return (
    <div className=" max-w-7xl mx-auto min-h-screen bg-[#09090b]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#0c0c10] to-[#09090b]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="font-orbitron text-2xl font-bold text-white mb-8 text-center">
            Finalizar <span className="text-[#d4af37]">Compra</span>
          </h1>

          <div className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-6 backdrop-blur-xl">
            {/* User info */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              {user.avatar && (
                <img src={user.avatar} alt={user.personaName} className="w-10 h-10 rounded-full border border-[#d4af37]/30" />
              )}
              <div>
                <p className="text-white text-sm font-semibold">{user.personaName}</p>
              </div>
            </div>

            {/* Char ID */}
            <div className="mb-6">
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                ID do Personagem (FiveM)
              </label>
              <input
                type="text"
                value={charId}
                onChange={(e) => { setCharId(e.target.value); setError(""); }}
                placeholder="Ex: 1502"
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-colors"
              />
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                Método de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("pix")}
                  className={`h-14 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-bold transition-all duration-200 ${
                    paymentMethod === "pix"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-white/5 text-white/40 hover:border-white/20"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PIX
                  {pixDiscount && <span className="text-[10px] font-normal text-emerald-300">-10%</span>}
                </button>
                <button
                  onClick={() => setPaymentMethod("credit_card")}
                  className={`h-14 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-bold transition-all duration-200 ${
                    paymentMethod === "credit_card"
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-white/10 bg-white/5 text-white/40 hover:border-white/20"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Cartão
                </button>
              </div>
            </div>

            {/* Credit Card Form */}
            {paymentMethod === "credit_card" && (
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Dados do Cartão</p>

                <div>
                  <label className="block text-white/40 text-xs mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setError(""); }}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs mb-1">Nome no Cartão</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => { setCardName(e.target.value.toUpperCase()); setError(""); }}
                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                    className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm uppercase placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/40 text-xs mb-1">Validade</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => { setCardExpiry(formatExpiry(e.target.value)); setError(""); }}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                      placeholder="000"
                      maxLength={4}
                      className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/40 text-xs mb-1">CPF do Titular</label>
                  <input
                    type="text"
                    value={cardCpf}
                    onChange={(e) => { setCardCpf(formatCpf(e.target.value)); setError(""); }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs mb-1">Parcelas</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors appearance-none cursor-pointer"
                  >
                    {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n} className="bg-[#131318] text-white">
                        {n}x de R$ {(finalTotalWithPromo / n).toFixed(2).replace(".", ",")} {n === 1 ? "(à vista)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="mb-6">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                Resumo do Pedido
              </h3>
              <div className="space-y-2">
                {items.map((item) => {
                  const pricing = getItemPrice(item.id, item.price, paymentMethod);
                  return (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#8b7021] flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-[#0a0a0a]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.5v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.64c.1 1.7 1.36 2.66 2.86 2.97V19h1.71v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.76-3.42z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{item.name}</p>
                          <p className="text-white/40 text-xs">Qtd: {item.amount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {pricing.hasPromo ? (
                          <>
                            <span className="text-white/30 text-xs line-through block">
                              R$ {pricing.originalPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-emerald-400 text-sm font-bold">
                              R$ {pricing.finalPrice.toFixed(2).replace(".", ",")}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#d4af37] text-sm font-bold">
                            R$ {item.price.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="mb-4">
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                Cupom de Desconto
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Digite seu cupom"
                  className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono uppercase placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-colors"
                />
              </div>
              <p className="text-white/30 text-[10px] mt-1">
                O desconto será aplicado automaticamente no resumo ao finalizar.
              </p>
            </div>

            {/* Discount info */}
            {(promoDiscount || (pixDiscount && paymentMethod === "pix")) && (
              <div className="space-y-2 mb-4">
                {promoDiscount && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20">
                    <svg className="w-4 h-4 text-[#d4af37] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-[#d4af37] text-xs font-semibold">
                      Promoção aplicada: -R$ {cartPricing.discountTotal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                )}
                {pixDiscount && paymentMethod === "pix" && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-300 text-xs font-semibold">10% OFF no PIX aplicado!</span>
                  </div>
                )}
              </div>
            )}
            {!promoDiscount && getAllPromoInfo && cartPricing.total < (getAllPromoInfo()?.minOrderBRL ?? 0) && (
              <div className="flex items-center gap-2 px-4 py-2 mb-4 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/15">
                <svg className="w-4 h-4 text-[#d4af37]/60 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[#d4af37]/70 text-xs font-semibold">
                  {getAllPromoInfo()?.discountLabel} acima de {getAllPromoInfo()?.minOrderLabel}{getAllPromoInfo()?.paymentLabel ? ` • ${getAllPromoInfo()?.paymentLabel}` : ""}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between py-3 border-t border-white/10 mb-6">
              <span className="text-white/60 text-sm font-semibold">Total</span>
              <div className="flex items-baseline gap-1">
                {(promoDiscount || (pixDiscount && paymentMethod === "pix")) && (
                  <span className="text-white/30 text-xs line-through mr-2">
                    R$ {totalPrice.toFixed(2).replace(".", ",")}
                  </span>
                )}
                <span className="text-white/30 text-xs">R$</span>
                <span className="text-white text-xl font-bold">
                  {finalTotalWithPromo.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/40 space-y-2">
              <p className="font-semibold text-white/70">Condições Legais e de Reembolso (CDC Art. 49):</p>
              <p>
                1. O direito de arrependimento (reembolso integral) aplica-se no prazo de até 7 dias corridos apenas para pacotes de moedas virtuais/Planos que estejam <strong className="text-white/60">100% intocados</strong> na sua conta.
              </p>
              <p>
                2. Após o consumo parcial ou total das moedas no jogo ou ativação de VIPs, o serviço é considerado prestado, <strong className="text-white/60">inviabilizando o reembolso</strong>.
              </p>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => { setTermsAccepted(e.target.checked); setError(""); }}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-[#d4af37] focus:ring-[#d4af37]/50 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-white/60 cursor-pointer leading-relaxed">
                Declaro que sou maior de 18 anos (ou estou sob supervisão direta de um responsável), estou ciente de que estou adquirindo um produto 100% digital para fomento do projeto e aceito integralmente os{" "}
                <span className="text-[#d4af37] underline">Termos de Uso</span> (com política de reembolso válida apenas para saldo intocado) e a{" "}
                <span className="text-[#d4af37] underline">Política de Privacidade</span> do Atlas RP.
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={!termsAccepted || loading || !charId.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] hover:from-[#e8c84a] hover:to-[#e8c84a] disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 text-[#0a0a0a] text-sm font-bold uppercase tracking-wider transition-all duration-300 font-orbitron"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processando...
                </span>
              ) : (
                paymentMethod === "pix" ? "Gerar PIX" : "Pagar com Cartão"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1725] border border-[#d4af37]/20 rounded-2xl max-w-lg w-full p-6">
            <h2 className="font-orbitron text-sm md:text-lg font-bold text-[#d4af37] mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> Atenção: Informações Importantes antes de Concluir
            </h2>
            <div className="font-rajdhani text-white/60 space-y-3 text-sm leading-relaxed mb-6">
              <p>Você está prestes a gerar uma cobrança para adquirir moedas virtuais. Por favor, revise as condições para garantir uma entrega rápida e segura:</p>
              <p><strong className="text-white/70">• Produto Digital:</strong> Este item não possui representação física e o valor apoia a manutenção dos nossos servidores e inovações do servidor.</p>
              <p><strong className="text-white/70">• Regra de Reembolso (CDC):</strong> Você tem direito ao reembolso de arrependimento em até 7 dias somente se o saldo de moedas virtuais estiver 100% intacto no jogo. Caso consuma qualquer valor, o reembolso torna-se impossível.</p>
              <p><strong className="text-white/70">• Validação Antifraude:</strong> Para segurança da transação, se pagar por Pix, o CPF do pagador cadastrado no banco poderá ser verificado.</p>
              <p><strong className="text-white/70">• Dados de Entrega:</strong> Verifique se o seu ID de Personagem (Char ID) e sua conta Steam estão corretos no formulário anterior.</p>
            </div>
            <p className="font-rajdhani text-white/80 text-sm font-semibold mb-5">Deseja finalizar a compra e gerar a cobrança (Pix / Cartão)?</p>
            <div className="flex gap-3">
              <button
                onClick={confirmPay}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider transition-colors"
              >
                Sim, Desejo Finalizar Compra
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-sm font-bold uppercase tracking-wider transition-colors"
              >
                Voltar e Corrigir Dados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
