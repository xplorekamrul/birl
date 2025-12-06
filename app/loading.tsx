export default function Loading() {
   return (
      <main className="max-w-6xl mx-auto space-y-10 animate-pulse">
         {/* Hero Skeleton */}
         <section className="relative overflow-hidden rounded-2xl bg-gray-200 h-[400px]">
            <div className="grid md:grid-cols-2 gap-6 items-center p-6 md:p-10 h-full">
               <div className="space-y-4">
                  <div className="h-12 bg-gray-300 rounded-lg w-3/4"></div>
                  <div className="h-6 bg-gray-300 rounded-lg w-full"></div>
                  <div className="h-6 bg-gray-300 rounded-lg w-2/3"></div>
                  <div className="h-12 bg-gray-300 rounded-xl w-32"></div>
               </div>
               <div className="relative h-[220px] md:h-[300px] lg:h-[360px] rounded-xl bg-gray-300"></div>
            </div>
         </section>

         <div className="space-y-10">
            {/* Category Grid Skeleton */}
            <section className="space-y-4">
               <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                     <div key={i} className="rounded-2xl overflow-hidden border bg-white">
                        <div className="aspect-4/3 bg-gray-200"></div>
                        <div className="px-3 py-2">
                           <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                     </div>
                  ))}
               </div>
            </section>

            {/* Brand Rail Skeleton */}
            <section className="space-y-4">
               <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
               <div className="flex gap-4 overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                     <div key={i} className="min-w-[120px] h-16 bg-gray-200 rounded-xl"></div>
                  ))}
               </div>
            </section>

            {/* Vendor Cards Skeleton */}
            <section className="space-y-4">
               <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                     <div key={i} className="rounded-2xl border bg-white p-4 space-y-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
                        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                     </div>
                  ))}
               </div>
            </section>

            {/* Product Carousel Skeleton - Featured */}
            <section className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
                  <div className="flex gap-2">
                     <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                     <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  </div>
               </div>
               <div className="flex gap-4 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="min-w-[220px] max-w-[260px] rounded-2xl border bg-white overflow-hidden">
                        <div className="aspect-square bg-gray-200"></div>
                        <div className="p-4 space-y-2">
                           <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                           <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                           <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                     </div>
                  ))}
               </div>
            </section>

            {/* Product Carousel Skeleton - Deals */}
            <section className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
                  <div className="flex gap-2">
                     <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                     <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  </div>
               </div>
               <div className="flex gap-4 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="min-w-[220px] max-w-[260px] rounded-2xl border bg-white overflow-hidden">
                        <div className="aspect-square bg-gray-200"></div>
                        <div className="p-4 space-y-2">
                           <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                           <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                           <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                     </div>
                  ))}
               </div>
            </section>
         </div>
      </main>
   );
}
