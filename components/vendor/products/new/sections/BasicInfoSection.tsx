"use client";

import type { ProductCreateValues } from "@/lib/validations/product";
import type { FC } from "react";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

import { Sparkles, ChevronsUpDown, Check, Plus } from "lucide-react";

import { quickCreateBrand } from "@/actions/vendor/catalog/quick-create-brand";
import { quickCreateCategory } from "@/actions/vendor/catalog/quick-create-category";

type SimpleRef = { id: string; name: string };
type FieldErrors = Partial<Record<keyof ProductCreateValues, string | undefined>>;

type Props = {
  form: ProductCreateValues;
  errors: FieldErrors;
  categories: SimpleRef[];
  brands: SimpleRef[];
  onChange: <K extends keyof ProductCreateValues>(
    key: K,
    value: ProductCreateValues[K]
  ) => void;
  onAutoSlug: () => void;
  onCategoryCreated: (cat: SimpleRef) => void;
  onBrandCreated: (brand: SimpleRef) => void;
};

const BasicInfoSection: FC<Props> = ({
  form,
  errors,
  categories,
  brands,
  onChange,
  onAutoSlug,
  onCategoryCreated,
  onBrandCreated,
}) => {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  const { executeAsync: createCategoryAction } = useAction(quickCreateCategory);
  const { executeAsync: createBrandAction } = useAction(quickCreateBrand);

  async function handleCreateCategoryFromSearch() {
    if (!categorySearch.trim()) return;
    const res = await createCategoryAction({ name: categorySearch.trim() });
    if (res?.data?.ok) {
      const c = res.data.category;
      onCategoryCreated({ id: c.id, name: c.name });
      setCategorySearch("");
      setCategoryOpen(false);
    }
  }

  async function handleCreateBrandFromSearch() {
    if (!brandSearch.trim()) return;
    const res = await createBrandAction({ name: brandSearch.trim() });
    if (res?.data?.ok) {
      const b = res.data.brand;
      onBrandCreated({ id: b.id, name: b.name });
      setBrandSearch("");
      setBrandOpen(false);
    }
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const selectedBrand = brands.find((b) => b.id === (form.brandId ?? ""));

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <Card className="border border-primary/10 shadow-sm backdrop-blur bg-white/80">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-lg text-pcolor">
            <Sparkles className="h-5 w-5 text-secondary" />
            Product overview
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Start with the essentials. You can fine-tune pricing, options, and
            SEO below.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-emerald-500/40 bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wide"
        >
          Vendor workspace
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            placeholder="e.g. Wireless Noise-Cancelling Headphones"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="bg-white"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="slug">Slug</Label>
            <button
              type="button"
              onClick={onAutoSlug}
              className="text-xs text-linkcolor hover:text-hcolor underline underline-offset-4"
            >
              Generate from name
            </button>
          </div>
          <Input
            id="slug"
            placeholder="wireless-noise-cancelling-headphones"
            value={form.slug}
            onChange={(e) => onChange("slug", e.target.value)}
            className="bg-white"
          />
          {errors.slug ? (
            <p className="text-xs text-destructive">{errors.slug}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Used in the product URL. Lowercase, numbers and hyphens only.
            </p>
          )}
        </div>

        {/* Category combobox */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm text-left"
              >
                <span className={selectedCategory ? "" : "text-muted-foreground"}>
                  {selectedCategory ? selectedCategory.name : "Select or create category"}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-slate-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search or type to create…"
                  value={categorySearch}
                  onValueChange={setCategorySearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {categorySearch ? (
                      <button
                        type="button"
                        className="flex w-full items-center justify-start gap-2 px-3 py-2 text-sm text-pcolor hover:bg-sky-50"
                        onClick={handleCreateCategoryFromSearch}
                      >
                        <Plus className="h-4 w-4" />
                        Create “{categorySearch}”
                      </button>
                    ) : (
                      "No category found."
                    )}
                  </CommandEmpty>
                  <CommandGroup heading="Existing categories">
                    {filteredCategories.map((cat) => (
                      <CommandItem
                        key={cat.id}
                        value={cat.name}
                        onSelect={() => {
                          onChange("categoryId", cat.id);
                          setCategoryOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            cat.id === form.categoryId
                              ? "opacity-100 text-emerald-500"
                              : "opacity-0"
                          }`}
                        />
                        {cat.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {categorySearch.trim() && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          value={`__create__${categorySearch}`}
                          onSelect={handleCreateCategoryFromSearch}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create “{categorySearch.trim()}”
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.categoryId && (
            <p className="text-xs text-destructive">{errors.categoryId}</p>
          )}
        </div>

        {/* Brand combobox */}
        <div className="space-y-2">
          <Label>Brand (optional)</Label>
          <Popover open={brandOpen} onOpenChange={setBrandOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm text-left"
              >
                <span className={selectedBrand ? "" : "text-muted-foreground"}>
                  {selectedBrand ? selectedBrand.name : "Select or create brand"}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-slate-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search or type to create…"
                  value={brandSearch}
                  onValueChange={setBrandSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {brandSearch ? (
                      <button
                        type="button"
                        className="flex w-full items-center justify-start gap-2 px-3 py-2 text-sm text-pcolor hover:bg-sky-50"
                        onClick={handleCreateBrandFromSearch}
                      >
                        <Plus className="h-4 w-4" />
                        Create “{brandSearch}”
                      </button>
                    ) : (
                      "No brand found."
                    )}
                  </CommandEmpty>
                  <CommandGroup heading="Existing brands">
                    {filteredBrands.map((brand) => (
                      <CommandItem
                        key={brand.id}
                        value={brand.name}
                        onSelect={() => {
                          onChange("brandId", brand.id);
                          setBrandOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            brand.id === form.brandId
                              ? "opacity-100 text-emerald-500"
                              : "opacity-0"
                          }`}
                        />
                        {brand.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {brandSearch.trim() && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          value={`__create__${brandSearch}`}
                          onSelect={handleCreateBrandFromSearch}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create “{brandSearch.trim()}”
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
