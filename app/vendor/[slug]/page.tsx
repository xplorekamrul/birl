import ProductCard, { ProductCardData } from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import {
   BadgeCheck,
   CalendarDays,
   Mail,
   MapPin,
   PackageSearch,
   Phone,
   ShieldCheck,
   ShoppingBag,
   Star,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";

type VendorPageProps = {
   params: Promise<{
      slug: string;
   }>;
};

export async function generateMetadata({ params }: VendorPageProps) {
   const { slug } = await params;

   const vendor = await prisma.vendorProfile.findUnique({
      where: { shopSlug: slug },
      select: { shopName: true, shopDescription: true },
   });

   if (!vendor) return { title: "Vendor Not Found" };

   return {
      title: `${vendor.shopName} | BIRL`,
      description: vendor.shopDescription || `Shop the best products from ${vendor.shopName}`,
   };
}

export default async function VendorPage({ params }: VendorPageProps) {
   const { slug } = await params;
   const session = await getServerSession();

   const vendor = await prisma.vendorProfile.findUnique({
      where: { shopSlug: slug },
      include: {
         products: {
            where: {
               status: "ACTIVE",
               visibility: "PUBLIC",
            },
            include: {
               images: {
                  orderBy: { sortOrder: "asc" },
                  take: 1,
               },
               brand: true,
               vendor: {
                  select: {
                     shopName: true,
                     shopSlug: true,
                  },
               },
            },
            orderBy: {
               createdAt: "desc",
            },
         },
      },
   });

   if (!vendor) {
      notFound();
   }

   const formattedProducts: ProductCardData[] = vendor.products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      shortDescription: p.shortDescription || null,
      brand: p.brand ? { name: p.brand.name } : null,
      vendor: p.vendor,
      imageUrl: p.images[0]?.url || null,
      initialWished: false, // You could fetch wishlist status if needed
   }));

   const joinedDate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
   }).format(vendor.createdAt);

   return (
      <div className="min-h-screen bg-slate-50/50 pb-20">
         {/* Hero Banner Layout */}
         <div>
            {/* Banner Background */}
            <div className="relative w-full h-[200px] md:h-[300px] bg-slate-900">
               {vendor.shopBanner ? (
                  <Image
                     src={vendor.shopBanner}
                     alt={`${vendor.shopName} Banner`}
                     fill
                     priority
                     className="object-cover opacity-70 mix-blend-overlay"
                  />
               ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 opacity-90" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            </div>

            {/* Profile Info Row */}
            <div className="container mx-auto px-4 relative">
               <div className="flex flex-col md:flex-row items-center md:items-end md:justify-start gap-4 md:gap-8 -mt-16 md:-mt-20 z-10">
                  {/* Logo Box */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                     {vendor.shopLogo ? (
                        <Image
                           src={vendor.shopLogo}
                           alt={vendor.shopName}
                           fill
                           className="object-cover"
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-5xl font-bold uppercase">
                           {vendor.shopName.charAt(0)}
                        </div>
                     )}
                  </div>

                  {/* Name and Stats */}
                  <div className="text-center md:text-left flex-1 pb-2">
                     <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 drop-shadow-sm">
                           {vendor.shopName}
                        </h1>
                        {vendor.verificationStatus === "VERIFIED" && (
                           <BadgeCheck className="w-6 h-6 text-blue-600" />
                        )}
                     </div>
                     <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                           <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                           <span className="text-slate-900">
                              {Number(vendor.averageRating).toFixed(1)}
                           </span>
                           <span className="text-slate-500 font-normal">({vendor.totalReviews} Reviews)</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                           <ShoppingBag className="w-4 h-4 text-emerald-500" />
                           <span className="text-slate-900">{vendor.totalOrders}+ <span className="text-slate-500 font-normal">Orders</span></span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="container mx-auto px-4 mt-20 md:mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               {/* Sidebar Info */}
               <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">
                     <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                        About Vendor
                     </h3>

                     <div className="text-sm text-slate-600 space-y-4">
                        {vendor.shopDescription ? (
                           <p className="leading-relaxed whitespace-pre-line text-slate-700">
                              {vendor.shopDescription}
                           </p>
                        ) : (
                           <p className="italic text-slate-400">No description provided.</p>
                        )}

                        <div className="h-px bg-slate-100 my-4" />

                        <ul className="space-y-4">
                           <li className="flex items-start gap-3">
                              <CalendarDays className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                 <p className="font-medium text-slate-900">Joined BIRL</p>
                                 <p className="text-slate-500">{joinedDate}</p>
                              </div>
                           </li>

                           {vendor.businessAddress && (
                              <li className="flex items-start gap-3">
                                 <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                 <div>
                                    <p className="font-medium text-slate-900">Location</p>
                                    <p className="text-slate-500 leading-tight">{vendor.businessAddress}</p>
                                 </div>
                              </li>
                           )}

                           {vendor.businessEmail && (
                              <li className="flex items-center gap-3">
                                 <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                                 <a href={`mailto:${vendor.businessEmail}`} className="text-blue-600 hover:underline truncate">
                                    {vendor.businessEmail}
                                 </a>
                              </li>
                           )}

                           {vendor.businessPhone && (
                              <li className="flex items-center gap-3">
                                 <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                                 <a href={`tel:${vendor.businessPhone}`} className="text-blue-600 hover:underline">
                                    {vendor.businessPhone}
                                 </a>
                              </li>
                           )}
                        </ul>
                     </div>
                  </div>
               </div>

               {/* Main Content - Products */}
               <div className="lg:col-span-3">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 mb-8 flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                           <PackageSearch className="w-6 h-6 text-blue-600" />
                           All Products
                        </h2>
                        <p className="text-slate-500 mt-1">
                           Browse {formattedProducts.length} amazing items from {vendor.shopName}
                        </p>
                     </div>
                  </div>

                  {formattedProducts.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {formattedProducts.map((product) => (
                           <div key={product.id} className="transition-transform hover:-translate-y-1 duration-300">
                              <ProductCard
                                 product={product}
                                 isAuthenticated={!!session}
                              />
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200/60 text-center">
                        <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                           <ShoppingBag className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No products yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                           This vendor hasn&apos;t published any products to their store yet. Check back later!
                        </p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
