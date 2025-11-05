// /app/layout.tsx
<<<<<<< HEAD
import Navbar from "@/components/layout/Navbar";
=======
import Sidebar from "@/components/layout/Sidebar";
>>>>>>> 89481806d891c1e1d2b7a7e9226847bbd4b1cdaf
import AppProviders from "@/components/providers/AppProviders";
import type { Metadata } from "next";
import "./globals.css";

<<<<<<< HEAD
export const metadata: Metadata = { title: "Birl Ecommerce" };
=======
export const metadata: Metadata = { title: "Hr_Plus" };
>>>>>>> 89481806d891c1e1d2b7a7e9226847bbd4b1cdaf

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-light dark:bg-background text-foreground">
        <AppProviders>
          <Sidebar />
          <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
