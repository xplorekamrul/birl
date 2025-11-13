"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { createProductWithImages } from "@/actions/vendor/products/create-product-with-images";
import type { ProductCreateValues } from "@/lib/validations/product";

import { Separator } from "@/components/ui/separator";
import BasicInfoSection from "./sections/BasicInfoSection";
import DescriptionSection from "./sections/DescriptionSection";
import PricingInventorySection from "./sections/PricingInventorySection";
import SellingOptionsSection from "./sections/SellingOptionsSection";
import SeoSection from "./sections/SeoSection";
import FooterActionsBar from "./sections/FooterActionsBar";
import ImagesSection from "./sections/ImagesSection";

import {
  useDocumentUploader,
  type UploadResult,
} from "@/lib/media/uploadthing-upload";

type SimpleRef = { id: string; name: string };

type Props = {
  vendorId: string; // you can keep this if you want, even if not used in the action
  categories: SimpleRef[];
  brands: SimpleRef[];
};

type FieldErrors = Partial<
  Record<keyof ProductCreateValues, string | undefined>
>;

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

type SuccessPayload = {
  ok: true;
  message: string;
  product: { id: string; slug: string };
};

type ErrorPayload = {
  ok: false;
  message: string;
};

function isSuccess(data: unknown): data is SuccessPayload {
  if (typeof data !== "object" || data === null) return false;

  const maybe = data as {
    ok?: unknown;
    product?: { id?: unknown; slug?: unknown };
  };

  return (
    maybe.ok === true &&
    typeof maybe.product?.id === "string" &&
    typeof maybe.product.slug === "string"
  );
}

function extractErrorMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;

  const maybe = data as { message?: unknown };
  if (typeof maybe.message === "string") return maybe.message;

  return undefined;
}

// Local image type matches ImagesSection
type LocalImage = {
  id: string;
  file: File;
  previewUrl: string;
  alt?: string;
  isPrimary?: boolean;
};

export default function NewProductForm({
  vendorId, // currently unused in this file, but available if you want to show something
  categories: initialCategories,
  brands: initialBrands,
}: Props) {
  const router = useRouter();
  const { executeAsync, status, result } = useAction(createProductWithImages);

  const [form, setForm] = useState<ProductCreateValues>(defaultValues);
  const [images, setImages] = useState<LocalImage[]>([]);

  const [categories, setCategories] = useState<SimpleRef[]>(initialCategories);
  const [brands, setBrands] = useState<SimpleRef[]>(initialBrands);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fieldErrors: FieldErrors = useMemo(() => {
    const errs = (result?.validationErrors ?? {}) as Record<
      string,
      string[] | undefined
    >;

    const pick = (key: keyof ProductCreateValues) => {
      const value = errs[key];
      return value && value.length > 0 ? value[0] : undefined;
    };

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
    value: ProductCreateValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAutoSlug() {
    if (!form.name) return;
    handleChange("slug", slugify(form.name));
  }

  // Common UploadThing helper hook for this endpoint
  const { startUpload, isUploading } = useDocumentUploader("productImage");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      // 1) Upload all local files via UploadThing
      const files = images.map((img) => img.file);
      const uploaded = await startUpload(files);

      if (!uploaded) {
        throw new Error("Upload failed. No response from UploadThing.");
      }

      // 2) Map uploaded results back to local image metadata
      const imagesPayload = images.map((img, index) => {
        const uploadedFile = uploaded[index] as UploadResult | undefined;
        if (!uploadedFile) {
          throw new Error("Upload failed for one of the images.");
        }

        return {
          url: uploadedFile.url,
          alt: img.alt,
          isPrimary: img.isPrimary ?? false,
        };
      });

      // 3) Call Server Action with product + image URLs
      const payload: ProductCreateValues = {
        ...form,
        salePrice: (form.salePrice ?? "").toString(),
        cost: (form.cost ?? "").toString(),
      };

      // ❌ OLD (causes error):
      // const response = await executeAsync({
      //   vendorId,
      //   payload,
      //   images: imagesPayload,
      // });

      // ✅ NEW: only send what the action schema expects
      const response = await executeAsync({
        payload,
        images: imagesPayload,
      });

      const data = response?.data;

      if (isSuccess(data)) {
        setFormSuccess(data.message ?? "Product created successfully");
        router.push(`/product/${data.product.slug}`);
        return;
      }

      const messageFromData = extractErrorMessage(data);
      const messageFromResult = result?.serverError;
      const fallbackMessage =
        "Failed to create product. Please try again.";

      setFormError(messageFromData ?? messageFromResult ?? fallbackMessage);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload images. Please try again.";
      setFormError(message);
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

      {/* Images */}
      <ImagesSection value={images} onChange={setImages} />

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
        isSubmitting={isSubmitting || isUploading}
        formError={formError}
        formSuccess={formSuccess}
        onCancel={() => router.back()}
      />
    </form>
  );
}
