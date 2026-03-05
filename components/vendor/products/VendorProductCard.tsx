"use client";

import { deleteProduct } from "@/actions/vendor/products/delete-product";
import { updateProductStatus } from "@/actions/vendor/products/update-status";
import ProductCard, { ProductCardData } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ProductStatus } from "@prisma/client";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type VendorProductCardData = ProductCardData & {
   status: ProductStatus;
};

export default function VendorProductCard({
   product,
   isAuthenticated,
}: {
   product: VendorProductCardData;
   isAuthenticated?: boolean;
}) {
   const [isPending, startTransition] = useTransition();

   const router = useRouter();

   const handleStatusChange = (newStatus: string) => {
      startTransition(async () => {
         const res = await updateProductStatus({
            id: product.id,
            status: newStatus as ProductStatus,
         });

         if (res?.data?.success) {
            alert(res.data.message);
            router.refresh();
         } else {
            alert("Failed to update status");
         }
      });
   };

   const handleDelete = () => {
      if (!confirm("Are you sure you want to delete this product?")) return;

      startTransition(async () => {
         const res = await deleteProduct({ id: product.id });
         if (res?.data?.success) {
            alert(res.data.message);
            router.refresh();
         } else {
            alert("Failed to delete product");
         }
      });
   };

   return (
      <div className="group relative">
         <ProductCard product={product} isAuthenticated={isAuthenticated} />

         {/* Top Left Status Badge */}
         <div className="absolute left-2 top-2 z-10 flex gap-2">
            <Badge variant="outline" className="bg-white/90 font-bold ">{product.status}</Badge>
         </div>

         {/* Top RIght Actions - visible on hover */}
         <div className="absolute right-2 top-2 z-10 flex flex-col gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">

            {/* Status Dropdown */}
            <div className="bg-white rounded-md shadow-sm">
               <Select
                  disabled={isPending}
                  value={product.status}
                  onValueChange={handleStatusChange}
               >
                  <SelectTrigger className="h-8 text-xs border-0 bg-transparent py-0 focus:ring-0">
                     <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="DRAFT">Draft</SelectItem>
                     <SelectItem value="ACTIVE">Active</SelectItem>
                     <SelectItem value="INACTIVE">Inactive</SelectItem>
                     <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
               </Select>
            </div>

            {/* Edit & Delete */}
            <div className="flex justify-end gap-1">
               <Link href={`/vendor/product/${product.id}/edit`}>
                  <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm">
                     <Edit2 className="h-4 w-4" />
                  </Button>
               </Link>
               <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 shadow-sm"
                  onClick={handleDelete}
                  disabled={isPending}
               >
                  <Trash2 className="h-4 w-4" />
               </Button>
            </div>

         </div>
      </div>
   );
}
