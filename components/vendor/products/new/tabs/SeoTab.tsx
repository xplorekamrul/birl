"use client";

import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { compressImage } from "@/lib/media/image-utils";
import { useDocumentUploader } from "@/lib/media/uploadthing-upload";
import { ProductComprehensiveValues } from "@/lib/validations/product-comprehensive";
import { Eye, Globe, Image as ImageIcon, Link, Loader2, RefreshCw, Search, Share2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

type Props = {
   form: UseFormReturn<ProductComprehensiveValues>;
};

// Inline minimal image uploader (same pattern as ImageUploadField.tsx)
function SeoImageUpload({
   value,
   onChange,
   label,
   description,
}: {
   value?: string | null;
   onChange: (url: string | null) => void;
   label: string;
   description?: string;
}) {
   const [showUrl, setShowUrl] = useState(false);
   const [urlInput, setUrlInput] = useState("");
   const [isCompressing, setIsCompressing] = useState(false);
   const fileRef = useRef<HTMLInputElement>(null);
   const { startUpload, isUploading } = useDocumentUploader("categoryImage");
   const isLoading = isUploading || isCompressing;

   async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
         setIsCompressing(true);
         const compressed = await compressImage(file, { maxSizeKB: 500 });
         const result = await startUpload([compressed]);
         if (result?.[0]) onChange(result[0].url);
      } catch {
         alert("Image upload failed. Please try again.");
      } finally {
         setIsCompressing(false);
         if (fileRef.current) fileRef.current.value = "";
      }
   }

   return (
      <div className="space-y-2">
         <p className="text-sm font-medium">{label}</p>
         {description && <p className="text-xs text-slate-500">{description}</p>}

         {value ? (
            <div className="space-y-2">
               <div className="relative w-full h-36 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                  <img src={value} alt={label} className="w-full h-full object-contain" />
               </div>
               <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => onChange(null)}>
                     <X className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fileRef.current?.click()} disabled={isLoading}>
                     <Upload className="w-3.5 h-3.5 mr-1" /> Replace
                  </Button>
               </div>
            </div>
         ) : (
            <div className="space-y-2">
               {showUrl ? (
                  <div className="flex gap-2">
                     <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                     />
                     <Button type="button" size="sm" disabled={!urlInput.trim()} onClick={() => { onChange(urlInput.trim()); setUrlInput(""); setShowUrl(false); }}>
                        Add
                     </Button>
                     <Button type="button" size="sm" variant="outline" onClick={() => { setShowUrl(false); setUrlInput(""); }}>
                        <X className="w-3.5 h-3.5" />
                     </Button>
                  </div>
               ) : (
                  <div className="flex gap-2">
                     <Button type="button" variant="outline" className="flex-1" onClick={() => fileRef.current?.click()} disabled={isLoading}>
                        {isLoading ? (
                           <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />{isCompressing ? "Compressing..." : "Uploading..."}</>
                        ) : (
                           <><Upload className="w-3.5 h-3.5 mr-1" /> Upload Image</>
                        )}
                     </Button>
                     <Button type="button" variant="outline" className="flex-1" onClick={() => setShowUrl(true)} disabled={isLoading}>
                        <Link className="w-3.5 h-3.5 mr-1" /> Use URL
                     </Button>
                  </div>
               )}
               <p className="text-[11px] text-slate-400">Max 500KB. Recommended: 1200×630px for social sharing.</p>
            </div>
         )}
         <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={isLoading} />
      </div>
   );
}

export default function SeoTab({ form }: Props) {
   const control = (form as any).control;
   const watchSlug = form.watch("slug");
   const watchName = form.watch("name");
   const watchSeoTitle = form.watch("seo.seoTitle" as any) as string | undefined;
   const watchMetaDesc = form.watch("seo.metaDescription" as any) as string | undefined;
   const watchCanonical = form.watch("seo.canonicalUrl" as any) as string | undefined;

   // Build the default canonical URL from the current slug
   const defaultCanonical = watchSlug ? `${typeof window !== "undefined" ? window.location.origin : ""}/${watchSlug}` : "";

   // Auto-fill canonical when slug changes and the field is still at the old slug-based value
   // (i.e. the user hasn't typed a completely custom URL)
   useEffect(() => {
      if (!watchSlug) return;
      const current = form.getValues("seo.canonicalUrl" as any) as string | undefined;
      // Only auto-update if field is empty OR was previously a slug-derived URL
      const looksAutoGenerated =
         !current ||
         current === "" ||
         (current.includes("/") && !current.includes("://") === false &&
            current.endsWith("/" + (form.getValues("slug") ?? "")));
      if (!current || looksAutoGenerated) {
         form.setValue("seo.canonicalUrl" as any, defaultCanonical, { shouldDirty: false });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [watchSlug]);

   return (
      <div className="space-y-6">
         {/* ── Search Preview ────────────────────────────────────────── */}
         <Card className="border-blue-100 bg-gradient-to-r from-blue-50/50 to-slate-50">
            <CardHeader className="pb-3">
               <CardTitle className="flex items-center gap-2 text-sm text-blue-700">
                  <Eye className="w-4 h-4" /> Search Preview
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm max-w-xl">
                  <p className="text-[11px] text-slate-400 mb-1">birl-ecom.com/{watchSlug || "slug"}</p>
                  <p className="text-[17px] text-blue-700 font-medium leading-snug line-clamp-1">
                     {watchSeoTitle || watchName || "Your product title"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                     {watchMetaDesc || "Your product description will appear here in search results."}
                  </p>
               </div>
            </CardContent>
         </Card>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Core SEO ───────────────────────────────────────── */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm"><Search className="w-4 h-4 text-pcolor" /> Core SEO</CardTitle>
                  <CardDescription>Fields that directly influence search engine ranking</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <FormField
                     control={control}
                     name="seo.seoTitle"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>SEO Title</FormLabel>
                           <FormControl>
                              <Input placeholder="Product title for search results" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormDescription>50–60 characters recommended</FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={control}
                     name="seo.metaDescription"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Meta Description</FormLabel>
                           <FormControl>
                              <Textarea rows={3} placeholder="Brief description for search results (150–160 characters)" {...field} value={field.value || ""} />
                           </FormControl>
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
                              <Input placeholder="Main keyword to target (e.g. wireless headphones)" {...field} value={field.value || ""} />
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
                              <Input placeholder="Comma-separated keywords (e.g. noise cancelling, bluetooth)" {...field} value={field.value || ""} />
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
                           <div className="flex items-center justify-between">
                              <FormLabel>Canonical URL</FormLabel>
                              {field.value && field.value !== defaultCanonical && (
                                 <button
                                    type="button"
                                    onClick={() => field.onChange(defaultCanonical)}
                                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-pcolor transition-colors"
                                 >
                                    <RefreshCw className="w-3 h-3" />
                                    Reset to default
                                 </button>
                              )}
                           </div>
                           <FormControl>
                              <Input
                                 {...field}
                                 value={field.value || ""}
                                 placeholder={defaultCanonical || "https://yourdomain.com/product-slug"}
                                 className="font-mono text-sm"
                              />
                           </FormControl>
                           <FormDescription>
                              Auto-filled from slug. Edit to set a custom canonical URL.
                           </FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </CardContent>
            </Card>

            {/* ── Open Graph / Facebook ──────────────────────────── */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm"><Share2 className="w-4 h-4 text-blue-600" /> Open Graph / Facebook</CardTitle>
                  <CardDescription>Shown when the product is shared on Facebook and other OG-supporting platforms</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <FormField
                     control={control}
                     name="seo.facebookTitle"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>OG Title</FormLabel>
                           <FormControl>
                              <Input placeholder="Title for Facebook / LinkedIn sharing" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={control}
                     name="seo.facebookDesc"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>OG Description</FormLabel>
                           <FormControl>
                              <Textarea rows={2} placeholder="Description shown on Facebook / LinkedIn cards" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  {/* Facebook Image Upload */}
                  <FormField
                     control={control}
                     name="seo.facebookImage"
                     render={({ field }) => (
                        <FormItem>
                           <FormControl>
                              <SeoImageUpload
                                 value={field.value}
                                 onChange={field.onChange}
                                 label="OG Image (Facebook / LinkedIn)"
                                 description="Recommended size: 1200×630 px"
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </CardContent>
            </Card>

            {/* ── Twitter / X Card ───────────────────────────────── */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                     <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.254 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                     Twitter / X Card
                  </CardTitle>
                  <CardDescription>Shown when the product is shared on Twitter / X</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <FormField
                     control={control}
                     name="seo.twitterTitle"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Twitter Title</FormLabel>
                           <FormControl>
                              <Input placeholder="Title for Twitter cards" {...field} value={field.value || ""} />
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
                              <Textarea rows={2} placeholder="Description shown on Twitter cards" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </CardContent>
            </Card>

            {/* ── Advanced SEO ───────────────────────────────────── */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-slate-500" /> Advanced SEO</CardTitle>
                  <CardDescription>Robots, schema type, sitemap settings and redirects</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <FormField
                     control={control}
                     name="seo.robotsSetting"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Robots Setting</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value || "index, follow"}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="index, follow">index, follow (default)</SelectItem>
                                 <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                                 <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                                 <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                              </SelectContent>
                           </Select>
                           <FormDescription>How search engines crawl and index this page</FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={control}
                     name="seo.schemaType"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Schema Type</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value || "Product"}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="Product">Product</SelectItem>
                                 <SelectItem value="Book">Book</SelectItem>
                                 <SelectItem value="SoftwareApplication">Software Application</SelectItem>
                                 <SelectItem value="Event">Event</SelectItem>
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={control}
                     name={"seo.priorityScore" as any}
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Sitemap Priority Score <span className="text-slate-400 font-normal">(0.0 – 1.0)</span></FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 min={0}
                                 max={1}
                                 step={0.1}
                                 placeholder="0.5"
                                 {...field}
                                 value={field.value ?? 0.5}
                                 onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                           </FormControl>
                           <FormDescription>0.5 = normal, 1.0 = highest priority in sitemap</FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={control}
                     name="seo.changeFrequency"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Sitemap Change Frequency</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value || "weekly"}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="always">Always</SelectItem>
                                 <SelectItem value="hourly">Hourly</SelectItem>
                                 <SelectItem value="daily">Daily</SelectItem>
                                 <SelectItem value="weekly">Weekly (recommended)</SelectItem>
                                 <SelectItem value="monthly">Monthly</SelectItem>
                                 <SelectItem value="yearly">Yearly</SelectItem>
                                 <SelectItem value="never">Never</SelectItem>
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={control}
                     name="seo.includeSitemap"
                     render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-slate-50">
                           <div>
                              <FormLabel className="cursor-pointer">Include in XML Sitemap</FormLabel>
                              <FormDescription className="text-xs">Uncheck to hide this product from sitemaps</FormDescription>
                           </div>
                           <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                           </FormControl>
                        </FormItem>
                     )}
                  />
               </CardContent>
            </Card>

            {/* ── Redirects ─────────────────────────────────────── */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm"><RefreshCw className="w-4 h-4 text-amber-500" /> Redirects</CardTitle>
                  <CardDescription>Set up permanent or temporary redirects for this product URL</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <FormField
                     control={control}
                     name="seo.redirectUrl"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Redirect To</FormLabel>
                           <FormControl>
                              <Input placeholder="https://example.com/new-url" {...field} value={field.value || ""} />
                           </FormControl>
                           <FormDescription>Leave blank to disable redirect</FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={control}
                     name="seo.redirectType"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Redirect Type</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select redirect type" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="301">301 — Permanent (SEO equity passes)</SelectItem>
                                 <SelectItem value="302">302 — Temporary (SEO equity stays)</SelectItem>
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </CardContent>
            </Card>

            {/* ── Custom Structured Data ───────────────────────── */}
            <Card className="lg:col-span-2">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm"><ImageIcon className="w-4 h-4 text-purple-500" /> Custom Structured Data (JSON-LD)</CardTitle>
                  <CardDescription>
                     Override the auto-generated schema.org JSON-LD block. If left blank, one is generated automatically from the product data.
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <FormField
                     control={control}
                     name="seo.structuredData"
                     render={({ field }) => (
                        <FormItem>
                           <FormControl>
                              <Textarea
                                 rows={8}
                                 placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "Your product",\n  ...\n}'}
                                 {...field}
                                 value={field.value || ""}
                                 className="font-mono text-xs"
                              />
                           </FormControl>
                           <FormDescription>Must be valid JSON. Invalid JSON will be ignored and auto-generated data will be used instead.</FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
