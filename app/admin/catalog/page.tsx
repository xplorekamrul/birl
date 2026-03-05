import CatalogPageClient from "@/components/admin/catalog/CatalogPageClient";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { redirect } from "next/navigation";

// Separate cached data fetching function
async function getCatalogData() {
  "use cache";
  cacheLife("minutes");
  cacheTag("admin-catalog");

  const [superCategories, categories, brands] = await Promise.all([
    prisma.superCategory.findMany({
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        isActive: true,
        displayOrder: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
        superCategoryId: true,
        isActive: true,
        displayOrder: true,
      },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, logoUrl: true },
    }),
  ]);

  return { superCategories, categories, brands };
}

export default async function AdminCatalogPage() {
  // Auth check happens outside cache scope
  const session = await auth();
  const role = (session?.user as any)?.role as
    | "DEVELOPER"
    | "SUPER_ADMIN"
    | "ADMIN"
    | "USER"
    | "VENDOR"
    | undefined;

  if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "DEVELOPER")) {
    redirect("/login");
  }

  // Fetch cached data
  const { superCategories, categories, brands } = await getCatalogData();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-linear-to-b from-sky-50 to-sky-100/70 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Admin · Catalog
          </p>
          <h1 className="text-2xl font-semibold text-pcolor">
            Catalog Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage the taxonomy of your marketplace: super categories, categories, and brands that vendors use when creating products.
          </p>
        </header>

        <CatalogPageClient
          initialSuperCategories={superCategories}
          initialCategories={categories}
          initialBrands={brands}
        />
      </div>
    </div>
  );
}
