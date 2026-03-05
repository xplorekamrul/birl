"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vendorActionClient } from "@/lib/safe-action/clients";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteProductSchema = z.object({
   id: z.string(),
});

export const deleteProduct = vendorActionClient
   .schema(deleteProductSchema)
   .action(async ({ parsedInput: { id } }) => {
      const session = await auth();

      if (!session?.user?.id) {
         throw new Error("Unauthorized");
      }

      const vendorProfile = await prisma.vendorProfile.findUnique({
         where: { userId: session.user.id },
      });

      if (!vendorProfile) {
         throw new Error("Vendor profile not found");
      }

      const product = await prisma.product.findFirst({
         where: {
            id,
            vendorId: vendorProfile.id,
         },
      });

      if (!product) {
         throw new Error("Product not found or unauthorized");
      }

      await prisma.product.delete({
         where: { id },
      });

      revalidatePath("/vendor/products");

      return { success: true, message: "Product deleted successfully" };
   });
