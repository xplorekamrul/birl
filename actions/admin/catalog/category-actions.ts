"use server";

import { prisma } from "@/lib/prisma";
import { adminActionClient } from "@/lib/safe-action/clients";
import { slugify } from "@/lib/slugify";
import { categorySchema } from "@/lib/validations/catalog";
import { revalidateTag } from "next/cache";

async function ensureUniqueCategorySlug(base: string, idToExclude?: string) {
  let slug = base;
  let count = 1;
  while (true) {
    const existing = await prisma.category.findFirst({
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

export const createCategory = adminActionClient
  .schema(categorySchema.omit({ id: true }))
  .action(async ({ parsedInput }) => {
    const baseSlug = parsedInput.slug || slugify(parsedInput.name);
    const finalSlug = await ensureUniqueCategorySlug(baseSlug);

    const superCatId = parsedInput.superCategoryId || (await prisma.superCategory.findFirst({ select: { id: true } }))?.id;

    if (!superCatId) throw new Error("No Super Category available");

    const category = await prisma.category.create({
      data: {
        name: parsedInput.name,
        slug: finalSlug,
        description: parsedInput.description || null,
        image: parsedInput.image || null,
        parentId: parsedInput.parentId || null,
        superCategoryId: superCatId,
        isActive: parsedInput.isActive ?? true,
        displayOrder: parsedInput.displayOrder ?? 0,
      },
    });

    revalidateTag("admin-catalog", "max");
    return { ok: true as const, category };
  });

export const updateCategory = adminActionClient
  .schema(categorySchema)
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) {
      return { ok: false as const, message: "Category id is required" };
    }

    const baseSlug = parsedInput.slug || slugify(parsedInput.name);
    const finalSlug = await ensureUniqueCategorySlug(baseSlug, parsedInput.id);

    const superCatId = parsedInput.superCategoryId || (await prisma.superCategory.findFirst({ select: { id: true } }))?.id;

    if (!superCatId) throw new Error("No Super Category available");

    const category = await prisma.category.update({
      where: { id: parsedInput.id },
      data: {
        name: parsedInput.name,
        slug: finalSlug,
        description: parsedInput.description || null,
        image: parsedInput.image || null,
        parentId: parsedInput.parentId || null,
        superCategoryId: superCatId,
        isActive: parsedInput.isActive ?? true,
        displayOrder: parsedInput.displayOrder ?? 0,
      },
    });

    revalidateTag("admin-catalog", "max");
    return { ok: true as const, category };
  });

export const deleteCategory = adminActionClient
  .schema(
    categorySchema
      .pick({ id: true })
      .required({ id: true })
  )
  .action(async ({ parsedInput }) => {
    await prisma.category.delete({
      where: { id: parsedInput.id! },
    });

    revalidateTag("admin-catalog", "max");
    return { ok: true as const };
  });
