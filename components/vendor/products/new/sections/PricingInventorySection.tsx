"use client";

import type { FC } from "react";
import type { ProductCreateValues } from "@/lib/validations/product";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tag } from "lucide-react";

type FieldErrors = Partial<Record<keyof ProductCreateValues, string | undefined>>;

type Props = {
  form: ProductCreateValues;
  errors: FieldErrors;
  onChange: <K extends keyof ProductCreateValues>(
    key: K,
    value: ProductCreateValues[K]
  ) => void;
};

const PricingInventorySection: FC<Props> = ({ form, errors, onChange }) => {
  return (
    <Card className="border border-primary/10 shadow-sm bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
          <Tag className="h-4 w-4 text-secondary" />
          Pricing & inventory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base price</Label>
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">
                BDT
              </span>
              <Input
                id="basePrice"
                type="number"
                min={0}
                className="bg-white"
                value={form.basePrice}
                onChange={(e) => onChange("basePrice", e.target.value)}
              />
            </div>
            {errors.basePrice ? (
              <p className="text-xs text-destructive">{errors.basePrice}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Main selling price before any discount.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="salePrice">Sale price (optional)</Label>
            <Input
              id="salePrice"
              type="number"
              min={0}
              className="bg-white"
              value={form.salePrice ?? ""}
              onChange={(e) => onChange("salePrice", e.target.value)}
            />
            {errors.salePrice ? (
              <p className="text-xs text-destructive">{errors.salePrice}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Show discounted price & highlight the offer.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost (internal)</Label>
            <Input
              id="cost"
              type="number"
              min={0}
              className="bg-white"
              value={form.cost ?? ""}
              onChange={(e) => onChange("cost", e.target.value)}
            />
            {errors.cost ? (
              <p className="text-xs text-destructive">{errors.cost}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Used for margin & profitability analysis.
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder="Optional internal SKU"
              className="bg-white"
              value={form.sku ?? ""}
              onChange={(e) => onChange("sku", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              placeholder="EAN/UPC if applicable"
              className="bg-white"
              value={form.barcode ?? ""}
              onChange={(e) => onChange("barcode", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              min={0}
              className="bg-white"
              value={form.lowStockThreshold ?? "10"}
              onChange={(e) => onChange("lowStockThreshold", e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              When stock falls below this, you can trigger alerts.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingInventorySection;
