import ComprehensiveProductForm from "@/components/vendor/products/new/ComprehensiveProductForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function VendorNewProductPage() {
  const session = await auth();
  const role = (session?.user as any)?.role as
    | "DEVELOPER"
    | "SUPER_ADMIN"
    | "ADMIN"
    | "USER"
    | "VENDOR"
    | undefined;

  if (
    !session?.user ||
    (role !== "VENDOR" &&
      role !== "ADMIN" &&
      role !== "SUPER_ADMIN" &&
      role !== "DEVELOPER")
  ) {
    redirect("/login");
  }

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, shopName: true },
  });

  if (!vendorProfile) {
    redirect("/vendor/setup");
  }

  const [superCategories, categories, brands, warehouses, tags, existingProducts] = await Promise.all([
    prisma.superCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, superCategoryId: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.warehouse.findMany({
      where: { vendorId: vendorProfile.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { vendorId: vendorProfile.id },
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-linear-to-b from-sky-50 to-sky-100/70 px-4 py-2">
      <div className="mx-auto max-w-7xl space-y-6">

        <ComprehensiveProductForm
          vendorId={vendorProfile.id}
          superCategories={superCategories}
          categories={categories}
          brands={brands}
          warehouses={warehouses}
          tags={tags}
          existingProducts={existingProducts}
        />
      </div>
    </div>
  );
}
