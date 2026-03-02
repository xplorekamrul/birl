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

export default function MediaTab({ form }: Props) {
   const control = (form as any).control;
   const { fields, append, remove } = useFieldArray({
      control,
      name: "media",
   });

   return (
      <div className="space-y-6">
         <Card>
            <CardHeader>
               <CardTitle>Product Media</CardTitle>
               <CardDescription>Add images and videos for your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {fields.length === 0 ? (
                  <p className="text-sm text-slate-500">No media added yet</p>
               ) : (
                  <div className="space-y-3">
                     {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 rounded-lg border p-3">
                           <div className="flex-1 space-y-2">
                              <FormField
                                 control={control}
                                 name={`media.${index}.url`}
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="text-xs">URL</FormLabel>
                                       <FormControl>
                                          <Input placeholder="https://..." {...field} />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                              <FormField
                                 control={control}
                                 name={`media.${index}.alt`}
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="text-xs">Alt Text</FormLabel>
                                       <FormControl>
                                          <Input placeholder="Describe the image" {...field} />
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
                  onClick={() => append({ url: "", type: "IMAGE", alt: "", sortOrder: fields.length })}
                  className="w-full"
               >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Media
               </Button>
            </CardContent>
         </Card>
      </div>
   );
}
