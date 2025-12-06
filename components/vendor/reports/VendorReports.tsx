"use client";

import { getVendorSalesReport } from "@/actions/vendor/orders/get-sales-report";
import { DollarSign, Download, Package, TrendingUp } from "lucide-react";
import { useState } from "react";

export function VendorReports() {
   const [report, setReport] = useState<any>(null);
   const [loading, setLoading] = useState(false);
   const [filters, setFilters] = useState({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      groupBy: "day" as "day" | "month" | "year",
   });

   const generateReport = async () => {
      setLoading(true);
      const result = await getVendorSalesReport(filters);
      if (result?.data?.ok) {
         setReport(result.data);
      }
      setLoading(false);
   };

   const exportReport = () => {
      if (!report) return;

      const csv = [
         ["Date", "Orders", "Revenue", "Commission", "Earnings", "Items Sold"].join(","),
         ...report.report.map((r: any) =>
            [r.date, r.orders, r.revenue.toFixed(2), r.commission.toFixed(2), r.earnings.toFixed(2), r.items].join(",")
         ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report-${filters.startDate}-to-${filters.endDate}.csv`;
      a.click();
   };

   return (
      <div className="space-y-6">
         <h1 className="text-3xl font-bold">Sales Reports</h1>

         <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Generate Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                     type="date"
                     value={filters.startDate}
                     onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                     className="w-full px-4 py-2 border rounded-lg"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                     type="date"
                     value={filters.endDate}
                     onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                     className="w-full px-4 py-2 border rounded-lg"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-2">Group By</label>
                  <select
                     value={filters.groupBy}
                     onChange={(e) => setFilters({ ...filters, groupBy: e.target.value as any })}
                     className="w-full px-4 py-2 border rounded-lg"
                  >
                     <option value="day">Daily</option>
                     <option value="month">Monthly</option>
                     <option value="year">Yearly</option>
                  </select>
               </div>
               <div className="flex items-end">
                  <button
                     onClick={generateReport}
                     disabled={loading}
                     className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                     {loading ? "Generating..." : "Generate Report"}
                  </button>
               </div>
            </div>
         </div>

         {report && (
            <>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6">
                     <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                           <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Total Orders</p>
                           <p className="text-2xl font-bold">{report.summary.totalOrders}</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                     <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                           <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Total Revenue</p>
                           <p className="text-2xl font-bold">${report.summary.totalRevenue.toFixed(2)}</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                     <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-3 rounded-lg">
                           <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Your Earnings</p>
                           <p className="text-2xl font-bold">${report.summary.totalEarnings.toFixed(2)}</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                     <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-3 rounded-lg">
                           <Package className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                           <p className="text-sm text-gray-600">Items Sold</p>
                           <p className="text-2xl font-bold">{report.summary.totalItems}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b flex justify-between items-center">
                     <h2 className="text-xl font-semibold">Sales Over Time</h2>
                     <button
                        onClick={exportReport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                     >
                        <Download className="w-4 h-4" />
                        Export CSV
                     </button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                           <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y">
                           {report.report.map((row: any) => (
                              <tr key={row.date} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 text-sm font-medium">{row.date}</td>
                                 <td className="px-6 py-4 text-sm">{row.orders}</td>
                                 <td className="px-6 py-4 text-sm">${row.revenue.toFixed(2)}</td>
                                 <td className="px-6 py-4 text-sm text-red-600">-${row.commission.toFixed(2)}</td>
                                 <td className="px-6 py-4 text-sm font-semibold text-green-600">${row.earnings.toFixed(2)}</td>
                                 <td className="px-6 py-4 text-sm">{row.items}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                     <h2 className="text-xl font-semibold">Top Selling Products</h2>
                  </div>
                  <div className="p-6">
                     <div className="space-y-3">
                        {report.topProducts.map((product: any, idx: number) => (
                           <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                                    {idx + 1}
                                 </div>
                                 <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </>
         )}
      </div>
   );
}
