import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
};

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <main className="min-h-screen bg-light dark:bg-background grid place-items-center px-4">
      <div className="w-full max-w-md">
        <AuthCard
          title="Create your account"
          subtitle="It takes less than a minute"
        >
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterContent searchParams={searchParams} />
          </Suspense>
        </AuthCard>
      </div>
    </main>
  );
}

async function RegisterContent({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl = sp?.callbackUrl ?? "/";

  const session = await auth();
  if (session?.user) {
    redirect(callbackUrl);
  }

  return <RegisterForm callbackUrl={callbackUrl} />;
}
