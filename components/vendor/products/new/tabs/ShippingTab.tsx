"use client";

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
import { UseFormReturn } from "react-hook-form";

type Props = {
   form: UseFormReturn<ProductComprehensiveValues>;
};

export default function ShippingTab({ form }: Props) {
   const control = (form as any).control;

   return (
      <div className="space-y-6">
         <Card>
            <CardHeader>
               <CardTitle>Shipping Information</CardTitle>
               <CardDescription>Product dimensions and weight for shipping calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <FormField
                     control={control}
                     name="weight"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Weight (kg)</FormLabel>
                           <FormControl>
                              <Input type="number" placeholder="0.00" step="0.01" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={control}
                     name="shippingClass"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Shipping Class</FormLabel>
                           <FormControl>
                              <Input placeholder="e.g., Standard, Express" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>

               <div className="grid grid-cols-3 gap-4">
                  <FormField
                     control={control}
                     name="length"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Length (cm)</FormLabel>
                           <FormControl>
                              <Input type="number" placeholder="0.00" step="0.01" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={control}
                     name="width"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Width (cm)</FormLabel>
                           <FormControl>
                              <Input type="number" placeholder="0.00" step="0.01" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={control}
                     name="height"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Height (cm)</FormLabel>
                           <FormControl>
                              <Input type="number" placeholder="0.00" step="0.01" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
