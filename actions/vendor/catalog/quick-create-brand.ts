"use server";

import { prisma } from "@/lib/prisma";
import { vendorActionClient } from "@/lib/safe-action/clients";
import { quickCreateNameSchema } from "@/lib/validations/catalog";
import { slugify } from "@/lib/slugify";

async function ensureUniqueBrandSlug(base: string) {
  let slug = base;
  let count = 1;
  while (true) {
    const existing = await prisma.brand.findFirst({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
    count += 1;
    slug = `${base}-${count}`;
  }
}

export const quickCreateBrand = vendorActionClient
  .schema(quickCreateNameSchema)
  .action(async ({ parsedInput }) => {
    const baseSlug = slugify(parsedInput.name);
    const finalSlug = await ensureUniqueBrandSlug(baseSlug);

    const brand = await prisma.brand.create({
      data: {
        name: parsedInput.name,
        slug: finalSlug,
      },
    });

    return { ok: true as const, brand };
  });
