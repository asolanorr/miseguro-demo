import { DashboardShell } from "@/components/layout/DashboardShell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Dashboard</p>
            <h1 className="text-3xl font-semibold text-foreground">Resumen general</h1>
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {["Polizas", "Coberturas", "Notificaciones"].map((label, index) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{index + 1}2</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
