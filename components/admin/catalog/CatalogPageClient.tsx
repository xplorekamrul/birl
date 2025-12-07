"use client";

import {
  createBrand,
  deleteBrand,
  updateBrand,
} from "@/actions/admin/catalog/brand-actions";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/actions/admin/catalog/category-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import BrandTab from "./BrandTab";
import CategoryForm, { type CategoryFormData } from "./CategoryForm";
import CategoryList, { type CategoryItem } from "./CategoryList";

type BrandItem = { id: string; name: string; slug: string; logoUrl?: string | null };

type Props = {
  initialCategories: CategoryItem[];
  initialBrands: BrandItem[];
};

export default function CatalogPageClient({
  initialCategories,
  initialBrands,
}: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands);

  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [loadingCreateCategory, setLoadingCreateCategory] = useState(false);
  const [loadingUpdateCategoryId, setLoadingUpdateCategoryId] = useState<string | null>(null);
  const [loadingDeleteCategoryId, setLoadingDeleteCategoryId] = useState<string | null>(null);

  const [loadingCreateBrand, setLoadingCreateBrand] = useState(false);
  const [loadingUpdateBrandId, setLoadingUpdateBrandId] = useState<string | null>(null);
  const [loadingDeleteBrandId, setLoadingDeleteBrandId] = useState<string | null>(null);

  const { executeAsync: createCatAction } = useAction(createCategory);
  const { executeAsync: updateCatAction } = useAction(updateCategory);
  const { executeAsync: deleteCatAction } = useAction(deleteCategory);

  const { executeAsync: createBrandAction } = useAction(createBrand);
  const { executeAsync: updateBrandAction } = useAction(updateBrand);
  const { executeAsync: deleteBrandAction } = useAction(deleteBrand);

  /* ----------------- CATEGORY HANDLERS ----------------- */

  async function handleCreateCategory(data: CategoryFormData) {
    setLoadingCreateCategory(true);
    try {
      const res = await createCatAction({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        parentId: data.parentId || null,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      });

      const result = res?.data;
      if (!result || !result.ok) return;

      const newCat: CategoryItem = {
        id: result.category.id,
        name: result.category.name,
        slug: result.category.slug,
        description: result.category.description,
        image: result.category.image,
        parentId: result.category.parentId,
        isActive: result.category.isActive,
        displayOrder: result.category.displayOrder,
      };

      setCategories((prev) => [...prev, newCat]);
      setShowAddCategoryDialog(false);
    } finally {
      setLoadingCreateCategory(false);
    }
  }

  async function handleUpdateCategory(id: string, data: CategoryFormData) {
    setLoadingUpdateCategoryId(id);
    try {
      const res = await updateCatAction({
        id,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        parentId: data.parentId || null,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      });

      const result = res?.data;
      if (!result || !result.ok) return;

      const updated: CategoryItem = {
        id: result.category.id,
        name: result.category.name,
        slug: result.category.slug,
        description: result.category.description,
        image: result.category.image,
        parentId: result.category.parentId,
        isActive: result.category.isActive,
        displayOrder: result.category.displayOrder,
      };

      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } finally {
      setLoadingUpdateCategoryId(null);
    }
  }

  async function handleDeleteCategory(id: string) {
    setLoadingDeleteCategoryId(id);
    try {
      const res = await deleteCatAction({ id });
      const result = res?.data;
      if (!result || !result.ok) return;

      setCategories((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setLoadingDeleteCategoryId(null);
    }
  }

  /* ----------------- BRAND HANDLERS ----------------- */

  async function handleCreateBrand(data: { name: string; slug: string; logoUrl: string }) {
    setLoadingCreateBrand(true);
    try {
      const res = await createBrandAction({
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl || null,
      });

      const result = res?.data as any;
      if (!result || !("ok" in result) || !result.ok) return;

      const newBrand: BrandItem = {
        id: result.brand.id,
        name: result.brand.name,
        slug: result.brand.slug,
        logoUrl: result.brand.logoUrl,
      };

      setBrands((prev) => [...prev, newBrand]);
    } finally {
      setLoadingCreateBrand(false);
    }
  }

  async function handleUpdateBrand(id: string, data: { name: string; slug: string; logoUrl: string }) {
    setLoadingUpdateBrandId(id);
    try {
      const res = await updateBrandAction({
        id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl || null,
      });

      const result = res?.data as any;
      if (!result || !("ok" in result) || !result.ok) return;

      const updated: BrandItem = {
        id: result.brand.id,
        name: result.brand.name,
        slug: result.brand.slug,
        logoUrl: result.brand.logoUrl,
      };

      setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } finally {
      setLoadingUpdateBrandId(null);
    }
  }

  async function handleDeleteBrand(id: string) {
    setLoadingDeleteBrandId(id);
    try {
      const res = await deleteBrandAction({ id });
      const result = res?.data as any;
      if (!result || !("ok" in result) || !result.ok) return;

      setBrands((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setLoadingDeleteBrandId(null);
    }
  }

  /* ----------------- RENDER ----------------- */

  return (
    <Tabs defaultValue="categories">
      <TabsList className="bg-white/80">
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="brands">Brands</TabsTrigger>
      </TabsList>

      {/* Categories tab */}
      <TabsContent value="categories" className="mt-4 space-y-4">
        <Card className="bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-pcolor">All Categories</CardTitle>
            <Button
              onClick={() => setShowAddCategoryDialog(true)}
              className="bg-pcolor text-white"
            >
              <span className="text-lg mr-1">+</span> Add Category
            </Button>
          </CardHeader>
          <CardContent>
            <CategoryList
              categories={categories}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory}
              isUpdating={loadingUpdateCategoryId}
              isDeleting={loadingDeleteCategoryId}
            />
          </CardContent>
        </Card>

        {/* Add Category Dialog - Simple centered modal */}
        {showAddCategoryDialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowAddCategoryDialog(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAddCategoryDialog(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="sr-only">Close</span>
              </button>
              <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
              <CategoryForm
                categories={categories}
                onSubmit={handleCreateCategory}
                onCancel={() => setShowAddCategoryDialog(false)}
                submitLabel="Add Category"
                isLoading={loadingCreateCategory}
              />
            </div>
          </div>
        )}
      </TabsContent>

      {/* Brands tab */}
      <TabsContent value="brands" className="mt-4 space-y-4">
        <BrandTab
          brands={brands}
          setBrands={setBrands}
          onCreateBrand={handleCreateBrand}
          onUpdateBrand={handleUpdateBrand}
          onDeleteBrand={handleDeleteBrand}
          loadingCreateBrand={loadingCreateBrand}
          loadingUpdateBrandId={loadingUpdateBrandId}
          loadingDeleteBrandId={loadingDeleteBrandId}
        />
      </TabsContent>
    </Tabs>
  );
}
