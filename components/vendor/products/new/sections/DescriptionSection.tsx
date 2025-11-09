"use client";

import type { FC } from "react";
import type { ProductCreateValues } from "@/lib/validations/product";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

type Props = {
  form: ProductCreateValues;
  onChange: <K extends keyof ProductCreateValues>(
    key: K,
    value: ProductCreateValues[K]
  ) => void;
};

const DescriptionSection: FC<Props> = ({ form, onChange }) => {
  return (
    <Card className="border border-slate-200/80 shadow-sm bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
          <Info className="h-4 w-4 text-secondary" />
          Description & details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Textarea
            id="shortDescription"
            rows={3}
            placeholder="A quick, catchy summary shown in product cards and search results."
            value={form.shortDescription ?? ""}
            onChange={(e) => onChange("shortDescription", e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Full description</Label>
          <Textarea
            id="description"
            rows={6}
            placeholder="Describe features, materials, usage, and benefits in detail."
            value={form.description ?? ""}
            onChange={(e) => onChange("description", e.target.value)}
            className="bg-white"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DescriptionSection;
