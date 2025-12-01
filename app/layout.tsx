// /app/layout.tsx
import Navbar from "@/components/layout/Navbar";
import AppProviders from "@/components/providers/AppProviders";
import "@uploadthing/react/styles.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import CartDrawer from "@/components/cart/CartDrawer";


export const metadata: Metadata = { title: "Birl Ecommerce" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-light dark:bg-background text-foreground">
        <AppProviders>
          <Navbar />
          <div className="flex items-start relative">
            <main className="flex-1 min-w-0 px-4 py-6">
              <div className="mx-auto w-full max-w-[1600px]">
                <Suspense fallback={<div>Loading...</div>}>
                  {children}
                </Suspense>
              </div>
            </main>
            <Suspense fallback={null}>
              <CartDrawer />
            </Suspense>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
