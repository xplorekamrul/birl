import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VendorSetupForm from "@/components/vendor/setup/VendorSetupForm";

export default async function VendorSetupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role as
    | "DEVELOPER"
    | "SUPER_ADMIN"
    | "ADMIN"
    | "USER"
    | "VENDOR"
    | undefined;

  // Only vendor/admin/dev/super can access setup
  if (
    role !== "VENDOR" &&
    role !== "ADMIN" &&
    role !== "SUPER_ADMIN" &&
    role !== "DEVELOPER"
  ) {
    redirect("/");
  }

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-linear-to-b from-sky-50 to-sky-100/70 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Vendor account setup
          </p>
          <h1 className="text-2xl font-semibold text-pcolor">
            {vendorProfile ? "Update your shop profile" : "Create your shop"}
          </h1>
          <p className="text-sm text-slate-500">
            Tell customers who you are. This information appears across your
            storefront and product pages.
          </p>
        </header>

        <VendorSetupForm initialVendor={vendorProfile} />
      </div>
    </div>
  );
}
