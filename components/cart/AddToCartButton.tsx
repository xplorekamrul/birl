"use client";

import { addToCart } from "@/actions/cart/add-to-cart";
import { Button } from "@/components/ui/button";
import { CartPurchaseType, useCartStore } from "@/store/cart";
import { useAction } from "next-safe-action/hooks";
import { useTransition } from "react";
// import { toast } from "sonner";

type AddToCartButtonProps = {
  productId: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  vendorName?: string | null;
  unitPrice: number;
  purchaseType?: CartPurchaseType;
  variantId?: string | null;
};

export function AddToCartButton({
  productId,
  slug,
  name,
  imageUrl,
  vendorName,
  unitPrice,
  purchaseType = "NEW",
  variantId = null,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);   // ← open drawer
  const [isPending, startTransition] = useTransition();

  const { execute, status } = useAction(addToCart, {
    onSuccess({ data }) {
      if (!data) return;

      if (!data.ok) {
        console.error(data.message ?? "Could not add to cart");
        // toast.error(data.message ?? "Could not add to cart");
        return;
      }

      // Update local cart (zustand + localStorage) for instant UI
      addItem({
        productId,
        slug,
        name,
        imageUrl,
        vendorName,
        unitPrice,
        currency: "BDT",
        quantity: 1,
        purchaseType,
        variantId,
      });

      // Open the cart drawer so the user sees what they added
      openCart();

      // toast.success("Added to cart");
    },
    onError(result) {
      console.error(result);
      // toast.error("Something went wrong");
    },
  });

  const loading = isPending || status === "executing";

  function handleClick() {
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
    <Button
      type="button"
      className="w-full bg-pcolor text-white hover:bg-pcolor/90"
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? "Adding..." : "Add to cart"}
    </Button>
  );
}