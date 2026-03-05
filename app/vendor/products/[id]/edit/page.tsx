import EditComprehensiveProductForm from "@/components/vendor/products/new/EditComprehensiveProductForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function VendorEditProductPage(props: { params: Promise<{ id: string }> }) {
   const params = await props.params;
   const session = await auth();
   const role = (session?.user as any)?.role as string;
   const productId = params.id;

   if (
      !session?.user ||
      (role !== "VENDOR" &&
         role !== "ADMIN" &&
         role !== "SUPER_ADMIN" &&
         role !== "DEVELOPER")
   ) {
      redirect("/login");
   }

   const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, shopName: true },
   });

   if (!vendorProfile) {
      redirect("/vendor/setup");
   }

   const [product, superCategories, categories, brands, warehouses, allTags, existingProducts] = await Promise.all([
      prisma.product.findUnique({
         where: { id: productId, vendorId: vendorProfile.id },
         include: {
            media: true,
            seo: true,
            tags: true,
            options: {
               include: {
                  values: true,
               }
            },
            variants: {
               include: {
                  variantValues: {
                     include: { optionValue: true }
                  },
                  stock: true,
               }
            },
            relatedProducts: true,
         }
      }),
      prisma.superCategory.findMany({
         where: { isActive: true },
         select: { id: true, name: true, slug: true },
         orderBy: { displayOrder: "asc" },
      }),
      prisma.category.findMany({
         where: { isActive: true },
         select: { id: true, name: true, superCategoryId: true },
         orderBy: { name: "asc" },
      }),
      prisma.brand.findMany({
         select: { id: true, name: true },
         orderBy: { name: "asc" },
      }),
      prisma.warehouse.findMany({
         where: { vendorId: vendorProfile.id },
         select: { id: true, name: true },
         orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
         select: { id: true, name: true },
         orderBy: { name: "asc" },
      }),
      prisma.product.findMany({
         where: { vendorId: vendorProfile.id },
         select: { id: true, name: true, slug: true },
         orderBy: { createdAt: "desc" },
         take: 100,
      }),
   ]);

   if (!product) {
      redirect("/vendor/products");
   }

   // Format initialData for the form
   const initialData = {
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      superCategoryId: categories.find(c => c.id === product.categoryId)?.superCategoryId || "",
      brandId: product.brandId,
      basePrice: product.basePrice?.toString() || "",
      salePrice: product.salePrice?.toString() || undefined,
      cost: product.cost?.toString() || undefined,
      productType: product.productType,
      status: product.status,
      visibility: product.visibility,
      sku: product.sku || undefined,
      barcode: product.barcode || undefined,
      gtin: product.gtin || undefined,
      upc: product.upc || undefined,
      ean: product.ean || undefined,
      isbn: product.isbn || undefined,
      description: product.description || undefined,
      shortDescription: product.shortDescription || undefined,
      weight: product.weight?.toString() || "",
      length: product.length?.toString() || "",
      width: product.width?.toString() || "",
      height: product.height?.toString() || "",
      shippingClass: product.shippingClass || "",
      stockManagement: product.stockManagement,
      allowBackorders: product.allowBackorders,
      lowStockThreshold: product.lowStockThreshold?.toString() || "10",
      soldIndividually: product.soldIndividually,
      allowRefurbished: product.allowRefurbished,
      allowRent: product.allowRent,
      allowHirePurchase: product.allowHirePurchase,
      allowPreOrder: product.allowPreOrder,
      scheduledPublish: product.scheduledPublish?.toISOString().split('T')[0] || "",

      media: product.media.map((m: any) => ({
         url: m.url,
         type: m.type,
         alt: m.alt || undefined,
      })),

      // We do simple mapping for others for now to satisfy basic form behavior.
      tags: product.tags.map((t: any) => t.id),

      seo: product.seo ? {
         seoTitle: product.seo.seoTitle || undefined,
         metaDescription: product.seo.metaDescription || undefined,
         focusKeyphrase: product.seo.focusKeyphrase || undefined,
         additionalKeywords: product.seo.additionalKeywords || undefined,
         facebookTitle: product.seo.facebookTitle || undefined,
         facebookDesc: product.seo.facebookDesc || undefined,
         facebookImage: product.seo.facebookImage || undefined,
         twitterTitle: product.seo.twitterTitle || undefined,
         twitterDesc: product.seo.twitterDesc || undefined,
         robotsSetting: product.seo.robotsSetting || "index, follow",
         includeSitemap: product.seo.includeSitemap ?? true,
         canonicalUrl: product.seo.canonicalUrl || `/${product.slug}`,
         schemaType: product.seo.schemaType || "Product",
         structuredData: product.seo.structuredData
            ? JSON.stringify(product.seo.structuredData, null, 2)
            : undefined,
         priorityScore: product.seo.priorityScore ?? 0.5,
         redirectUrl: product.seo.redirectUrl || undefined,
         redirectType: product.seo.redirectType || undefined,
         changeFrequency: product.seo.changeFrequency || "weekly",
      } : {
         robotsSetting: "index, follow",
         includeSitemap: true,
         schemaType: "Product",
         priorityScore: 0.5,
         changeFrequency: "weekly",
      },

      // options, variants, stocks, relatedProducts
      options: product.options.map((opt: any) => ({
         name: opt.name,
         values: opt.values.map((v: any) => v.value)
      })),
      variants: product.variants.map((v: any) => {
         const optionValues: Record<string, string> = {};
         v.variantValues.forEach((vv: any) => {
            // Reconstruct optionName -> value mapping
            const option = product.options.find((opt: any) => opt.id === vv.optionValue.optionId);
            if (option) {
               optionValues[option.name] = vv.optionValue.value;
            }
         });
         return {
            sku: v.sku,
            price: v.price?.toString() || undefined,
            salePrice: v.salePrice?.toString() || undefined,
            isActive: v.isActive,
            optionValues,
         }
      }),
      stocks: product.variants.flatMap((v: any) =>
         v.stock.map((s: any) => ({
            warehouseId: s.warehouseId,
            quantity: s.quantity.toString(),
            reserved: s.reserved?.toString() || undefined,
            lowThreshold: s.lowThreshold?.toString() || undefined,
         }))
      ),
      relatedProducts: product.relatedProducts.map((rp: any) => ({
         productId: rp.targetId,
         type: rp.type,
      })),
   };

   return (
      <div className="min-h-[calc(100vh-80px)] bg-linear-to-b from-sky-50 to-sky-100/70 px-4 py-2">
         <div className="mx-auto max-w-7xl space-y-6">
            <h1 className="text-xl font-bold">Edit Product: {product.name}</h1>
            <EditComprehensiveProductForm
               vendorId={vendorProfile.id}
               productId={product.id}
               initialData={initialData}
               superCategories={superCategories}
               categories={categories}
               brands={brands}
               warehouses={warehouses}
               tags={allTags}
               existingProducts={existingProducts}
            />
         </div>
      </div>
   );
}
