"use client";

import { toggleWishlist } from "@/actions/wishlist";
import type { SerializedProduct } from "@/app/[slug]/page";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Package,
  PlayCircle,
  Plus,
  Share2,
  Star,
  Tag,
  Truck,
  Warehouse,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type SerializedVariant = SerializedProduct["variants"][0];

type Props = {
  product: SerializedProduct;
  isAuthenticated?: boolean;
};

function formatBDT(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const COLOR_MAP: Record<string, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  black: "bg-black",
  white: "bg-white border-2 border-slate-300",
  yellow: "bg-yellow-400",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  pink: "bg-pink-400",
  gray: "bg-gray-500",
  grey: "bg-gray-500",
  brown: "bg-[#8B4513]",
  navy: "bg-[#000080]",
  silver: "bg-gray-300",
  gold: "bg-yellow-500",
  beige: "bg-[#f5f0e8]",
};

function parseColor(val: string) {
  return COLOR_MAP[val.toLowerCase()] ?? "bg-slate-300";
}

/** Total available = sum(quantity - reserved) across all stock rows */
function variantAvailableStock(variant: SerializedVariant): number {
  return variant.stock.reduce((sum, s) => sum + Math.max(0, s.quantity - s.reserved), 0);
}

export default function ProductDetailLayout({ product, isAuthenticated = false }: Props) {
  // ── Variant / Option selection ──────────────────────────────────────────
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Pre-select first value of each option
    const init: Record<string, string> = {};
    product.options?.forEach((opt) => {
      if (opt.values[0]) init[opt.id] = opt.values[0].value;
    });
    return init;
  });

  /** Find the variant whose option-values match every currently-selected option */
  const matchedVariant = useMemo<SerializedVariant | null>(() => {
    if (!product.variants?.length) return null;
    const selVals = Object.values(selectedOptions);
    return (
      product.variants.find((v) => {
        const vVals = v.variantValues.map((vv) => vv.optionValue.value);
        return selVals.every((sv) => vVals.includes(sv));
      }) ?? null
    );
  }, [product.variants, selectedOptions]);

  const effectivePrice: number = useMemo(() => {
    if (matchedVariant) {
      if (matchedVariant.salePrice != null) return matchedVariant.salePrice;
      if (matchedVariant.price != null) return matchedVariant.price;
    }
    return product.salePrice ?? product.basePrice;
  }, [matchedVariant, product]);

  const availableStock = useMemo(() => {
    if (matchedVariant) return variantAvailableStock(matchedVariant);
    // No variants → no granular stock data; return null (show based on status)
    return null;
  }, [matchedVariant]);

  const inStock =
    availableStock != null
      ? availableStock > 0
      : product.status === "ACTIVE";

  // ── Image gallery ───────────────────────────────────────────────────────
  const media = product.media.length > 0 ? product.media : [];
  const [imgIdx, setImgIdx] = useState(0);

  // ── Image Zoom ──────────────────────────────────────────────────────────
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(250);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleDoubleClick = () => {
    setZoomLevel(prev => (prev === 250 ? 300 : 250));
  };

  // ── Tabs ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"description" | "specification" | "reviews">("description");

  // ── Quantity ────────────────────────────────────────────────────────────
  const [qty, setQty] = useState(1);
  const maxQty = availableStock ?? 99;

  // ── Wishlist ────────────────────────────────────────────────────────────
  const [wishLoading, setWishLoading] = useState(false);
  const wishlistStore = useWishlistStore();
  const isInWishlist = wishlistStore.isInWishlist(product.id);

  async function handleWishlist() {
    setWishLoading(true);
    const was = isInWishlist;
    try {
      was ? wishlistStore.removeItem(product.id) : wishlistStore.addItem(product.id);
      if (isAuthenticated) {
        const res = await toggleWishlist(product.id);
        if (!res.ok) was ? wishlistStore.addItem(product.id) : wishlistStore.removeItem(product.id);
      }
    } finally {
      setWishLoading(false);
    }
  }

  // ── Shared AddToCart props ───────────────────────────────────────────────
  const cartProps = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: media[0]?.url ?? null,
    vendorName: product.vendor?.shopName ?? null,
    variantId: matchedVariant?.id ?? null,
    quantity: qty,
  };

  return (
    <div className="space-y-10">
      {/* ── Main 2-column Layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-x-12 gap-y-10 items-start">

        {/* ── LEFT: Info / Actions ───────────────────────────────────── */}
        <div className="space-y-6">

          {/* Title + Meta */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {product.brand && (
                <span className="text-base font-medium text-slate-700">
                  Brand: <span className="text-slate-900">{product.brand.name}</span>
                </span>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-amber-600">{product.averageRating.toFixed(1)}</span>
                <span className="text-xs text-slate-500">({product.totalReviews})</span>
              </div>

              {/* Store badge */}
              {product.vendor && (
                <div className="flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  Sold by {product.vendor.shopName}
                </div>
              )}

              {/* Total Sales */}
              {product.totalSales > 0 && (
                <span className="text-xs text-slate-500">{product.totalSales.toLocaleString()} sold</span>
              )}
            </div>

            {product.shortDescription && (
              <p className="mt-4 text-slate-600 leading-relaxed text-sm">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900">{formatBDT(effectivePrice)}</span>
            {product.salePrice != null && !matchedVariant && (
              <span className="text-lg text-slate-400 line-through">{formatBDT(product.basePrice)}</span>
            )}
            {matchedVariant?.salePrice != null && matchedVariant.price != null && (
              <span className="text-lg text-slate-400 line-through">{formatBDT(matchedVariant.price)}</span>
            )}
            {product.salePrice != null && (
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                On Sale
              </span>
            )}
          </div>

          {/* Options (Color / Size / etc.) */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-4">
              {product.options.map((opt) => {
                const isColor = ["color", "colour", "colors"].includes(opt.name.toLowerCase());
                return (
                  <div key={opt.id}>
                    <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                      {opt.name}
                      {selectedOptions[opt.id] && (
                        <span className="ml-2 normal-case font-medium text-slate-900">
                          — {selectedOptions[opt.id]}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((v) => {
                        const isSelected = selectedOptions[opt.id] === v.value;
                        if (isColor) {
                          return (
                            <button
                              key={v.id}
                              onClick={() => setSelectedOptions((p) => ({ ...p, [opt.id]: v.value }))}
                              className={cn(
                                "w-9 h-9 rounded-full transition-all ring-offset-2",
                                parseColor(v.value),
                                isSelected ? "ring-2 ring-slate-700 scale-110" : "hover:scale-105"
                              )}
                              title={v.value}
                            />
                          );
                        }
                        return (
                          <button
                            key={v.id}
                            onClick={() => setSelectedOptions((p) => ({ ...p, [opt.id]: v.value }))}
                            className={cn(
                              "px-4 py-1.5 rounded-full border text-sm font-medium transition-all",
                              isSelected
                                ? "border-slate-900 bg-slate-900 text-white shadow"
                                : "border-slate-300 text-slate-700 bg-white hover:border-slate-500"
                            )}
                          >
                            {v.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Variant + Stock Info */}
          {product.variants && product.variants.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-slate-500" />
                Inventory
              </p>
              {matchedVariant ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">SKU</span>
                    <span className="font-mono font-medium text-slate-800">{matchedVariant.sku}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Available</span>
                    <span
                      className={cn(
                        "font-bold",
                        availableStock === 0
                          ? "text-rose-600"
                          : (availableStock ?? 0) <= (product.lowStockThreshold ?? 10)
                            ? "text-amber-600"
                            : "text-emerald-600"
                      )}
                    >
                      {availableStock} units
                    </span>
                  </div>
                  {/* Stock bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        (availableStock ?? 0) === 0
                          ? "bg-rose-400"
                          : (availableStock ?? 0) <= (product.lowStockThreshold ?? 10)
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                      )}
                      style={{ width: `${Math.min(100, ((availableStock ?? 0) / Math.max((availableStock ?? 0) + 20, 50)) * 100)}%` }}
                    />
                  </div>
                  {(availableStock ?? 0) > 0 && (availableStock ?? 0) <= (product.lowStockThreshold ?? 10) && (
                    <p className="text-xs text-amber-600 font-medium">Only {availableStock} left — order soon!</p>
                  )}
                  {(availableStock ?? 0) === 0 && !product.allowBackorders && (
                    <p className="text-xs text-rose-600 font-medium">Out of stock</p>
                  )}
                  {(availableStock ?? 0) === 0 && product.allowBackorders && (
                    <p className="text-xs text-amber-600 font-medium">Out of stock — backorders accepted</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Select options above to see stock</p>
              )}
            </div>
          )}

          {/* Tabs */}
          <div>
            <div className="flex items-center gap-8 border-b border-slate-200">
              {(["description", "specification", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px",
                    activeTab === tab
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  {tab === "reviews" ? `Reviews (${product.totalReviews})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="py-5 min-h-[100px] text-slate-600 text-sm leading-relaxed">
              {activeTab === "description" && (
                <p className="whitespace-pre-wrap">{product.description || "No description provided."}</p>
              )}
              {activeTab === "specification" && (
                <div className="space-y-2">
                  {product.sku && (
                    <div className="flex gap-4"><span className="w-28 text-slate-400 shrink-0">SKU</span><span className="font-medium text-slate-800">{product.sku}</span></div>
                  )}
                  {product.weight && (
                    <div className="flex gap-4"><span className="w-28 text-slate-400 shrink-0">Weight</span><span className="font-medium text-slate-800">{product.weight} kg</span></div>
                  )}
                  {(product.length || product.width || product.height) && (
                    <div className="flex gap-4"><span className="w-28 text-slate-400 shrink-0">Dimensions</span><span className="font-medium text-slate-800">{product.length ?? 0} × {product.width ?? 0} × {product.height ?? 0} cm</span></div>
                  )}
                  {product.shippingClass && (
                    <div className="flex gap-4"><span className="w-28 text-slate-400 shrink-0">Shipping</span><span className="font-medium text-slate-800">{product.shippingClass}</span></div>
                  )}
                  {product.barcode && (
                    <div className="flex gap-4"><span className="w-28 text-slate-400 shrink-0">Barcode</span><span className="font-medium text-slate-800">{product.barcode}</span></div>
                  )}
                  {product.specifications?.map((s) => (
                    <div key={s.id} className="flex gap-4">
                      <span className="w-28 text-slate-400 shrink-0">{s.key}</span>
                      <span className="font-medium text-slate-800">{s.value}</span>
                    </div>
                  ))}
                  {!product.sku && !product.weight && !product.specifications?.length && (
                    <p className="text-slate-400 italic">No specifications available.</p>
                  )}
                </div>
              )}
              {activeTab === "reviews" && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-5 h-5",
                            i <= Math.round(product.averageRating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-slate-900">{product.averageRating.toFixed(1)}</span>
                    <span className="text-slate-500 text-sm">out of 5</span>
                  </div>
                  {product.totalReviews === 0 && (
                    <p className="text-slate-400 italic">No reviews yet. Be the first to review this product.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Grid */}
          <div className="space-y-3">
            {/* Row 1: Stock status / Price / Qty / Add to Cart */}
            <div className="grid grid-cols-4 gap-2">
              {/* Stock Status */}
              <div className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 h-16 px-2 text-center",
                inStock
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              )}>
                <Package className="w-4 h-4 mb-0.5" />
                <span className="text-xs font-bold leading-tight">{inStock ? "In Stock" : "Out of Stock"}</span>
              </div>

              {/* Price */}
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white h-16 px-2 text-center">
                <span className="text-[10px] text-slate-400 uppercase">Price</span>
                <span className="text-sm font-bold text-slate-900 leading-tight">{formatBDT(effectivePrice)}</span>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 h-16 col-span-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-900">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(maxQty, qty + 1))}
                  disabled={!inStock}
                  className="text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <AddToCartButton
                {...cartProps}
                unitPrice={effectivePrice}
                purchaseType="NEW"
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 h-16 text-center px-2 transition-colors text-xs font-bold",
                  inStock
                    ? "border-[#3c4a6e] bg-[#3c4a6e] text-white hover:bg-[#2d3856]"
                    : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                Add to<br />Cart
              </AddToCartButton>
            </div>

            {/* Row 2: Wishlist / Compare / Share / Rating */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleWishlist}
                disabled={wishLoading}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 h-16 transition-colors text-xs font-bold",
                  isInWishlist
                    ? "border-rose-400 bg-rose-50 text-rose-600"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600"
                )}
              >
                <Heart className={cn("w-4 h-4 mb-0.5", isInWishlist && "fill-rose-500")} />
                <span className="leading-tight">Add to<br />Wishlist</span>
              </button>

              <button className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white h-16 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700">
                <span className="leading-tight">Add to<br />Compare</span>
              </button>

              <button className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white h-16 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700">
                <Share2 className="w-4 h-4 mb-0.5" />
                <span className="leading-tight">Social<br />Sharing</span>
              </button>

              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white h-16 text-xs font-bold text-slate-700">
                <div className="flex mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={cn("w-3 h-3", i <= Math.round(product.averageRating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
                  ))}
                </div>
                <span className="leading-tight text-center">Customer<br />Rating</span>
              </div>
            </div>
          </div>

          {/* Purchase Mode Buttons */}
          {(product.allowRefurbished || product.allowRent || product.allowHirePurchase || product.allowPreOrder || true) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Purchase Options</p>
              <div className="flex flex-wrap gap-2">
                {/* Buy Brand New — always shown */}
                <AddToCartButton
                  {...cartProps}
                  unitPrice={effectivePrice}
                  purchaseType="NEW"
                  className="h-14 px-5 rounded-xl bg-[#3c4a6e] hover:bg-[#2d3856] text-white font-semibold text-xs transition-colors min-w-[100px] text-center leading-tight"
                >
                  Buy<br />Brand New
                </AddToCartButton>

                {product.allowRefurbished && (
                  <AddToCartButton
                    {...cartProps}
                    unitPrice={Math.round(effectivePrice * 0.7)}
                    purchaseType="REFURBISHED"
                    className="h-14 px-5 rounded-xl bg-[#3c4a6e] hover:bg-[#2d3856] text-white font-semibold text-xs transition-colors min-w-[100px] text-center leading-tight"
                  >
                    Buy<br />Refurbished
                  </AddToCartButton>
                )}

                {product.allowRent && (
                  <AddToCartButton
                    {...cartProps}
                    unitPrice={Math.round(effectivePrice * 0.1)}
                    purchaseType="RENT"
                    className="h-14 px-5 rounded-xl bg-[#3c4a6e] hover:bg-[#2d3856] text-white font-semibold text-xs transition-colors min-w-[100px] text-center leading-tight"
                  >
                    Rent<br />Now
                  </AddToCartButton>
                )}

                {product.allowHirePurchase && (
                  <AddToCartButton
                    {...cartProps}
                    unitPrice={Math.round(effectivePrice / 12)}
                    purchaseType="HIRE_PURCHASE"
                    className="h-14 px-5 rounded-xl bg-[#3c4a6e] hover:bg-[#2d3856] text-white font-semibold text-xs transition-colors min-w-[100px] text-center leading-tight"
                  >
                    Hire<br />Purchase
                  </AddToCartButton>
                )}

                {product.allowPreOrder && (
                  <AddToCartButton
                    {...cartProps}
                    unitPrice={effectivePrice}
                    purchaseType="PRE_ORDER"
                    className="h-14 px-5 rounded-xl bg-[#3c4a6e] hover:bg-[#2d3856] text-white font-semibold text-xs transition-colors min-w-[100px] text-center leading-tight"
                  >
                    Pre-<br />Order
                  </AddToCartButton>
                )}
              </div>
            </div>
          )}

          {/* Shipping note */}
          <div className="flex items-center gap-2 text-sm text-slate-500 border-t border-slate-100 pt-4">
            <Truck className="w-4 h-4 shrink-0" />
            <span>Free delivery on orders over ৳1,000 · Ships from Bangladesh</span>
          </div>
        </div>

        {/* ── RIGHT: Image Gallery ───────────────────────────────────── */}
        <div className="flex flex-col gap-4 sticky top-4">
          {/* Main Image */}
          <div
            className="relative w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden group cursor-crosshair"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onDoubleClick={handleDoubleClick}
          >
            {media[imgIdx]?.url ? (
              <>
                <Image
                  src={media[imgIdx].url}
                  alt={media[imgIdx].alt ?? product.name}
                  fill
                  className="object-cover transition-all duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />

                {/* Zoom Box Overlay */}
                {isZooming && (
                  <div
                    className="absolute pointer-events-none rounded-full bg-white z-20 w-[60px] h-[60px] lg:w-[140px] lg:h-[140px] shadow-[0_0_0_2000px_rgba(0,0,0,0.5),0_10px_30px_rgba(0,0,0,0.8)] ring-4 ring-white/50"
                    style={{
                      left: `${zoomPos.x}%`,
                      top: `${zoomPos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundImage: `url(${media[imgIdx].url})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: `${zoomLevel}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                <Package className="w-16 h-16" />
                <span className="mt-3 text-sm">No image available</span>
              </div>
            )}

            {media.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIdx((p) => (p - 1 + media.length) % media.length);
                  }}
                  onMouseEnter={() => setIsZooming(false)}
                  onMouseLeave={() => setIsZooming(true)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-30"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIdx((p) => (p + 1) % media.length);
                  }}
                  onMouseEnter={() => setIsZooming(false)}
                  onMouseLeave={() => setIsZooming(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-30"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </>
            )}

            {/* Sale badge */}
            {product.salePrice != null && (
              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                SALE
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {media.slice(0, 6).map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setImgIdx(i)}
                  className={cn(
                    "relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                    imgIdx === i ? "border-[#3c4a6e] shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  {m.url ? (
                    <Image src={m.url} alt={m.alt ?? `Image ${i + 1}`} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200" />
                  )}
                </button>
              ))}

              {/* Video placeholder like the screenshot */}
              {media.length >= 1 && (
                <button className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 border-transparent opacity-70 hover:opacity-100 group">
                  {media[0]?.url && (
                    <Image src={media[0].url} alt="Preview" fill className="object-cover grayscale" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <PlayCircle className="w-7 h-7 text-white drop-shadow" />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
