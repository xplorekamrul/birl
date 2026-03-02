"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import { Plus, Trash2 } from "lucide-react";
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

   if (productType !== "VARIABLE") {
      return (
         <Card>
            <CardContent className="pt-6">
               <p className="text-sm text-slate-500">
                  Variants are only available for VARIABLE product type. Change the product type in the General tab.
               </p>
            </CardContent>
         </Card>
      );
   }

   return (
      <div className="space-y-6">
         {/* Options */}
         <Card>
            <CardHeader>
               <CardTitle>Product Options</CardTitle>
               <CardDescription>Define options like Size, Color, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {optionFields.length === 0 ? (
                  <p className="text-sm text-slate-500">No options added yet</p>
               ) : (
                  <div className="space-y-3">
                     {optionFields.map((field, index) => (
                        <div key={field.id} className="rounded-lg border p-3">
                           <div className="flex gap-3">
                              <div className="flex-1 space-y-2">
                                 <FormField
                                    control={control}
                                    name={`options.${index}.name`}
                                    render={({ field }) => (
                                       <FormItem>
                                          <FormLabel className="text-xs">Option Name</FormLabel>
                                          <FormControl>
                                             <Input placeholder="e.g., Size" {...field} />
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
                                          <FormLabel className="text-xs">Values (comma-separated)</FormLabel>
                                          <FormControl>
                                             <Input
                                                placeholder="e.g., S, M, L, XL"
                                                value={field.value?.join(", ") || ""}
                                                onChange={(e) =>
                                                   field.onChange(
                                                      e.target.value.split(",").map((v) => v.trim())
                                                   )
                                                }
                                             />
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />
                              </div>
                              <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => removeOption(index)}
                                 className="h-fit"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>
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
                  className="w-full"
               >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
               </Button>
            </CardContent>
         </Card>

         {/* Variants */}
         <Card>
            <CardHeader>
               <CardTitle>Variants</CardTitle>
               <CardDescription>Define individual variants with SKU and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {variantFields.length === 0 ? (
                  <p className="text-sm text-slate-500">No variants added yet</p>
               ) : (
                  <div className="space-y-3">
                     {variantFields.map((field, index) => (
                        <div key={field.id} className="rounded-lg border p-3">
                           <div className="flex gap-3">
                              <div className="flex-1 space-y-2">
                                 <FormField
                                    control={control}
                                    name={`variants.${index}.sku`}
                                    render={({ field }) => (
                                       <FormItem>
                                          <FormLabel className="text-xs">SKU *</FormLabel>
                                          <FormControl>
                                             <Input placeholder="e.g., SKU-001" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />
                                 <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                       control={control}
                                       name={`variants.${index}.price`}
                                       render={({ field }) => (
                                          <FormItem>
                                             <FormLabel className="text-xs">Price</FormLabel>
                                             <FormControl>
                                                <Input type="number" placeholder="0.00" step="0.01" {...field} />
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
                                             <FormLabel className="text-xs">Sale Price</FormLabel>
                                             <FormControl>
                                                <Input type="number" placeholder="0.00" step="0.01" {...field} />
                                             </FormControl>
                                             <FormMessage />
                                          </FormItem>
                                       )}
                                    />
                                 </div>
                              </div>
                              <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => removeVariant(index)}
                                 className="h-fit"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                     appendVariant({ sku: "", price: "", salePrice: "", isActive: true, optionValues: {} }, { shouldFocus: false })
                  }
                  className="w-full"
               >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
               </Button>
            </CardContent>
         </Card>
      </div>
   );
}
