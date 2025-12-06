"use client";

import { BarChart3, LayoutDashboard, Package, Settings, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function VendorNav() {
   const pathname = usePathname();

   const navItems = [
      { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
      { href: "/vendor/products", label: "Products", icon: Package },
      { href: "/vendor/reports", label: "Reports", icon: BarChart3 },
      { href: "/vendor/setup", label: "Settings", icon: Settings },
   ];

   return (
      <nav className="bg-white border-b shadow-sm">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-1">
               {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname?.startsWith(item.href);

                  return (
                     <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${isActive
                              ? "border-blue-600 text-blue-600 font-medium"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                           }`}
                     >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                     </Link>
                  );
               })}
            </div>
         </div>
      </nav>
   );
}
