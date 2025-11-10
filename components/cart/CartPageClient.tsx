"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, formatBDT } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

export default function CartPageClient() {
  // Select each slice independently — no object selector!
  const items = useCartStore((s) => s.items);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalQty = useCartStore((s) => s.totalQty());
  const clear = useCartStore((s) => s.clear);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-xl font-semibold">Your Cart</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {totalQty} item{totalQty !== 1 ? "s" : ""} in your bag
      </p>

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          <div className="mt-4">
            <Link href="/shop">
              <Button>Continue shopping</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Items Table */}
          <div className="overflow-hidden rounded-lg border bg-white">
            <div className="grid grid-cols-12 gap-3 border-b bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <ul className="divide-y">
              {items.map((i) => (
                <li key={i.key} className="grid grid-cols-12 items-center gap-3 px-4 py-4">
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      {i.imageUrl ? (
                        <Image src={i.imageUrl} alt={i.name} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/product/${i.slug}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {i.name}
                      </Link>
                      {i.vendorName ? (
                        <p className="truncate text-xs text-muted-foreground">{i.vendorName}</p>
                      ) : null}
                      {i.purchaseType && (
                        <span className="mt-1 inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          {i.purchaseType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 text-center text-sm">{formatBDT(i.unitPrice)}</div>

                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                      onClick={() => decrement(i.key)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{i.quantity}</span>
                    <button
                      className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                      onClick={() => increment(i.key)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      className="ml-2 inline-flex items-center rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => removeItem(i.key)}
                      aria-label="Remove"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="col-span-2 text-right text-sm font-semibold">
                    {formatBDT(i.unitPrice * i.quantity)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatBDT(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex items-center justify-between text-sm">
                <span>Total</span>
                <span className="text-base font-bold">{formatBDT(subtotal)}</span>
              </div>

              <div className="mt-4 grid gap-2">
                <Button className="w-full bg-pcolor text-white hover:bg-pcolor/90">
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={clear}>
                  Clear Cart
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              Prices in BDT. VAT/tax & shipping shown at checkout.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
