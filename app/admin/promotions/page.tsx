import PromoManager from "@/components/promotions/promo-manager";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

export default async function PromotionsPage() {
  await connection();
  const promos = await prisma.promotionalOffer.findMany({
    orderBy: [{ priority: "desc" }, { startDate: "desc" }],
  });

  return <PromoManager initialPromos={promos} />;
}
