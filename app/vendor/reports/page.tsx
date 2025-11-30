import { VendorReports } from "@/components/vendor/reports/VendorReports";
import { Suspense } from "react";

export default function VendorReportsPage() {
   return (
      <div className="container mx-auto p-6">
         <Suspense fallback={<div>Loading reports...</div>}>
            <VendorReports />
         </Suspense>
      </div>
   );
}
