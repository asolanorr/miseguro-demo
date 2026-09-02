import type { PropsWithChildren } from "react";

export function DashboardShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <aside className="border-b border-border bg-card px-4 py-4 md:border-b-0 md:border-r md:px-6 md:py-8">
        <div className="flex items-center justify-between md:block">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">MiSeguro</p>
            <h2 className="mt-2 text-xl font-semibold">Panel</h2>
          </div>
        </div>
      </aside>
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
