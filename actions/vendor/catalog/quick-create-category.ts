"use server";

import { prisma } from "@/lib/prisma";
import { vendorActionClient } from "@/lib/safe-action/clients";
import { quickCreateNameSchema } from "@/lib/validations/catalog";
import { slugify } from "@/lib/slugify";

async function ensureUniqueCategorySlug(base: string) {
  let slug = base;
  let count = 1;
  while (true) {
    const existing = await prisma.category.findFirst({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
    count += 1;
    slug = `${base}-${count}`;
  }
}

export const quickCreateCategory = vendorActionClient
  .schema(quickCreateNameSchema)
  .action(async ({ parsedInput }) => {
    const baseSlug = slugify(parsedInput.name);
    const finalSlug = await ensureUniqueCategorySlug(baseSlug);

    const category = await prisma.category.create({
      data: {
        name: parsedInput.name,
        slug: finalSlug,
        isActive: true,
      },
    });

    return { ok: true as const, category };
  });
