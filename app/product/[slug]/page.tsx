import { notFound } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import ProductDetailLayout from "@/components/product/ProductDetailLayout";

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
  images: true,
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export default async function ProductPage({ params }: PageProps) {
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


  return (
    <div className="min-h-[calc(100vh-80px)] bg-linear-to-b from-sky-50 via-white to-sky-100/60 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <ProductDetailLayout product={product} />
      </div>
    </div>
  );
}
