"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import { AlertCircle, ChevronDown, ChevronUp, Layers, Plus, Settings2, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";

type Props = {
  form: UseFormReturn<ProductComprehensiveValues>;
};

export default function VariantsTab({ form }: Props) {
  const control = (form as any).control;
  const { watch } = form;
  const productType = watch("productType");

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: "options",
  });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  });

  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set());

  const toggleVariant = (index: number) => {
    setExpandedVariants((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  if (productType !== "VARIABLE") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Layers className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Variants not available</h3>
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
          Switch the product type to <span className="font-medium text-slate-600">Variable</span> in the General tab to define options and variants.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          Current type: <span className="font-semibold">{productType}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Options Card */}
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
              <Settings2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">Product Options</CardTitle>
              <CardDescription className="text-xs mt-0.5">Define option groups like Size, Color, Material</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {optionFields.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
              <p className="text-xs text-slate-400">No options added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {optionFields.map((field, index) => (
                <div
                  key={field.id}
                  className="group rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition-all hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-start gap-2">
                    {/* Index badge */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center mt-[26px]">
                      <span className="text-xs font-semibold text-slate-500">{index + 1}</span>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <FormField
                        control={control}
                        name={`options.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-medium">Option Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Size"
                                {...field}
                                className="h-9 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`options.${index}.values`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-slate-500 font-medium">Values <span className="text-slate-400">(comma-separated)</span></FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., S, M, L, XL"
                                value={field.value?.join(", ") || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value.split(",").map((v) => v.trim())
                                  )
                                }
                                className="h-9 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="flex-shrink-0 mt-[26px] p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendOption({ name: "", values: [] }, { shouldFocus: false })}
            className="w-full h-9 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add Option
          </Button>
        </CardContent>
      </Card>

      {/* Variants Card */}
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                <Tag className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">Variants</CardTitle>
                <CardDescription className="text-xs mt-0.5">SKU, pricing and stock per variant</CardDescription>
              </div>
            </div>
            {variantFields.length > 0 && (
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {variantFields.length} variant{variantFields.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {variantFields.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
              <p className="text-xs text-slate-400">No variants added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {variantFields.map((field, index) => {
                const isExpanded = expandedVariants.has(index);
                const skuValue = form.watch(`variants.${index}.sku` as any);

                return (
                  <div
                    key={field.id}
                    className="rounded-xl border border-slate-200 overflow-hidden transition-all"
                  >
                    {/* Variant Header — always visible, click to expand */}
                    <div
                      className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleVariant(index)}
                    >
                      <div className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-slate-500">{index + 1}</span>
                      </div>
                      <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                        {skuValue || <span className="text-slate-400 font-normal">Variant {index + 1}</span>}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVariant(index);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Variant Body — collapsible */}
                    {isExpanded && (
                      <div className="p-3 border-t border-slate-200 bg-white space-y-3">
                        {/* Price row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {/* SKU */}
                        <FormField
                          control={control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-slate-500 font-medium">SKU <span className="text-red-400">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., PROD-RED-M" {...field} className="h-9 text-sm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                          <FormField
                            control={control}
                            name={`variants.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-slate-500 font-medium">Price</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      step="0.01"
                                      {...field}
                                      className="h-9 text-sm pl-6"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`variants.${index}.salePrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs text-slate-500 font-medium">Sale Price</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      step="0.01"
                                      {...field}
                                      className="h-9 text-sm pl-6"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newIndex = variantFields.length;
              appendVariant(
                { sku: "", price: "", salePrice: "", isActive: true, optionValues: {} },
                { shouldFocus: false }
              );
              // Auto-expand new variant
              setExpandedVariants((prev) => new Set(prev).add(newIndex));
            }}
            className="w-full h-9 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add Variant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}