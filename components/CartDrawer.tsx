"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSteam } from "@/context/SteamContext";
import { usePromotions } from "@/hooks/usePromotions";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeFromCart, clearCart, totalPrice, itemCount } = useCart();
  const { user } = useSteam();
  const { getItemPrice, getCartTotal, getAllPromoInfo, loading: promosLoading } = usePromotions();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleCheckout = () => {
    if (!user) {
      window.location.href = "/api/auth/steam";
      return;
    }
    window.location.href = "/checkout";
  };

  const cartPricing = getCartTotal(items);
  const pixDiscount = cartPricing.total >= 99.90;
  const allPromoInfo = getAllPromoInfo();
  const showAllPromoInfo = allPromoInfo && cartPricing.total < allPromoInfo.minOrderBRL;

  return (
    <div className={`fixed inset-0 z-[9999] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-[400px] max-w-[90vw] bg-[#0c0c10] border-l border-[#d4af37]/20 flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-sm font-bold">Meu Carrinho</h2>
              <p className="text-white/40 text-xs">{itemCount} {itemCount === 1 ? "item" : "itens"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-5">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <p className="text-white/40 text-sm font-medium">Carrinho vazio</p>
              <p className="text-white/20 text-xs mt-1">Adicione pacotes de Atlas</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {items.map((item) => {
                const pricing = getItemPrice(item.id, item.price);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#d4af37]/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8b7021] flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#0a0a0a]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.5v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.64c.1 1.7 1.36 2.66 2.86 2.97V19h1.71v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.76-3.42z" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2">
                        {pricing.hasPromo ? (
                          <>
                            <span className="text-white/30 text-xs line-through">
                              R$ {pricing.originalPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-emerald-400 text-xs font-bold">
                              R$ {pricing.finalPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-emerald-400/60 text-[9px] font-semibold">
                              {pricing.discountLabel}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#d4af37] text-xs font-bold">
                            R$ {item.price.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-4 space-y-3">
            {/* Promotion discount */}
            {cartPricing.discountTotal > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20">
                <svg className="w-3.5 h-3.5 text-[#d4af37] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-[#d4af37] text-[11px] font-semibold">
                  Promoção aplicada: -R$ {cartPricing.discountTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}

            {/* ALL promo info badge (cart below min_order) */}
            {showAllPromoInfo && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/15">
                <svg className="w-3.5 h-3.5 text-[#d4af37]/60 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[#d4af37]/70 text-[11px] font-semibold">
                  {allPromoInfo.discountLabel} acima de {allPromoInfo.minOrderLabel}{allPromoInfo.paymentLabel ? ` • ${allPromoInfo.paymentLabel}` : ""}
                </span>
              </div>
            )}

            {/* PIX discount */}
            {pixDiscount && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-300 text-[11px] font-semibold">10% OFF no PIX</span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">Total</span>
              <div className="flex items-baseline gap-1">
                {cartPricing.discountTotal > 0 && (
                  <span className="text-white/30 text-xs line-through mr-2">
                    R$ {cartPricing.originalTotal.toFixed(2).replace(".", ",")}
                  </span>
                )}
                <span className="text-white/30 text-xs">R$</span>
                <span className="text-white text-lg font-bold">
                  {cartPricing.total.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* Checkout */}
            <button
              onClick={handleCheckout}
              className="w-full h-11 rounded-xl bg-[#d4af37] hover:bg-[#e8c84a] text-[#0a0a0a] text-sm font-bold uppercase tracking-wider transition-colors"
            >
              {user ? "Finalizar Compra" : "Faça Login para Comprar"}
            </button>

            {/* Clear */}
            <button
              onClick={clearCart}
              className="w-full text-center text-white/20 hover:text-red-400 text-xs transition-colors py-1"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
