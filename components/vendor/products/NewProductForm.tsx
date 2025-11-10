// "use client";

// import { useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAction } from "next-safe-action/hooks";
// import { createProduct } from "@/actions/vendor/products/create-product";
// import type { ProductCreateValues } from "@/lib/validations/product";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";

// import { Sparkles, Tag, Info, Rocket } from "lucide-react";

// type SimpleRef = { id: string; name: string };

// type Props = {
//   vendorId: string; // not used directly (back-end infers vendor via session, but we might show it later)
//   categories: SimpleRef[];
//   brands: SimpleRef[];
// };

// const defaultValues: ProductCreateValues = {
//   name: "",
//   slug: "",
//   categoryId: "",
//   brandId: undefined,
//   basePrice: "",
//   salePrice: undefined,
//   cost: undefined,
//   sku: "",
//   barcode: "",
//   lowStockThreshold: "10",
//   description: "",
//   shortDescription: "",
//   metaTitle: "",
//   metaDescription: "",
//   metaKeywords: "",
//   allowRefurbished: false,
//   allowRent: false,
//   allowHirePurchase: false,
//   allowPreOrder: false,
//   status: "DRAFT",
//   visibility: "PUBLIC",
// };

// export default function NewProductForm({ categories, brands }: Props) {
//   const router = useRouter();
//   const { executeAsync, status, result } = useAction(createProduct);

//   const [form, setForm] = useState<ProductCreateValues>(defaultValues);
//   const [formError, setFormError] = useState<string | null>(null);
//   const [formSuccess, setFormSuccess] = useState<string | null>(null);

//   const fieldErrors = useMemo(() => {
//     const errs = (result?.validationErrors ?? {}) as Record<
//       string,
//       string[] | undefined
//     >;
//     return {
//       name: errs?.name?.[0],
//       slug: errs?.slug?.[0],
//       categoryId: errs?.categoryId?.[0],
//       basePrice: errs?.basePrice?.[0],
//       salePrice: errs?.salePrice?.[0],
//       cost: errs?.cost?.[0],
//     };
//   }, [result]);

//   function handleChange<K extends keyof ProductCreateValues>(
//     key: K,
//     value: ProductCreateValues[K]
//   ) {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   }

//   function autoSlug() {
//     if (!form.name) return;
//     const s = form.name
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");
//     handleChange("slug", s);
//   }

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setFormError(null);
//     setFormSuccess(null);

//     const payload: ProductCreateValues = {
//       ...form,
//       // normalize optional string fields: if empty string, let server transform to null
//       salePrice: (form.salePrice ?? "").toString(),
//       cost: (form.cost ?? "").toString(),
//     };

//     const res = await executeAsync(payload);

//     if (res?.data?.ok) {
//       setFormSuccess(res.data.message ?? "Product created successfully");
//       const slug = res.data.product.slug;
//       // small delay so user sees the success message
//       setTimeout(() => {
//         router.push(`/product/${slug}`);
//       }, 500);
//     } else {
//       setFormError(
//         res?.data?.message ??
//           result?.serverError ??
//           "Failed to create product. Please try again."
//       );
//     }
//   }

//   const isSubmitting = status === "executing";

//   return (
//     <form onSubmit={onSubmit} className="space-y-6">
//       {/* Top summary card */}
//       <Card className="border border-primary/10 shadow-sm backdrop-blur bg-white/80">
//         <CardHeader className="flex flex-row items-center justify-between gap-4">
//           <div className="space-y-1.5">
//             <CardTitle className="flex items-center gap-2 text-lg text-pcolor">
//               <Sparkles className="h-5 w-5 text-secondary" />
//               Product overview
//             </CardTitle>
//             <p className="text-xs text-muted-foreground">
//               Start with the essentials. You can fine-tune pricing, options, and
//               SEO below.
//             </p>
//           </div>
//           <Badge
//             variant="outline"
//             className="border-emerald-500/40 bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wide"
//           >
//             Vendor workspace
//           </Badge>
//         </CardHeader>
//         <CardContent className="grid gap-4 md:grid-cols-2">
//           <div className="space-y-2">
//             <Label htmlFor="name">Product name</Label>
//             <Input
//               id="name"
//               placeholder="e.g. Wireless Noise-Cancelling Headphones"
//               value={form.name}
//               onChange={(e) => handleChange("name", e.target.value)}
//               className="bg-white"
//             />
//             {fieldErrors.name ? (
//               <p className="text-xs text-destructive">{fieldErrors.name}</p>
//             ) : null}
//           </div>

//           <div className="space-y-2">
//             <div className="flex items-center justify-between gap-2">
//               <Label htmlFor="slug">Slug</Label>
//               <button
//                 type="button"
//                 onClick={autoSlug}
//                 className="text-xs text-linkcolor hover:text-hcolor underline underline-offset-4"
//               >
//                 Generate from name
//               </button>
//             </div>
//             <Input
//               id="slug"
//               placeholder="wireless-noise-cancelling-headphones"
//               value={form.slug}
//               onChange={(e) => handleChange("slug", e.target.value)}
//               className="bg-white"
//             />
//             {fieldErrors.slug ? (
//               <p className="text-xs text-destructive">{fieldErrors.slug}</p>
//             ) : (
//               <p className="text-[11px] text-muted-foreground">
//                 Used in the product URL. Lowercase, numbers and hyphens only.
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label>Category</Label>
//             <Select
//               value={form.categoryId}
//               onValueChange={(v) => handleChange("categoryId", v)}
//             >
//               <SelectTrigger className="bg-white">
//                 <SelectValue placeholder="Select a category" />
//               </SelectTrigger>
//               <SelectContent>
//                 {categories.map((c) => (
//                   <SelectItem key={c.id} value={c.id}>
//                     {c.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {fieldErrors.categoryId ? (
//               <p className="text-xs text-destructive">
//                 {fieldErrors.categoryId}
//               </p>
//             ) : null}
//           </div>

//           <div className="space-y-2">
//             <Label>Brand (optional)</Label>
//             <Select
//               value={form.brandId ?? ""}
//               onValueChange={(v) =>
//                 handleChange("brandId", v === "" ? undefined : v)
//               }
//             >
//               <SelectTrigger className="bg-white">
//                 <SelectValue placeholder="No brand / generic" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="">No brand</SelectItem>
//                 {brands.map((b) => (
//                   <SelectItem key={b.id} value={b.id}>
//                     {b.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Description card */}
//       <Card className="border border-slate-200/80 shadow-sm bg-white/90">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
//             <Info className="h-4 w-4 text-secondary" />
//             Description & details
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="grid gap-4 md:grid-cols-2">
//           <div className="space-y-2">
//             <Label htmlFor="shortDescription">Short description</Label>
//             <Textarea
//               id="shortDescription"
//               rows={3}
//               placeholder="A quick, catchy summary shown in product cards and search results."
//               value={form.shortDescription ?? ""}
//               onChange={(e) =>
//                 handleChange("shortDescription", e.target.value)
//               }
//               className="bg-white"
//             />
//           </div>

//           <div className="space-y-2 md:col-span-2">
//             <Label htmlFor="description">Full description</Label>
//             <Textarea
//               id="description"
//               rows={6}
//               placeholder="Describe features, materials, usage, and benefits in detail."
//               value={form.description ?? ""}
//               onChange={(e) => handleChange("description", e.target.value)}
//               className="bg-white"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Pricing & inventory */}
//       <Card className="border border-primary/10 shadow-sm bg-white/90">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
//             <Tag className="h-4 w-4 text-secondary" />
//             Pricing & inventory
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-3">
//             <div className="space-y-2">
//               <Label htmlFor="basePrice">Base price</Label>
//               <div className="flex items-center gap-1">
//                 <span className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">
//                   BDT
//                 </span>
//                 <Input
//                   id="basePrice"
//                   type="number"
//                   min={0}
//                   className="bg-white"
//                   value={form.basePrice}
//                   onChange={(e) => handleChange("basePrice", e.target.value)}
//                 />
//               </div>
//               {fieldErrors.basePrice ? (
//                 <p className="text-xs text-destructive">
//                   {fieldErrors.basePrice}
//                 </p>
//               ) : (
//                 <p className="text-[11px] text-muted-foreground">
//                   Main selling price before any discount.
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="salePrice">Sale price (optional)</Label>
//               <Input
//                 id="salePrice"
//                 type="number"
//                 min={0}
//                 className="bg-white"
//                 value={form.salePrice ?? ""}
//                 onChange={(e) => handleChange("salePrice", e.target.value)}
//               />
//               {fieldErrors.salePrice ? (
//                 <p className="text-xs text-destructive">
//                   {fieldErrors.salePrice}
//                 </p>
//               ) : (
//                 <p className="text-[11px] text-muted-foreground">
//                   Show discounted price & highlight the offer.
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="cost">Cost (internal)</Label>
//               <Input
//                 id="cost"
//                 type="number"
//                 min={0}
//                 className="bg-white"
//                 value={form.cost ?? ""}
//                 onChange={(e) => handleChange("cost", e.target.value)}
//               />
//               {fieldErrors.cost ? (
//                 <p className="text-xs text-destructive">{fieldErrors.cost}</p>
//               ) : (
//                 <p className="text-[11px] text-muted-foreground">
//                   Used for margin & profitability analysis.
//                 </p>
//               )}
//             </div>
//           </div>

//           <Separator />

//           <div className="grid gap-4 md:grid-cols-3">
//             <div className="space-y-2">
//               <Label htmlFor="sku">SKU</Label>
//               <Input
//                 id="sku"
//                 placeholder="Optional internal SKU"
//                 className="bg-white"
//                 value={form.sku ?? ""}
//                 onChange={(e) => handleChange("sku", e.target.value)}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="barcode">Barcode</Label>
//               <Input
//                 id="barcode"
//                 placeholder="EAN/UPC if applicable"
//                 className="bg-white"
//                 value={form.barcode ?? ""}
//                 onChange={(e) => handleChange("barcode", e.target.value)}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="lowStockThreshold">
//                 Low stock threshold
//               </Label>
//               <Input
//                 id="lowStockThreshold"
//                 type="number"
//                 min={0}
//                 className="bg-white"
//                 value={form.lowStockThreshold ?? "10"}
//                 onChange={(e) =>
//                   handleChange("lowStockThreshold", e.target.value)
//                 }
//               />
//               <p className="text-[11px] text-muted-foreground">
//                 When stock falls below this, you can trigger alerts.
//               </p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Selling options & status */}
//       <Card className="border border-emerald-100 shadow-sm bg-white/90">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
//             <Rocket className="h-4 w-4 text-emerald-500" />
//             Selling options & visibility
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* Selling options */}
//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-3">
//               <p className="text-xs font-medium text-muted-foreground uppercase">
//                 Selling options
//               </p>

//               <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
//                 <div className="space-y-0.5">
//                   <p className="text-sm font-medium">Refurbished</p>
//                   <p className="text-xs text-muted-foreground">
//                     Allow refurbished units of this product.
//                   </p>
//                 </div>
//                 <Switch
//                   checked={!!form.allowRefurbished}
//                   onCheckedChange={(v) =>
//                     handleChange("allowRefurbished", v)
//                   }
//                 />
//               </div>

//               <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
//                 <div className="space-y-0.5">
//                   <p className="text-sm font-medium">Rental</p>
//                   <p className="text-xs text-muted-foreground">
//                     Offer this product as a rental.
//                   </p>
//                 </div>
//                 <Switch
//                   checked={!!form.allowRent}
//                   onCheckedChange={(v) => handleChange("allowRent", v)}
//                 />
//               </div>
//             </div>

//             <div className="space-y-3">
//               <p className="text-xs font-medium text-muted-foreground uppercase">
//                 Financing & pre-order
//               </p>

//               <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
//                 <div className="space-y-0.5">
//                   <p className="text-sm font-medium">Hire purchase</p>
//                   <p className="text-xs text-muted-foreground">
//                     Enable installment / hire purchase options.
//                   </p>
//                 </div>
//                 <Switch
//                   checked={!!form.allowHirePurchase}
//                   onCheckedChange={(v) =>
//                     handleChange("allowHirePurchase", v)
//                   }
//                 />
//               </div>

//               <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
//                 <div className="space-y-0.5">
//                   <p className="text-sm font-medium">Pre-order</p>
//                   <p className="text-xs text-muted-foreground">
//                     Allow customers to order before stock arrives.
//                   </p>
//                 </div>
//                 <Switch
//                   checked={!!form.allowPreOrder}
//                   onCheckedChange={(v) =>
//                     handleChange("allowPreOrder", v)
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <Separator />

//           {/* Status & visibility */}
//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <Label>Status</Label>
//               <Select
//                 value={form.status}
//                 onValueChange={(v) =>
//                   handleChange(
//                     "status",
//                     v as ProductCreateValues["status"]
//                   )
//                 }
//               >
//                 <SelectTrigger className="bg-white">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="DRAFT">Draft</SelectItem>
//                   <SelectItem value="ACTIVE">Active</SelectItem>
//                   <SelectItem value="INACTIVE">Inactive</SelectItem>
//                   <SelectItem value="ARCHIVED">Archived</SelectItem>
//                 </SelectContent>
//               </Select>
//               <p className="text-[11px] text-muted-foreground">
//                 Use <span className="font-semibold">Draft</span> while you’re
//                 still preparing content.
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label>Visibility</Label>
//               <Select
//                 value={form.visibility}
//                 onValueChange={(v) =>
//                   handleChange(
//                     "visibility",
//                     v as ProductCreateValues["visibility"]
//                   )
//                 }
//               >
//                 <SelectTrigger className="bg-white">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="PUBLIC">Public</SelectItem>
//                   <SelectItem value="PRIVATE">Private</SelectItem>
//                   <SelectItem value="HIDDEN">Hidden</SelectItem>
//                 </SelectContent>
//               </Select>
//               <p className="text-[11px] text-muted-foreground">
//                 Public products appear in search & listings; private ones are
//                 only accessible with direct link.
//               </p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* SEO card */}
//       <Card className="border border-slate-200 shadow-sm bg-white/90">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-sm text-pcolor">
//             SEO & search preview
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <Label htmlFor="metaTitle">Meta title</Label>
//               <Input
//                 id="metaTitle"
//                 placeholder="Title shown in search results"
//                 value={form.metaTitle ?? ""}
//                 onChange={(e) => handleChange("metaTitle", e.target.value)}
//                 className="bg-white"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="metaKeywords">Meta keywords</Label>
//               <Input
//                 id="metaKeywords"
//                 placeholder="headphones, wireless, noise cancelling"
//                 value={form.metaKeywords ?? ""}
//                 onChange={(e) =>
//                   handleChange("metaKeywords", e.target.value)
//                 }
//                 className="bg-white"
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="metaDescription">Meta description</Label>
//             <Textarea
//               id="metaDescription"
//               rows={3}
//               placeholder="Short snippet that appears under the title in search engines."
//               value={form.metaDescription ?? ""}
//               onChange={(e) =>
//                 handleChange("metaDescription", e.target.value)
//               }
//               className="bg-white"
//             />
//           </div>

//           {/* Simple preview */}
//           <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
//             <p className="text-[11px] font-semibold text-slate-500 mb-1">
//               Search preview
//             </p>
//             <p className="truncate text-[13px] text-blue-700">
//               {form.metaTitle || form.name || "Your product title"}
//             </p>
//             <p className="text-xs text-green-700 truncate">
//               birl-ecom.com/product/{form.slug || "slug-preview"}
//             </p>
//             <p className="mt-1 line-clamp-2 text-xs text-slate-600">
//               {form.metaDescription ||
//                 form.shortDescription ||
//                 "Your product description will appear here in search results."}
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Footer actions */}
//       <div className="sticky bottom-0 z-10 border-t border-slate-200/80 bg-linear-to-t from-white/95 to-white/80 backdrop-blur py-3">
//         <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-1">
//           <div className="flex flex-col text-xs text-muted-foreground">
//             {formError && (
//               <p className="text-destructive font-medium">{formError}</p>
//             )}
//             {formSuccess && (
//               <p className="text-emerald-600 font-medium">{formSuccess}</p>
//             )}
//             {!formError && !formSuccess && (
//               <p>
//                 You can save this product as{" "}
//                 <span className="font-semibold">Draft</span> and publish later.
//               </p>
//             )}
//           </div>

//           <div className="flex items-center gap-3">
//             <Button
//               type="button"
//               variant="outline"
//               className="border-slate-300 text-slate-600 hover:bg-slate-100"
//               onClick={() => router.back()}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={isSubmitting}
//               className="bg-pcolor text-white hover:bg-pcolor/90 px-5"
//             >
//               {isSubmitting ? "Saving…" : "Save product"}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </form>
//   );
// }
