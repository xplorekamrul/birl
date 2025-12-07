"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ImageUploadField from "./ImageUploadField";

export interface CategoryFormData {
   name: string;
   slug: string;
   description: string;
   image: string;
   parentId: string;
   isActive: boolean;
   displayOrder: number;
}

interface CategoryFormProps {
   initialData?: Partial<CategoryFormData> & { id?: string };
   categories: Array<{ id: string; name: string }>;
   onSubmit: (data: CategoryFormData) => Promise<void>;
   onCancel?: () => void;
   submitLabel?: string;
   isLoading?: boolean;
}

export default function CategoryForm({
   initialData,
   categories,
   onSubmit,
   onCancel,
   submitLabel = "Save",
   isLoading = false,
}: CategoryFormProps) {
   const [formData, setFormData] = useState<CategoryFormData>({
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      image: initialData?.image || "",
      parentId: initialData?.parentId || "",
      isActive: initialData?.isActive ?? true,
      displayOrder: initialData?.displayOrder ?? 0,
   });

   // Auto-generate slug from name
   useEffect(() => {
      if (!initialData && formData.name && !formData.slug) {
         const autoSlug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
         setFormData((prev) => ({ ...prev, slug: autoSlug }));
      }
   }, [formData.name, formData.slug, initialData]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(formData);
   };

   const handleChange = (field: keyof CategoryFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
   };

   // Filter out current category from parent options
   const availableParents = categories.filter(
      (cat) => cat.id !== (initialData?.id || "")
   );

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
               <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
               </Label>
               <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Electronics"
                  required
                  disabled={isLoading}
               />
            </div>

            {/* Slug */}
            <div className="space-y-2">
               <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
               </Label>
               <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="electronics"
                  required
                  disabled={isLoading}
               />
            </div>
         </div>

         {/* Description */}
         <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
               id="description"
               value={formData.description}
               onChange={(e) => handleChange("description", e.target.value)}
               placeholder="Category description..."
               rows={3}
               disabled={isLoading}
            />
         </div>

         {/* Image */}
         <ImageUploadField
            value={formData.image}
            onChange={(url) => handleChange("image", url || "")}
            disabled={isLoading}
         />

         <div className="grid gap-4 md:grid-cols-2">
            {/* Parent Category */}
            <div className="space-y-2">
               <Label htmlFor="parentId">Parent Category</Label>
               <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) =>
                     handleChange("parentId", value === "none" ? "" : value)
                  }
                  disabled={isLoading}
               >
                  <SelectTrigger id="parentId">
                     <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                     <SelectItem value="none">None (Top Level)</SelectItem>
                     {availableParents.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                           {cat.name}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
               <Label htmlFor="displayOrder">Display Order</Label>
               <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) =>
                     handleChange("displayOrder", parseInt(e.target.value) || 0)
                  }
                  disabled={isLoading}
               />
            </div>
         </div>

         {/* Is Active */}
         <div className="flex items-center space-x-2">
            <Switch
               id="isActive"
               checked={formData.isActive}
               onCheckedChange={(checked) => handleChange("isActive", checked)}
               disabled={isLoading}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
               Active (visible to users)
            </Label>
         </div>

         {/* Actions */}
         <div className="flex gap-2 pt-4">
            {onCancel && (
               <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1"
               >
                  Cancel
               </Button>
            )}
            <Button
               type="submit"
               className="flex-1 bg-pcolor text-white"
               disabled={isLoading}
            >
               {isLoading ? (
                  <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Saving...
                  </>
               ) : (
                  submitLabel
               )}
            </Button>
         </div>
      </form>
   );
}
