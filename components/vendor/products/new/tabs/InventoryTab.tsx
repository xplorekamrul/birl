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
   warehouses: SimpleRef[];
};

export default function InventoryTab({ form, warehouses }: Props) {
   const control = (form as any).control;
   const { fields, append, remove } = useFieldArray({
      control,
      name: "stocks",
   });

   return (
      <div className="space-y-6">
         <Card>
            <CardHeader>
               <CardTitle>Warehouse Stock</CardTitle>
               <CardDescription>Manage inventory across warehouses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {fields.length === 0 ? (
                  <p className="text-sm text-slate-500">No warehouse stock added yet</p>
               ) : (
                  <div className="space-y-3">
                     {fields.map((field, index) => (
                        <div key={field.id} className="rounded-lg border p-3">
                           <div className="flex gap-3">
                              <div className=" space-y-2">
                                 
                                 <div className="grid lg:grid-cols-4 grid-cols-1 gap-2">
                                    <FormField
                                    control={control}
                                    name={`stocks.${index}.warehouseId`}
                                    render={({ field }) => (
                                       <FormItem>
                                          <FormLabel className="text-xs">Warehouse *</FormLabel>
                                          <Select value={field.value} onValueChange={field.onChange}>
                                             <FormControl>
                                                <SelectTrigger>
                                                   <SelectValue placeholder="Select warehouse" />
                                                </SelectTrigger>
                                             </FormControl>
                                             <SelectContent>
                                                {warehouses.map((wh) => (
                                                   <SelectItem key={wh.id} value={wh.id}>
                                                      {wh.name}
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
                                       name={`stocks.${index}.quantity`}
                                       render={({ field }) => (
                                          <FormItem>
                                             <FormLabel className="text-xs">Quantity *</FormLabel>
                                             <FormControl>
                                                <Input type="number" placeholder="0" {...field} />
                                             </FormControl>
                                             <FormMessage />
                                          </FormItem>
                                       )}
                                    />
                                    <FormField
                                       control={control}
                                       name={`stocks.${index}.reserved`}
                                       render={({ field }) => (
                                          <FormItem>
                                             <FormLabel className="text-xs">Reserved</FormLabel>
                                             <FormControl>
                                                <Input type="number" placeholder="0" {...field} />
                                             </FormControl>
                                             <FormMessage />
                                          </FormItem>
                                       )}
                                    />
                                    <FormField
                                       control={control}
                                       name={`stocks.${index}.lowThreshold`}
                                       render={({ field }) => (
                                          <FormItem>
                                             <FormLabel className="text-xs">Low Threshold</FormLabel>
                                             <FormControl>
                                                <Input type="number" placeholder="10" {...field} />
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
                                 onClick={() => remove(index)}
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
                     append({ warehouseId: "", quantity: "0", reserved: "0", lowThreshold: "10" }, { shouldFocus: false })
                  }
                  className="w-full"
               >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Warehouse Stock
               </Button>
            </CardContent>
         </Card>
      </div>
   );
}
