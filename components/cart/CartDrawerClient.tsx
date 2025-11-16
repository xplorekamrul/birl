"use client";

import Image from "next/image";
import Link from "next/link";
import {  Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, formatBDT } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";


export default function CartDrawerClient() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const open = useCartStore((s) => s.open);
  const close = useCartStore((s) => s.close);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalQty = useCartStore((s) => s.totalQty());
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(o) => {
        if (o) open();
        else close();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* a11y title for Radix (can be visually hidden) */}
        <SheetTitle className="sr-only">Shopping Bag</SheetTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">
            Bag <span className="text-muted-foreground">({totalQty})</span>
          </h3>
          {/* <button
            onClick={close}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button> */}
        </div>

        {/* Items */}
        <ScrollArea className="flex-1 px-2">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Your bag is empty.
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((i) => (
                <li key={i.key} className="flex items-center gap-3 px-3 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {i.imageUrl ? (
                      <Image src={i.imageUrl} alt={i.name} fill className="object-cover" sizes="40px" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${i.slug}`}
                      className="block truncate text-sm font-medium hover:underline"
                      onClick={close}
                    >
                      {i.name}
                    </Link>
                    {i.vendorName ? (
                      <p className="truncate text-xs text-muted-foreground">{i.vendorName}</p>
                    ) : null}
                    <p className="mt-1 text-xs font-medium">{formatBDT(i.unitPrice)}</p>
                  </div>

                  <div className="flex items-center gap-2">
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
                  </div>

                  <button
                    className="ml-2 inline-flex items-center rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => removeItem(i.key)}
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="space-y-3 border-t p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatBDT(subtotal)}</span>
          </div>
          <Separator />
          <Link href="/cart" onClick={() => close()} className="block">
            <Button className="w-full bg-pcolor text-white hover:bg-pcolor/90">
              Review & Checkout
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
