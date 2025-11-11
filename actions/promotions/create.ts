"use server";

import { adminActionClient } from "@/lib/safe-action/clients";
import { promoCreateSchema } from "@/lib/validations/promotional-offer";
import { prisma } from "@/lib/prisma";

export const createPromotion = adminActionClient
  .schema(promoCreateSchema)
  .action(async ({ parsedInput }) => {
    const data = parsedInput;
    const row = await prisma.promotionalOffer.create({ data: {
      title: data.title,
      description: data.description,
      image: data.image,
      buttonText: data.buttonText,
      link: data.link,
      backgroundColor: data.backgroundColor,
      textColor: data.textColor,
      startDate: data.startDate,
      endDate: data.endDate,
      active: data.active,
      priority: data.priority,
    }});
    return { ok: true, id: row.id };
  });
