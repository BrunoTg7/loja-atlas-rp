"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSteam } from "@/context/SteamContext";

interface CartItem {
  id: string;
  name: string;
  price: number;
  amount: number;
  type: "vip" | "car" | "coin";
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "jsjka6dsbna6sas8";

function encode(data: string): string {
  return btoa(encodeURIComponent(data));
}

function decode(data: string): string {
  return decodeURIComponent(atob(data));
}

function getCartKey(steamId: string | null): string {
  return steamId ? `${CART_KEY}_${steamId}` : CART_KEY;
}

function loadCart(steamId: string | null): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getCartKey(steamId));
    if (!raw) return [];
    return JSON.parse(decode(raw));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[], steamId: string | null) {
  try {
    localStorage.setItem(getCartKey(steamId), encode(JSON.stringify(items)));
  } catch {}
}

function migrateOldCart(steamId: string | null) {
  if (!steamId || typeof window === "undefined") return;
  try {
    const oldKey = CART_KEY;
    const newKey = getCartKey(steamId);
    const oldData = localStorage.getItem(oldKey);
    const newData = localStorage.getItem(newKey);
    if (oldData && !newData) {
      localStorage.setItem(newKey, oldData);
      localStorage.removeItem(oldKey);
    }
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useSteam();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    migrateOldCart(user?.steamId ?? null);
    setItems(loadCart(user?.steamId ?? null));
    setLoaded(true);
  }, [user?.steamId]);

  useEffect(() => {
    if (loaded) {
      saveCart(items, user?.steamId ?? null);
    }
  }, [items, loaded, user?.steamId]);

  const addToCart = useCallback((item: CartItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? item : i));
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, totalPrice, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
