import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CatalogPageClient from "@/components/admin/catalog/CatalogPageClient";

export default async function AdminCatalogPage() {
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

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-linear-to-b from-sky-50 to-sky-100/70 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Admin · Catalog
          </p>
          <h1 className="text-2xl font-semibold text-pcolor">
            Categories & Brands
          </h1>
          <p className="text-sm text-slate-500">
            Manage the taxonomy of your marketplace: categories and brands that vendors use when creating products.
          </p>
        </header>

        <CatalogPageClient
          initialCategories={categories}
          initialBrands={brands}
        />
      </div>
    </div>
  );
}
