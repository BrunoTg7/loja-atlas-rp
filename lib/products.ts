// ═══════════════════════════════════════════════════════════════
// Loja Atlas RP — Catálogo de Produtos Compartilhado
// Usado por: AtlasCoinCard.tsx, promotion.service.ts, checkout
// ═══════════════════════════════════════════════════════════════

export interface Product {
  id: string;
  name: string;
  amount: number;
  price: number;
  type: "coin" | "vip" | "car";
}

export const PRODUCT_CATALOG: Product[] = [
  { id: "c100",   name: "100 Atlas",      amount: 100,   price: 6.90,   type: "coin" },
  { id: "c250",   name: "250 Atlas",      amount: 250,   price: 14.90,  type: "coin" },
  { id: "c500",   name: "500 Atlas",      amount: 500,   price: 27.90,  type: "coin" },
  { id: "c600",   name: "600 Atlas",      amount: 600,   price: 32.90,  type: "coin" },
  { id: "c1000",  name: "1.000 Atlas",    amount: 1000,  price: 54.90,  type: "coin" },
  { id: "c1500",  name: "1.500 Atlas",    amount: 1500,  price: 79.90,  type: "coin" },
  { id: "c2000",  name: "2.000 Atlas",    amount: 2000,  price: 94.90,  type: "coin" },
  { id: "c5000",  name: "5.000 Atlas",    amount: 5000,  price: 199.90, type: "coin" },
  { id: "c10000", name: "10.000 Atlas",   amount: 10000, price: 349.90, type: "coin" },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === id);
}
