
import type { ProductCardData } from "@/components/product/ProductCard";

export function mapToProductCardData(p: any): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    basePrice: Number(p.basePrice ?? 0),
    salePrice: p.salePrice != null ? Number(p.salePrice) : null,
    shortDescription: p.shortDescription ?? null,
    brand: p.brand ? { name: p.brand.name } : null,
    vendor: p.vendor ? { shopName: p.vendor.shopName, shopSlug: p.vendor.shopSlug } : null,
    imageUrl: p.images?.[0]?.url ?? null,
    initialWished: false,
  };
}

export function mapProductsToCardData(arr: any[]): ProductCardData[] {
  return (arr ?? []).map(mapToProductCardData);
}