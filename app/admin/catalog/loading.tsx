export default function Loading() {
   return (
      <div className="min-h-[calc(100vh-80px)] bg-linear-to-b from-sky-50 to-sky-100/70 px-4 py-8">
         <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
            {/* Header */}
            <header className="space-y-2">
               <div className="h-4 bg-gray-200 rounded w-32"></div>
               <div className="h-8 bg-gray-200 rounded w-64"></div>
               <div className="h-4 bg-gray-200 rounded w-96"></div>
            </header>

            {/* Tabs */}
            <div className="flex gap-2">
               <div className="h-10 bg-gray-200 rounded w-32"></div>
               <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Form Card */}
            <div className="bg-white/90 rounded-lg border p-6 space-y-4">
               <div className="h-5 bg-gray-200 rounded w-32"></div>
               <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                     <div className="h-4 bg-gray-200 rounded w-16"></div>
                     <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                     <div className="h-4 bg-gray-200 rounded w-16"></div>
                     <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
               </div>
               <div className="h-40 bg-gray-200 rounded"></div>
            </div>

            {/* List Card */}
            <div className="bg-white/90 rounded-lg border p-6 space-y-4">
               <div className="h-5 bg-gray-200 rounded w-32"></div>
               <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-6 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-6 bg-gray-200 rounded"></div>
                        <div className="w-24 flex gap-2">
                           <div className="h-8 w-8 bg-gray-200 rounded"></div>
                           <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
