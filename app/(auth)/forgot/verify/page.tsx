// /app/(auth)/forgot/verify/page.tsx
import AuthCard from "@/components/auth/AuthCard";
import ForgotVerifyForm from "@/components/auth/ForgotVerifyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verify code" };

import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  return (
    <main className="min-h-screen bg-light dark:bg-background grid place-items-center px-4">
      <div className="w-full max-w-md">
        <AuthCard title="Verify code" subtitle="Enter the 6-digit code we sent to your email">
          <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent searchParams={searchParams} />
          </Suspense>
        </AuthCard>
      </div>
    </main>
  );
}

async function VerifyContent({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const sp = await searchParams;
  const email = sp?.email ?? "";

  return <ForgotVerifyForm defaultEmail={email} />;
}
