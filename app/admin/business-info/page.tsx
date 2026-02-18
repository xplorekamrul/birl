import { getBusinessInfos } from "@/actions/admin/business-info-actions";
import { BusinessInfoPageClient } from "./client";

export const metadata = {
   title: "Business Info | Admin",
   description: "Manage business information",
};

export default async function BusinessInfoPage() {
   const data = await getBusinessInfos();
   return <BusinessInfoPageClient data={data} />;
}
