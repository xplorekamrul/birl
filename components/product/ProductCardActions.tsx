"use client";

import { addToCart } from "@/actions/cart/add-to-cart";
import { toggleWishlist } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CartPurchaseType, useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { Heart, ShoppingCart } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState, useTransition } from "react";

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
  const [wishLoading, setWishLoading] = useState(false);

  const add = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);

  const wishlistStore = useWishlistStore();
  const isInWishlist = wishlistStore.isInWishlist(productId);

  const [isPending, startTransition] = useTransition();

  // Sync initial state with store
  useEffect(() => {
    if (initialWished && !isInWishlist) {
      wishlistStore.addItem(productId);
    }
  }, [initialWished, productId, isInWishlist, wishlistStore]);

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

  async function handleWishlistToggle() {
    setWishLoading(true);

    try {
      // Toggle in localStorage first (instant feedback)
      if (isInWishlist) {
        wishlistStore.removeItem(productId);
      } else {
        wishlistStore.addItem(productId);
      }

      // If authenticated, also sync with database
      if (isAuthenticated) {
        const result = await toggleWishlist(productId);
        if (!result.ok) {
          // Revert on error
          if (isInWishlist) {
            wishlistStore.addItem(productId);
          } else {
            wishlistStore.removeItem(productId);
          }
          console.error(result.message);
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      // Revert on error
      if (isInWishlist) {
        wishlistStore.addItem(productId);
      } else {
        wishlistStore.removeItem(productId);
      }
    } finally {
      setWishLoading(false);
    }
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
          "border-slate-300 transition-colors",
          isInWishlist && "border-rose-500 bg-rose-50 text-rose-600 hover:bg-rose-100"
        )}
        onClick={handleWishlistToggle}
        disabled={wishLoading}
        aria-label="Toggle wishlist"
      >
        <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
      </Button>
    </div>
  );
}
