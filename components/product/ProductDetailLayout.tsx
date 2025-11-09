import type { ProductWithRelations } from "@/app/product/[slug]/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Star,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Store,
  Tag,
} from "lucide-react";

type Props = {
  product: ProductWithRelations;
};

function formatPrice(value: unknown, currency: "BDT" | "USD" | "EUR" = "BDT") {
  if (value == null) return "";
  const num = Number(value);
  const symbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : "৳";

  return `${symbol}${num.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getStatusBadge(status: ProductWithRelations["status"]) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
          In stock
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge className="bg-slate-100 text-slate-700 border-slate-300">
          Draft
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
          Inactive
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge className="bg-slate-200 text-slate-700 border-slate-400">
          Archived
        </Badge>
      );
    default:
      return null;
  }
}

export default function ProductDetailLayout({ product }: Props) {
  const hasSale = product.salePrice != null;
  const showPrice = hasSale ? product.salePrice : product.basePrice;

  const mainImage =
    product.images.find((img) => img.sortOrder === 0) ??
    product.images[0] ??
    null;

  const otherImages = product.images.filter(
    (img) => !mainImage || img.id !== mainImage.id
  );

  const rating = product.averageRating;
  const totalReviews = product.totalReviews;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="mb-2 text-xs text-slate-500">
        <ol className="flex items-center gap-1">
          <li>
            <a href="/" className="hover:text-pcolor">
              Home
            </a>
          </li>
          <li className="mx-1 text-slate-400">/</li>
          <li>
            <a
              href={`/category/${product.category.slug}`}
              className="hover:text-pcolor"
            >
              {product.category.name}
            </a>
          </li>
          <li className="mx-1 text-slate-400">/</li>
          <li className="text-slate-800 line-clamp-1">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-[10px] font-semibold uppercase tracking-wide text-pcolor"
          >
            Product detail
          </Badge>
          {product.brand ? (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-[10px] font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1"
            >
              <Tag className="h-3 w-3" />
              {product.brand.name}
            </Badge>
          ) : null}
          {getStatusBadge(product.status)}
        </div>

        <h1 className="text-2xl font-semibold text-pcolor md:text-3xl">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-slate-800">
              {rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{totalReviews} reviews</span>
          </div>

          <Separator orientation="vertical" className="h-4" />

          <div className="inline-flex items-center gap-1">
            <Store className="h-4 w-4 text-slate-400" />
            <a
              href={`/vendor/${product.vendor.shopSlug}`}
              className="font-medium text-pcolor hover:underline"
            >
              {product.vendor.shopName}
            </a>
            <span className="text-slate-400 text-[11px]">
              ({product.vendor.totalReviews} shop reviews)
            </span>
          </div>
        </div>
      </header>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Left: images */}
        <section className="space-y-3">
          <Card className="overflow-hidden border border-slate-200/70 bg-white/80">
            <CardContent className="p-4">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImage.url}
                  alt={mainImage.alt ?? product.name}
                  className="mx-auto aspect-square w-full max-w-md rounded-lg object-cover bg-slate-100"
                />
              ) : (
                <div className="flex aspect-square w-full max-w-md items-center justify-center rounded-lg bg-slate-100 text-slate-400 mx-auto">
                  No image
                </div>
              )}
            </CardContent>
          </Card>

          {otherImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {otherImages.slice(0, 4).map((img) => (
                <button
                  key={img.id}
                  type="button"
                  className="relative overflow-hidden rounded-md border border-slate-200 bg-white/70 hover:border-pcolor/40"
                >
                  {/* In future you can set mainImage on click with client state */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt ?? product.name}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {/* Right: buying section */}
        <section className="space-y-4">
          <Card className="border border-pcolor/10 bg-white/90 shadow-sm">
            <CardContent className="space-y-4 p-4">
              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-pcolor">
                    {formatPrice(showPrice)}
                  </p>
                  {hasSale ? (
                    <p className="text-sm text-slate-400 line-through">
                      {formatPrice(product.basePrice)}
                    </p>
                  ) : null}
                  {hasSale ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px] uppercase tracking-wide">
                      On sale
                    </Badge>
                  ) : null}
                </div>
                {product.shortDescription ? (
                  <p className="text-xs text-slate-500">
                    {product.shortDescription}
                  </p>
                ) : null}
              </div>

              <Separator />

              {/* Stock / small info */}
              <div className="grid gap-3 text-xs text-slate-600">
                <div className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4 text-slate-400" />
                  <span>Fast delivery across Bangladesh</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Secure payment & buyer protection</span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-2 pt-1">
                <Button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 bg-pcolor text-white hover:bg-pcolor/90"
                  // TODO: hook up add-to-cart action
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to cart
                </Button>
                <p className="text-[11px] text-slate-500 text-center">
                  Taxes & shipping calculated at checkout.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vendor card */}
          <Card className="border border-slate-200/80 bg-softsky/60 bg-sky-50/70">
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sold by
                </p>
                <a
                  href={`/vendor/${product.vendor.shopSlug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-pcolor hover:underline"
                >
                  <Store className="h-4 w-4 text-slate-500" />
                  {product.vendor.shopName}
                </a>
                <p className="text-[11px] text-slate-500">
                  {product.vendor.averageRating.toFixed(1)} seller rating ·{" "}
                  {product.vendor.totalReviews} reviews
                </p>
              </div>
              <a
                href={`/vendor/${product.vendor.shopSlug}`}
                className="text-xs text-linkcolor hover:text-pcolor underline underline-offset-4"
              >
                Visit shop
              </a>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Description / details */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="border border-slate-200/80 bg-white/90">
          <CardContent className="space-y-3 p-4">
            <h2 className="text-sm font-semibold text-pcolor">
              Product description
            </h2>
            {product.description ? (
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {product.description}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                No detailed description has been provided for this product yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90">
          <CardContent className="space-y-3 p-4 text-sm">
            <h2 className="text-sm font-semibold text-pcolor">
              Product information
            </h2>
            <dl className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-medium text-slate-800">
                  {product.category.name}
                </dd>
              </div>
              {product.brand ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Brand</dt>
                  <dd className="font-medium text-slate-800">
                    {product.brand.name}
                  </dd>
                </div>
              ) : null}
              {product.sku ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">SKU</dt>
                  <dd className="font-mono text-[11px] text-slate-800">
                    {product.sku}
                  </dd>
                </div>
              ) : null}
              {product.barcode ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Barcode</dt>
                  <dd className="font-mono text-[11px] text-slate-800">
                    {product.barcode}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Visibility</dt>
                <dd className="font-medium text-slate-800">
                  {product.visibility}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
