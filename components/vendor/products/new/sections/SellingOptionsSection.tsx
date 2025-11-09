"use client";

import type { FC } from "react";
import type { ProductCreateValues } from "@/lib/validations/product";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Rocket } from "lucide-react";

type Props = {
  form: ProductCreateValues;
  onChange: <K extends keyof ProductCreateValues>(
    key: K,
    value: ProductCreateValues[K]
  ) => void;
};

const SellingOptionsSection: FC<Props> = ({ form, onChange }) => {
  return (
    <Card className="border border-emerald-100 shadow-sm bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
          <Rocket className="h-4 w-4 text-emerald-500" />
          Selling options & visibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selling options */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Selling options
            </p>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Refurbished</p>
                <p className="text-xs text-muted-foreground">
                  Allow refurbished units of this product.
                </p>
              </div>
              <Switch
                checked={!!form.allowRefurbished}
                onCheckedChange={(v) => onChange("allowRefurbished", v)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Rental</p>
                <p className="text-xs text-muted-foreground">
                  Offer this product as a rental.
                </p>
              </div>
              <Switch
                checked={!!form.allowRent}
                onCheckedChange={(v) => onChange("allowRent", v)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Financing & pre-order
            </p>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Hire purchase</p>
                <p className="text-xs text-muted-foreground">
                  Enable installment / hire purchase options.
                </p>
              </div>
              <Switch
                checked={!!form.allowHirePurchase}
                onCheckedChange={(v) => onChange("allowHirePurchase", v)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Pre-order</p>
                <p className="text-xs text-muted-foreground">
                  Allow customers to order before stock arrives.
                </p>
              </div>
              <Switch
                checked={!!form.allowPreOrder}
                onCheckedChange={(v) => onChange("allowPreOrder", v)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Status & visibility */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={form.status}
              onChange={(e) =>
                onChange("status", e.target.value as ProductCreateValues["status"])
              }
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              Use <span className="font-semibold">Draft</span> while you’re still
              preparing content.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <select
              value={form.visibility}
              onChange={(e) =>
                onChange(
                  "visibility",
                  e.target.value as ProductCreateValues["visibility"]
                )
              }
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="HIDDEN">Hidden</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              Public products appear in search & listings; private ones are only
              accessible with direct link.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellingOptionsSection;
