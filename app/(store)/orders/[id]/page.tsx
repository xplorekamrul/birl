import { UserOrderTracking } from "@/components/orders/UserOrderTracking";
import { Suspense } from "react";

export default function UserOrderTrackingPage({ params }: { params: { id: string } }) {
   return (
      <div className="container mx-auto px-4 py-8">
         <Suspense fallback={<div>Loading order details...</div>}>
            <UserOrderTracking orderId={params.id} />
         </Suspense>
      </div>
   );
}
