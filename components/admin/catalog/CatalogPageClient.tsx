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
import {
  createSuperCategory,
  deleteSuperCategory,
  updateSuperCategory,
} from "@/actions/admin/catalog/super-category-actions";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import CatalogHierarchyView from "./CatalogHierarchyView";
import { type CategoryFormData } from "./CategoryForm";
import { type CategoryItem } from "./CategoryList";
import { type SuperCategoryFormData } from "./SuperCategoryForm";
import { type SuperCategoryItem } from "./SuperCategoryList";

type BrandItem = { id: string; name: string; slug: string; logoUrl?: string | null };

type Props = {
  initialSuperCategories: SuperCategoryItem[];
  initialCategories: CategoryItem[];
  initialBrands: BrandItem[];
};

export default function CatalogPageClient({
  initialSuperCategories,
  initialCategories,
  initialBrands,
}: Props) {
  const [superCategories, setSuperCategories] = useState<SuperCategoryItem[]>(initialSuperCategories);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands);

  const [loadingCreateSuperCategory, setLoadingCreateSuperCategory] = useState(false);
  const [loadingUpdateSuperCategoryId, setLoadingUpdateSuperCategoryId] = useState<string | null>(null);
  const [loadingDeleteSuperCategoryId, setLoadingDeleteSuperCategoryId] = useState<string | null>(null);

  const [loadingCreateCategory, setLoadingCreateCategory] = useState(false);
  const [loadingUpdateCategoryId, setLoadingUpdateCategoryId] = useState<string | null>(null);
  const [loadingDeleteCategoryId, setLoadingDeleteCategoryId] = useState<string | null>(null);

  const [loadingCreateBrand, setLoadingCreateBrand] = useState(false);
  const [loadingUpdateBrandId, setLoadingUpdateBrandId] = useState<string | null>(null);
  const [loadingDeleteBrandId, setLoadingDeleteBrandId] = useState<string | null>(null);

  const { executeAsync: createSuperCatAction } = useAction(createSuperCategory);
  const { executeAsync: updateSuperCatAction } = useAction(updateSuperCategory);
  const { executeAsync: deleteSuperCatAction } = useAction(deleteSuperCategory);

  const { executeAsync: createCatAction } = useAction(createCategory);
  const { executeAsync: updateCatAction } = useAction(updateCategory);
  const { executeAsync: deleteCatAction } = useAction(deleteCategory);

  const { executeAsync: createBrandAction } = useAction(createBrand);
  const { executeAsync: updateBrandAction } = useAction(updateBrand);
  const { executeAsync: deleteBrandAction } = useAction(deleteBrand);

  /* --------- SUPER CATEGORY HANDLERS --------- */

  async function handleCreateSuperCategory(data: SuperCategoryFormData) {
    setLoadingCreateSuperCategory(true);
    try {
      const res = await createSuperCatAction({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      });

      const result = res?.data;
      if (!result || !result.ok) return;

      setSuperCategories((prev) => [...prev, result.superCategory]);
    } finally {
      setLoadingCreateSuperCategory(false);
    }
  }

  async function handleUpdateSuperCategory(id: string, data: SuperCategoryFormData) {
    setLoadingUpdateSuperCategoryId(id);
    try {
      const res = await updateSuperCatAction({
        id,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      });

      const result = res?.data;
      if (!result || !result.ok) return;

      setSuperCategories((prev) => prev.map((sc) => (sc.id === id ? result.superCategory : sc)));
    } finally {
      setLoadingUpdateSuperCategoryId(null);
    }
  }

  async function handleDeleteSuperCategory(id: string) {
    setLoadingDeleteSuperCategoryId(id);
    try {
      const res = await deleteSuperCatAction({ id });
      const result = res?.data;
      if (!result || !result.ok) return;

      setSuperCategories((prev) => prev.filter((sc) => sc.id !== id));
    } finally {
      setLoadingDeleteSuperCategoryId(null);
    }
  }

  /* --------- CATEGORY HANDLERS --------- */

  async function handleCreateCategory(data: CategoryFormData) {
    setLoadingCreateCategory(true);
    try {
      const res = await createCatAction({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        parentId: data.parentId || null,
        superCategoryId: data.superCategoryId || undefined,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      });

      const result = res?.data;
      if (!result || !result.ok) return;

      setCategories((prev) => [...prev, result.category]);
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
        superCategoryId: data.superCategoryId || undefined,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      });

      const result = res?.data;
      if (!result || !result.ok) return;

      setCategories((prev) => prev.map((c) => (c.id === id ? result.category : c)));
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

  /* --------- BRAND HANDLERS --------- */

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

      setBrands((prev) => [...prev, result.brand]);
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

      setBrands((prev) => prev.map((b) => (b.id === id ? result.brand : b)));
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

  return (
    <CatalogHierarchyView
      superCategories={superCategories}
      categories={categories}
      brands={brands}
      onCreateSuperCategory={handleCreateSuperCategory}
      onUpdateSuperCategory={handleUpdateSuperCategory}
      onDeleteSuperCategory={handleDeleteSuperCategory}
      onCreateCategory={handleCreateCategory}
      onUpdateCategory={handleUpdateCategory}
      onDeleteCategory={handleDeleteCategory}
      onCreateBrand={handleCreateBrand}
      onUpdateBrand={handleUpdateBrand}
      onDeleteBrand={handleDeleteBrand}
      loadingCreateSuperCategory={loadingCreateSuperCategory}
      loadingUpdateSuperCategoryId={loadingUpdateSuperCategoryId}
      loadingDeleteSuperCategoryId={loadingDeleteSuperCategoryId}
      loadingCreateCategory={loadingCreateCategory}
      loadingUpdateCategoryId={loadingUpdateCategoryId}
      loadingDeleteCategoryId={loadingDeleteCategoryId}
      loadingCreateBrand={loadingCreateBrand}
      loadingUpdateBrandId={loadingUpdateBrandId}
      loadingDeleteBrandId={loadingDeleteBrandId}
    />
  );
}
