import UserRegisterForm from "@/components/auth/user/UserRegusterForm";

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center bg-light dark:bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow">
        <h1 className="mb-4 text-xl font-semibold">Create your account</h1>
        <UserRegisterForm />
      </section>
    </main>
  );
}
