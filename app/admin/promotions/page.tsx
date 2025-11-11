import { prisma } from "@/lib/prisma";
import PromoManager from "@/components/promotions/promo-manager";

export default async function PromotionsPage() {
  const promos = await prisma.promotionalOffer.findMany({
    orderBy: [{ priority: "desc" }, { startDate: "desc" }],
  });

  return <PromoManager initialPromos={promos} />;
}
