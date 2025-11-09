"use client";

import type { FC } from "react";
import type { ProductCreateValues } from "@/lib/validations/product";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  form: ProductCreateValues;
  onChange: <K extends keyof ProductCreateValues>(
    key: K,
    value: ProductCreateValues[K]
  ) => void;
};

const SeoSection: FC<Props> = ({ form, onChange }) => {
  return (
    <Card className="border border-slate-200 shadow-sm bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
          SEO & search preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta title</Label>
            <Input
              id="metaTitle"
              placeholder="Title shown in search results"
              value={form.metaTitle ?? ""}
              onChange={(e) => onChange("metaTitle", e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Meta keywords</Label>
            <Input
              id="metaKeywords"
              placeholder="headphones, wireless, noise cancelling"
              value={form.metaKeywords ?? ""}
              onChange={(e) => onChange("metaKeywords", e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta description</Label>
          <Textarea
            id="metaDescription"
            rows={3}
            placeholder="Short snippet that appears under the title in search engines."
            value={form.metaDescription ?? ""}
            onChange={(e) => onChange("metaDescription", e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">
            Search preview
          </p>
          <p className="truncate text-[13px] text-blue-700">
            {form.metaTitle || form.name || "Your product title"}
          </p>
          <p className="text-xs text-green-700 truncate">
            birl-ecom.com/product/{form.slug || "slug-preview"}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">
            {form.metaDescription ||
              form.shortDescription ||
              "Your product description will appear here in search results."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeoSection;
