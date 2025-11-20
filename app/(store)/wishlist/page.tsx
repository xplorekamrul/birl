"use client";

import { getWishlistItems, removeFromWishlist, syncWishlistWithDB } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWishlistStore } from "@/store/wishlist";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistPage() {
   const { data: session, status } = useSession();
   const [mounted, setMounted] = useState(false);
   const [wishlistItems, setWishlistItems] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const wishlistStore = useWishlistStore();

   useEffect(() => {
      setMounted(true);
   }, []);

   useEffect(() => {
      if (status === "authenticated") {
         fetchWishlist();
      }
   }, [status]);

   const fetchWishlist = async () => {
      try {
         // First check localStorage
         const localProductIds = wishlistStore.items.map((item) => item.productId);

         if (status === "authenticated") {
            // Sync localStorage with database
            await syncWishlistWithDB(localProductIds);

            // Fetch from database
            const result = await getWishlistItems();
            if (result.ok) {
               setWishlistItems(result.items || []);

               // Update localStorage with DB data
               const dbProductIds = result.items.map((item: any) => item.product.id);
               wishlistStore.setItems(
                  dbProductIds.map((id: string) => ({ productId: id, addedAt: Date.now() }))
               );
            }
         } else {
            // For non-authenticated users, show items from localStorage
            // We would need to fetch product details for these IDs
            // For now, just show empty if not authenticated
            setWishlistItems([]);
         }
      } catch (error) {
         console.error("Failed to fetch wishlist:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleRemove = async (productId: string) => {
      try {
         // Remove from localStorage
         wishlistStore.removeItem(productId);

         // Remove from UI
         setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId));

         // If authenticated, also remove from database
         if (status === "authenticated") {
            const result = await removeFromWishlist(productId);
            if (!result.ok) {
               console.error("Failed to remove from database:", result.message);
            }
         }
      } catch (error) {
         console.error("Failed to remove from wishlist:", error);
      }
   };

   if (!mounted) return null;

   if (status === "loading") {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pcolor" />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
         <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-4xl font-bold text-hcolor mb-2">My Wishlist</h1>
               <p className="text-muted-foreground">Items you've saved for later</p>
            </div>

            {loading ? (
               <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pcolor" />
               </div>
            ) : wishlistItems.length === 0 ? (
               <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="py-12 text-center">
                     <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                     <h3 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h3>
                     <p className="text-muted-foreground mb-6">Start adding items to your wishlist to save them for later</p>
                     <Link href="/shop">
                        <Button className="bg-pcolor hover:bg-scolor">Continue Shopping</Button>
                     </Link>
                  </CardContent>
               </Card>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                     <Card key={item.id} className="border-border/50 bg-card/50 backdrop-blur hover:border-pcolor/50 transition-all hover:shadow-lg">
                        <CardHeader className="relative">
                           {item.product?.images?.[0]?.url && (
                              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                                 <img
                                    src={item.product.images[0].url}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                           )}
                           <button
                              onClick={() => handleRemove(item.product.id)}
                              className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors"
                              aria-label="Remove from wishlist"
                           >
                              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                           </button>
                           <CardTitle className="line-clamp-2">{item.product?.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <p className="text-sm text-muted-foreground line-clamp-2">{item.product?.shortDescription}</p>
                           <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-pcolor">
                                 ${item.product?.salePrice || item.product?.basePrice}
                              </span>
                              {item.product?.basePrice && item.product?.salePrice && (
                                 <span className="text-sm line-through text-muted-foreground">
                                    ${item.product?.basePrice}
                                 </span>
                              )}
                           </div>
                           <div className="flex gap-2">
                              <Link href={`/product/${item.product?.slug}`} className="flex-1">
                                 <Button variant="outline" className="w-full">View</Button>
                              </Link>
                              <Button className="flex-1 bg-pcolor hover:bg-scolor">Add to Cart</Button>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
