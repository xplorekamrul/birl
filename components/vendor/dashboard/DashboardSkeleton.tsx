export function DashboardSkeleton() {
   return (
      <div className="space-y-6 animate-pulse">
         <div className="h-10 bg-gray-200 rounded w-1/3" />

         <div className="bg-gray-200 rounded-xl h-32" />

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
               <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                     <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                     </div>
                     <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  </div>
               </div>
            ))}
         </div>

         <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
               <div className="h-6 bg-gray-200 rounded w-1/4" />
            </div>
            <div className="divide-y">
               {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4">
                     <div className="flex justify-between">
                        <div className="space-y-2 flex-1">
                           <div className="h-4 bg-gray-200 rounded w-1/4" />
                           <div className="h-4 bg-gray-200 rounded w-1/2" />
                           <div className="h-3 bg-gray-200 rounded w-1/3" />
                        </div>
                        <div className="space-y-2">
                           <div className="h-4 bg-gray-200 rounded w-20" />
                           <div className="h-6 bg-gray-200 rounded w-24" />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
