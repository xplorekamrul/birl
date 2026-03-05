"use client";

import { updateProductComprehensive } from "@/actions/vendor/products/update-product-comprehensive";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { productComprehensiveSchema, type ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
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
  initialData?: any;
  productId?: string;
};

const defaultValuesPlaceholder: ProductComprehensiveValues = {
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
    schemaType: "Product",
    priorityScore: 0.5,
    changeFrequency: "weekly",
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
  initialData,
  productId,
}: Props) {
  const router = useRouter();
  const { executeAsync, status } = useAction(updateProductComprehensive);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(productComprehensiveSchema),
    defaultValues: initialData || defaultValuesPlaceholder,
    mode: "onChange",
  });

  const { formState: { errors, isValid } } = form;

  const isLastTab = activeTabIndex === TABS.length - 1;
  const isFirstTab = activeTabIndex === 0;

  // Check which tab indices have errors
  const tabsWithErrors = useMemo(() => {
    const tabs = new Set<string>();
    const generalFields = ["name", "slug", "categoryId", "basePrice", "productType"];
    Object.keys(errors).forEach((field) => {
      if (generalFields.includes(field)) tabs.add("general");
    });
    return tabs;
  }, [errors]);

  const isSubmitting = status === "executing";

  function goToNext() {
    if (activeTabIndex < TABS.length - 1) {
      setActiveTabIndex((i) => i + 1);
    }
  }

  function goToPrev() {
    if (activeTabIndex > 0) {
      setActiveTabIndex((i) => i - 1);
    }
  }

  async function onSubmit(values: ProductComprehensiveValues) {
    setFormError(null);
    setFormSuccess(null);

    try {
      const response = await executeAsync({ ...values, id: productId });
      const data = response?.data;

      if (data?.ok) {
        setFormSuccess(data.message);
        setTimeout(() => {
          router.push(`/${data.product.slug}`);
        }, 1000);
        return;
      }

      setFormError(data?.message || "Failed to create product");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "An error occurred");
    }
  }

  const activeTab = TABS[activeTabIndex];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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

        {/* Stepper Header */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex items-center w-full justify-between px-1 py-2 min-w-[600px] md:min-w-0">
            {TABS.map((tab, index) => {
              const isActive = index === activeTabIndex;
              const isCompleted = index < activeTabIndex;
              const hasError = tabsWithErrors.has(tab.id);

              return (
                <div key={tab.id} className={`flex items-center ${index < TABS.length - 1 ? "flex-1" : ""}`}>
                  {/* Step Button */}
                  <button
                    type="button"
                    onClick={() => setActiveTabIndex(index)}
                    className={`
                      flex flex-col items-center gap-1 group cursor-pointer
                      transition-all duration-200 focus:outline-none
                    `}
                  >
                    {/* Circle */}
                    <div
                      className={`
                        relative flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold
                        border-2 transition-all duration-200
                        ${isActive
                          ? "bg-slate-900 border-slate-900 text-white shadow-md scale-110"
                          : isCompleted
                            ? "bg-slate-700 border-slate-700 text-white"
                            : "bg-white border-slate-300 text-slate-500 group-hover:border-slate-500 group-hover:text-slate-700"
                        }
                        ${hasError ? "border-red-500 bg-red-50 text-red-600" : ""}
                      `}
                    >
                      {hasError ? (
                        <span className="text-xs">!</span>
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`
                        text-xs font-medium whitespace-nowrap transition-colors duration-200
                        ${isActive ? "text-slate-900" : isCompleted ? "text-slate-600" : "text-slate-400 group-hover:text-slate-600"}
                        ${hasError ? "text-red-500" : ""}
                      `}
                    >
                      {tab.label}
                    </span>
                  </button>

                  {/* Connector Line */}
                  {index < TABS.length - 1 && (
                    <div
                      className={`
                        h-0.5 flex-1 mx-2 sm:mx-4 mb-5 rounded-full transition-colors duration-300
                        ${index < activeTabIndex ? "bg-slate-700" : "bg-slate-200"}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className="bg-slate-800 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((activeTabIndex + 1) / TABS.length) * 100}%` }}
          />
        </div>

        {/* Step Label */}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="font-medium text-slate-700">
            {activeTab.icon} {activeTab.label}
          </span>
          <span>
            Step {activeTabIndex + 1} of {TABS.length}
          </span>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab.id === "general" && (
            <GeneralTab
              form={form as any}
              superCategories={superCategories}
              categories={categories}
              brands={brands}
            />
          )}
          {activeTab.id === "media" && (
            <MediaTab form={form as any} />
          )}
          {activeTab.id === "variants" && (
            <VariantsTab form={form as any} />
          )}
          {activeTab.id === "inventory" && (
            <InventoryTab form={form as any} warehouses={warehouses} />
          )}
          {activeTab.id === "shipping" && (
            <ShippingTab form={form as any} />
          )}
          {activeTab.id === "seo" && (
            <SeoTab form={form as any} />
          )}
          {activeTab.id === "related" && (
            <RelatedProductsTab form={form as any} existingProducts={existingProducts} />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 border-t pt-6">
          {/* Cancel always on left */}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3 ml-auto">
            {/* Back Button (shown from step 2 onward) */}
            {!isFirstTab && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPrev}
                disabled={isSubmitting}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}

            {/* Continue or Create Product */}
            {isLastTab ? (
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="flex items-center gap-1"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goToNext}
                disabled={isSubmitting}
                className="flex items-center gap-1"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}