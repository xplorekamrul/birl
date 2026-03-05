import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import ProductDetailLayout from "@/components/product/ProductDetailLayout";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

// ─── Site origin ───────────────────────────────────────────────────────────────
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

// ─── Page props ────────────────────────────────────────────────────────────────
type PageProps = { params: Promise<{ slug: string }> };

// ─── Prisma include ───────────────────────────────────────────────────────────
// Every relation that the page or SEO needs is listed here once.
const productInclude = {
   brand: true,
   category: {
      include: {
         superCategory: { select: { id: true, name: true, slug: true } },
      },
   },
   vendor: {
      select: {
         id: true,
         shopName: true,
         shopSlug: true,
         averageRating: true,
         totalReviews: true,
      },
   },
   media: { orderBy: { sortOrder: "asc" as const } },
   specifications: true,
   seo: true,          // ← full ProductSeo row (all 15 columns)
   tags: { select: { name: true } },
   options: { include: { values: true } },
   variants: {
      include: {
         variantValues: { include: { optionValue: true } },
         stock: true,
      },
   },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export type SerializedProduct = Omit<
   ProductWithRelations,
   "basePrice" | "salePrice" | "cost" | "weight" | "length" | "width" | "height" | "variants"
> & {
   basePrice: number;
   salePrice: number | null;
   cost: number | null;
   weight: number | null;
   length: number | null;
   width: number | null;
   height: number | null;
   variants: (Omit<
      ProductWithRelations["variants"][0],
      "price" | "salePrice" | "cost" | "weight" | "length" | "width" | "height"
   > & {
      price: number | null;
      salePrice: number | null;
      cost: number | null;
      weight: number | null;
      length: number | null;
      width: number | null;
      height: number | null;
   })[];
};

// ─── Shared DB fetch (called by both generateMetadata and the page) ───────────
async function getProduct(slug: string) {
   return prisma.product.findFirst({
      where: { slug: { equals: slug, mode: "insensitive" } },
      include: productInclude,
   });
}

// ─────────────────────────────────────────────────────────────────────────────
// generateMetadata
// Next.js calls this before rendering and writes every returned value into
// the HTML <head> automatically — no need to render any <meta> tags manually.
// ─────────────────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
   const { slug } = await params;
   const product = await getProduct(slug);

   // ── Product not found ────────────────────────────────────────────────────
   if (!product) {
      return {
         title: "Product not found",
         description: "The product you are looking for does not exist.",
         robots: { index: false, follow: false },
      };
   }

   // ── Shortcuts ────────────────────────────────────────────────────────────
   const seo = product.seo;                         // ProductSeo | null
   const productUrl = `${SITE_URL}/${product.slug}`;

   // ── [1] Core title & description ─────────────────────────────────────────
   // Priority: seo.seoTitle → product.name
   const title = seo?.seoTitle?.trim() || product.name;

   // Priority: seo.metaDescription → shortDescription → stripped description → generated
   const description =
      seo?.metaDescription?.trim() ||
      product.shortDescription?.trim() ||
      product.description?.replace(/<[^>]+>/g, "").slice(0, 160).trim() ||
      `Buy ${product.name} online at the best price — Birl Ecommerce.`;

   // ── [2] Canonical URL ─────────────────────────────────────────────────────
   // seo.canonicalUrl (vendor custom) → absolute product URL
   const canonicalUrl = seo?.canonicalUrl?.trim() || productUrl;

   // ── [3] Robots ────────────────────────────────────────────────────────────
   // seo.robotsSetting — e.g. "index, follow" / "noindex, follow" etc.
   const robotsRaw = seo?.robotsSetting ?? "index, follow";
   const noIndex = robotsRaw.includes("noindex");
   const noFollow = robotsRaw.includes("nofollow");

   // ── [4] Open Graph / Facebook ─────────────────────────────────────────────
   // seo.facebookTitle  → og:title
   // seo.facebookDesc   → og:description
   // seo.facebookImage  → og:image (primary), then subsequent product media
   const ogTitle = seo?.facebookTitle?.trim() || title;
   const ogDesc = seo?.facebookDesc?.trim() || description;
   const ogImageUrl = seo?.facebookImage?.trim() || product.media[0]?.url || null;

   const ogImages = ogImageUrl
      ? [
         { url: ogImageUrl, width: 1200, height: 630, alt: product.name, type: "image/jpeg" },
         // Up to 3 more product images as supplementary OG images
         ...product.media
            .slice(1, 4)
            .filter((m) => m.url !== ogImageUrl)
            .map((m) => ({ url: m.url, alt: m.alt || product.name })),
      ]
      : [];

   // ── [5] Twitter / X Card ──────────────────────────────────────────────────
   // seo.twitterTitle → twitter:title
   // seo.twitterDesc  → twitter:description
   const twTitle = seo?.twitterTitle?.trim() || title;
   const twDesc = seo?.twitterDesc?.trim() || description;
   const twImageUrl = product.media[0]?.url || null;

   // ── [6] Keywords ──────────────────────────────────────────────────────────
   // seo.focusKeyphrase + seo.additionalKeywords + brand + category + tags + product name
   const keywords = [
      seo?.focusKeyphrase,
      ...(seo?.additionalKeywords?.split(",").map((k) => k.trim()) ?? []),
      product.brand?.name,
      product.category?.name,
      product.category?.superCategory?.name,
      ...product.tags.map((t) => t.name),
      product.name,
   ]
      .filter((k): k is string => Boolean(k?.trim()))
      .slice(0, 20);

   // ── [7] Effective price (for product:price meta) ──────────────────────────
   const effectivePrice = Number(product.salePrice ?? product.basePrice);

   // ── Return all metadata ───────────────────────────────────────────────────
   return {
      // ── Core ──────────────────────────────────────────────────────────────
      title,
      description,
      keywords,

      // ── Canonical ─────────────────────────────────────────────────────────
      alternates: {
         canonical: canonicalUrl,
      },

      // ── Robots ────────────────────────────────────────────────────────────
      // max-image-preview:large → lets Google show large image previews
      // max-snippet:-1          → lets Google show any-length text snippets
      robots: {
         index: !noIndex,
         follow: !noFollow,
         "max-image-preview": "large",
         "max-snippet": -1,
         "max-video-preview": -1,
         googleBot: {
            index: !noIndex,
            follow: !noFollow,
            "max-image-preview": "large",
            "max-snippet": -1,
         },
      },

      // ── Open Graph ────────────────────────────────────────────────────────
      openGraph: {
         type: "website",
         url: canonicalUrl,
         title: ogTitle,
         description: ogDesc,
         siteName: "Birl Ecommerce",
         locale: "en_US",
         images: ogImages,
      },

      // ── Twitter / X Card ──────────────────────────────────────────────────
      twitter: {
         card: "summary_large_image",
         title: twTitle,
         description: twDesc,
         site: "@BirlEcommerce",
         ...(twImageUrl ? { images: [twImageUrl] } : {}),
      },

      // ── Extra <meta> tags (via next.js "other") ───────────────────────────
      // product:* tags are read by Facebook Shops, Google Merchant, and aggregators.
      // article:modified_time is a freshness signal used by Google News / Discover.
      other: {
         // Product-specific Open Graph extensions
         "product:price:amount": String(effectivePrice),
         "product:price:currency": "BDT",
         "product:availability": product.status === "ACTIVE" ? "in stock" : "out of stock",
         "product:condition": "new",
         ...(product.brand?.name ? { "product:brand": product.brand.name } : {}),
         ...(product.sku ? { "product:retailer_item_id": product.sku } : {}),
         ...(product.category?.name ? { "product:category": product.category.name } : {}),

         // Freshness signal — used by Google Discover / News ranking
         ...(product.updatedAt ? { "article:modified_time": product.updatedAt.toISOString() } : {}),
         ...(product.createdAt ? { "article:published_time": product.createdAt.toISOString() } : {}),
      },
   };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────────────────────────────────────
export default async function ProductPage({ params }: PageProps) {
   "use cache";
   cacheLife("hours");
   cacheTag("product-detail");

   const { slug } = await params;
   if (!slug || typeof slug !== "string") notFound();

   const product = await getProduct(slug);
   if (!product) notFound();

   cacheTag(`product-${slug}`);

   const seo = product.seo;
   const productUrl = `${SITE_URL}/${product.slug}`;

   // ── Redirect (seo.redirectUrl / seo.redirectType) ──────────────────────
   // If a vendor has configured a redirect in the SEO settings, honour it.
   // redirect() in Next.js server components defaults to 307; for 301 we'd
   // need a middleware, but redirect() still prevents the page from rendering.
   if (seo?.redirectUrl?.trim()) {
      redirect(seo.redirectUrl.trim());
   }

   // ── Decimal → plain-number serialization ───────────────────────────────
   // Prisma Decimal objects cannot cross the server→client boundary.
   const serializedProduct: SerializedProduct = {
      ...product,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      cost: product.cost ? Number(product.cost) : null,
      weight: product.weight ? Number(product.weight) : null,
      length: product.length ? Number(product.length) : null,
      width: product.width ? Number(product.width) : null,
      height: product.height ? Number(product.height) : null,
      variants: product.variants.map((v) => ({
         ...v,
         price: v.price ? Number(v.price) : null,
         salePrice: v.salePrice ? Number(v.salePrice) : null,
         cost: v.cost ? Number(v.cost) : null,
         weight: v.weight ? Number(v.weight) : null,
         length: v.length ? Number(v.length) : null,
         width: v.width ? Number(v.width) : null,
         height: v.height ? Number(v.height) : null,
      })),
   };

   const effectivePrice = Number(product.salePrice ?? product.basePrice);

   // ── Breadcrumb items (reused in both JSON-LD blocks) ───────────────────
   type BreadcrumbItem = { "@type": "ListItem"; position: number; name: string; item: string };
   const breadcrumbItems: BreadcrumbItem[] = [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
   ];
   if (product.category?.superCategory) {
      breadcrumbItems.push({
         "@type": "ListItem",
         position: 2,
         name: product.category.superCategory.name,
         item: `${SITE_URL}/super-category/${product.category.superCategory.slug}`,
      });
   }
   if (product.category) {
      breadcrumbItems.push({
         "@type": "ListItem",
         position: breadcrumbItems.length + 1,
         name: product.category.name,
         item: `${SITE_URL}/category/${product.category.slug}`,
      });
   }
   breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: product.name,
      item: productUrl,
   });

   // ── Auto-generated Product JSON-LD ─────────────────────────────────────
   // seo.structuredData (vendor custom JSON) overrides this entirely.
   const autoJsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": seo?.schemaType || "Product",
      "@id": productUrl,

      // Core identity
      name: product.name,
      url: productUrl,
      description:
         product.description?.replace(/<[^>]+>/g, "").trim() ||
         product.shortDescription ||
         "",

      // Images — each as ImageObject so Google can pick correct aspect ratios
      image: product.media.map((m) => ({
         "@type": "ImageObject",
         url: m.url,
         ...(m.alt ? { name: m.alt } : {}),
      })),

      // Product identifiers (all major schemes)
      ...(product.sku ? { sku: product.sku } : {}),
      ...(product.barcode ? { gtin13: product.barcode } : {}),
      ...(product.gtin ? { gtin: product.gtin } : {}),
      ...(product.upc ? { gtin12: product.upc } : {}),
      ...(product.ean ? { gtin8: product.ean } : {}),
      ...(product.isbn ? { isbn: product.isbn } : {}),

      // Classification
      ...(product.category ? { category: product.category.name } : {}),
      ...(product.tags.length > 0
         ? { keywords: product.tags.map((t) => t.name).join(", ") }
         : {}),

      // Brand
      ...(product.brand
         ? { brand: { "@type": "Brand", name: product.brand.name } }
         : {}),

      // Physical properties
      ...(product.weight
         ? {
            weight: {
               "@type": "QuantitativeValue",
               value: Number(product.weight),
               unitCode: "KGM",
               unitText: "kg",
            },
         }
         : {}),

      // Offers array — new condition always present; refurbished added if allowed
      offers: [
         {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "BDT",
            price: effectivePrice,
            // priceValidUntil required by Google for rich results — set 1 year ahead
            priceValidUntil: new Date(
               new Date().setFullYear(new Date().getFullYear() + 1)
            ).toISOString().split("T")[0],
            availability: product.status === "ACTIVE"
               ? "https://schema.org/InStock"
               : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            ...(product.vendor
               ? {
                  seller: {
                     "@type": "Organization",
                     name: product.vendor.shopName,
                  },
               }
               : {}),
            ...(product.shippingClass
               ? {
                  shippingDetails: {
                     "@type": "OfferShippingDetails",
                     shippingLabel: product.shippingClass,
                  },
               }
               : {}),
         },
         // Refurbished offer — only when product.allowRefurbished = true
         ...(product.allowRefurbished
            ? [
               {
                  "@type": "Offer",
                  url: productUrl,
                  priceCurrency: "BDT",
                  price: Math.round(effectivePrice * 0.7),
                  priceValidUntil: new Date(
                     new Date().setFullYear(new Date().getFullYear() + 1)
                  ).toISOString().split("T")[0],
                  availability: product.status === "ACTIVE"
                     ? "https://schema.org/InStock"
                     : "https://schema.org/OutOfStock",
                  itemCondition: "https://schema.org/RefurbishedCondition",
               },
            ]
            : []),
      ],

      // Aggregate Rating — only included when reviews exist (required by Google)
      ...(product.totalReviews > 0
         ? {
            aggregateRating: {
               "@type": "AggregateRating",
               ratingValue: product.averageRating.toFixed(1),
               reviewCount: product.totalReviews,
               bestRating: "5",
               worstRating: "1",
            },
         }
         : {}),

      // Embedded breadcrumb within the Product entity for richer context
      breadcrumb: {
         "@type": "BreadcrumbList",
         itemListElement: breadcrumbItems,
      },
   };

   // Use vendor custom JSON-LD if it's a non-null JSON object in DB
   const jsonLd: Record<string, unknown> =
      seo?.structuredData && typeof seo.structuredData === "object"
         ? (seo.structuredData as Record<string, unknown>)
         : autoJsonLd;

   return (
      <>
         {/* ── Product JSON-LD (schema.org/Product) ─────────────────────── */}
         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
         />

         {/* ── Standalone BreadcrumbList JSON-LD ────────────────────────── */}
         {/* Separate block so Google can parse breadcrumbs independently   */}
         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
               __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  itemListElement: breadcrumbItems,
               }),
            }}
         />

         {/* ── Page content ─────────────────────────────────────────────── */}
         <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-sky-50 via-white to-sky-100/60 px-4 py-8">
            <div className="mx-auto max-w-6xl">
               <ProductDetailLayout product={serializedProduct} />
            </div>
         </div>
      </>
   );
}
