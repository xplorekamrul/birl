import { z } from "zod";

/**
 * Comprehensive product creation schema with all tabs
 * Includes: General, Media, Variants, Inventory, Shipping, SEO, Related Products
 */

// Media validation
export const productMediaSchema = z.object({
   url: z.string().url("Invalid image URL"),
   type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
   alt: z.string().optional(),
   sortOrder: z.number().default(0),
});

// Specification validation
export const productSpecificationSchema = z.object({
   key: z.string().min(1, "Specification key required"),
   value: z.string().min(1, "Specification value required"),
});

// Product Option validation
export const productOptionSchema = z.object({
   name: z.string().min(1, "Option name required"),
   values: z.array(z.string().min(1)).min(1, "At least one value required"),
});

// Variant validation
export const productVariantSchema = z.object({
   sku: z.string().min(1, "SKU required for variant"),
   price: z.string().optional(),
   salePrice: z.string().optional(),
   isActive: z.boolean().default(true),
   optionValues: z.record(z.string(), z.string()), // { optionName: value }
});

// Stock validation
export const productStockSchema = z.object({
   warehouseId: z.string().min(1, "Warehouse required"),
   quantity: z.string().refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Quantity must be non-negative"
   ),
   reserved: z.string().optional().default("0"),
   lowThreshold: z.string().optional().default("10"),
});

// Related product validation
export const relatedProductSchema = z.object({
   productId: z.string().min(1, "Product required"),
   type: z.enum(["UPSELL", "CROSS_SELL"]),
});

// SEO validation
export const productSeoSchema = z.object({
   seoTitle: z.string().optional(),
   metaDescription: z.string().optional(),
   focusKeyphrase: z.string().optional(),
   additionalKeywords: z.string().optional(),
   facebookTitle: z.string().optional(),
   facebookDesc: z.string().optional(),
   facebookImage: z.string().optional(),
   twitterTitle: z.string().optional(),
   twitterDesc: z.string().optional(),
   robotsSetting: z.string().default("index, follow"),
   includeSitemap: z.boolean().default(true),
   canonicalUrl: z.string().optional(),
});

// Main comprehensive product schema
export const productComprehensiveSchema = z.object({
   // General Tab (Required)
   name: z.string().min(3, "Product name must be at least 3 characters"),
   slug: z
      .string()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
   categoryId: z.string().min(1, "Category is required"),
   superCategoryId: z.string().optional(),
   brandId: z.string().optional().nullable(),

   // Pricing (Required)
   basePrice: z
      .string()
      .min(1, "Base price is required")
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Base price must be non-negative"),
   salePrice: z
      .string()
      .nullable()
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : v))
      .refine(
         (v) => v === undefined || (!isNaN(Number(v)) && Number(v) >= 0),
         "Sale price must be non-negative"
      ),
   cost: z
      .string()
      .nullable()
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : v))
      .refine(
         (v) => v === undefined || (!isNaN(Number(v)) && Number(v) >= 0),
         "Cost must be non-negative"
      ),

   // Product Type & Status (Required)
   productType: z.enum(["SIMPLE", "VARIABLE", "DIGITAL", "VIRTUAL"]).default("SIMPLE"),
   status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).default("DRAFT"),
   visibility: z.enum(["PUBLIC", "PRIVATE", "HIDDEN"]).default("PUBLIC"),

   // Identification
   sku: z.string().optional().nullable(),
   barcode: z.string().optional().nullable(),
   gtin: z.string().optional().nullable(),
   upc: z.string().optional().nullable(),
   ean: z.string().optional().nullable(),
   isbn: z.string().optional().nullable(),

   // Description
   description: z.string().optional().nullable(),
   shortDescription: z.string().optional().nullable(),

   // Shipping & Dimensions
   weight: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : v))
      .refine(
         (v) => v === undefined || (!isNaN(Number(v)) && Number(v) >= 0),
         "Weight must be non-negative"
      ),
   length: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : v))
      .refine(
         (v) => v === undefined || (!isNaN(Number(v)) && Number(v) >= 0),
         "Length must be non-negative"
      ),
   width: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : v))
      .refine(
         (v) => v === undefined || (!isNaN(Number(v)) && Number(v) >= 0),
         "Width must be non-negative"
      ),
   height: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? undefined : v))
      .refine(
         (v) => v === undefined || (!isNaN(Number(v)) && Number(v) >= 0),
         "Height must be non-negative"
      ),
   shippingClass: z.string().optional(),

   // Inventory Management
   stockManagement: z.boolean().default(true),
   allowBackorders: z.boolean().default(false),
   lowStockThreshold: z
      .string()
      .optional()
      .transform((v) => (v === "" || v == null ? "10" : v))
      .refine(
         (v) => !isNaN(Number(v)) && Number(v) >= 0,
         "Low stock threshold must be non-negative"
      ),
   soldIndividually: z.boolean().default(false),

   // Purchase Types
   allowRefurbished: z.boolean().default(false),
   allowRent: z.boolean().default(false),
   allowHirePurchase: z.boolean().default(false),
   allowPreOrder: z.boolean().default(false),

   // Scheduling
   scheduledPublish: z.string().optional(),

   // Media Tab
   media: z.array(productMediaSchema).optional().default([]),

   // Variants & Options Tab (for VARIABLE products)
   options: z.array(productOptionSchema).optional().default([]),
   variants: z.array(productVariantSchema).optional().default([]),

   // Inventory Tab
   stocks: z.array(productStockSchema).optional().default([]),

   // SEO Tab
   seo: productSeoSchema.optional(),

   // Related Products Tab
   relatedProducts: z.array(relatedProductSchema).optional().default([]),

   // Tags
   tags: z.array(z.string()).optional().default([]),
});

export type ProductComprehensiveValues = z.infer<typeof productComprehensiveSchema>;
