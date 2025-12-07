"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import BrandForm, { type BrandFormData } from "./BrandForm";
import BrandList, { type BrandItem } from "./BrandList";

interface BrandTabProps {
   brands: BrandItem[];
   setBrands: React.Dispatch<React.SetStateAction<BrandItem[]>>;
   onCreateBrand: (data: BrandFormData) => Promise<void>;
   onUpdateBrand: (id: string, data: BrandFormData) => Promise<void>;
   onDeleteBrand: (id: string) => Promise<void>;
   loadingCreateBrand: boolean;
   loadingUpdateBrandId: string | null;
   loadingDeleteBrandId: string | null;
}

export default function BrandTab({
   brands,
   onCreateBrand,
   onUpdateBrand,
   onDeleteBrand,
   loadingCreateBrand,
   loadingUpdateBrandId,
   loadingDeleteBrandId,
}: BrandTabProps) {
   const [showAddBrandDialog, setShowAddBrandDialog] = useState(false);

   const handleCreate = async (data: BrandFormData) => {
      await onCreateBrand(data);
      setShowAddBrandDialog(false);
   };

   return (
      <>
         <Card className="bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="text-sm text-pcolor">All Brands</CardTitle>
               <Button
                  onClick={() => setShowAddBrandDialog(true)}
                  className="bg-pcolor text-white"
               >
                  <span className="text-lg mr-1">+</span> Add Brand
               </Button>
            </CardHeader>
            <CardContent>
               <BrandList
                  brands={brands}
                  onUpdate={onUpdateBrand}
                  onDelete={onDeleteBrand}
                  isUpdating={loadingUpdateBrandId}
                  isDeleting={loadingDeleteBrandId}
               />
            </CardContent>
         </Card>

         {/* Add Brand Dialog - Simple centered modal */}
         {showAddBrandDialog && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
               onClick={() => setShowAddBrandDialog(false)}
            >
               <div
                  className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
                  onClick={(e) => e.stopPropagation()}
               >
                  <button
                     onClick={() => setShowAddBrandDialog(false)}
                     className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                  >
                     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                     <span className="sr-only">Close</span>
                  </button>
                  <h2 className="text-lg font-semibold mb-4">Add New Brand</h2>
                  <BrandForm
                     onSubmit={handleCreate}
                     onCancel={() => setShowAddBrandDialog(false)}
                     submitLabel="Add Brand"
                     isLoading={loadingCreateBrand}
                  />
               </div>
            </div>
         )}
      </>
   );
}
