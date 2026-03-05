"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vendorActionClient } from "@/lib/safe-action/clients";

const updateStatusSchema = z.object({
   id: z.string(),
   status: z.nativeEnum(ProductStatus),
});

export const updateProductStatus = vendorActionClient
   .schema(updateStatusSchema)
   .action(async ({ parsedInput: { id, status } }) => {
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

      await prisma.product.update({
         where: { id },
         data: { status },
      });

      revalidatePath("/vendor/products");

      return { success: true, message: `Product status updated to ${status}` };
   });
