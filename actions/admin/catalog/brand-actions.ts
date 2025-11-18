"use server";

import { prisma } from "@/lib/prisma";
import { adminActionClient } from "@/lib/safe-action/clients";
import { brandSchema } from "@/lib/validations/catalog";
import { slugify } from "@/lib/slugify";

async function ensureUniqueBrandSlug(base: string, idToExclude?: string) {
  let slug = base;
  let count = 1;
  while (true) {
    const existing = await prisma.brand.findFirst({
      where: {
        slug,
        ...(idToExclude ? { NOT: { id: idToExclude } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return slug;
    count += 1;
    slug = `${base}-${count}`;
  }
}

export const createBrand = adminActionClient
  .schema(brandSchema.omit({ id: true }))
  .action(async ({ parsedInput }) => {
    const baseSlug = parsedInput.slug || slugify(parsedInput.name);
    const finalSlug = await ensureUniqueBrandSlug(baseSlug);

    const brand = await prisma.brand.create({
      data: {
        name: parsedInput.name,
        slug: finalSlug,
      },
    });

    return { ok: true as const, brand };
  }); 

export const updateBrand = adminActionClient
  .schema(brandSchema)
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) {
      return { ok: false as const, message: "Brand id is required" };
    }

    const baseSlug = parsedInput.slug || slugify(parsedInput.name);
    const finalSlug = await ensureUniqueBrandSlug(baseSlug, parsedInput.id);

    const brand = await prisma.brand.update({
      where: { id: parsedInput.id },
      data: {
        name: parsedInput.name,
        slug: finalSlug,
      },
    });

    return { ok: true as const, brand };
  });

export const deleteBrand = adminActionClient
  .schema(
    brandSchema
      .pick({ id: true })
      .required({ id: true }) // id required for delete
  )
  .action(async ({ parsedInput }) => {
    await prisma.brand.delete({
      where: { id: parsedInput.id! },
    });
    return { ok: true as const };
  });
