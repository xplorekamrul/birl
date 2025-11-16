import Link from "next/link";
import Image from "next/image";
import { Percent } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCardActions from "./ProductCardActions";
import { cn } from "@/lib/utils";

type MinimalBrand = { name: string };
type MinimalVendor = { shopName: string; shopSlug?: string };

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  salePrice?: number | null;
  shortDescription?: string | null;
  brand?: MinimalBrand | null;
  vendor?: MinimalVendor | null;
  imageUrl?: string | null;
  initialWished?: boolean;
};

function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function ProductCard({
  product,
  className,
  isAuthenticated = false,
}: {
  product: ProductCardData;
  className?: string;
  isAuthenticated?: boolean;
}) {
  const base = Number(product.basePrice || 0);
  const sale = product.salePrice != null ? Number(product.salePrice) : null;
  const hasSale = !!sale && sale > 0 && sale < base;
  const discountPct = hasSale ? Math.round(((base - (sale as number)) / base) * 100) : 0;
  const unitPrice = hasSale ? (sale as number) : base;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-slate-200/80 bg-white/80 backdrop-blur transition-shadow hover:shadow-lg",
        className
      )}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-slate-50 to-slate-200 text-slate-400">
              <span className="text-xs">No image</span>
            </div>
          )}

          {hasSale ? (
            <Badge className="absolute left-2 top-2 bg-emerald-600 text-white shadow">
              <Percent className="mr-1 h-3 w-3" />
              -{discountPct}%
            </Badge>
          ) : null}
        </div>
      </Link>

      <CardHeader className="space-y-1 pb-0">
        <div className="flex items-center gap-2">
          {product.brand?.name ? (
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {product.brand.name}
            </p>
          ) : null}
          {product.vendor?.shopName ? (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
              {product.vendor.shopName}
            </span>
          ) : null}
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-slate-900 hover:underline"
        >
          {product.name}
        </Link>
      </CardHeader>

      <CardContent className="mt-2 space-y-3">
        <div className="flex items-end gap-2">
          <span className={cn("text-base font-bold text-pcolor", hasSale && "text-emerald-700")}>
            {formatBDT(unitPrice)}
          </span>
          {hasSale ? (
            <span className="text-xs text-slate-500 line-through">
              {formatBDT(base)}
            </span>
          ) : null}
        </div>

        {product.shortDescription ? (
          <p className="line-clamp-2 text-xs text-slate-600">
            {product.shortDescription}
          </p>
        ) : null}

        <ProductCardActions
          productId={product.id}
          slug={product.slug}
          name={product.name}
          imageUrl={product.imageUrl}
          vendorName={product.vendor?.shopName}
          unitPrice={unitPrice}
          initialWished={product.initialWished}
          isAuthenticated={isAuthenticated}
        />
      </CardContent>
    </Card>
  );
}
