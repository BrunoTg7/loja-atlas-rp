"use client";

import { AtlasGoldenA } from "@/components/AtlasCoinCard";
import BaseModal from "@/components/BaseModal";
import { useCart } from "@/context/CartContext";
import { useDiscord } from "@/context/DiscordContext";
import { useSteam } from "@/context/SteamContext";
import { usePromotions } from "@/hooks/usePromotions";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type PaymentMethod = "pix" | "credit_card";

const PHONE_COUNTRIES = [
  { code: "+55", country: "BR", label: "Brasil", flag: "BR" },
  { code: "+1", country: "US", label: "Estados Unidos", flag: "US" },
  { code: "+44", country: "GB", label: "Reino Unido", flag: "GB" },
  { code: "+351", country: "PT", label: "Portugal", flag: "PT" },
  { code: "+54", country: "AR", label: "Argentina", flag: "AR" },
  { code: "+56", country: "CL", label: "Chile", flag: "CL" },
  { code: "+57", country: "CO", label: "Colômbia", flag: "CO" },
  { code: "+51", country: "PE", label: "Peru", flag: "PE" },
  { code: "+49", country: "DE", label: "Alemanha", flag: "DE" },
  { code: "+34", country: "ES", label: "Espanha", flag: "ES" },
  { code: "+33", country: "FR", label: "França", flag: "FR" },
  { code: "+39", country: "IT", label: "Itália", flag: "IT" },
  { code: "+81", country: "JP", label: "Japão", flag: "JP" },
  { code: "+82", country: "KR", label: "Coreia do Sul", flag: "KR" },
] as const;

type PhoneCountry = (typeof PHONE_COUNTRIES)[number]["country"];

function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatPhoneGeneric(value: string, maxLen: number): string {
  const digits = value.replace(/\D/g, "").slice(0, maxLen);
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, digits.length - 4)}-${digits.slice(digits.length - 4)}`;
  return `${digits.slice(0, digits.length - 8)} ${digits.slice(digits.length - 8, digits.length - 4)}-${digits.slice(digits.length - 4)}`;
}

function formatPhoneByCountry(value: string, country: PhoneCountry): string {
  if (country === "BR") return formatPhoneBR(value);
  if (country === "US" || country === "GB") return formatPhoneGeneric(value, 10);
  return formatPhoneGeneric(value, 11);
}

function getPhoneMaxLen(country: PhoneCountry): number {
  if (country === "BR") return 11;
  if (country === "US" || country === "GB") return 10;
  return 11;
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
  const { user: steamUser, loading: steamLoading } = useSteam();
  const { user: discordUser, loading: discordLoading } = useDiscord();
  const { getItemPrice, getCartTotal, getAllPromoInfo } = usePromotions();

  const [currentStep, setCurrentStep] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>("BR");
  const [charId, setCharId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixOrderId, setPixOrderId] = useState<string | null>(null);
  const [pixStatus, setPixStatus] = useState<"waiting" | "approved" | "expired" | "failed">("waiting");
  const [pixTimeLeft, setPixTimeLeft] = useState(24 * 60 * 60);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!steamLoading && !steamUser) {
      window.location.href = "/api/auth/steam";
    }
  }, [steamUser, steamLoading]);

  useEffect(() => {
    if (!steamLoading && steamUser) {
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
  }, [steamUser, steamLoading, router]);

  useEffect(() => {
    if (!steamLoading && steamUser && isAdmin && items.length === 0) {
      router.push("/atlas");
    }
  }, [steamLoading, steamUser, isAdmin, items, router]);

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
      if (data.expiresIn !== undefined) setPixTimeLeft(data.expiresIn);
    } catch {}
  }, [clearCart]);

  useEffect(() => {
    if (pixOrderId && pixStatus === "waiting") {
      pollRef.current = setInterval(() => pollPixStatus(pixOrderId), 10000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
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
  const cartPricing = getCartTotal(items, paymentMethod);
  const promoDiscount = cartPricing.discountTotal > 0;
  const promoTotal = cartPricing.total;
  const pixTotalWithPromo = promoTotal >= 99.90 ? promoTotal * 0.9 : promoTotal;
  const finalTotalWithPromo = paymentMethod === "pix" ? pixTotalWithPromo : promoTotal;

  const isStep1Done = !!discordUser;
  const isStep2Done = contactName.trim() && contactEmail.trim() && contactPhone.trim() && charId.trim();

  const handleDiscordLogin = () => {
    document.cookie = `discord_return_to=/checkout; path=/; max-age=300`;
    window.location.href = "/api/auth/discord";
  };

  const handlePay = async () => {
    if (!termsAccepted) { setError("Você precisa aceitar os Termos de Uso e Política de Privacidade."); return; }
    if (!isStep1Done) { setError("Conecte seu Discord para continuar."); return; }
    if (!isStep2Done) { setError("Preencha todos os dados de contato."); setCurrentStep(2); return; }
    if (paymentMethod === "credit_card") return;
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
          discord_id: discordUser?.id,
          contact_name: contactName.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim(),
          terms_accepted: true,
          payment_method: paymentMethod,
          items: items.map((item) => ({ id: item.id, name: item.name, price: item.price, amount: item.amount, type: item.type })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao processar pedido."); setLoading(false); return; }
      if (data.pixCode) { setPixCode(data.pixCode); setPixOrderId(data.orderId); setPixStatus("waiting"); setLoading(false); return; }
      clearCart();
    } catch { setError("Erro de conexão. Tente novamente."); setLoading(false); }
  };

  const copyPix = async () => {
    if (pixCode) { await navigator.clipboard.writeText(pixCode); setPixCopied(true); setTimeout(() => setPixCopied(false), 2000); }
  };

  if (steamLoading || !steamUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#05080F] via-[#0B1725] to-[#05080F]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin" />
          <p className="text-white/40 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (pixCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#05080F] via-[#0B1725] to-[#05080F]">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#05080F] via-[#0B1725] to-[#05080F]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 50% 30%, rgba(212,175,55,0.25) 0%, transparent 50%)` }} />
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
                  <p className="text-emerald-400 text-xs font-bold mb-4">Aguardando pagamento... {formatTimeLeft(pixTimeLeft)}</p>
                  <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                    <p className="text-white text-xs font-mono break-all leading-relaxed">{pixCode}</p>
                  </div>
                  <button onClick={copyPix} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase tracking-wider transition-colors mb-3">
                    {pixCopied ? "Copiado!" : "Copiar Código PIX"}
                  </button>
                  <div className="mt-4 w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(pixTimeLeft / (24 * 60 * 60)) * 100}%` }} />
                  </div>
                  <p className="text-white/30 text-xs mt-2">O código expira em {formatTimeLeft(pixTimeLeft)}</p>
                </>
              )}
              {pixStatus === "approved" && (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-orbitron text-xl font-bold text-white mb-3">Pagamento <span className="text-emerald-400">Confirmado!</span></h2>
                  <p className="text-white/50 text-sm mb-8">Seu apoio será processado em breve.</p>
                  <button onClick={() => { clearCart(); router.push("/atlas"); }} className="w-full h-11 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider font-orbitron">
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
                  <h2 className="font-orbitron text-xl font-bold text-white mb-3">PIX <span className="text-red-400">Expirado</span></h2>
                  <p className="text-white/50 text-sm mb-8">O código PIX expirou. Gere um novo para continuar.</p>
                  <button onClick={() => { setPixCode(null); setPixOrderId(null); setPixStatus("waiting"); }} className="w-full h-11 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider font-orbitron">
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

  const steps = [
    { num: 1, label: "Discord", done: isStep1Done },
    { num: 2, label: "Dados", done: isStep2Done },
    { num: 3, label: "Pagamento", done: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05080F] via-[#0B1725] to-[#05080F] pb-24 lg:pb-0">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#05080F] via-[#0B1725] to-[#05080F]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle at 30% 20%, rgba(212,175,55,0.25) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(212,175,55,0.15) 0%, transparent 50%)` }} />
      </div>

      <div className="relative z-10 pt-24 pb-8 px-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">
            Finalizar <span className="text-[#d4af37]">Doação</span>
          </h1>
          <p className="text-white/40 text-sm">Complete as etapas abaixo para concluir seu apoio</p>
        </div>

        {/* Steps Indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center gap-2">
                <button
                  onClick={() => step.done && setCurrentStep(step.num)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    currentStep === step.num
                      ? "bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37]"
                      : step.done
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-white/5 border border-white/10 text-white/30"
                  }`}
                >
                  {step.done ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">{step.num}</span>
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-px ${step.done ? "bg-emerald-500/40" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: 2 columns */}
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Left Column: Form Steps */}
          <div className="flex-1 space-y-4">

            {/* Step 1: Discord */}
            <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              currentStep === 1 ? "border-[#d4af37]/40 shadow-[0_0_30px_rgba(212,175,55,0.08)]" : isStep1Done ? "border-emerald-500/30" : "border-white/10"
            }`}>
              <div
                className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-5 cursor-pointer"
                onClick={() => setCurrentStep(1)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isStep1Done ? "bg-[#5865F2]/20 border border-[#5865F2]/40" : currentStep === 1 ? "bg-[#5865F2]/15 border border-[#5865F2]/30" : "bg-white/5 border border-white/10"
                  }`}>
                    {isStep1Done ? (
                      <svg className="w-6 h-6 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-[#5865F2]/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold">Conectar Discord</p>
                    <p className="text-white/40 text-xs">
                      {isStep1Done ? `${discordUser?.globalName || discordUser?.username} · Conectado` : "Autentique-se com Discord para receber recompensas"}
                    </p>
                  </div>
                  {!isStep1Done && currentStep === 1 && (
                    <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                  )}
                </div>
              </div>
              {currentStep === 1 && !isStep1Done && (
                <div className="px-5 pb-5 bg-gradient-to-b from-[#131318] to-[#0B0B0B] border-t border-white/5">
                  <div className="pt-4">
                    <p className="text-white/40 text-xs mb-4 leading-relaxed">
                      Conecte seu Discord para que possamos identificá-lo na cidade e entregar seus benefícios.
                    </p>
                    <button
                      onClick={handleDiscordLogin}
                      className="w-full h-12 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      Entrar com Discord
                    </button>
                  </div>
                </div>
              )}
              {currentStep === 1 && isStep1Done && (
                <div className="px-5 pb-5 bg-gradient-to-b from-[#131318] to-[#0B0B0B] border-t border-white/5">
                  <div className="pt-4 flex items-center gap-3">
                    <img src={discordUser?.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-[#5865F2]/40" />
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">{discordUser?.globalName || discordUser?.username}</p>
                      <p className="text-white/40 text-xs">@{discordUser?.username} </p>
                    </div>
                    <button onClick={() => setCurrentStep(2)} className="px-4 py-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37]/20 transition-colors">
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Contact Info */}
            <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              currentStep === 2 ? "border-[#d4af37]/40 shadow-[0_0_30px_rgba(212,175,55,0.08)]" : isStep2Done ? "border-emerald-500/30" : "border-white/10"
            }`}>
              <div
                className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-5 cursor-pointer"
                onClick={() => isStep1Done && setCurrentStep(2)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isStep2Done ? "bg-emerald-500/15 border border-emerald-500/30" : currentStep === 2 ? "bg-[#d4af37]/15 border border-[#d4af37]/30" : "bg-white/5 border border-white/10"
                  }`}>
                    {isStep2Done ? (
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-[#d4af37]/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold">Dados de Contato</p>
                    <p className="text-white/40 text-xs">
                      {isStep2Done ? `${contactName} · ${charId}` : "Nome, email, telefone e ID da cidade"}
                    </p>
                  </div>
                  {isStep1Done && currentStep !== 2 && (
                    <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
              {currentStep === 2 && (
                <div className="px-5 pb-5 bg-gradient-to-b from-[#131318] to-[#0B0B0B] border-t border-white/5">
                  <div className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">Nome Completo</label>
                        <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Seu nome completo"
                          className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">Email</label>
                        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="seu@email.com"
                          className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-colors" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">Telefone</label>
                        <div className="flex gap-0">
                          <select
                            value={phoneCountry}
                            onChange={(e) => { setPhoneCountry(e.target.value as PhoneCountry); setContactPhone(""); }}
                            className="h-11 px-2 rounded-l-xl bg-white/5 border border-white/10 border-r-0 text-white text-xs focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-colors appearance-none cursor-pointer min-w-[100px]"
                          >
                            {PHONE_COUNTRIES.map((c) => (
                              <option key={c.country} value={c.country} className="bg-[#0B0F1A] text-white">
                                {c.country} {c.label} {c.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(formatPhoneByCountry(e.target.value, phoneCountry))}
                            placeholder={phoneCountry === "BR" ? "(00) 00000-0000" : "000 000 0000"}
                            maxLength={getPhoneMaxLen(phoneCountry)}
                            className="flex-1 h-11 px-3 rounded-r-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">ID na Cidade (Char ID)</label>
                        <input type="text" value={charId} onChange={(e) => { setCharId(e.target.value); setError(""); }} placeholder="Ex: 1502"
                          className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-colors" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setCurrentStep(1)} className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors">
                        Voltar
                      </button>
                      <button
                        onClick={() => { if (isStep2Done) setCurrentStep(3); }}
                        disabled={!isStep2Done}
                        className="flex-1 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment */}
            <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              currentStep === 3 ? "border-[#d4af37]/40 shadow-[0_0_30px_rgba(212,175,55,0.08)]" : "border-white/10"
            }`}>
              <div
                className="bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-5 cursor-pointer"
                onClick={() => isStep2Done && setCurrentStep(3)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    currentStep === 3 ? "bg-[#d4af37]/15 border border-[#d4af37]/30" : "bg-white/5 border border-white/10"
                  }`}>
                    <svg className="w-6 h-6 text-[#d4af37]/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold">Forma de Pagamento</p>
                    <p className="text-white/40 text-xs">
                      {paymentMethod === "pix" ? "PIX — 10% de desconto acima de R$ 99,90" : "Cartão de Crédito — Via suporte"}
                    </p>
                  </div>
                  {isStep2Done && currentStep !== 3 && (
                    <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
              {currentStep === 3 && (
                <div className="px-5 pb-5 bg-gradient-to-b from-[#131318] to-[#0B0B0B] border-t border-white/5">
                  <div className="pt-4 space-y-3">
                    {/* PIX Card */}
                    <button
                      onClick={() => setPaymentMethod("pix")}
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200 ${
                        paymentMethod === "pix"
                          ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white text-sm font-bold">PIX</p>
                        <p className="text-white/40 text-xs">Aprovação instantânea</p>
                      </div>
                      {pixDiscount && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">-10%</span>
                      )}
                    </button>

                    {/* Credit Card Card */}
                    <button
                      onClick={() => setPaymentMethod("credit_card")}
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200 ${
                        paymentMethod === "credit_card"
                          ? "border-[#5865F2] bg-[#5865F2]/10 shadow-[0_0_20px_rgba(88,101,242,0.1)]"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-[#5865F2]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white text-sm font-bold">Cartão de Crédito</p>
                        <p className="text-white/40 text-xs">Processado via suporte</p>
                      </div>
                    </button>

                    {/* Credit Card Info */}
                    {paymentMethod === "credit_card" && (
                      <div className="p-4 rounded-xl bg-[#5865F2]/5 border border-[#5865F2]/20 space-y-3">
                        <p className="text-white/50 text-xs leading-relaxed">
                          Pagamentos por cartão são processados com nossa equipe por segurança. Tire um print do checkout antes de entrar na call.
                        </p>
                        <a href="https://discord.com/channels/856691311264661515/856691312152543232" target="_blank" rel="noopener noreferrer"
                          className="w-full h-10 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.545 2.907a13.227 13.227 0 00-3.257-1.011.05.05 0 00-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 00-3.658 0 8.258 8.258 0 00-.412-.833.051.051 0 00-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 00-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 003.995 2.02.05.05 0 00.056-.019c.308-.42.582-.863.818-1.329a.05.05 0 00-.01-.059.051.051 0 00-.018-.011 8.875 8.875 0 01-1.248-.595.05.05 0 01-.02-.066.051.051 0 01.015-.019c.084-.063.168-.129.248-.195a.05.05 0 01.051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 01.053.007c.08.066.164.132.248.195a.051.051 0 01-.004.085 8.254 8.254 0 01-1.249.594.05.05 0 00-.03.03.052.052 0 00.003.041c.24.465.515.909.817 1.329a.05.05 0 00.056.019 13.235 13.235 0 004.001-2.02.049.049 0 00.021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 00-.02-.019Z" />
                          </svg>
                          Falar com Suporte
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setCurrentStep(2)} className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors">
                        Voltar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => { setTermsAccepted(e.target.checked); setError(""); }}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-white/20 bg-white/5 peer-checked:border-[#d4af37] peer-checked:bg-[#d4af37] transition-all duration-200 flex items-center justify-center">
                    {termsAccepted && (
                      <svg className="w-3 h-3 text-[#0a0a0a]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-white/50 leading-relaxed group-hover:text-white/60 transition-colors">
                  Declaro que sou maior de 18 anos, estou ciente de que estou apoiando o projeto em troca de um benefício 100% digital, e aceito os{" "}
                  <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-[#d4af37] underline hover:text-[#e8c84a] transition-colors">Termos de Uso</button> e a{" "}
                  <button type="button" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-[#d4af37] underline hover:text-[#e8c84a] transition-colors">Política de Privacidade</button>.
                </span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Desktop: Pay Button */}
            <div className="hidden lg:block">
              {paymentMethod === "credit_card" ? (
                <a href="https://discord.com/channels/856691311264661515/856691312152543232" target="_blank" rel="noopener noreferrer"
                  className="w-full h-13 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold uppercase tracking-wider transition-all duration-300 font-orbitron flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.545 2.907a13.227 13.227 0 00-3.257-1.011.05.05 0 00-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 00-3.658 0 8.258 8.258 0 00-.412-.833.051.051 0 00-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 00-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 003.995 2.02.05.05 0 00.056-.019c.308-.42.582-.863.818-1.329a.05.05 0 00-.01-.059.051.051 0 00-.018-.011 8.875 8.875 0 01-1.248-.595.05.05 0 01-.02-.066.051.051 0 01.015-.019c.084-.063.168-.129.248-.195a.05.05 0 01.051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 01.053.007c.08.066.164.132.248.195a.051.051 0 01-.004.085 8.254 8.254 0 01-1.249.594.05.05 0 00-.03.03.052.052 0 00.003.041c.24.465.515.909.817 1.329a.05.05 0 00.056.019 13.235 13.235 0 004.001-2.02.049.049 0 00.021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 00-.02-.019Z" />
                  </svg>
                  Falar com o Suporte
                </a>
              ) : (
                <button
                  onClick={handlePay}
                  disabled={!termsAccepted || loading || !isStep1Done || !isStep2Done}
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] hover:from-[#e8c84a] hover:to-[#e8c84a] disabled:from-white/10 disabled:via-white/10 disabled:to-white/10 disabled:text-white/30 text-[#0a0a0a] text-sm font-bold uppercase tracking-wider transition-all duration-300 font-orbitron shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)]"
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
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Gerar PIX
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-br from-[#131318] to-[#0B0B0B] p-5 backdrop-blur-xl">
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Resumo do Pedido</h3>

                {/* Items */}
                <div className="space-y-3 mb-4">
                  {items.map((item) => {
                    const pricing = getItemPrice(item.id, item.price, paymentMethod);
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0">
                          <AtlasGoldenA size={40} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{item.name}</p>
                          <p className="text-white/40 text-xs">Qtd: {item.amount}</p>
                        </div>
                        <div className="text-right">
                          {pricing.hasPromo ? (
                            <>
                              <span className="text-white/30 text-[10px] line-through block">R$ {pricing.originalPrice.toFixed(2).replace(".", ",")}</span>
                              <span className="text-emerald-400 text-sm font-bold">R$ {pricing.finalPrice.toFixed(2).replace(".", ",")}</span>
                            </>
                          ) : (
                            <span className="text-[#d4af37] text-sm font-bold">R$ {item.price.toFixed(2).replace(".", ",")}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Cupom"
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono uppercase placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount Badges */}
                <div className="space-y-2 mb-4">
                  {promoDiscount && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20">
                      <svg className="w-3.5 h-3.5 text-[#d4af37] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-[#d4af37] text-[11px] font-semibold">Promo: -R$ {cartPricing.discountTotal.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                  {pixDiscount && paymentMethod === "pix" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-300 text-[11px] font-semibold">10% OFF no PIX</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-end justify-between">
                    <span className="text-white/60 text-sm font-semibold">Total</span>
                    <div className="flex items-baseline gap-1">
                      {(promoDiscount || (pixDiscount && paymentMethod === "pix")) && (
                        <span className="text-white/30 text-xs line-through mr-2">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                      )}
                      <span className="text-white/40 text-sm">R$</span>
                      <span className="text-white text-2xl font-orbitron font-black">{finalTotalWithPromo.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steam User */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
                {steamUser.avatar && (
                  <img src={steamUser.avatar} alt="" className="w-9 h-9 rounded-full border border-[#d4af37]/30" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{steamUser.personaName}</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Steam</p>
                </div>
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1725]/95 backdrop-blur-md border-t border-[#d4af37]/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/50 text-sm">Total</span>
          <div className="flex items-baseline gap-1">
            <span className="text-white/40 text-xs">R$</span>
            <span className="text-white text-xl font-orbitron font-black">{finalTotalWithPromo.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
        {paymentMethod === "credit_card" ? (
          <a href="https://discord.com/channels/856691311264661515/856691312152543232" target="_blank" rel="noopener noreferrer"
            className="w-full h-12 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
            Falar com Suporte
          </a>
        ) : (
          <button
            onClick={handlePay}
            disabled={!termsAccepted || loading || !isStep1Done || !isStep2Done}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c84a] to-[#d4af37] disabled:from-white/10 disabled:via-white/10 disabled:to-white/10 disabled:text-white/30 text-[#0a0a0a] text-sm font-bold uppercase tracking-wider transition-all duration-300 font-orbitron"
          >
            {loading ? "Processando..." : "Gerar PIX"}
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      <BaseModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Antes de Concluir"
        maxWidth="xl"
        closeOnBackdrop={false}
        closeOnEscape={false}
        icon={
          <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        }
        footer={
          <>
            <BaseModal.SecondaryButton onClick={() => setShowConfirmModal(false)}>Voltar</BaseModal.SecondaryButton>
            <BaseModal.PrimaryButton onClick={confirmPay}>Gerar Cobrança</BaseModal.PrimaryButton>
          </>
        }
      >
        <div className="font-rajdhani text-white/60 space-y-4 text-base leading-relaxed">
          <p>Você está prestes a gerar uma cobrança para apoiar o Atlas RP. Revise:</p>
          <p><strong className="text-white/70">• Benefício Digital —</strong> Valor apoia a manutenção dos servidores.</p>
          <p><strong className="text-white/70">• Validação Antifraude —</strong> CPF do pagador poderá ser conferido.</p>
          <p><strong className="text-white/70">• Dados de Entrega —</strong> Confira seu ID e conta Steam.</p>
        </div>
        <p className="font-rajdhani text-white/80 text-base font-semibold mt-6">Tudo certo? Vamos gerar a cobrança?</p>
      </BaseModal>

      {/* Terms Modal */}
      <BaseModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        title="Termos de Uso"
        maxWidth="2xl"
        icon={
          <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        }
        footer={
          <BaseModal.PrimaryButton onClick={() => setShowTerms(false)}>Aceitar e Fechar</BaseModal.PrimaryButton>
        }
      >
        <div className="font-rajdhani text-white/50 space-y-4 text-sm leading-relaxed">
          <p>Ao acessar este site ou contribuir através de nosso sistema de checkout, você concorda com estes Termos de Uso.</p>
          <p><strong className="text-white/70">1. ACEITAÇÃO E MAIORIDADE</strong></p>
          <p>Para contribuir, o Apoiador declara ser maior de 18 anos ou estar sob supervisão de um responsável.</p>
          <p><strong className="text-white/70">2. NATUREZA DOS BENEFÍCIOS</strong></p>
          <p>Sua contribuição resulta em um benefício 100% digital, sem existência física.</p>
          <p><strong className="text-white/70">3. CADASTRO E ENTREGA</strong></p>
          <p>O Apoiador é responsável por preencher corretamente seus identificadores de jogo.</p>
          <p><strong className="text-white/70">4. PAGAMENTO</strong></p>
          <p>Contribuições processadas via Pix e cartão de crédito. Validação de CPF pode ser exigida.</p>
          <p><strong className="text-white/70">5. SUPORTE</strong></p>
          <p>Falhas deverão ser reportadas pelo canal oficial de suporte.</p>
        </div>
      </BaseModal>

      {/* Privacy Modal */}
      <BaseModal
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Política de Privacidade"
        maxWidth="2xl"
        icon={
          <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        }
        footer={
          <BaseModal.PrimaryButton onClick={() => setShowPrivacy(false)}>Aceitar e Fechar</BaseModal.PrimaryButton>
        }
      >
        <div className="font-rajdhani text-white/50 space-y-4 text-sm leading-relaxed">
          <p>Coletamos estritamente os dados necessários para entrega dos benefícios e prevenção de fraudes.</p>
          <p><strong className="text-white/70">DADOS COLETADOS:</strong> Steam ID, Char ID, Discord ID, email, nome, CPF (apenas para validação Pix).</p>
          <p><strong className="text-white/70">SEGURANÇA:</strong> Utilizamos criptografia e cookies de segurança.</p>
          <p><strong className="text-white/70">SEUS DIREITOS:</strong> Você pode solicitar acesso, correção ou eliminação dos seus dados pelo canal de suporte.</p>
        </div>
      </BaseModal>
    </div>
  );
}
