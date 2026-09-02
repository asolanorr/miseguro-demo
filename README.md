# MiSeguro

Comparador de seguros de auto para Costa Rica, inspirado en el modelo de [The Zebra](https://www.thezebra.com). **Los datos de este MVP son 100% simulados**: los precios, las aseguradoras y las cotizaciones que se muestran son de demostración, no representan una oferta real de ninguna aseguradora ni constituyen una cotización en firme. El objetivo es validar el flujo de usuario (perfil → vehículo → conductor → cobertura → resultados → contacto) antes de integrar tarifas reales.

## Cómo correrlo

Requiere [pnpm](https://pnpm.io) (no usar npm ni yarn) y Node 20.9+.

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Otros comandos:

```bash
pnpm build          # build de producción
pnpm start          # sirve el build de producción
pnpm lint            # ESLint
pnpm test            # Vitest (unit + RTL)
pnpm test:watch      # Vitest en modo watch
pnpm test:e2e        # Playwright (levanta el build de producción solo)
```

## Variables de entorno

Copiá `.env.example` a `.env.local` y ajustá lo que necesites:

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Sí | Base para metadata/Open Graph. |
| `QUOTE_DELAY_MS` | No (default `800`) | Retardo artificial en `POST /api/quotes` para que el estado de carga sea observable. Se pone en `0` en los tests E2E (ver `playwright.config.ts`). |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | No | Si están presentes, los leads se guardan en Supabase (`lib/leads.ts` + migración en `supabase/migrations/0001_quote_leads.sql`). Si faltan, los leads se registran como log estructurado en el servidor. La service role key nunca se usa desde el cliente. |

## Cómo cambiar los datos de demostración

Todo el catálogo y la heurística de precios viven en `lib/mock-data/`, detrás de una interfaz estable (`QuoteProvider`) que no cambia el día que existan tarifas reales:

- `insurers.ts` — las 6 aseguradoras ficticias (nombres, rating, token de color).
- `vehicle-catalog.ts` — marcas, modelos, versiones y años.
- `cr-geo.ts` — provincias y cantones de Costa Rica.
- `coverage-plans.ts` — los 3 niveles de cobertura y sus features incluidas.
- `quote-generator.ts` — la heurística de precios (determinista: la misma cotización siempre da el mismo resultado).

Nada fuera de `lib/mock-data/` sabe que los datos son inventados, salvo el flag `isDemo: true` en cada oferta, que es intencional y no se puede ocultar en la UI (banner permanente en la pantalla de resultados).

## Pendiente fuera de este MVP

- **Selector de idioma.** La infraestructura de next-intl ya está montada (`es`/`en` en paridad de claves), pero no hay switcher en la UI. El siguiente paso es leer la cookie `NEXT_LOCALE` en `i18n/request.ts` y agregar un `LocaleSwitcher` en el footer que la escriba.
- Integración con aseguradoras reales, compra en línea, cuentas de usuario y backoffice: ver `docs/mvp-plan.md` §0 y §8 para el detalle de qué queda fuera de este MVP y por qué.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · Zod · TanStack Query · Zustand · next-intl · Vitest + Testing Library · Playwright.
