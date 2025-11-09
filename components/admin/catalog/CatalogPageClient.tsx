"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/actions/admin/catalog/brand-actions";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/admin/catalog/category-actions";
import { Pencil, Trash2 } from "lucide-react";

type SimpleItem = { id: string; name: string; slug: string };

type Props = {
  initialCategories: SimpleItem[];
  initialBrands: SimpleItem[];
};

export default function CatalogPageClient({
  initialCategories,
  initialBrands,
}: Props) {
  const [categories, setCategories] = useState<SimpleItem[]>(initialCategories);
  const [brands, setBrands] = useState<SimpleItem[]>(initialBrands);

  const [catForm, setCatForm] = useState({ name: "", slug: "" });
  const [brandForm, setBrandForm] = useState({ name: "", slug: "" });

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  // loading states
  const [loadingCreateCategory, setLoadingCreateCategory] = useState(false);
  const [loadingCreateBrand, setLoadingCreateBrand] = useState(false);
  const [loadingUpdateCategoryId, setLoadingUpdateCategoryId] = useState<
    string | null
  >(null);
  const [loadingUpdateBrandId, setLoadingUpdateBrandId] = useState<
    string | null
  >(null);
  const [loadingDeleteCategoryId, setLoadingDeleteCategoryId] = useState<
    string | null
  >(null);
  const [loadingDeleteBrandId, setLoadingDeleteBrandId] = useState<
    string | null
  >(null);

  const { executeAsync: createCatAction } = useAction(createCategory);
  const { executeAsync: updateCatAction } = useAction(updateCategory);
  const { executeAsync: deleteCatAction } = useAction(deleteCategory);

  const { executeAsync: createBrandAction } = useAction(createBrand);
  const { executeAsync: updateBrandAction } = useAction(updateBrand);
  const { executeAsync: deleteBrandAction } = useAction(deleteBrand);

  /* ----------------- CATEGORY HANDLERS ----------------- */

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    setLoadingCreateCategory(true);
    try {
      const res = await createCatAction({
        name: catForm.name,
        slug: catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, "-"),
      });

      const data = res?.data;
      if (!data || !data.ok) return;

      const newCat: SimpleItem = {
        id: data.category.id,
        name: data.category.name,
        slug: data.category.slug,
      };

      setCategories((prev) => [...prev, newCat]);
      setCatForm({ name: "", slug: "" });
    } finally {
      setLoadingCreateCategory(false);
    }
  }

  async function handleUpdateCategory(item: SimpleItem) {
    setLoadingUpdateCategoryId(item.id);
    try {
      const res = await updateCatAction({
        id: item.id,
        name: item.name,
        slug: item.slug,
        parentId: null, // adjust when you implement parent logic
      });

      const data = res?.data;
      if (!data || !data.ok) return;

      const updated: SimpleItem = {
        id: data.category.id,
        name: data.category.name,
        slug: data.category.slug,
      };

      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setEditingCategoryId(null);
    } finally {
      setLoadingUpdateCategoryId(null);
    }
  }

  async function handleDeleteCategory(id: string) {
    setLoadingDeleteCategoryId(id);
    try {
      const res = await deleteCatAction({ id });

      const data = res?.data;
      if (!data || !data.ok) return;

      setCategories((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setLoadingDeleteCategoryId(null);
    }
  }

  /* ----------------- BRAND HANDLERS ----------------- */

  async function handleCreateBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!brandForm.name.trim()) return;

    setLoadingCreateBrand(true);
    try {
      const res = await createBrandAction({
        name: brandForm.name,
        slug: brandForm.slug || brandForm.name.toLowerCase().replace(/\s+/g, "-"),
      });

      const data = res?.data;
      if (!data || !data.ok) return;

      const newBrand: SimpleItem = {
        id: data.brand.id,
        name: data.brand.name,
        slug: data.brand.slug,
      };

      setBrands((prev) => [...prev, newBrand]);
      setBrandForm({ name: "", slug: "" });
    } finally {
      setLoadingCreateBrand(false);
    }
  }

  async function handleUpdateBrand(item: SimpleItem) {
    setLoadingUpdateBrandId(item.id);
    try {
      const res = await updateBrandAction({
        id: item.id,
        name: item.name,
        slug: item.slug,
      });

      const data = res?.data;
      if (!data || !data.ok) return;

      const updated: SimpleItem = {
        id: data.brand.id,
        name: data.brand.name,
        slug: data.brand.slug,
      };

      setBrands((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      setEditingBrandId(null);
    } finally {
      setLoadingUpdateBrandId(null);
    }
  }

  async function handleDeleteBrand(id: string) {
    setLoadingDeleteBrandId(id);
    try {
      const res = await deleteBrandAction({ id });

      const data = res?.data;
      if (!data || !data.ok) return;

      setBrands((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setLoadingDeleteBrandId(null);
    }
  }

  /* ----------------- SHARED LOADER UI ----------------- */

  function LoaderIcon() {
    return (
      <svg
        className="mr-1 h-4 w-4 animate-spin"
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
          <CardHeader>
            <CardTitle className="text-sm text-pcolor">Add category</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateCategory}
              className="grid gap-3 md:grid-cols-[2fr_2fr_auto]"
            >
              <div className="space-y-1">
                <Label htmlFor="catName">Name</Label>
                <Input
                  id="catName"
                  value={catForm.name}
                  onChange={(e) =>
                    setCatForm((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Electronics"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="catSlug">Slug</Label>
                <Input
                  id="catSlug"
                  value={catForm.slug}
                  onChange={(e) =>
                    setCatForm((s) => ({ ...s, slug: e.target.value }))
                  }
                  placeholder="electronics"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full bg-pcolor text-white"
                  disabled={loadingCreateCategory}
                >
                  {loadingCreateCategory ? (
                    <span className="inline-flex items-center">
                      <LoaderIcon />
                      Adding…
                    </span>
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-sm text-pcolor">
              All categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-[2fr_2fr_auto] gap-2 text-xs font-semibold text-slate-500">
              <span>Name</span>
              <span>Slug</span>
              <span className="text-right">Actions</span>
            </div>
            <Separator />
            {categories.map((cat) => {
              const isEditing = editingCategoryId === cat.id;
              const isUpdating = loadingUpdateCategoryId === cat.id;
              const isDeleting = loadingDeleteCategoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="grid grid-cols-[2fr_2fr_auto] gap-2 items-center py-2 border-b border-border last:border-b-0"
                >
                  {isEditing ? (
                    <>
                      <Input
                        value={cat.name}
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((c) =>
                              c.id === cat.id
                                ? { ...c, name: e.target.value }
                                : c
                            )
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <Input
                        value={cat.slug}
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((c) =>
                              c.id === cat.id
                                ? { ...c, slug: e.target.value }
                                : c
                            )
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => setEditingCategoryId(null)}
                          disabled={isUpdating}
                        >
                          <span className="sr-only">Cancel</span>
                          ✕
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 px-2 text-xs bg-pcolor text-white"
                          onClick={() => handleUpdateCategory(cat)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <span className="inline-flex items-center">
                              <LoaderIcon />
                              Saving…
                            </span>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="truncate text-sm">{cat.name}</span>
                      <span className="truncate text-xs text-slate-500">
                        {cat.slug}
                      </span>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => setEditingCategoryId(cat.id)}
                          disabled={isDeleting}
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-600" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteCategory(cat.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <LoaderIcon />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Brands tab */}
      <TabsContent value="brands" className="mt-4 space-y-4">
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-sm text-pcolor">Add brand</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateBrand}
              className="grid gap-3 md:grid-cols-[2fr_2fr_auto]"
            >
              <div className="space-y-1">
                <Label htmlFor="brandName">Name</Label>
                <Input
                  id="brandName"
                  value={brandForm.name}
                  onChange={(e) =>
                    setBrandForm((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Apple"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="brandSlug">Slug</Label>
                <Input
                  id="brandSlug"
                  value={brandForm.slug}
                  onChange={(e) =>
                    setBrandForm((s) => ({ ...s, slug: e.target.value }))
                  }
                  placeholder="apple"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full bg-pcolor text-white"
                  disabled={loadingCreateBrand}
                >
                  {loadingCreateBrand ? (
                    <span className="inline-flex items-center">
                      <LoaderIcon />
                      Adding…
                    </span>
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-sm text-pcolor">All brands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-[2fr_2fr_auto] gap-2 text-xs font-semibold text-slate-500">
              <span>Name</span>
              <span>Slug</span>
              <span className="text-right">Actions</span>
            </div>
            <Separator />
            {brands.map((brand) => {
              const isEditing = editingBrandId === brand.id;
              const isUpdating = loadingUpdateBrandId === brand.id;
              const isDeleting = loadingDeleteBrandId === brand.id;

              return (
                <div
                  key={brand.id}
                  className="grid grid-cols-[2fr_2fr_auto] gap-2 items-center py-2 border-b border-border last:border-b-0"
                >
                  {isEditing ? (
                    <>
                      <Input
                        value={brand.name}
                        onChange={(e) =>
                          setBrands((prev) =>
                            prev.map((b) =>
                              b.id === brand.id
                                ? { ...b, name: e.target.value }
                                : b
                            )
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <Input
                        value={brand.slug}
                        onChange={(e) =>
                          setBrands((prev) =>
                            prev.map((b) =>
                              b.id === brand.id
                                ? { ...b, slug: e.target.value }
                                : b
                            )
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => setEditingBrandId(null)}
                          disabled={isUpdating}
                        >
                          <span className="sr-only">Cancel</span>
                          ✕
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 px-2 text-xs bg-pcolor text-white"
                          onClick={() => handleUpdateBrand(brand)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <span className="inline-flex items-center">
                              <LoaderIcon />
                              Saving…
                            </span>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="truncate text-sm">{brand.name}</span>
                      <span className="truncate text-xs text-slate-500">
                        {brand.slug}
                      </span>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => setEditingBrandId(brand.id)}
                          disabled={isDeleting}
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-600" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteBrand(brand.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <LoaderIcon />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
