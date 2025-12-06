import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <main className="min-h-screen bg-light dark:bg-background grid place-items-center px-4">
      <div className="w-full max-w-md">
        <AuthCard title="Welcome back" subtitle="Sign in to continue">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginContent searchParams={searchParams} />
          </Suspense>
        </AuthCard>
      </div>
    </main>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl = sp?.callbackUrl ?? "/";

  return <LoginForm callbackUrl={callbackUrl} />;
}
