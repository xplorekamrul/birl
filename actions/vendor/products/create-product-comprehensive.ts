"use server";

import { prisma } from "@/lib/prisma";
import { vendorActionClient } from "@/lib/safe-action/clients";
import { productComprehensiveSchema } from "@/lib/validations/product-comprehensive";
import { revalidatePath } from "next/cache";

function slugify(name: string) {
   return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
}

export const createProductComprehensive = vendorActionClient
   .schema(productComprehensiveSchema)
   .action(async ({ parsedInput, ctx }) => {
      const { session } = ctx;
      const userId = (session.user as any).id as string;

      // Get vendor profile
      const vendorProfile = await prisma.vendorProfile.findUnique({
         where: { userId },
         select: { id: true },
      });

      if (!vendorProfile) {
         return {
            ok: false as const,
            message: "Vendor profile not found. Please complete your vendor setup.",
         };
      }

      const {
         name,
         slug: inputSlug,
         categoryId,
         superCategoryId,
         brandId,
         basePrice,
         salePrice,
         cost,
         productType,
         status,
         visibility,
         sku,
         barcode,
         gtin,
         upc,
         ean,
         isbn,
         description,
         shortDescription,
         weight,
         length,
         width,
         height,
         shippingClass,
         stockManagement,
         allowBackorders,
         lowStockThreshold,
         soldIndividually,
         allowRefurbished,
         allowRent,
         allowHirePurchase,
         allowPreOrder,
         scheduledPublish,
         media = [],
         options = [],
         variants = [],
         stocks = [],
         seo,
         relatedProducts = [],
         tags = [],
      } = parsedInput;

      // Generate slug if not provided
      const finalSlug = inputSlug || slugify(name);

      // Check slug uniqueness
      const existingSlug = await prisma.product.findUnique({
         where: { slug: finalSlug },
      });

      if (existingSlug) {
         return {
            ok: false as const,
            message: "Slug already in use. Please choose a different one.",
         };
      }

      try {
         // Generate SKU if not provided
         const finalSku = sku || `${finalSlug}-${Date.now()}`;

         // Check uniqueness for all product codes
         const [existingSku, existingGtin, existingUpc, existingEan, existingIsbn] = await Promise.all([
            sku ? prisma.product.findUnique({ where: { sku: finalSku } }) : null,
            gtin ? prisma.product.findUnique({ where: { gtin } }) : null,
            upc ? prisma.product.findUnique({ where: { upc } }) : null,
            ean ? prisma.product.findUnique({ where: { ean } }) : null,
            isbn ? prisma.product.findUnique({ where: { isbn } }) : null,
         ]);

         if (existingSku) {
            return {
               ok: false as const,
               message: `SKU "${finalSku}" is already in use by another product. Please use a different SKU.`,
            };
         }

         if (existingGtin) {
            return {
               ok: false as const,
               message: `GTIN "${gtin}" is already in use by another product. Please use a different GTIN.`,
            };
         }

         if (existingUpc) {
            return {
               ok: false as const,
               message: `UPC "${upc}" is already in use by another product. Please use a different UPC.`,
            };
         }

         if (existingEan) {
            return {
               ok: false as const,
               message: `EAN "${ean}" is already in use by another product. Please use a different EAN.`,
            };
         }

         if (existingIsbn) {
            return {
               ok: false as const,
               message: `ISBN "${isbn}" is already in use by another product. Please use a different ISBN.`,
            };
         }

         // Create product with all related data
         const product = await prisma.product.create({
            data: {
               vendorId: vendorProfile.id,
               categoryId,
               brandId: brandId || null,
               name,
               slug: finalSlug,
               description: description || null,
               shortDescription: shortDescription || null,
               productType,
               status,
               visibility,

               basePrice: parseFloat(basePrice),
               salePrice: salePrice ? parseFloat(salePrice) : null,
               cost: cost ? parseFloat(cost) : null,

               sku: finalSku,
               barcode: barcode || null,
               gtin: gtin || null,
               upc: upc || null,
               ean: ean || null,
               isbn: isbn || null,

               weight: weight ? parseFloat(weight) : null,
               length: length ? parseFloat(length) : null,
               width: width ? parseFloat(width) : null,
               height: height ? parseFloat(height) : null,
               shippingClass: shippingClass || null,

               stockManagement,
               allowBackorders,
               lowStockThreshold: parseInt(lowStockThreshold || "10"),
               soldIndividually,

               allowRefurbished,
               allowRent,
               allowHirePurchase,
               allowPreOrder,

               scheduledPublish: scheduledPublish ? new Date(scheduledPublish) : null,

               // Media
               media: media.length > 0 ? {
                  create: media.map((m, idx) => ({
                     url: m.url,
                     type: m.type,
                     alt: m.alt || null,
                     sortOrder: idx,
                  })),
               } : undefined,

               // SEO
               seo: seo ? {
                  create: {
                     seoTitle: seo.seoTitle || null,
                     metaDescription: seo.metaDescription || null,
                     focusKeyphrase: seo.focusKeyphrase || null,
                     additionalKeywords: seo.additionalKeywords || null,
                     facebookTitle: seo.facebookTitle || null,
                     facebookDesc: seo.facebookDesc || null,
                     facebookImage: seo.facebookImage || null,
                     twitterTitle: seo.twitterTitle || null,
                     twitterDesc: seo.twitterDesc || null,
                     robotsSetting: seo.robotsSetting,
                     includeSitemap: seo.includeSitemap,
                     canonicalUrl: seo.canonicalUrl || null,
                  },
               } : undefined,

               // Tags
               tags: tags.length > 0 ? {
                  connect: tags.map(tagId => ({ id: tagId })),
               } : undefined,
            },
            select: {
               id: true,
               slug: true,
            },
         });

         // Handle variants if VARIABLE product type
         if (productType === "VARIABLE" && options.length > 0) {
            // Create options
            const createdOptions = await Promise.all(
               options.map(opt =>
                  prisma.productOption.create({
                     data: {
                        productId: product.id,
                        name: opt.name,
                        values: {
                           create: opt.values.map(val => ({
                              value: val,
                           })),
                        },
                     },
                     include: {
                        values: true,
                     },
                  })
               )
            );

            // Create variants
            if (variants.length > 0) {
               await Promise.all(
                  variants.map(variant =>
                     prisma.productVariant.create({
                        data: {
                           productId: product.id,
                           vendorId: vendorProfile.id,
                           sku: variant.sku,
                           price: variant.price ? parseFloat(variant.price) : null,
                           salePrice: variant.salePrice ? parseFloat(variant.salePrice) : null,
                           isActive: variant.isActive,
                           variantValues: {
                              create: Object.entries(variant.optionValues).map(([optName, value]) => {
                                 const option = createdOptions.find(o => o.name === optName);
                                 const optionValue = option?.values.find(v => v.value === value);
                                 return {
                                    optionValueId: optionValue?.id || "",
                                 };
                              }),
                           },
                        },
                     })
                  )
               );
            }
         }

         // Handle inventory/stocks
         if (stocks.length > 0) {
            // For SIMPLE products, create stock for base product
            if (productType === "SIMPLE") {
               // Get or create a default variant for simple products
               let variant = await prisma.productVariant.findFirst({
                  where: { productId: product.id },
               });

               if (!variant) {
                  variant = await prisma.productVariant.create({
                     data: {
                        productId: product.id,
                        vendorId: vendorProfile.id,
                        sku: sku || `${finalSlug}-default`,
                        price: parseFloat(basePrice),
                     },
                  });
               }

               // Create stocks for each warehouse
               await Promise.all(
                  stocks.map(stock =>
                     prisma.stock.create({
                        data: {
                           variantId: variant!.id,
                           warehouseId: stock.warehouseId,
                           quantity: parseInt(stock.quantity),
                           reserved: stock.reserved ? parseInt(stock.reserved) : 0,
                           lowThreshold: stock.lowThreshold ? parseInt(stock.lowThreshold) : 10,
                        },
                     })
                  )
               );
            } else if (productType === "VARIABLE") {
               // For VARIABLE products, assign stocks to each variant
               const createdVariants = await prisma.productVariant.findMany({
                  where: { productId: product.id },
               });

               await Promise.all(
                  createdVariants.flatMap(variant =>
                     stocks.map(stock =>
                        prisma.stock.create({
                           data: {
                              variantId: variant.id,
                              warehouseId: stock.warehouseId,
                              quantity: parseInt(stock.quantity),
                              reserved: stock.reserved ? parseInt(stock.reserved) : 0,
                              lowThreshold: stock.lowThreshold ? parseInt(stock.lowThreshold) : 10,
                           },
                        })
                     )
                  )
               );
            }
         }

         // Handle related products
         if (relatedProducts.length > 0) {
            await Promise.all(
               relatedProducts.map(rel =>
                  prisma.relatedProduct.create({
                     data: {
                        sourceId: product.id,
                        targetId: rel.productId,
                        type: rel.type,
                     },
                  })
               )
            );
         }

         // Revalidate product-related caches
         revalidatePath("/vendor/products");
         revalidatePath(`/product/${product.slug}`);

         return {
            ok: true as const,
            message: "Product created successfully",
            product: {
               id: product.id,
               slug: product.slug,
            },
         };
      } catch (error) {
         console.error("Product creation error:", error);

         // Handle Prisma unique constraint errors
         if (error instanceof Error && error.message.includes("Unique constraint failed")) {
            const match = error.message.match(/`(\w+)`/);
            const field = match ? match[1] : "field";
            return {
               ok: false as const,
               message: `The ${field} value is already in use by another product. Please use a different value.`,
            };
         }

         return {
            ok: false as const,
            message: error instanceof Error ? error.message : "Failed to create product",
         };
      }
   });
