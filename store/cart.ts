// src/store/cart.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartCurrency = "BDT";

// Keep this in sync with your Prisma PurchaseType enum
export type CartPurchaseType =
  | "NEW"
  | "REFURBISHED"
  | "RENT"
  | "HIRE_PURCHASE"
  | "PRE_ORDER";

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  imageUrl?: string | null;

  // merchandising
  vendorName?: string | null;
  purchaseType?: CartPurchaseType;
  variantId?: string | null;

  // pricing
  unitPrice: number;
  currency: CartCurrency;

  quantity: number;
};

type CartState = {
  items: CartLine[];
  isOpen: boolean;

  open: () => void;
  close: () => void;
  toggle: () => void;

  addItem: (line: Omit<CartLine, "key">) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, qty: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  clear: () => void;

  totalQty: () => number;
  subtotal: () => number;
};

function lineKey(p: {
  productId: string;
  variantId?: string | null;
  purchaseType?: CartPurchaseType | null;
}) {
  // default to "NEW" instead of "SALE" so it matches your server
  return [p.productId, p.variantId ?? "no-variant", p.purchaseType ?? "NEW"].join("|");
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),

      addItem: (l) => {
        const key = lineKey(l);
        const existing = get().items.find((i) => i.key === key);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + (l.quantity || 1) } : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                ...l,
                key,
                quantity: l.quantity || 1,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (key) =>
        set({
          items: get().items.filter((i) => i.key !== key),
        }),

      setQuantity: (key, qty) =>
        set({
          items: get().items
            .map((i) =>
              i.key === key ? { ...i, quantity: Math.max(1, qty) } : i
            )
            .filter((i) => i.quantity > 0),
        }),

      increment: (key) =>
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }),

      decrement: (key) =>
        set({
          items: get().items
            .map((i) =>
              i.key === key ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0),
        }),

      clear: () => set({ items: [] }),

      totalQty: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    }),
    {
      name: "birl-cart-v1", // localStorage key
      partialize: (s) => ({ items: s.items }), // don't persist open state
    }
  )
);

export function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}
