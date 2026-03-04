"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import { UseFormReturn } from "react-hook-form";

type Props = {
   form: UseFormReturn<ProductComprehensiveValues>;
};

export default function SeoTab({ form }: Props) {
   const control = (form as any).control;

   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         <Card>
            <CardHeader>
               <CardTitle>SEO Settings</CardTitle>
               <CardDescription>Optimize your product for search engines</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
               <div className="">
                  <FormField
                     control={control}
                     name="seo.seoTitle"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>SEO Title</FormLabel>
                           <FormControl>
                              <Input placeholder="Product title for search results" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormDescription>50-60 characters recommended</FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={control}
                     name="seo.facebookTitle"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Facebook Title</FormLabel>
                           <FormControl>
                              <Input placeholder="Title for Facebook sharing" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={control}
                     name="seo.twitterTitle"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Twitter Title</FormLabel>
                           <FormControl>
                              <Input placeholder="Title for Twitter sharing" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={control}
                     name="seo.canonicalUrl"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Canonical URL</FormLabel>
                           <FormControl>
                              <Input placeholder="https://..." {...field} value={field.value || ""} />
                           </FormControl>
                           <FormDescription>Specify the preferred URL for this product</FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>

               <div>
                  <FormField
                     control={control}
                     name="seo.metaDescription"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Meta Description</FormLabel>
                           <FormControl>
                              <Textarea placeholder="Brief description for search results 150-160 characters recommended" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormDescription></FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />



                  <FormField
                     control={control}
                     name="seo.facebookDesc"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Facebook Description</FormLabel>
                           <FormControl>
                              <Textarea placeholder="Description for Facebook sharing" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />



                  <FormField
                     control={control}
                     name="seo.twitterDesc"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Twitter Description</FormLabel>
                           <FormControl>
                              <Textarea placeholder="Description for Twitter sharing" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />


               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Advanced SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 ">



               <FormField
                  control={control}
                  name="seo.robotsSetting"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Robots Setting</FormLabel>
                        <FormControl>
                           <Input placeholder="index, follow" {...field} />
                        </FormControl>
                        <FormDescription>Control how search engines crawl this page</FormDescription>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={control}
                  name="seo.focusKeyphrase"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Focus Keyphrase</FormLabel>
                        <FormControl>
                           <Input placeholder="Main keyword to target" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={control}
                  name="seo.additionalKeywords"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Additional Keywords</FormLabel>
                        <FormControl>
                           <Input placeholder="Comma-separated keywords" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </CardContent>
         </Card>
      </div>
   );
}
