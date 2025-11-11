import "server-only";
import { prisma } from "@/lib/prisma";

export async function getHomeData() {
  const now = new Date();

  const offers = await prisma.promotionalOffer.findMany({
    where: { active: true, startDate: { lte: now }, endDate: { gte: now } },
    orderBy: [{ priority: "desc" }, { startDate: "desc" }],
    take: 6,
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 10,
  });

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    take: 20,
  });

  // NOTE: include brand, vendor (VendorProfile), and first image for ProductCard
  const baseProductInclude = {
    include: {
      brand: { select: { name: true } },
      vendor: { select: { shopName: true, shopSlug: true } },
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
  } as const;

  const featuredProducts = await prisma.product.findMany({
    where: { status: "ACTIVE", visibility: "PUBLIC" },
    orderBy: { totalSales: "desc" },
    ...baseProductInclude,
    take: 12,
  });

  const deals = await prisma.product.findMany({
    where: { status: "ACTIVE", visibility: "PUBLIC", salePrice: { not: null } },
    orderBy: { updatedAt: "desc" },
    ...baseProductInclude,
    take: 12,
  });

  const vendors = await prisma.vendorProfile.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ averageRating: "desc" }, { totalOrders: "desc" }],
    select: { id: true, shopName: true, shopSlug: true, shopLogo: true, averageRating: true, totalOrders: true },
    take: 8,
  });

  return { offers, categories, brands, featuredProducts, deals, vendors };
}
