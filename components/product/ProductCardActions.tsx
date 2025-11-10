"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

type Props = {
  productId: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  vendorName?: string | null;
  unitPrice: number; // in BDT
  currency?: "BDT";
  variantId?: string | null;
  purchaseType?: "SALE" | "RENT" | "HP" | "PREORDER";
  initialWished?: boolean;
};

export default function ProductCardActions({
  productId,
  slug,
  name,
  imageUrl,
  vendorName,
  unitPrice,
  currency = "BDT",
  variantId = null,
  purchaseType = "SALE",
  initialWished,
}: Props) {
  const [wishLocal, setWishLocal] = useState<boolean>(!!initialWished);
  const add = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="flex-1 bg-pcolor text-white hover:bg-pcolor/90"
        onClick={() => {
          add({
            productId,
            slug,
            name,
            imageUrl,
            vendorName,
            unitPrice,
            currency,
            variantId,
            purchaseType,
            quantity: 1,
          });
          open();
        }}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to cart
      </Button>

      <Button
        size="icon"
        variant="outline"
        className={cn(
          "border-slate-300",
          wishLocal && "border-rose-300 bg-rose-50 text-rose-600"
        )}
        onClick={() => setWishLocal((w) => !w)}
        aria-label="Toggle wishlist"
      >
        {wishLocal ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
      </Button>
    </div>
  );
}
