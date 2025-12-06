import { VendorNav } from "@/components/vendor/VendorNav";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
   return (
      <div className="min-h-screen bg-gray-50">
         <VendorNav />
         <main>{children}</main>
      </div>
   );
}
