"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { saveVendorProfile } from "@/actions/vendor/setup/save-vendor-profile";
import type { VendorSetupValues } from "@/lib/validations/vendor";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { Store, Globe2, Building2, Phone, MapPin } from "lucide-react";
import { VendorProfile } from "@/generated/prisma/client";

type Props = {
  initialVendor: VendorProfile | null;
};

type FieldErrors = Partial<Record<keyof VendorSetupValues, string | undefined>>;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function VendorSetupForm({ initialVendor }: Props) {
  const router = useRouter();
  const { executeAsync, status, result } = useAction(saveVendorProfile);

  const [form, setForm] = useState<VendorSetupValues>({
    shopName: initialVendor?.shopName ?? "",
    shopSlug: initialVendor?.shopSlug ?? "",
    shopDescription: initialVendor?.shopDescription ?? "",
    businessType: initialVendor?.businessType ?? "",
    businessRegistration: initialVendor?.businessRegistration ?? "",
    taxId: initialVendor?.taxId ?? "",
    businessEmail: initialVendor?.businessEmail ?? "",
    businessPhone: initialVendor?.businessPhone ?? "",
    businessAddress: initialVendor?.businessAddress ?? "",
    shopLogo: initialVendor?.shopLogo ?? "",
    shopBanner: initialVendor?.shopBanner ?? "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fieldErrors: FieldErrors = useMemo(() => {
    const errs = (result?.validationErrors ?? {}) as Record<
      string,
      string[] | undefined
    >;
    const pick = (k: keyof VendorSetupValues) => errs?.[k]?.[0];
    return {
      shopName: pick("shopName"),
      shopSlug: pick("shopSlug"),
      businessEmail: pick("businessEmail"),
    };
  }, [result]);

  function handleChange<K extends keyof VendorSetupValues>(
    key: K,
    value: VendorSetupValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAutoSlug() {
    if (!form.shopName) return;
    handleChange("shopSlug", slugify(form.shopName));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const res = await executeAsync(form);

    if (res?.data?.ok) {
      setFormSuccess(res.data.message ?? "Vendor profile saved.");
      // After setup, go to product upload
      setTimeout(() => {
        router.push("/vendor/products/new");
      }, 500);
    } else {
      setFormError(
        res?.data?.message ??
          result?.serverError ??
          "Failed to save vendor profile. Please try again."
      );
    }
  }

  const isSubmitting = status === "executing";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Shop basics */}
      <Card className="border border-primary/10 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-lg text-pcolor">
              <Store className="h-5 w-5 text-secondary" />
              Shop identity
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Choose a name and URL that represent your brand clearly.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wide"
          >
            Step 1 · Required
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop name</Label>
            <Input
              id="shopName"
              placeholder="e.g. Acme Electronics"
              value={form.shopName}
              onChange={(e) => handleChange("shopName", e.target.value)}
              className="bg-white"
            />
            {fieldErrors.shopName && (
              <p className="text-xs text-destructive">
                {fieldErrors.shopName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="shopSlug">Shop URL</Label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-xs text-linkcolor hover:text-hcolor underline underline-offset-4"
              >
                Generate
              </button>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-white px-2">
              <span className="text-xs text-slate-500">
                birl-ecom.com/shop/
              </span>
              <input
                id="shopSlug"
                value={form.shopSlug}
                onChange={(e) => handleChange("shopSlug", e.target.value)}
                className="flex-1 bg-transparent py-1 text-sm outline-none"
                placeholder="acme-electronics"
              />
            </div>
            {fieldErrors.shopSlug ? (
              <p className="text-xs text-destructive">
                {fieldErrors.shopSlug}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Lowercase, numbers and hyphens only. This becomes your public
                shop URL.
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shopDescription">Shop description</Label>
            <Textarea
              id="shopDescription"
              rows={4}
              placeholder="Briefly describe what you sell, your brand story, and what makes you unique."
              value={form.shopDescription ?? ""}
              onChange={(e) =>
                handleChange("shopDescription", e.target.value)
              }
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Business details */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
            <Building2 className="h-4 w-4 text-secondary" />
            Business information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessType">Business type</Label>
            <Input
              id="businessType"
              placeholder="e.g. Sole proprietorship, Limited company"
              value={form.businessType ?? ""}
              onChange={(e) =>
                handleChange("businessType", e.target.value)
              }
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessRegistration">
              Registration / license
            </Label>
            <Input
              id="businessRegistration"
              placeholder="Registration or trade license number"
              value={form.businessRegistration ?? ""}
              onChange={(e) =>
                handleChange("businessRegistration", e.target.value)
              }
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID (if applicable)</Label>
            <Input
              id="taxId"
              placeholder="TIN / VAT / Tax ID"
              value={form.taxId ?? ""}
              onChange={(e) => handleChange("taxId", e.target.value)}
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact & address */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
            <Phone className="h-4 w-4 text-secondary" />
            Contact & address
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business email</Label>
            <Input
              id="businessEmail"
              type="email"
              placeholder="support@yourshop.com"
              value={form.businessEmail ?? ""}
              onChange={(e) =>
                handleChange("businessEmail", e.target.value)
              }
              className="bg-white"
            />
            {fieldErrors.businessEmail && (
              <p className="text-xs text-destructive">
                {fieldErrors.businessEmail}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business phone</Label>
            <Input
              id="businessPhone"
              placeholder="+8801XXXXXXXXX"
              value={form.businessPhone ?? ""}
              onChange={(e) =>
                handleChange("businessPhone", e.target.value)
              }
              className="bg-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessAddress">Business address</Label>
            <div className="flex items-start gap-2">
              <MapPin className="mt-2 h-4 w-4 text-slate-400" />
              <Textarea
                id="businessAddress"
                rows={3}
                placeholder="Street, area, city, postal code, country"
                value={form.businessAddress ?? ""}
                onChange={(e) =>
                  handleChange("businessAddress", e.target.value)
                }
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding (simple text URLs for now) */}
      <Card className="border border-slate-200 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
            <Globe2 className="h-4 w-4 text-secondary" />
            Branding (optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shopLogo">Logo URL</Label>
            <Input
              id="shopLogo"
              placeholder="https://your-cdn.com/logo.png"
              value={form.shopLogo ?? ""}
              onChange={(e) => handleChange("shopLogo", e.target.value)}
              className="bg-white"
            />
            <p className="text-[11px] text-muted-foreground">
              You can connect your image storage later; for now, direct URLs
              work.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopBanner">Banner URL</Label>
            <Input
              id="shopBanner"
              placeholder="https://your-cdn.com/banner.png"
              value={form.shopBanner ?? ""}
              onChange={(e) => handleChange("shopBanner", e.target.value)}
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Footer actions */}
      <div className="sticky bottom-0 z-10 border-t border-slate-200/80 bg-linear-to-t from-white/95 to-white/80 backdrop-blur py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-1">
          <div className="flex flex-col text-xs text-muted-foreground">
            {formError && (
              <p className="text-destructive font-medium">{formError}</p>
            )}
            {formSuccess && (
              <p className="text-emerald-600 font-medium">{formSuccess}</p>
            )}
            {!formError && !formSuccess && (
              <p>
                Complete your shop details once. You can update them anytime
                from your vendor dashboard.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 text-slate-600 hover:bg-slate-100"
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-pcolor text-white hover:bg-pcolor/90 px-5"
            >
              {isSubmitting
                ? initialVendor
                  ? "Saving…"
                  : "Creating…"
                : initialVendor
                ? "Save changes"
                : "Create shop"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
