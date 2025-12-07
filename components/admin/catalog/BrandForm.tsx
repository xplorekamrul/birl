"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ImageUploadField from "./ImageUploadField";

export interface BrandFormData {
   name: string;
   slug: string;
   logoUrl: string;
}

interface BrandFormProps {
   initialData?: Partial<BrandFormData> & { id?: string };
   onSubmit: (data: BrandFormData) => Promise<void>;
   onCancel?: () => void;
   submitLabel?: string;
   isLoading?: boolean;
}

export default function BrandForm({
   initialData,
   onSubmit,
   onCancel,
   submitLabel = "Save",
   isLoading = false,
}: BrandFormProps) {
   const [formData, setFormData] = useState<BrandFormData>({
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      logoUrl: initialData?.logoUrl || "",
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

   const handleChange = (field: keyof BrandFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
   };

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
                  placeholder="Apple"
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
                  placeholder="apple"
                  required
                  disabled={isLoading}
               />
            </div>
         </div>

         {/* Logo */}
         <ImageUploadField
            value={formData.logoUrl}
            onChange={(url) => handleChange("logoUrl", url || "")}
            label="Logo"
            disabled={isLoading}
         />

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
