import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";

export const revalidate = 60;

export default async function ShopPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  const items = await prisma.product.findMany({
    where: { status: "ACTIVE", visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      basePrice: true, 
      salePrice: true, 
      shortDescription: true,
      brand: { select: { name: true } },
      vendor: { select: { shopName: true, shopSlug: true } },
      images: {
        take: 1,
        orderBy: { sortOrder: "asc" },
        select: { url: true },
      },
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold">Shop</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => {
          const basePriceNum = Number(p.basePrice); // convert Decimal -> number
          const salePriceNum = p.salePrice != null ? Number(p.salePrice) : null;
          const imageUrl = p.images[0]?.url ?? null;

          return (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                basePrice: basePriceNum,
                salePrice: salePriceNum,
                shortDescription: p.shortDescription ?? null,
                brand: p.brand ?? null,
                vendor: p.vendor ?? null,
                imageUrl,
              }}
              isAuthenticated={isAuthenticated}
            />
          );
        })}
      </div>
    </main>
  );
}
