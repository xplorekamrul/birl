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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn, useFieldArray } from "react-hook-form";

type SimpleRef = { id: string; name: string };

type Props = {
   form: UseFormReturn<ProductComprehensiveValues>;
   existingProducts: SimpleRef[];
};

export default function RelatedProductsTab({ form, existingProducts }: Props) {
   const control = (form as any).control;
   const { fields, append, remove } = useFieldArray({
      control,
      name: "relatedProducts",
   });

   return (
      <div className="space-y-6">
         <Card>
            <CardHeader>
               <CardTitle>Related Products</CardTitle>
               <CardDescription>Link upsell and cross-sell products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {fields.length === 0 ? (
                  <p className="text-sm text-slate-500">No related products added yet</p>
               ) : (
                  <div className="space-y-3">
                     {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 rounded-lg border p-3">
                           <div className="flex-1 space-y-2">
                              <FormField
                                 control={control}
                                 name={`relatedProducts.${index}.productId`}
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="text-xs">Product *</FormLabel>
                                       <Select value={field.value} onValueChange={field.onChange}>
                                          <FormControl>
                                             <SelectTrigger>
                                                <SelectValue placeholder="Select product" />
                                             </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                             {existingProducts.map((prod) => (
                                                <SelectItem key={prod.id} value={prod.id}>
                                                   {prod.name}
                                                </SelectItem>
                                             ))}
                                          </SelectContent>
                                       </Select>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                              <FormField
                                 control={control}
                                 name={`relatedProducts.${index}.type`}
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="text-xs">Type *</FormLabel>
                                       <Select value={field.value} onValueChange={field.onChange}>
                                          <FormControl>
                                             <SelectTrigger>
                                                <SelectValue />
                                             </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                             <SelectItem value="UPSELL">Upsell</SelectItem>
                                             <SelectItem value="CROSS_SELL">Cross-sell</SelectItem>
                                          </SelectContent>
                                       </Select>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>
                           <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="h-fit"
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                     ))}
                  </div>
               )}

               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                     append({ productId: "", type: "UPSELL" }, { shouldFocus: false })
                  }
                  className="w-full"
               >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Related Product
               </Button>
            </CardContent>
         </Card>
      </div>
   );
}
