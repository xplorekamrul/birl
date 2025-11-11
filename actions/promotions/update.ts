"use server";

import { adminActionClient } from "@/lib/safe-action/clients";
import { promoUpdateSchema } from "@/lib/validations/promotional-offer";
import { prisma } from "@/lib/prisma";

export const updatePromotion = adminActionClient
  .schema(promoUpdateSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;
    await prisma.promotionalOffer.update({
      where: { id },
      data,
    });
    return { ok: true };
  });
