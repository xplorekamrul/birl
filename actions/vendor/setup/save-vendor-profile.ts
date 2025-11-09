"use server";

import { prisma } from "@/lib/prisma";
import { vendorSetupSchema } from "@/lib/validations/vendor";
import { vendorOnlyActionClient } from "@/lib/safe-action/clients";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const saveVendorProfile = vendorOnlyActionClient
  .schema(vendorSetupSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { session } = ctx;
    const userId = (session.user as any).id as string;

    const existing = await prisma.vendorProfile.findUnique({
      where: { userId },
    });

    const rawSlug = parsedInput.shopSlug || parsedInput.shopName;
    const finalSlug = slugify(rawSlug);

    // Ensure slug unique
    const slugOwner = await prisma.vendorProfile.findUnique({
      where: { shopSlug: finalSlug },
    });

    if (slugOwner && slugOwner.userId !== userId) {
      return {
        ok: false as const,
        message: "This shop URL (slug) is already in use. Please choose another.",
      };
    }

    const data = {
      userId,
      shopName: parsedInput.shopName,
      shopSlug: finalSlug,
      shopDescription: parsedInput.shopDescription || null,

      businessType: parsedInput.businessType || null,
      businessRegistration: parsedInput.businessRegistration || null,
      taxId: parsedInput.taxId || null,
      businessEmail: parsedInput.businessEmail || null,
      businessPhone: parsedInput.businessPhone || null,
      businessAddress: parsedInput.businessAddress || null,

      shopLogo: parsedInput.shopLogo || null,
      shopBanner: parsedInput.shopBanner || null,
    };

    const vendor = existing
      ? await prisma.vendorProfile.update({
          where: { userId },
          data,
        })
      : await prisma.vendorProfile.create({
          data,
        });

    return {
      ok: true as const,
      message: existing
        ? "Vendor profile updated successfully."
        : "Vendor profile created successfully.",
      vendorId: vendor.id,
      shopSlug: vendor.shopSlug,
    };
  });
