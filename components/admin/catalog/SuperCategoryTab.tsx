"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import SuperCategoryForm, { type SuperCategoryFormData } from "./SuperCategoryForm";
import SuperCategoryList, { type SuperCategoryItem } from "./SuperCategoryList";

interface SuperCategoryTabProps {
   superCategories: SuperCategoryItem[];
   setSuperCategories: (scs: SuperCategoryItem[]) => void;
   onCreateSuperCategory: (data: SuperCategoryFormData) => Promise<void>;
   onUpdateSuperCategory: (id: string, data: SuperCategoryFormData) => Promise<void>;
   onDeleteSuperCategory: (id: string) => Promise<void>;
   loadingCreateSuperCategory: boolean;
   loadingUpdateSuperCategoryId: string | null;
   loadingDeleteSuperCategoryId: string | null;
}

export default function SuperCategoryTab({
   superCategories,
   setSuperCategories,
   onCreateSuperCategory,
   onUpdateSuperCategory,
   onDeleteSuperCategory,
   loadingCreateSuperCategory,
   loadingUpdateSuperCategoryId,
   loadingDeleteSuperCategoryId,
}: SuperCategoryTabProps) {
   const [showAddDialog, setShowAddDialog] = useState(false);

   return (
      <div className="space-y-4">
         <Card className="bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="text-sm text-pcolor">All Super Categories</CardTitle>
               <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-pcolor text-white"
               >
                  <span className="text-lg mr-1">+</span> Add Super Category
               </Button>
            </CardHeader>
            <CardContent>
               <SuperCategoryList
                  superCategories={superCategories}
                  onUpdate={onUpdateSuperCategory}
                  onDelete={onDeleteSuperCategory}
                  isUpdating={loadingUpdateSuperCategoryId}
                  isDeleting={loadingDeleteSuperCategoryId}
               />
            </CardContent>
         </Card>

         {/* Add Super Category Dialog */}
         {showAddDialog && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
               onClick={() => setShowAddDialog(false)}
            >
               <div
                  className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
                  onClick={(e) => e.stopPropagation()}
               >
                  <button
                     onClick={() => setShowAddDialog(false)}
                     className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                  >
                     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                     <span className="sr-only">Close</span>
                  </button>
                  <h2 className="text-lg font-semibold mb-4">Add New Super Category</h2>
                  <SuperCategoryForm
                     onSubmit={async (data) => {
                        await onCreateSuperCategory(data);
                        setShowAddDialog(false);
                     }}
                     onCancel={() => setShowAddDialog(false)}
                     submitLabel="Add Super Category"
                     isLoading={loadingCreateSuperCategory}
                  />
               </div>
            </div>
         )}
      </div>
   );
}
