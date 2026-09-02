import { RegisterForm } from "@/components/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">MiSeguro</p>
          <h1 className="text-3xl font-semibold text-foreground">Crear cuenta</h1>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
