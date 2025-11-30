export function OrdersLoadingSkeleton() {
   return (
      <div className="space-y-6 animate-pulse">
         <div className="h-10 bg-gray-200 rounded w-1/3" />
         <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded" />
               ))}
            </div>
         </div>
         <div className="bg-white rounded-lg shadow overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="p-6 border-b">
                  <div className="flex justify-between">
                     <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                     </div>
                     <div className="h-6 bg-gray-200 rounded w-20" />
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
