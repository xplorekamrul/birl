"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeOff, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import CategoryForm, { type CategoryFormData } from "./CategoryForm";

export interface CategoryItem {
   id: string;
   name: string;
   slug: string;
   description?: string | null;
   image?: string | null;
   parentId?: string | null;
   isActive: boolean;
   displayOrder: number;
}

interface CategoryListProps {
   categories: CategoryItem[];
   onUpdate: (id: string, data: CategoryFormData) => Promise<void>;
   onDelete: (id: string) => Promise<void>;
   isUpdating: string | null;
   isDeleting: string | null;
}

export default function CategoryList({
   categories,
   onUpdate,
   onDelete,
   isUpdating,
   isDeleting,
}: CategoryListProps) {
   const [editingId, setEditingId] = useState<string | null>(null);

   const editingCategory = categories.find((c) => c.id === editingId);

   const handleUpdate = async (data: CategoryFormData) => {
      if (!editingId) return;
      await onUpdate(editingId, data);
      setEditingId(null);
   };

   const handleDelete = async (id: string) => {
      if (confirm("Are you sure you want to delete this category?")) {
         await onDelete(id);
      }
   };

   function LoaderIcon() {
      return (
         <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            aria-hidden="true"
         >
            <circle
               className="opacity-25"
               cx="12"
               cy="12"
               r="10"
               stroke="currentColor"
               strokeWidth="4"
            />
            <path
               className="opacity-75"
               fill="currentColor"
               d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
            />
         </svg>
      );
   }

   // Sort by displayOrder
   const sortedCategories = [...categories].sort(
      (a, b) => a.displayOrder - b.displayOrder
   );

   return (
      <>
         <div className="space-y-2">
            <div className="grid grid-cols-[auto_2fr_2fr_1fr_auto] gap-2 text-xs font-semibold text-slate-500 px-2">
               <span className="w-8"></span>
               <span>Name</span>
               <span>Slug</span>
               <span>Order</span>
               <span className="text-right w-24">Actions</span>
            </div>
            <Separator />

            {sortedCategories.length === 0 ? (
               <p className="text-sm text-gray-500 text-center py-8">
                  No categories yet. Click "Add Category" button above.
               </p>
            ) : (
               sortedCategories.map((cat) => {
                  const isLoading = isUpdating === cat.id || isDeleting === cat.id;
                  const parentCategory = categories.find((c) => c.id === cat.parentId);

                  return (
                     <div
                        key={cat.id}
                        className="grid grid-cols-[auto_2fr_2fr_1fr_auto] gap-2 items-center py-3 px-2 border-b border-border last:border-b-0 hover:bg-gray-50 transition"
                     >
                        {/* Image/Icon */}
                        <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                           {cat.image ? (
                              <img
                                 src={cat.image}
                                 alt={cat.name}
                                 className="w-full h-full object-cover"
                              />
                           ) : (
                              <span className="text-xs text-gray-400">No img</span>
                           )}
                        </div>

                        {/* Name */}
                        <div className="space-y-0.5">
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                 {cat.name}
                              </span>
                              {!cat.isActive && (
                                 <EyeOff className="h-3 w-3 text-gray-400" />
                              )}
                           </div>
                           {parentCategory && (
                              <span className="text-xs text-gray-500">
                                 Parent: {parentCategory.name}
                              </span>
                           )}
                        </div>

                        {/* Slug */}
                        <span className="truncate text-xs text-slate-500">
                           {cat.slug}
                        </span>

                        {/* Display Order */}
                        <span className="text-xs text-slate-500">
                           {cat.displayOrder}
                        </span>

                        {/* Actions */}
                        <div className="flex justify-end gap-1">
                           <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => setEditingId(cat.id)}
                              disabled={isLoading}
                           >
                              <Pencil className="h-3.5 w-3.5 text-slate-600" />
                              <span className="sr-only">Edit</span>
                           </Button>
                           <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(cat.id)}
                              disabled={isLoading}
                           >
                              {isDeleting === cat.id ? (
                                 <LoaderIcon />
                              ) : (
                                 <Trash2 className="h-3.5 w-3.5" />
                              )}
                              <span className="sr-only">Delete</span>
                           </Button>
                        </div>
                     </div>
                  );
               })
            )}
         </div>

         {/* Edit Dialog - Simple centered modal */}
         {editingId && editingCategory && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
               onClick={() => setEditingId(null)}
            >
               <div
                  className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
                  onClick={(e) => e.stopPropagation()}
               >
                  <button
                     onClick={() => setEditingId(null)}
                     className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                  >
                     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                     <span className="sr-only">Close</span>
                  </button>
                  <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
                  <CategoryForm
                     initialData={{
                        id: editingCategory.id,
                        name: editingCategory.name,
                        slug: editingCategory.slug,
                        description: editingCategory.description || "",
                        image: editingCategory.image || "",
                        parentId: editingCategory.parentId || "",
                        isActive: editingCategory.isActive,
                        displayOrder: editingCategory.displayOrder,
                     }}
                     categories={categories}
                     onSubmit={handleUpdate}
                     onCancel={() => setEditingId(null)}
                     submitLabel="Update"
                     isLoading={isUpdating === editingId}
                  />
               </div>
            </div>
         )}
      </>
   );
}
