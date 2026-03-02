"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

type SimpleRef = { id: string; name: string; slug?: string; superCategoryId?: string };

type Props = {
  form: UseFormReturn<ProductComprehensiveValues>;
  superCategories: SimpleRef[];
  categories: SimpleRef[];
  brands: SimpleRef[];
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function GeneralTab({
  form,
  superCategories,
  categories,
  brands,
}: Props) {
  const { watch, setValue } = form;
  const control = (form as any).control;
  const name = watch("name");
  const slug = watch("slug");
  const superCategoryId = watch("superCategoryId");

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !slug) {
      setValue("slug", slugify(name));
    }
  }, [name, slug, setValue]);

  // Filter categories by super category
  const filteredCategories = superCategoryId
    ? categories.filter((cat) => cat.superCategoryId === superCategoryId)
    : categories;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Basic product details and categorization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., iPhone 15 Pro Max" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slug */}
          <FormField
            control={control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug *</FormLabel>
                <FormControl>
                  <Input placeholder="auto-generated from name" {...field} />
                </FormControl>
                <FormDescription>URL-friendly identifier</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Super Category */}
          <FormField
            control={control}
            name="superCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Super Category</FormLabel>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select super category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {superCategories.map((sc) => (
                      <SelectItem key={sc.id} value={sc.id}>
                        {sc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Brand */}
          <FormField
            control={control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set product prices in BDT</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Price */}
          <FormField
            control={control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price (BDT) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sale Price */}
          <FormField
            control={control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price (BDT)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" step="0.01" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>Leave empty if no sale</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cost */}
          <FormField
            control={control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost (BDT)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" step="0.01" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>Internal cost tracking</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Type & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Type */}
          <FormField
            control={control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SIMPLE">Simple</SelectItem>
                    <SelectItem value="VARIABLE">Variable (with options)</SelectItem>
                    <SelectItem value="DIGITAL">Digital</SelectItem>
                    <SelectItem value="VIRTUAL">Virtual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visibility */}
          <FormField
            control={control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="HIDDEN">Hidden</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identification</CardTitle>
          <CardDescription>Optional product identifiers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SKU */}
          <FormField
            control={control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., SKU-001" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Barcode */}
          <FormField
            control={control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 123456789" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* GTIN */}
          <FormField
            control={control}
            name="gtin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GTIN</FormLabel>
                <FormControl>
                  <Input placeholder="Global Trade Item Number" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
