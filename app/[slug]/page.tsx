import { notFound } from "next/navigation";

import ProductDetailLayout from "@/components/product/ProductDetailLayout";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

type PageProps = {
   params: Promise<{
      slug: string;
   }>;
};

const productInclude = {
   brand: true,
   category: true,
   vendor: {
      select: {
         id: true,
         shopName: true,
         shopSlug: true,
         averageRating: true,
         totalReviews: true,
      },
   },
   media: true,
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
   include: typeof productInclude;
}>;

export type SerializedProduct = Omit<ProductWithRelations, 'basePrice' | 'salePrice' | 'cost' | 'weight' | 'length' | 'width' | 'height'> & {
   basePrice: number;
   salePrice: number | null;
   cost: number | null;
   weight: number | null;
   length: number | null;
   width: number | null;
   height: number | null;
};

export default async function ProductPage({ params }: PageProps) {
   "use cache";
   cacheLife("hours");
   cacheTag("product-detail");

   const { slug } = await params;

   if (!slug || typeof slug !== "string") {
      notFound();
   }

   const product = await prisma.product.findFirst({
      where: {
         slug: {
            equals: slug,
            mode: "insensitive",
         },
      },
      include: productInclude,
   });

   if (!product) {
      notFound();
   }

   // Add product-specific cache tag for targeted revalidation
   cacheTag(`product-${slug}`);

   // Convert Decimal types to numbers for client component compatibility
   const serializedProduct: SerializedProduct = {
      ...product,
      basePrice: Number(product.basePrice),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      cost: product.cost ? Number(product.cost) : null,
      weight: product.weight ? Number(product.weight) : null,
      length: product.length ? Number(product.length) : null,
      width: product.width ? Number(product.width) : null,
      height: product.height ? Number(product.height) : null,
   };

   return (
      <div className="min-h-[calc(100vh-80px)] bg-linear-to-b from-sky-50 via-white to-sky-100/60 px-4 py-8">
         <div className="mx-auto max-w-6xl">
            <ProductDetailLayout product={serializedProduct} />
         </div>
      </div>
   );
}
