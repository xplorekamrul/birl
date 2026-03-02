"use client";

import { createProductComprehensive } from "@/actions/vendor/products/create-product-comprehensive";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productComprehensiveSchema, type ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import GeneralTab from "./tabs/GeneralTab";
import InventoryTab from "./tabs/InventoryTab";
import MediaTab from "./tabs/MediaTab";
import RelatedProductsTab from "./tabs/RelatedProductsTab";
import SeoTab from "./tabs/SeoTab";
import ShippingTab from "./tabs/ShippingTab";
import VariantsTab from "./tabs/VariantsTab";

type SimpleRef = { id: string; name: string; slug?: string; superCategoryId?: string };

type Props = {
  vendorId: string;
  superCategories: SimpleRef[];
  categories: SimpleRef[];
  brands: SimpleRef[];
  warehouses: SimpleRef[];
  tags: SimpleRef[];
  existingProducts: SimpleRef[];
};

const defaultValues: ProductComprehensiveValues = {
  name: "",
  slug: "",
  categoryId: "",
  superCategoryId: "",
  brandId: null,
  basePrice: "",
  salePrice: undefined,
  cost: undefined,
  productType: "SIMPLE",
  status: "DRAFT",
  visibility: "PUBLIC",
  sku: null,
  barcode: null,
  gtin: null,
  upc: null,
  ean: null,
  isbn: null,
  description: null,
  shortDescription: null,
  weight: "",
  length: "",
  width: "",
  height: "",
  shippingClass: "",
  stockManagement: true,
  allowBackorders: false,
  lowStockThreshold: "10",
  soldIndividually: false,
  allowRefurbished: false,
  allowRent: false,
  allowHirePurchase: false,
  allowPreOrder: false,
  scheduledPublish: "",
  media: [],
  options: [],
  variants: [],
  stocks: [],
  seo: {
    robotsSetting: "index, follow",
    includeSitemap: true,
  },
  relatedProducts: [],
  tags: [],
};

const TABS = [
  { id: "general", label: "General", icon: "📋" },
  { id: "media", label: "Media", icon: "🖼️" },
  { id: "variants", label: "Variants", icon: "🔄" },
  { id: "inventory", label: "Inventory", icon: "📦" },
  { id: "shipping", label: "Shipping", icon: "🚚" },
  { id: "seo", label: "SEO", icon: "🔍" },
  { id: "related", label: "Related", icon: "🔗" },
];

export default function ComprehensiveProductForm({
  vendorId,
  superCategories,
  categories,
  brands,
  warehouses,
  tags,
  existingProducts,
}: Props) {
  const router = useRouter();
  const { executeAsync, status } = useAction(createProductComprehensive);
  const [activeTab, setActiveTab] = useState("general");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(productComprehensiveSchema),
    defaultValues,
    mode: "onChange",
  });

  const { watch, formState: { errors, isValid } } = form;
  const formValues = watch();

  // Track required fields per tab
  const requiredFieldsByTab = useMemo(() => ({
    general: ["name", "slug", "categoryId", "basePrice", "productType"] as const,
    media: [] as const,
    variants: [] as const,
    inventory: [] as const,
    shipping: [] as const,
    seo: [] as const,
    related: [] as const,
  }), []);

  // Check which tabs have unfilled required fields
  const tabsWithErrors = useMemo(() => {
    const tabs = new Set<string>();
    const generalFields = ["name", "slug", "categoryId", "basePrice", "productType"];

    Object.keys(errors).forEach((field) => {
      if (generalFields.includes(field)) {
        tabs.add("general");
      }
    });
    return tabs;
  }, [errors]);

  const isSubmitting = status === "executing";

  async function onSubmit(values: ProductComprehensiveValues) {
    setFormError(null);
    setFormSuccess(null);

    try {
      const response = await executeAsync(values);
      const data = response?.data;

      if (data?.ok) {
        setFormSuccess(data.message);
        setTimeout(() => {
          router.push(`/vendor/products/${data.product.slug}`);
        }, 1000);
        return;
      }

      setFormError(data?.message || "Failed to create product");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "An error occurred");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Error/Success Alerts */}
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        {formSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{formSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.icon}</span>
                {tabsWithErrors.has(tab.id) && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <GeneralTab
              form={form as any}
              superCategories={superCategories}
              categories={categories}
              brands={brands}
            />
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <MediaTab form={form as any} />
          </TabsContent>

          <TabsContent value="variants" className="space-y-4">
            <VariantsTab form={form as any} />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <InventoryTab form={form as any} warehouses={warehouses} />
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <ShippingTab form={form as any} />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <SeoTab form={form as any} />
          </TabsContent>

          <TabsContent value="related" className="space-y-4">
            <RelatedProductsTab form={form as any} existingProducts={existingProducts} />
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="ml-auto"
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
