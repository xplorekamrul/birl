// /app/layout.tsx
import Navbar from "@/components/layout/Navbar";
import AppProviders from "@/components/providers/AppProviders";
import type { Metadata } from "next";
import "./globals.css";
import "@uploadthing/react/styles.css";

import CartDrawer from "@/components/cart/CartDrawer";


export const metadata: Metadata = { title: "Birl Ecommerce" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-light dark:bg-background text-foreground">
        <AppProviders>
          <Navbar />
          <main className="mx-auto w-full  px-4 py-6">
            {children}
            <CartDrawer />
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
