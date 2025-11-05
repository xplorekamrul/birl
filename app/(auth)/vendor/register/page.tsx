import VendorRegisterForm from "@/components/auth/vendor/VendorRegisterForm";

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center bg-light dark:bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow">
        <h1 className="mb-4 text-xl font-semibold">Become a vendor</h1>
        <VendorRegisterForm/>
      </section>
    </main>
  );
}
