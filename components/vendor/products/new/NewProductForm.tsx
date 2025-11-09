"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { createProduct } from "@/actions/vendor/products/create-product";
import type { ProductCreateValues } from "@/lib/validations/product";

import { Separator } from "@/components/ui/separator";

import BasicInfoSection from "./sections/BasicInfoSection";
import DescriptionSection from "./sections/DescriptionSection";
import PricingInventorySection from "./sections/PricingInventorySection";
import SellingOptionsSection from "./sections/SellingOptionsSection";
import SeoSection from "./sections/SeoSection";
import FooterActionsBar from "./sections/FooterActionsBar";

type SimpleRef = { id: string; name: string };

type Props = {
  vendorId: string;
  categories: SimpleRef[];
  brands: SimpleRef[];
};

type FieldErrors = Partial<Record<keyof ProductCreateValues, string | undefined>>;

const defaultValues: ProductCreateValues = {
  name: "",
  slug: "",
  categoryId: "",
  brandId: undefined,
  basePrice: "",
  salePrice: undefined,
  cost: undefined,
  sku: "",
  barcode: "",
  lowStockThreshold: "10",
  description: "",
  shortDescription: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  allowRefurbished: false,
  allowRent: false,
  allowHirePurchase: false,
  allowPreOrder: false,
  status: "DRAFT",
  visibility: "PUBLIC",
};

function slugify(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewProductForm({
  categories: initialCategories,
  brands: initialBrands,
}: Props) {
  const router = useRouter();
  const { executeAsync, status, result } = useAction(createProduct);

  const [form, setForm] = useState<ProductCreateValues>(defaultValues);

  const [categories, setCategories] = useState<SimpleRef[]>(initialCategories);
  const [brands, setBrands] = useState<SimpleRef[]>(initialBrands);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fieldErrors: FieldErrors = useMemo(() => {
    const errs = (result?.validationErrors ?? {}) as Record<
      string,
      string[] | undefined
    >;
    const pick = (k: keyof ProductCreateValues) => errs?.[k]?.[0];
    return {
      name: pick("name"),
      slug: pick("slug"),
      categoryId: pick("categoryId"),
      basePrice: pick("basePrice"),
      salePrice: pick("salePrice"),
      cost: pick("cost"),
    };
  }, [result]);

  function handleChange<K extends keyof ProductCreateValues>(
    key: K,
    value: ProductCreateValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAutoSlug() {
    if (!form.name) return;
    handleChange("slug", slugify(form.name));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const payload: ProductCreateValues = {
      ...form,
      salePrice: (form.salePrice ?? "").toString(),
      cost: (form.cost ?? "").toString(),
    };

    const res = await executeAsync(payload);

    if (res?.data?.ok) {
      setFormSuccess(res.data.message ?? "Product created successfully");
      const slug = res.data.product.slug;
      setTimeout(() => {
        router.push(`/product/${slug}`);
      }, 500);
    } else {
      setFormError(
        res?.data?.message ??
          result?.serverError ??
          "Failed to create product. Please try again."
      );
    }
  }

  const isSubmitting = status === "executing";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <BasicInfoSection
        form={form}
        errors={fieldErrors}
        categories={categories}
        brands={brands}
        onChange={handleChange}
        onAutoSlug={handleAutoSlug}
        onCategoryCreated={(cat) => {
          setCategories((prev) => [...prev, cat]);
          handleChange("categoryId", cat.id);
        }}
        onBrandCreated={(brand) => {
          setBrands((prev) => [...prev, brand]);
          handleChange("brandId", brand.id);
        }}
      />

      <DescriptionSection form={form} onChange={handleChange} />
      <PricingInventorySection
        form={form}
        errors={fieldErrors}
        onChange={handleChange}
      />
      <SellingOptionsSection form={form} onChange={handleChange} />
      <SeoSection form={form} onChange={handleChange} />

      <Separator />

      <FooterActionsBar
        isSubmitting={isSubmitting}
        formError={formError}
        formSuccess={formSuccess}
        onCancel={() => router.back()}
      />
    </form>
  );
}
