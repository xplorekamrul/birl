"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserAccountPage() {
   const { data: session, status } = useSession();
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   if (!mounted) return null;

   if (status === "unauthenticated") {
      redirect("/login");
   }

   if (status === "loading") {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pcolor" />
         </div>
      );
   }

   const user = session?.user;

   return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
         <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-4xl font-bold text-hcolor mb-2">My Account</h1>
               <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* User Profile Card */}
               <Card className="md:col-span-1 border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                     <CardTitle>Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pcolor to-scolor text-xl font-bold text-white">
                           {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <p className="font-semibold text-foreground">{user?.name || "User"}</p>
                           <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                     </div>
                     <Link href="/profile" className="w-full">
                        <Button className="w-full bg-pcolor hover:bg-scolor">Edit Profile</Button>
                     </Link>
                  </CardContent>
               </Card>

               {/* Quick Links */}
               <div className="md:col-span-2 space-y-6">
                  {/* Orders */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-pcolor/50 transition-colors">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <svg className="w-5 h-5 text-pcolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                           </svg>
                           My Orders
                        </CardTitle>
                        <CardDescription>Track and manage your orders</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <Link href="/orders">
                           <Button variant="outline" className="w-full">View Orders</Button>
                        </Link>
                     </CardContent>
                  </Card>

                  {/* Wishlist */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-pcolor/50 transition-colors">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <svg className="w-5 h-5 text-pcolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                           </svg>
                           Wishlist
                        </CardTitle>
                        <CardDescription>Your saved items</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <Link href="/user/wishlist">
                           <Button variant="outline" className="w-full">View Wishlist</Button>
                        </Link>
                     </CardContent>
                  </Card>

                  {/* Settings */}
                  <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-pcolor/50 transition-colors">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <svg className="w-5 h-5 text-pcolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           </svg>
                           Settings
                        </CardTitle>
                        <CardDescription>Manage your preferences</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <Link href="/settings">
                           <Button variant="outline" className="w-full">Go to Settings</Button>
                        </Link>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </div>
      </div>
   );
}
