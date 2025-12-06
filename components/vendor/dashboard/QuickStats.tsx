"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
   label: string;
   value: number | string;
   icon: LucideIcon;
   color: string;
   trend?: { value: number; isPositive: boolean };
}

export function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
   return (
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
         <div className="flex items-center justify-between">
            <div>
               <p className="text-sm text-gray-600 mb-1">{label}</p>
               <p className="text-3xl font-bold">{value}</p>
               {trend && (
                  <p className={`text-sm mt-1 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                     {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                  </p>
               )}
            </div>
            <div className={`${color} p-3 rounded-lg`}>
               <Icon className="w-6 h-6 text-white" />
            </div>
         </div>
      </div>
   );
}
