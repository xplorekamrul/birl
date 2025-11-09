"use server";

import { prisma } from "@/lib/prisma";
import { productCreateSchema } from "@/lib/validations/product";
import { vendorActionClient } from "@/lib/safe-action/clients";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const createProduct = vendorActionClient
  .schema(productCreateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { session } = ctx;
    const userId = (session.user as any).id as string;

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
      slug,
      categoryId,
      brandId,
      basePrice,
      salePrice,
      cost,
      sku,
      barcode,
      lowStockThreshold,
      description,
      shortDescription,
      metaTitle,
      metaDescription,
      metaKeywords,
      allowRefurbished,
      allowRent,
      allowHirePurchase,
      allowPreOrder,
      status,
      visibility,
    } = parsedInput;

    const finalSlug = slug || slugify(name);

    // Ensure slug is unique per product
    const hasSlug = await prisma.product.findUnique({ where: { slug: finalSlug } });
    if (hasSlug) {
      return {
        ok: false as const,
        message: "Slug already in use. Please choose a different one.",
      };
    }

    const product = await prisma.product.create({
      data: {
        vendorId: vendorProfile.id,
        categoryId,
        brandId: brandId || null,
        name,
        slug: finalSlug,
        description: description || null,
        shortDescription: shortDescription || null,

        basePrice: basePrice,
        salePrice: salePrice ?? null,
        cost: cost ?? null,

        sku: sku || null,
        barcode: barcode || null,
        lowStockThreshold: Number(lowStockThreshold ?? "10"),

        status,
        visibility,

        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,

        allowRefurbished: !!allowRefurbished,
        allowRent: !!allowRent,
        allowHirePurchase: !!allowHirePurchase,
        allowPreOrder: !!allowPreOrder,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    return {
      ok: true as const,
      message: "Product created successfully",
      product,
    };
  });
