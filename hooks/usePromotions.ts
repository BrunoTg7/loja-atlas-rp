"use client";

import { useState, useEffect } from "react";

interface ProductPromo {
  product_id: string;
  discount_type: "percentage" | "fixed_cents";
  discount_value: number;
  min_order_cents: number;
  payment_methods: string | null;
}

export function usePromotions() {
  const [promos, setPromos] = useState<ProductPromo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promotions")
      .then((res) => res.json())
      .then((data) => setPromos(data.promotions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Specific product promos (not ALL)
  const specificPromoMap = new Map<string, ProductPromo>();
  for (const p of promos) {
    if (p.product_id === "ALL") continue;
    if (!specificPromoMap.has(p.product_id)) specificPromoMap.set(p.product_id, p);
  }

  // ALL promos (applied to all products when conditions met)
  const allPromos = promos.filter((p) => p.product_id === "ALL");

  function getItemPrice(productId: string, originalPrice: number, paymentMethod?: string): {
    finalPrice: number;
    originalPrice: number;
    discountLabel: string;
    hasPromo: boolean;
  } {
    // Check specific product promo first (no min_order, always applies)
    const specificPromo = specificPromoMap.get(productId);
    if (specificPromo) {
      const finalPrice = specificPromo.discount_type === "percentage"
        ? originalPrice * (1 - specificPromo.discount_value / 100)
        : Math.max(originalPrice - specificPromo.discount_value / 100, 0);
      const label = specificPromo.discount_type === "percentage"
        ? `${specificPromo.discount_value}% OFF`
        : `-R$ ${(specificPromo.discount_value / 100).toFixed(2).replace(".", ",")}`;
      return { finalPrice, originalPrice, discountLabel: label, hasPromo: true };
    }

    // ALL promos: check min_order AND payment_methods
    for (const allPromo of allPromos) {
      if (originalPrice * 100 < allPromo.min_order_cents) continue;
      if (allPromo.payment_methods && paymentMethod && allPromo.payment_methods !== paymentMethod) continue;
      const finalPrice = allPromo.discount_type === "percentage"
        ? originalPrice * (1 - allPromo.discount_value / 100)
        : Math.max(originalPrice - allPromo.discount_value / 100, 0);
      const label = allPromo.discount_type === "percentage"
        ? `${allPromo.discount_value}% OFF`
        : `-R$ ${(allPromo.discount_value / 100).toFixed(2).replace(".", ",")}`;
      return { finalPrice, originalPrice, discountLabel: label, hasPromo: true };
    }

    return { finalPrice: originalPrice, originalPrice, discountLabel: "", hasPromo: false };
  }

  function getCartTotal(items: { id: string; price: number }[], paymentMethod?: string): {
    total: number;
    originalTotal: number;
    discountTotal: number;
  } {
    let cartOriginalTotal = 0;
    for (const item of items) {
      cartOriginalTotal += item.price;
    }

    // Check specific promos (always apply)
    let specificDiscount = 0;
    for (const item of items) {
      const specificPromo = specificPromoMap.get(item.id);
      if (specificPromo) {
        const disc = specificPromo.discount_type === "percentage"
          ? item.price * (specificPromo.discount_value / 100)
          : Math.min(specificPromo.discount_value / 100, item.price);
        specificDiscount += disc;
      }
    }

    // Check ALL promos: only if cart total >= min_order AND payment method matches
    let allDiscount = 0;
    for (const allPromo of allPromos) {
      if (cartOriginalTotal * 100 < allPromo.min_order_cents) continue;
      if (allPromo.payment_methods && paymentMethod && allPromo.payment_methods !== paymentMethod) continue;
      for (const item of items) {
        const disc = allPromo.discount_type === "percentage"
          ? item.price * (allPromo.discount_value / 100)
          : Math.min(allPromo.discount_value / 100, item.price);
        allDiscount += disc;
      }
    }

    const finalTotal = cartOriginalTotal - specificDiscount - allDiscount;
    return {
      total: Math.max(finalTotal, 0),
      originalTotal: cartOriginalTotal,
      discountTotal: specificDiscount + allDiscount,
    };
  }

  // Get ALL promo info for display (badge, min_order text)
  function getAllPromoInfo(): { discountLabel: string; minOrderLabel: string; minOrderBRL: number; paymentLabel: string } | null {
    if (allPromos.length === 0) return null;
    const promo = allPromos[0]; // use first active ALL promo
    const minOrderBRL = promo.min_order_cents / 100;
    const discountLabel = promo.discount_type === "percentage"
      ? `${promo.discount_value}% OFF`
      : `-R$ ${(promo.discount_value / 100).toFixed(2).replace(".", ",")}`;
    const minOrderLabel = `Mínimo R$ ${minOrderBRL.toFixed(2).replace(".", ",")}`;
    const paymentLabel = promo.payment_methods === "pix" ? "PIX" : promo.payment_methods === "credit_card" ? "Cartão" : "";
    return { discountLabel, minOrderLabel, minOrderBRL, paymentLabel };
  }

  return { promos, loading, getItemPrice, getCartTotal, getAllPromoInfo, allPromos };
}
