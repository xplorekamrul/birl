"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { vendorAdminActionClient } from "@/lib/safe-action/clients";
import type { ProductCreateValues } from "@/lib/validations/product";

const ImageZ = z.object({
  url: z.string().min(1),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const schema = z.object({
  payload: z.custom<ProductCreateValues>(),
  images: z.array(ImageZ).optional(),
});

type Success = {
  ok: true;
  message: string;
  product: { id: string; slug: string };
};

type Failure =
  | { ok: false; message: "Not authenticated" }
  | { ok: false; message: "Vendor profile not found" }
  | { ok: false; message: string };

export type CreateProductWithImagesResponse = Success | Failure;

export const createProductWithImages = vendorAdminActionClient
  .schema(schema)
  .action(
    async ({ parsedInput, ctx }): Promise<CreateProductWithImagesResponse> => {
      const { payload, images = [] } = parsedInput;

      const userId = ctx.session?.user?.id;
      if (!userId) return { ok: false, message: "Not authenticated" };

      const vendorProfile = await prisma.vendorProfile.findFirst({
        where: { userId },
        select: { id: true },
      });
      if (!vendorProfile) {
        return { ok: false, message: "Vendor profile not found" };
      }

      const product = await prisma.product.create({
        data: {
          vendorId: vendorProfile.id,
          categoryId: payload.categoryId,
          brandId: payload.brandId ?? null,
          name: payload.name,
          slug: payload.slug,
          description: payload.description ?? null,
          shortDescription: payload.shortDescription ?? null,
          basePrice: payload.basePrice,
          salePrice: payload.salePrice ? payload.salePrice : null,
          cost: payload.cost ? payload.cost : null,
          sku: payload.sku ?? null,
          barcode: payload.barcode ?? null,
          lowStockThreshold: Number(payload.lowStockThreshold ?? "10"),
          status: payload.status,
          visibility: payload.visibility,
          metaTitle: payload.metaTitle ?? null,
          metaDescription: payload.metaDescription ?? null,
          metaKeywords: payload.metaKeywords ?? null,
        },
        select: { id: true, slug: true },
      });

      if (images.length > 0) {
        // Put chosen primary first
        const primaryIndex = images.findIndex((image) => image.isPrimary);
        const ordered = [...images];
        if (primaryIndex > 0) {
          const [primary] = ordered.splice(primaryIndex, 1);
          ordered.unshift(primary);
        }

        let sortOrder = 0;
        for (const img of ordered) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: img.url,
              alt: img.alt ?? null,
              sortOrder,
            },
          });
          sortOrder += 1;
        }
      }

      return {
        ok: true,
        message: "Product created successfully",
        product: { id: product.id, slug: product.slug },
      };
    },
  );
