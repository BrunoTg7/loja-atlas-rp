"use client";

import { useSteam } from "@/context/SteamContext";
import { PRODUCT_CATALOG } from "@/lib/products";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PromoCode {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed_cents";
  discount_value: number;
  min_order_cents: number;
  max_uses_total: number | null;
  max_uses_per_user: number;
  uses_count: number;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_by: string;
  created_at: string;
}

interface ProductPromotion {
  id: string;
  product_id: string;
  discount_type: "percentage" | "fixed_cents";
  discount_value: number;
  min_order_cents: number;
  payment_methods: string | null;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_by: string;
}

type Tab = "cupons" | "produtos";

export default function AdminPromocoesPage() {
  const { user, loading: steamLoading } = useSteam();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("cupons");
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [productPromos, setProductPromos] = useState<ProductPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Estado do formulário de cupom ───
  const [showForm, setShowForm] = useState(false);
  const [formCode, setFormCode] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed_cents">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinOrder, setFormMinOrder] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formMaxPerUser, setFormMaxPerUser] = useState("1");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formEndsAt, setFormEndsAt] = useState("");
  const [saving, setSaving] = useState(false);

  // ─── Estado do formulário de promoção por produto ───
  const [promoFormProductId, setPromoFormProductId] = useState("");
  const [promoFormType, setPromoFormType] = useState<"percentage" | "fixed_cents">("percentage");
  const [promoFormValue, setPromoFormValue] = useState("");
  const [promoFormMinOrder, setPromoFormMinOrder] = useState("");
  const [promoFormPaymentMethod, setPromoFormPaymentMethod] = useState("");
  const [promoFormEndsAt, setPromoFormEndsAt] = useState("");
  const [showPromoForm, setShowPromoForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [codesRes, promosRes] = await Promise.all([
        fetch("/api/admin/promo-codes"),
        fetch("/api/admin/product-promotions"),
      ]);
      const codesData = await codesRes.json();
      const promosData = await promosRes.json();
      setPromoCodes(codesData.promoCodes || []);
      setProductPromos(promosData.productPromotions || []);
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!steamLoading && !user) router.push("/");
    if (user) fetchData();
  }, [user, steamLoading, router, fetchData]);

  if (steamLoading || !user) return null;

  // ─── Criar cupom ───
  async function handleCreatePromo() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formCode,
          discount_type: formDiscountType,
          discount_value: Number(formDiscountValue),
          min_order_cents: Number(formMinOrder) * 100,
          max_uses_total: formMaxUses ? Number(formMaxUses) : null,
          max_uses_per_user: Number(formMaxPerUser),
          starts_at: formStartsAt ? new Date(formStartsAt).toISOString() : new Date().toISOString(),
          ends_at: formEndsAt ? new Date(formEndsAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao criar cupom.");
        return;
      }
      setShowForm(false);
      setFormCode("");
      setFormDiscountValue("");
      setFormMinOrder("");
      setFormMaxUses("");
      setFormMaxPerUser("1");
      setFormStartsAt("");
      setFormEndsAt("");
      fetchData();
    } catch {
      alert("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  // ─── Toggle ativar/desativar cupom ───
  async function togglePromoCode(id: string, currentActive: boolean) {
    await fetch(`/api/admin/promo-codes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    fetchData();
  }

  // ─── Criar promoção por produto ───
  async function handleCreateProductPromo() {
    if (!promoFormProductId || !promoFormValue) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/product-promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: promoFormProductId,
          discount_type: promoFormType,
          discount_value: Number(promoFormValue),
          min_order_cents: promoFormMinOrder ? Number(promoFormMinOrder) * 100 : 0,
          payment_methods: promoFormPaymentMethod || null,
          ends_at: promoFormEndsAt ? new Date(promoFormEndsAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao criar promoção.");
        return;
      }
      setShowPromoForm(false);
      setPromoFormProductId("");
      setPromoFormValue("");
      setPromoFormMinOrder("");
      setPromoFormPaymentMethod("");
      setPromoFormEndsAt("");
      fetchData();
    } catch {
      alert("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  // ─── Toggle ativar/desativar promoção de produto ───
  async function toggleProductPromo(id: string, currentActive: boolean) {
    await fetch(`/api/admin/product-promotions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    fetchData();
  }

  // ─── Deletar promoção de produto ───
  async function deleteProductPromo(id: string) {
    if (!confirm("Desativar esta promoção?")) return;
    await fetch(`/api/admin/product-promotions/${id}`, { method: "DELETE" });
    fetchData();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDiscount(type: string, value: number) {
    return type === "percentage" ? `${value}%` : `R$ ${(value / 100).toFixed(2).replace(".", ",")}`;
  }

  function getProductPrice(productId: string) {
    const product = PRODUCT_CATALOG.find((p) => p.id === productId);
    return product ? product.price : 0;
  }

  function getDiscountedPrice(productId: string, promo: ProductPromotion) {
    const price = getProductPrice(productId);
    if (promo.discount_type === "percentage") {
      return price * (1 - promo.discount_value / 100);
    }
    return Math.max(price - promo.discount_value / 100, 0);
  }

  const productsWithPromo = productPromos.filter((p) => p.active);

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#0c0c10] to-[#09090b]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-2xl font-bold text-white">Promoções e Cupons</h1>
            <p className="text-white/40 text-sm mt-1">Gerencie cupons de desconto e promoções por produto</p>
          </div>
          <button
            onClick={() => router.push("/admin/whitelist")}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("cupons")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "cupons"
                ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30"
                : "bg-[#121622] text-white/50 border border-white/10 hover:bg-white/10"
            }`}
          >
            Cupons ({promoCodes.length})
          </button>
          <button
            onClick={() => setTab("produtos")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "produtos"
                ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30"
                : "bg-[#121622] text-white/50 border border-white/10 hover:bg-white/10"
            }`}
          >
            Promoções por Plano ({productsWithPromo.length})
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB: CUPONS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {!loading && tab === "cupons" && (
          <div>
            {/* Botão novo cupom */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-5 py-2.5 bg-[#d4af37] text-black font-orbitron text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#e8c84a] transition-colors"
              >
                {showForm ? "Cancelar" : "+ Novo Cupom"}
              </button>
            </div>

            {/* Formulário novo cupom */}
            {showForm && (
              <div className="bg-[#121622] border border-white/10 rounded-xl p-6 mb-6">
                <h3 className="font-orbitron text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-4">
                  Criar Cupom
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Código</label>
                    <input
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      placeholder="PROMO10"
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Tipo de Desconto</label>
                    <select
                      value={formDiscountType}
                      onChange={(e) => setFormDiscountType(e.target.value as "percentage" | "fixed_cents")}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    >
                      <option value="percentage">Percentual (%)</option>
                      <option value="fixed_cents">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">
                      {formDiscountType === "percentage" ? "Desconto (%)" : "Desconto (R$)"}
                    </label>
                    <input
                      type="number"
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(e.target.value)}
                      placeholder={formDiscountType === "percentage" ? "10" : "10.00"}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Valor Mínimo do Pedido (R$)</label>
                    <input
                      type="number"
                      value={formMinOrder}
                      onChange={(e) => setFormMinOrder(e.target.value)}
                      placeholder="0 = sem mínimo"
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Limite Total de Usos</label>
                    <input
                      type="number"
                      value={formMaxUses}
                      onChange={(e) => setFormMaxUses(e.target.value)}
                      placeholder="0 = ilimitado"
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Limite por Usuário</label>
                    <input
                      type="number"
                      value={formMaxPerUser}
                      onChange={(e) => setFormMaxPerUser(e.target.value)}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Data Início</label>
                    <input
                      type="datetime-local"
                      value={formStartsAt}
                      onChange={(e) => setFormStartsAt(e.target.value)}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Data Fim (opcional)</label>
                    <input
                      type="datetime-local"
                      value={formEndsAt}
                      onChange={(e) => setFormEndsAt(e.target.value)}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleCreatePromo}
                    disabled={saving || !formCode || !formDiscountValue}
                    className="px-6 py-2 bg-[#d4af37] text-black font-orbitron text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#e8c84a] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Salvando..." : "Criar Cupom"}
                  </button>
                </div>
              </div>
            )}

            {/* Tabela de cupons */}
            {promoCodes.length === 0 ? (
              <div className="text-center py-16 text-white/30 text-sm">
                Nenhum cupom criado ainda.
              </div>
            ) : (
              <div className="bg-[#121622] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-4 py-3 text-white/50 font-medium">Código</th>
                        <th className="text-left px-4 py-3 text-white/50 font-medium">Desconto</th>
                        <th className="text-left px-4 py-3 text-white/50 font-medium">Mínimo</th>
                        <th className="text-left px-4 py-3 text-white/50 font-medium">Usos</th>
                        <th className="text-left px-4 py-3 text-white/50 font-medium">Vigência</th>
                        <th className="text-center px-4 py-3 text-white/50 font-medium">Status</th>
                        <th className="text-center px-4 py-3 text-white/50 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoCodes.map((code) => (
                        <tr key={code.id} className="border-b border-white/5 hover:bg-[#121622] transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-white">{code.code}</span>
                          </td>
                          <td className="px-4 py-3 text-white/80">
                            {formatDiscount(code.discount_type, code.discount_value)}
                          </td>
                          <td className="px-4 py-3 text-white/60">
                            {code.min_order_cents > 0
                              ? `R$ ${(code.min_order_cents / 100).toFixed(2).replace(".", ",")}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-white/60">
                            {code.uses_count}
                            {code.max_uses_total !== null ? `/${code.max_uses_total}` : "/∞"}
                            <span className="text-white/30 ml-1">(×{code.max_uses_per_user}/user)</span>
                          </td>
                          <td className="px-4 py-3 text-white/50 text-xs">
                            {formatDate(code.starts_at)}
                            {code.ends_at && <> → {formatDate(code.ends_at)}</>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                code.active
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-red-500/15 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {code.active ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => togglePromoCode(code.id, code.active)}
                              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                                code.active
                                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                            >
                              {code.active ? "Desativar" : "Ativar"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB: PROMOÇÕES POR PRODUTO */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {!loading && tab === "produtos" && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowPromoForm(!showPromoForm)}
                className="px-5 py-2.5 bg-[#d4af37] text-black font-orbitron text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#e8c84a] transition-colors"
              >
                {showPromoForm ? "Cancelar" : "+ Nova Promoção"}
              </button>
            </div>

            {/* Formulário nova promoção por produto */}
            {showPromoForm && (
              <div className="bg-[#121622] border border-white/10 rounded-xl p-6 mb-6">
                <h3 className="font-orbitron text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-4">
                  Criar Promoção
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Produto</label>
                    <select
                      value={promoFormProductId}
                      onChange={(e) => setPromoFormProductId(e.target.value)}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="ALL">★ Todos os Produtos</option>
                      {PRODUCT_CATALOG.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — R$ {p.price.toFixed(2).replace(".", ",")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Tipo</label>
                    <select
                      value={promoFormType}
                      onChange={(e) => setPromoFormType(e.target.value as "percentage" | "fixed_cents")}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    >
                      <option value="percentage">Percentual (%)</option>
                      <option value="fixed_cents">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">
                      {promoFormType === "percentage" ? "Desconto (%)" : "Desconto (R$)"}
                    </label>
                    <input
                      type="number"
                      value={promoFormValue}
                      onChange={(e) => setPromoFormValue(e.target.value)}
                      placeholder={promoFormType === "percentage" ? "15" : "10.00"}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Valor Mínimo do Pedido (R$)</label>
                    <input
                      type="number"
                      value={promoFormMinOrder}
                      onChange={(e) => setPromoFormMinOrder(e.target.value)}
                      placeholder="0 = sem mínimo"
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Método de Pagamento</label>
                    <select
                      value={promoFormPaymentMethod}
                      onChange={(e) => setPromoFormPaymentMethod(e.target.value)}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    >
                      <option value="">Todos</option>
                      <option value="pix">Apenas PIX</option>
                      <option value="credit_card">Apenas Cartão</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs mb-1">Data Fim (opcional)</label>
                    <input
                      type="datetime-local"
                      value={promoFormEndsAt}
                      onChange={(e) => setPromoFormEndsAt(e.target.value)}
                      className="w-full bg-[#121622] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d4af37]/50 outline-none"
                    />
                  </div>
                </div>

                {/* Preview do preço com desconto */}
                {promoFormProductId && promoFormProductId !== "ALL" && promoFormValue && (
                  <div className="mt-4 p-3 bg-[#121622] rounded-lg border border-white/10">
                    <span className="text-white/50 text-xs">Preview: </span>
                    <span className="text-white/40 line-through text-sm mr-2">
                      R$ {getProductPrice(promoFormProductId).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-emerald-400 font-bold text-sm">
                      R$ {(promoFormType === "percentage"
                        ? getProductPrice(promoFormProductId) * (1 - Number(promoFormValue) / 100)
                        : Math.max(getProductPrice(promoFormProductId) - Number(promoFormValue), 0)
                      ).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                )}
                {promoFormProductId === "ALL" && promoFormValue && (
                  <div className="mt-4 p-3 bg-[#121622] rounded-lg border border-white/10">
                    <span className="text-[#d4af37] text-xs font-semibold">
                      Promoção de {promoFormType === "percentage" ? `${promoFormValue}%` : `R$ ${Number(promoFormValue).toFixed(2).replace(".", ",")}`} aplicada a todos os produtos
                      {promoFormMinOrder && ` (mínimo R$ ${Number(promoFormMinOrder).toFixed(2).replace(".", ",")})`}
                      {promoFormPaymentMethod && ` — apenas ${promoFormPaymentMethod === "pix" ? "PIX" : "Cartão"}`}
                    </span>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleCreateProductPromo}
                    disabled={saving || !promoFormProductId || !promoFormValue}
                    className="px-6 py-2 bg-[#d4af37] text-black font-orbitron text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#e8c84a] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Salvando..." : "Criar Promoção"}
                  </button>
                </div>
              </div>
            )}

            {/* Lista de promoções ALL */}
            {productPromos.filter((p) => p.product_id === "ALL" && p.active).length > 0 && (
              <div className="mb-6">
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                  Promoções que se aplicam a Todos os Produtos
                </h3>
                <div className="space-y-2">
                  {productPromos.filter((p) => p.product_id === "ALL" && p.active).map((promo) => (
                    <div key={promo.id} className="bg-[#121622] border border-[#d4af37]/30 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-[#d4af37] font-orbitron font-bold text-sm">
                          -{formatDiscount(promo.discount_type, promo.discount_value)}
                        </span>
                        <span className="text-white/60 text-xs">
                          Todos os produtos
                          {promo.min_order_cents > 0 && ` • Mínimo R$ ${(promo.min_order_cents / 100).toFixed(2).replace(".", ",")}`}
                          {promo.payment_methods && ` • ${promo.payment_methods === "pix" ? "PIX" : "Cartão"}`}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleProductPromo(promo.id, promo.active)}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Desativar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de produtos com promoções */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCT_CATALOG.map((product) => {
                const specificPromo = productPromos.find((p) => p.product_id === product.id && p.active);
                const allPromo = productPromos.find((p) => p.product_id === "ALL" && p.active);

                // Check if ALL promo qualifies for this product
                const allPromoQualifies = allPromo && product.price * 100 >= allPromo.min_order_cents;

                const promo = specificPromo || (allPromoQualifies ? allPromo : undefined);
                return (
                  <div
                    key={product.id}
                    className={`bg-[#121622] border rounded-xl p-5 transition-all ${
                      specificPromo
                        ? "border-[#d4af37]/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                        : allPromoQualifies
                        ? "border-emerald-500/20"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-orbitron text-sm font-bold text-white">{product.name}</h4>
                        <p className="text-white/40 text-xs">ID: {product.id}</p>
                      </div>
                      {specificPromo && (
                        <button
                          onClick={() => toggleProductPromo(specificPromo.id, specificPromo.active)}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          Desativar
                        </button>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      {promo ? (
                        <>
                          <span className="text-white/30 line-through text-sm">
                            R$ {product.price.toFixed(2).replace(".", ",")}
                          </span>
                          <span className="text-emerald-400 font-orbitron font-bold text-lg">
                            R$ {getDiscountedPrice(product.id, promo).toFixed(2).replace(".", ",")}
                          </span>
                          <span className="text-[#d4af37] text-xs font-semibold">
                            -{formatDiscount(promo.discount_type, promo.discount_value)}
                          </span>
                        </>
                      ) : (
                        <span className="text-white/70 font-orbitron font-bold text-lg">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>

                    {allPromo && !specificPromo && (
                      <p className="text-emerald-400/60 text-[10px] mt-1">
                        {allPromoQualifies
                          ? "Promoção ALL ativa"
                          : `ALL: -${formatDiscount(allPromo.discount_type, allPromo.discount_value)} acima de R$ ${(allPromo.min_order_cents / 100).toFixed(2).replace(".", ",")}${allPromo.payment_methods ? ` • ${allPromo.payment_methods === "pix" ? "PIX" : "Cartão"}` : ""}`
                        }
                      </p>
                    )}

                    {!specificPromo && (
                      <button
                        onClick={() => {
                          setPromoFormProductId(product.id);
                          setShowPromoForm(true);
                        }}
                        className="mt-3 w-full py-1.5 bg-[#121622] border border-white/10 rounded-lg text-white/50 text-xs hover:bg-white/10 hover:text-white transition-colors"
                      >
                        + Adicionar promoção específica
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
