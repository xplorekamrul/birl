"use server";

import { prisma } from "@/lib/prisma";
import { adminActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";

const superCategorySchema = z.object({
   name: z.string().min(1, "Name is required"),
   slug: z.string().min(1, "Slug is required"),
   description: z.string().optional().nullable(),
   image: z.string().optional().nullable(),
   isActive: z.boolean().default(true),
   displayOrder: z.number().default(0),
});

export const createSuperCategory = adminActionClient
   .schema(superCategorySchema)
   .action(async ({ parsedInput }) => {
      try {
         const existing = await prisma.superCategory.findUnique({
            where: { slug: parsedInput.slug },
         });

         if (existing) {
            return {
               ok: false as const,
               message: "Slug already exists",
            };
         }

         const superCategory = await prisma.superCategory.create({
            data: {
               name: parsedInput.name,
               slug: parsedInput.slug,
               description: parsedInput.description,
               image: parsedInput.image,
               isActive: parsedInput.isActive,
               displayOrder: parsedInput.displayOrder,
            },
         });

         return {
            ok: true as const,
            message: "Super category created successfully",
            superCategory,
         };
      } catch (error) {
         return {
            ok: false as const,
            message: error instanceof Error ? error.message : "Failed to create super category",
         };
      }
   });

export const updateSuperCategory = adminActionClient
   .schema(
      z.object({
         id: z.string(),
         ...superCategorySchema.shape,
      })
   )
   .action(async ({ parsedInput }) => {
      try {
         const existing = await prisma.superCategory.findUnique({
            where: { slug: parsedInput.slug },
         });

         if (existing && existing.id !== parsedInput.id) {
            return {
               ok: false as const,
               message: "Slug already exists",
            };
         }

         const superCategory = await prisma.superCategory.update({
            where: { id: parsedInput.id },
            data: {
               name: parsedInput.name,
               slug: parsedInput.slug,
               description: parsedInput.description,
               image: parsedInput.image,
               isActive: parsedInput.isActive,
               displayOrder: parsedInput.displayOrder,
            },
         });

         return {
            ok: true as const,
            message: "Super category updated successfully",
            superCategory,
         };
      } catch (error) {
         return {
            ok: false as const,
            message: error instanceof Error ? error.message : "Failed to update super category",
         };
      }
   });

export const deleteSuperCategory = adminActionClient
   .schema(z.object({ id: z.string() }))
   .action(async ({ parsedInput }) => {
      try {
         // Check if there are categories using this super category
         const categoriesCount = await prisma.category.count({
            where: { superCategoryId: parsedInput.id },
         });

         if (categoriesCount > 0) {
            return {
               ok: false as const,
               message: `Cannot delete. ${categoriesCount} category(ies) are using this super category.`,
            };
         }

         await prisma.superCategory.delete({
            where: { id: parsedInput.id },
         });

         return {
            ok: true as const,
            message: "Super category deleted successfully",
         };
      } catch (error) {
         return {
            ok: false as const,
            message: error instanceof Error ? error.message : "Failed to delete super category",
         };
      }
   });
