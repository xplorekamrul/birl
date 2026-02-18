"use server";

import { prisma } from "@/lib/prisma";
import { adminActionClient } from "@/lib/safe-action/clients";
import { businessInfoSchema } from "@/lib/validations/business-info";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

export async function getBusinessInfos() {
   "use cache";
   cacheLife("max");
   cacheTag("business-info");

   const data = await prisma.businessInfo.findMany({
      orderBy: { createdAt: "desc" },
   });
   return data;
}

export async function getBusinessInfoById(id: string) {
   "use cache";
   cacheLife("max");
   cacheTag("business-info");

   const data = await prisma.businessInfo.findUnique({
      where: { id },
   });
   return data;
}

export const createBusinessInfo = adminActionClient
   .schema(businessInfoSchema.omit({ id: true }))
   .action(async ({ parsedInput }) => {
      // Check for existing allowed records (limit to 1)
      const count = await prisma.businessInfo.count();
      if (count > 0) {
         return { ok: false as const, message: "A Business Info record already exists. Please edit the existing one." };
      }

      const businessInfo = await prisma.businessInfo.create({
         data: {
            name: parsedInput.name,
            logoSrc: parsedInput.logoSrc,
            logoAlt: parsedInput.logoAlt,
            bannerSrc: parsedInput.bannerSrc,
            bannerAlt: parsedInput.bannerAlt,
            businessHours: parsedInput.businessHours,
            address: parsedInput.address as any,
            phone: parsedInput.phone as any,
            email: parsedInput.email as any,
            website: parsedInput.website,
            facebook: parsedInput.facebook,
            twitter: parsedInput.twitter,
            instagram: parsedInput.instagram,
            youtube: parsedInput.youtube,
         },
      });

      revalidateTag("business-info", "max");
      return { ok: true as const, businessInfo };
   });

export const updateBusinessInfo = adminActionClient
   .schema(businessInfoSchema)
   .action(async ({ parsedInput }) => {
      if (!parsedInput.id) {
         return { ok: false as const, message: "Business Info ID is required" };
      }

      const businessInfo = await prisma.businessInfo.update({
         where: { id: parsedInput.id },
         data: {
            name: parsedInput.name,
            logoSrc: parsedInput.logoSrc,
            logoAlt: parsedInput.logoAlt,
            bannerSrc: parsedInput.bannerSrc,
            bannerAlt: parsedInput.bannerAlt,
            businessHours: parsedInput.businessHours,
            address: parsedInput.address as any,
            phone: parsedInput.phone as any,
            email: parsedInput.email as any,
            website: parsedInput.website,
            facebook: parsedInput.facebook,
            twitter: parsedInput.twitter,
            instagram: parsedInput.instagram,
            youtube: parsedInput.youtube,
         },
      });

      revalidateTag("business-info", "max");
      return { ok: true as const, businessInfo };
   });

export const deleteBusinessInfo = adminActionClient
   .schema(businessInfoSchema.pick({ id: true }).required())
   .action(async ({ parsedInput }) => {
      await prisma.businessInfo.delete({
         where: { id: parsedInput.id! },
      });

      revalidateTag("business-info", "max");
      return { ok: true as const };
   });
