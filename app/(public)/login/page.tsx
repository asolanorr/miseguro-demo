import { LoginForm } from "@/components/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">MiSeguro</p>
          <h1 className="text-3xl font-semibold text-foreground">Iniciar sesión</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
