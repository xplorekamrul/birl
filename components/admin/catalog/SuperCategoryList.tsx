"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import SuperCategoryForm, { type SuperCategoryFormData } from "./SuperCategoryForm";

export interface SuperCategoryItem {
   id: string;
   name: string;
   slug: string;
   description?: string | null;
   image?: string | null;
   isActive: boolean;
   displayOrder: number;
}

interface SuperCategoryListProps {
   superCategories: SuperCategoryItem[];
   onUpdate: (id: string, data: SuperCategoryFormData) => Promise<void>;
   onDelete: (id: string) => Promise<void>;
   isUpdating: string | null;
   isDeleting: string | null;
}

export default function SuperCategoryList({
   superCategories,
   onUpdate,
   onDelete,
   isUpdating,
   isDeleting,
}: SuperCategoryListProps) {
   const [editingId, setEditingId] = useState<string | null>(null);

   if (superCategories.length === 0) {
      return (
         <div className="text-center py-8 text-slate-500">
            No super categories yet. Create one to get started.
         </div>
      );
   }

   return (
      <div className="space-y-3">
         {superCategories.map((sc) => (
            <div key={sc.id}>
               {editingId === sc.id ? (
                  <div className="border rounded-lg p-4 bg-slate-50">
                     <SuperCategoryForm
                        initialData={{
                           ...sc,
                           description: sc.description || "",
                           image: sc.image || "",
                        }}
                        onSubmit={async (data) => {
                           await onUpdate(sc.id, data);
                           setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Update"
                        isLoading={isUpdating === sc.id}
                     />
                  </div>
               ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition">
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           {sc.image && (
                              <img
                                 src={sc.image}
                                 alt={sc.name}
                                 className="h-10 w-10 rounded object-cover"
                              />
                           )}
                           <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{sc.name}</p>
                              <p className="text-xs text-slate-500 truncate">{sc.slug}</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 ml-2">
                        <span
                           className={`text-xs px-2 py-1 rounded ${sc.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                              }`}
                        >
                           {sc.isActive ? "Active" : "Inactive"}
                        </span>
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => setEditingId(sc.id)}
                           disabled={isUpdating === sc.id || isDeleting === sc.id}
                        >
                           <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => onDelete(sc.id)}
                           disabled={isDeleting === sc.id || isUpdating === sc.id}
                        >
                           <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                     </div>
                  </div>
               )}
            </div>
         ))}
      </div>
   );
}
