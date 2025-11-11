"use server";

import { adminActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const deletePromotion = adminActionClient
  .schema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await prisma.promotionalOffer.delete({ where: { id: parsedInput.id } });
    return { ok: true };
  });
