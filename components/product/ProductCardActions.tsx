"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore, CartPurchaseType } from "@/store/cart";
import { useAction } from "next-safe-action/hooks";
import { addToCart } from "@/actions/cart/add-to-cart";

type Props = {
  productId: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  vendorName?: string | null;
  unitPrice: number; // in BDT
  currency?: "BDT";
  variantId?: string | null;
  purchaseType?: CartPurchaseType;
  initialWished?: boolean;

  // ✅ new: tells us if we should also hit DB
  isAuthenticated?: boolean;
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
  purchaseType = "NEW",
  initialWished,
  isAuthenticated = false,
}: Props) {
  const [wishLocal, setWishLocal] = useState<boolean>(!!initialWished);

  const add = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);

  const [isPending, startTransition] = useTransition();

  const { execute, status } = useAction(addToCart, {
    onSuccess({ data }) {
      if (!data) return;

      if (!data.ok) {
        console.error(data.message ?? "Could not add to cart");
        // toast.error(data.message ?? "Could not add to cart");
        return;
      }

      // On success, we already added locally (see below), so no need to add again if you don't want duplicates.
      // If you prefer to add only after DB success, move add(...) here instead of in onClick.
    },
    onError(err) {
      console.error(err);
      // toast.error("Something went wrong");
    },
  });

  const loading = isAuthenticated && (isPending || status === "executing");

  function handleAddToCart() {
    // ✅ Always update local cart & open drawer (guest or logged-in)
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

    // ✅ Only logged-in users hit DB
    if (!isAuthenticated) return;

    startTransition(() => {
      execute({
        productId,
        quantity: 1,
        variantId,
        purchaseType,
      });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="flex-1 bg-pcolor text-white hover:bg-pcolor/90"
        disabled={loading}
        onClick={handleAddToCart}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {loading ? "Adding..." : "Add to cart"}
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
