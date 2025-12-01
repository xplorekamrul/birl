import { VendorOrderDetails } from "@/components/vendor/orders/VendorOrderDetails";
import { Suspense } from "react";

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
   return (
      <div className="container mx-auto p-6">
         <Suspense fallback={<div>Loading order details...</div>}>
            <VendorOrderDetailsWrapper params={params} />
         </Suspense>
      </div>
   );
}

async function VendorOrderDetailsWrapper({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   return <VendorOrderDetails orderId={id} />;
}
