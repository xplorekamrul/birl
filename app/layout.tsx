// /app/layout.tsx
import Navbar from "@/components/layout/Navbar";
import AppProviders from "@/components/providers/AppProviders";
import "@uploadthing/react/styles.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import CartDrawer from "@/components/cart/CartDrawer";


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Birl Ecommerce",
    template: "%s | Birl",
  },
  description: "Shop the best products at Birl Ecommerce.",
  openGraph: {
    siteName: "Birl Ecommerce",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@BirlEcommerce",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-screen bg-light dark:bg-background text-foreground">
        <AppProviders>
          <Navbar />
          <div className="flex items-start relative">
            <main className="flex-1 min-w-0 px-4 py-2">
              <div className="mx-auto w-full max-w-[1600px]">
                {children}
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
