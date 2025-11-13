import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewProductForm from "@/components/vendor/products/new/NewProductForm";

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

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-linear-to-b from-sky-50 to-sky-100/70 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {vendorProfile?.shopName || "Vendor"} · New Product
            </p>
            <h1 className="text-2xl font-semibold text-pcolor">
              Add a new product
            </h1>
            <p className="text-sm text-slate-500">
              Create a detailed, high-converting product listing for your store.
            </p>
          </div>
        </header>

        <NewProductForm
          vendorId={vendorProfile.id}
          categories={categories}
          brands={brands}
        />
      </div>
    </div>
  );
}
