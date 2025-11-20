"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
   productId: string;
   addedAt: number;
}

interface WishlistStore {
   items: WishlistItem[];
   addItem: (productId: string) => void;
   removeItem: (productId: string) => void;
   isInWishlist: (productId: string) => boolean;
   clearWishlist: () => void;
   setItems: (items: WishlistItem[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
   persist(
      (set, get) => ({
         items: [],

         addItem: (productId: string) => {
            const items = get().items;
            const exists = items.find((item) => item.productId === productId);

            if (!exists) {
               set({
                  items: [...items, { productId, addedAt: Date.now() }],
               });
            }
         },

         removeItem: (productId: string) => {
            set({
               items: get().items.filter((item) => item.productId !== productId),
            });
         },

         isInWishlist: (productId: string) => {
            return get().items.some((item) => item.productId === productId);
         },

         clearWishlist: () => {
            set({ items: [] });
         },

         setItems: (items: WishlistItem[]) => {
            set({ items });
         },
      }),
      {
         name: "wishlist-storage",
      }
   )
);
