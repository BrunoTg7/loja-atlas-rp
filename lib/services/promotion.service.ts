// ═══════════════════════════════════════════════════════════════
// Loja Atlas RP — Serviço de Promoções e Cupons
// ═══════════════════════════════════════════════════════════════

import { getSupabaseServer } from "@/lib/supabase-server";

export interface PromoCode {
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
  updated_at: string;
}

export interface ProductPromotion {
  id: string;
  product_id: string;           // 'ALL' = todos os produtos, ou ID específico
  discount_type: "percentage" | "fixed_cents";
  discount_value: number;
  min_order_cents: number;      // valor mínimo do pedido em centavos
  payment_methods: string | null; // null = todos, ou 'pix', 'credit_card'
  active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItemInput {
  product_id: string;
  name: string;
  price_cents: number;
  amount: number;
  type: string;
}

export interface PromotionResult {
  totalCents: number;
  discountCents: number;
  subtotalCents: number;
  appliedPromoCodeId: string | null;
  productPromotions: { product_id: string; discount_cents: number }[];
}

// ─── Verificar se a promoção se aplica ao método de pagamento ──
function matchesPaymentMethod(
  promo: ProductPromotion,
  paymentMethod?: string
): boolean {
  if (!promo.payment_methods) return true; // todos os métodos
  if (!paymentMethod) return true;
  const methods = promo.payment_methods.split(",").map((m) => m.trim());
  return methods.includes(paymentMethod);
}

// ─── Verificar se o produto se aplica à promoção ───────────────
function matchesProduct(
  promo: ProductPromotion,
  productId: string
): boolean {
  if (promo.product_id === "ALL") return true;
  return promo.product_id === productId;
}

// ─── Buscar cupom ativo por código ──────────────────────────────
async function getActivePromoCode(code: string): Promise<PromoCode | null> {
  const db = getSupabaseServer();
  const now = new Date().toISOString();

  const { data, error } = await db
    .from("promo_codes")
    .select("*")
    .ilike("code", code.trim())
    .eq("active", true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .lte("starts_at", now)
    .maybeSingle();

  if (error || !data) return null;
  return data as PromoCode;
}

// ─── Buscar todas as promoções ativas (específicas + ALL) ─────
async function getActiveProductPromotionsForItems(
  productIds: string[]
): Promise<ProductPromotion[]> {
  const db = getSupabaseServer();
  const now = new Date().toISOString();

  const { data, error } = await db
    .from("product_promotions")
    .select("*")
    .eq("active", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`);

  if (error || !data) return [];
  return data as ProductPromotion[];
}

// ─── Contar usos de um cupom por usuário ───────────────────────
async function countUserPromoUses(
  promoCodeId: string,
  userSteamId: string
): Promise<number> {
  const db = getSupabaseServer();
  const { count, error } = await db
    .from("promo_code_uses")
    .select("*", { count: "exact", head: true })
    .eq("promo_code_id", promoCodeId)
    .eq("user_steam_id", userSteamId);

  if (error) return 0;
  return count || 0;
}

// ─── Registrar uso de cupom ────────────────────────────────────
async function recordPromoUse(
  promoCodeId: string,
  orderId: string,
  userSteamId: string,
  discountAppliedCents: number
): Promise<void> {
  const db = getSupabaseServer();
  await db.from("promo_code_uses").insert({
    id: `PCU-${crypto.randomUUID()}`,
    promo_code_id: promoCodeId,
    order_id: orderId,
    user_steam_id: userSteamId,
    discount_applied_cents: discountAppliedCents,
  });

  await db
    .from("promo_codes")
    .update({ uses_count: await getPromoUsesCount(promoCodeId) + 1 })
    .eq("id", promoCodeId);
}

async function getPromoUsesCount(promoCodeId: string): Promise<number> {
  const db = getSupabaseServer();
  const { count } = await db
    .from("promo_code_uses")
    .select("*", { count: "exact", head: true })
    .eq("promo_code_id", promoCodeId);
  return count || 0;
}

// ─── Função principal: aplicar promoções ───────────────────────
export async function applyPromotion(params: {
  items: OrderItemInput[];
  promoCode?: string;
  userSteamId: string;
  paymentMethod?: string;
  subtotalCentsOverride?: number; // subtotal pré-calculado (para ALL + min_order)
}): Promise<PromotionResult> {
  let discountCents = 0;
  let appliedPromoCodeId: string | null = null;
  const productPromotions: { product_id: string; discount_cents: number }[] = [];

  const subtotalCents =
    params.subtotalCentsOverride ??
    params.items.reduce((sum, item) => sum + item.price_cents * item.amount, 0);

  // 1. Buscar todas as promoções ativas
  const allPromos = await getActiveProductPromotionsForItems(
    params.items.map((i) => i.product_id)
  );

  // Separar promoções ALL das promoções por produto
  const allPromosList = allPromos.filter((p) => p.product_id === "ALL");
  const specificPromos = allPromos.filter((p) => p.product_id !== "ALL");

  // 2. Promoções fixas por produto específico (automáticas)
  for (const item of params.items) {
    const promo = specificPromos.find((p) => p.product_id === item.product_id);
    if (promo && matchesPaymentMethod(promo, params.paymentMethod)) {
      const itemTotal = item.price_cents * item.amount;
      const itemDiscount =
        promo.discount_type === "percentage"
          ? Math.floor((itemTotal * promo.discount_value) / 100)
          : Math.min(promo.discount_value, itemTotal);
      discountCents += itemDiscount;
      productPromotions.push({
        product_id: item.product_id,
        discount_cents: itemDiscount,
      });
    }
  }

  // 3. Promoções ALL (aplicam a todos os itens, verificando min_order e payment_method)
  for (const promo of allPromosList) {
    if (!matchesPaymentMethod(promo, params.paymentMethod)) continue;
    if (subtotalCents < promo.min_order_cents) continue;

    for (const item of params.items) {
      const itemTotal = item.price_cents * item.amount;
      const itemDiscount =
        promo.discount_type === "percentage"
          ? Math.floor((itemTotal * promo.discount_value) / 100)
          : Math.min(promo.discount_value, itemTotal);
      discountCents += itemDiscount;
      productPromotions.push({
        product_id: `ALL:${item.product_id}`,
        discount_cents: itemDiscount,
      });
    }
  }

  // 4. Cupom digitado pelo usuário
  if (params.promoCode) {
    const code = await getActivePromoCode(params.promoCode);
    if (!code) throw new Error("Cupom inválido ou expirado.");

    if (subtotalCents < code.min_order_cents) {
      throw new Error(
        `Cupom válido apenas para compras acima de R$ ${(code.min_order_cents / 100).toFixed(2).replace(".", ",")}`
      );
    }

    if (code.max_uses_total !== null && code.uses_count >= code.max_uses_total) {
      throw new Error("Cupom esgotado.");
    }

    const userUses = await countUserPromoUses(code.id, params.userSteamId);
    if (userUses >= code.max_uses_per_user) {
      throw new Error("Você já utilizou este cupom.");
    }

    const couponDiscount =
      code.discount_type === "percentage"
        ? Math.floor((subtotalCents * code.discount_value) / 100)
        : code.discount_value;

    discountCents += couponDiscount;
    appliedPromoCodeId = code.id;
  }

  const totalCents = Math.max(subtotalCents - discountCents, 0);

  return {
    totalCents,
    discountCents,
    subtotalCents,
    appliedPromoCodeId,
    productPromotions,
  };
}

// ─── Buscar todas as promoções fixas ativas (para o checkout/cards) ─
export async function getActiveProductPromotions(): Promise<ProductPromotion[]> {
  const db = getSupabaseServer();
  const now = new Date().toISOString();

  const { data, error } = await db
    .from("product_promotions")
    .select("*")
    .eq("active", true)
    .lte("starts_at", now)
    .or(`ends_at.is.null,ends_at.gt.${now}`);

  if (error || !data) return [];
  return data as ProductPromotion[];
}

// ─── Exportar para uso externo ──────────────────────────────────
export { recordPromoUse, getActivePromoCode };
