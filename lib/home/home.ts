// lib/home/home.ts
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import "server-only";

export async function getHomeData() {
  "use cache";
  cacheLife("hours");
  cacheTag("home-data");

  const now = new Date();

  // NOTE: include brand, vendor (VendorProfile), and first image for ProductCard
  const baseProductInclude = {
    include: {
      brand: { select: { name: true } },
      vendor: { select: { shopName: true, shopSlug: true } },
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
  } as const;

  // --- UPDATED ---
  // Run all queries concurrently using Promise.all
  const [offers, categories, brands, featuredProducts, deals, vendors] =
    await Promise.all([
      prisma.promotionalOffer.findMany({
        where: { active: true, startDate: { lte: now }, endDate: { gte: now } },
        orderBy: [{ priority: "desc" }, { startDate: "desc" }],
        take: 6,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        take: 10,
      }),
      prisma.brand.findMany({
        orderBy: { name: "asc" },
        take: 20,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", visibility: "PUBLIC" },
        orderBy: { totalSales: "desc" },
        ...baseProductInclude,
        take: 12,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", visibility: "PUBLIC", salePrice: { not: null } },
        orderBy: { updatedAt: "desc" },
        ...baseProductInclude,
        take: 12,
      }),
      prisma.vendorProfile.findMany({
        where: { status: "ACTIVE" },
        orderBy: [{ averageRating: "desc" }, { totalOrders: "desc" }],
        select: {
          id: true,
          shopName: true,
          shopSlug: true,
          shopLogo: true,
          averageRating: true,
          totalOrders: true,
        },
        take: 8,
      }),
    ]);
  // --- END UPDATE ---

  // Serialize Decimal types to numbers for client component compatibility
  return {
    offers,
    categories,
    brands,
    featuredProducts: featuredProducts.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      cost: p.cost ? Number(p.cost) : null,
      averageRating: p.averageRating ? Number(p.averageRating) : 0,
    })),
    deals: deals.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      cost: p.cost ? Number(p.cost) : null,
      averageRating: p.averageRating ? Number(p.averageRating) : 0,
    })),
    vendors: vendors.map((v) => ({
      ...v,
      averageRating: Number(v.averageRating ?? 0),
      totalOrders: Number(v.totalOrders ?? 0),
    })),
  };
}