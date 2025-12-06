import { DashboardSkeleton } from "@/components/vendor/dashboard/DashboardSkeleton";
import { VendorDashboardServer } from "@/components/vendor/dashboard/VendorDashboardServer";
import { Suspense } from "react";

// Enable ISR with 60 second revalidation



export default function VendorDashboardPage() {
   return (
      <div className="container mx-auto p-6">
         <Suspense fallback={<DashboardSkeleton />}>
            <VendorDashboardServer />
         </Suspense>
      </div>
   );
}
