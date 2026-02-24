"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatBDT, useCartStore } from "@/store/cart";
import { Minus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function CartDrawerClient() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalQty = useCartStore((s) => s.totalQty());
  const subtotal = useCartStore((s) => s.subtotal());

  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const drawerRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Close on route change ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── JS-driven open / close (no Tailwind classes for this) ────────────────
  // We directly mutate the DOM refs so there is zero CSS-class ambiguity.
  useEffect(() => {
    const drawer = drawerRef.current;
    const backdrop = backdropRef.current;
    if (!drawer || !backdrop) return;

    if (isOpen) {
      // Show backdrop
      backdrop.style.opacity = "1";
      backdrop.style.pointerEvents = "auto";
      // Slide drawer in
      drawer.style.transform = "translateX(0)";
      drawer.style.pointerEvents = "auto";
    } else {
      // Hide backdrop
      backdrop.style.opacity = "0";
      backdrop.style.pointerEvents = "none";
      // Slide drawer out
      drawer.style.transform = "translateX(100%)";
      drawer.style.pointerEvents = "none";
    }
  }, [isOpen]);

  // ── Close on outside click — pure JS, all screen sizes ──────────────────
  // mousedown fires before click so we can prevent accidental button activations.
  // The 50 ms delay ensures the very click that opens the drawer doesn't
  // immediately close it.
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleMouseDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen, close]);

  if (!mounted) return null;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────
          Covers the full screen behind the drawer.
          JS (the useEffect above) controls opacity + pointer-events.
          Initial state: invisible, non-interactive.                       */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(3px)",
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 300ms ease",
        }}
      />

      {/* ── Drawer ────────────────────────────────────────────────────────
          Fixed overlay on ALL screen sizes.
          JS controls transform + pointer-events — no Tailwind breakpoints
          involved in any functional behaviour.

          Initial state: slid fully off the right edge (translateX(100%)),
          non-interactive (pointer-events: none), so it is invisible and
          cannot receive or block any clicks until the store opens it.      */}
      <aside
        ref={drawerRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: "min(82vw, 400px)",
          transform: "translateX(100%)",   // hidden by default
          pointerEvents: "none",           // non-interactive by default
          transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
          display: "flex",
          flexDirection: "column",
        }}
        className="bg-background border-l shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <h3 className="text-sm font-semibold">
            Bag{" "}
            <span className="text-muted-foreground">({totalQty})</span>
          </h3>
          <button
            onClick={close}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
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
                <li
                  key={i.key}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {i.imageUrl ? (
                      <Image
                        src={i.imageUrl}
                        alt={i.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${i.slug}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {i.name}
                    </Link>
                    {i.vendorName ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {i.vendorName}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs font-medium">
                      {formatBDT(i.unitPrice)}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => decrement(i.key)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">
                        {i.quantity}
                      </span>
                      <button
                        className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => increment(i.key)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        className="ml-auto inline-flex items-center rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        onClick={() => removeItem(i.key)}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="space-y-3 border-t p-4 bg-background shrink-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatBDT(subtotal)}</span>
          </div>
          <Separator />
          <Link href="/cart" className="block">
            <Button className="w-full bg-pcolor text-white hover:bg-pcolor/90">
              Review &amp; Checkout
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
