import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">MiSeguro</p>
        <h1 className="mt-4 text-4xl font-semibold text-foreground">Tu protección, organizada.</h1>
        <p className="mt-4 text-base text-muted">
          Proyecto base para la operación, autenticación y dashboard de seguros.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 font-medium text-primary-foreground transition hover:opacity-95"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 font-medium text-foreground transition hover:bg-muted/10"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
