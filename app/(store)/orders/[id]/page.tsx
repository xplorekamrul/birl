import { UserOrderTracking } from "@/components/orders/UserOrderTracking";
import { Suspense } from "react";

export default function UserOrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
   return (
      <div className="container mx-auto px-4 py-8">
         <Suspense fallback={<div>Loading order details...</div>}>
            <OrderTrackingWrapper params={params} />
         </Suspense>
      </div>
   );
}

async function OrderTrackingWrapper({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   return <UserOrderTracking orderId={id} />;
}
