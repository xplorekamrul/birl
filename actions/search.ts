"use server";

import { prisma } from "@/lib/prisma";

export async function searchProducts(query: string) {
   if (!query || query.trim().length < 2) {
      return [];
   }

   try {
      const products = await prisma.product.findMany({
         where: {
            AND: [
               {
                  status: "ACTIVE",
               },
               {
                  OR: [
                     {
                        name: {
                           contains: query,
                           mode: "insensitive",
                        },
                     },
                     {
                        description: {
                           contains: query,
                           mode: "insensitive",
                        },
                     },
                     {
                        shortDescription: {
                           contains: query,
                           mode: "insensitive",
                        },
                     },
                  ],
               },
            ],
         },
         select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            salePrice: true,
            images: {
               select: {
                  url: true,
               },
               take: 1,
            },
         },
         take: 8,
      });

      // Convert Decimal to number for client components
      const serializedProducts = products.map((product) => ({
         id: product.id,
         name: product.name,
         slug: product.slug,
         basePrice: Number(product.basePrice),
         salePrice: product.salePrice ? Number(product.salePrice) : null,
         images: product.images,
      }));

      return serializedProducts;
   } catch (error) {
      console.error("Search error:", error);
      return [];
   }
}
