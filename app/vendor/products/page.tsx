import { Button } from "@/components/ui/button";
import VendorProductCard from "@/components/vendor/products/VendorProductCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VendorProductsPage(props: {
   searchParams: Promise<{ page?: string }>;
}) {
   const searchParams = await props.searchParams;
   const session = await auth();

   if (!session?.user) {
      redirect("/login");
   }

   const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
   });

   if (!vendorProfile) {
      redirect("/vendor/setup");
   }

   const currentPage = Number(searchParams?.page) || 1;
   const pageSize = 12;

   const [totalProducts, products] = await Promise.all([
      prisma.product.count({
         where: { vendorId: vendorProfile.id },
      }),
      prisma.product.findMany({
         where: { vendorId: vendorProfile.id },
         orderBy: { createdAt: "desc" },
         skip: (currentPage - 1) * pageSize,
         take: pageSize,
         select: {
            id: true,
            slug: true,
            name: true,
            basePrice: true,
            salePrice: true,
            shortDescription: true,
            status: true,
            brand: { select: { name: true } },
            vendor: { select: { shopName: true, shopSlug: true } },
            media: {
               take: 1,
               orderBy: { sortOrder: "asc" },
               select: { url: true },
            },
         },
      }),
   ]);

   const totalPages = Math.ceil(totalProducts / pageSize);

   return (
      <div className="mx-auto max-w-7xl px-4 py-6">
         <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">My Products</h1>
            <Link href="/vendor/products/new">
               <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Product
               </Button>
            </Link>
         </div>

         {products.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
               <p>You haven't added any products yet.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
               {products.map((p) => {
                  const basePriceNum = Number(p.basePrice);
                  const salePriceNum = p.salePrice != null ? Number(p.salePrice) : null;
                  const imageUrl = p.media[0]?.url ?? null;

                  return (
                     <VendorProductCard
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
                           status: p.status,
                        }}
                        isAuthenticated={true}
                     />
                  );
               })}
            </div>
         )}

         {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
               {currentPage > 1 && (
                  <Link href={`/vendor/products?page=${currentPage - 1}`}>
                     <Button variant="outline">Previous</Button>
                  </Link>
               )}

               <div className="flex items-center gap-2 px-2">
                  Page {currentPage} of {totalPages}
               </div>

               {currentPage < totalPages && (
                  <Link href={`/vendor/products?page=${currentPage + 1}`}>
                     <Button variant="outline">Next</Button>
                  </Link>
               )}
            </div>
         )}
      </div>
   );
}
