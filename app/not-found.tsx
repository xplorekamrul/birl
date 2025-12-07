// app/not-found.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  // Handle countdown ticking
  useEffect(() => {
    if (countdown <= 0) return;

    const timeout = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [countdown]);

  // Redirect when countdown hits 0
  useEffect(() => {
    if (countdown === 0) {
      router.push("/");
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-9xl font-bold bg-linear-to-r from-pcolor to-scolor bg-clip-text text-transparent mb-4">
            404
          </div>
          <div className="w-24 h-1 bg-linear-to-r from-pcolor to-scolor mx-auto rounded-full" />
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-hcolor mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist. Don't worry, we'll
          redirect you home in{" "}
          <span className="font-bold text-pcolor">{countdown}</span> seconds.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full bg-pcolor hover:bg-scolor">
              Go Home Now
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Illustration */}
        <div className="mt-12 opacity-50">
          <svg
            className="w-32 h-32 mx-auto text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
