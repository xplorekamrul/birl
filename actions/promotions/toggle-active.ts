"use server";

import { adminActionClient } from "@/lib/safe-action/clients";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const togglePromotionActive = adminActionClient
  .schema(z.object({ id: z.string().min(1), active: z.boolean() }))
  .action(async ({ parsedInput }) => {
    await prisma.promotionalOffer.update({
      where: { id: parsedInput.id },
      data: { active: parsedInput.active },
    });
    return { ok: true };
  });
