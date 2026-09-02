# MVP Plan — Comparador de seguros de auto (Costa Rica)

> **Para el agente:** este documento es el plan de ejecución del MVP. Léelo completo antes de
> escribir código. Trabajá **un milestone a la vez**, en orden, y no avances al siguiente hasta
> que todos los criterios de aceptación del actual estén cumplidos y verificados.
>
> Las reglas de `CLAUDE.md` / `AGENTS.md` del proyecto tienen precedencia sobre cualquier
> sugerencia de este plan. Si algo aquí las contradice, gana `CLAUDE.md` y me lo señalás antes
> de continuar.

---

## 0. Contexto y objetivo

Comparador de seguros en línea para Costa Rica, inspirado en el modelo de **The Zebra**
(thezebra.com): el usuario responde un cuestionario guiado sobre su perfil, su vehículo y la
cobertura que busca, y recibe una comparación lado a lado de opciones de distintas aseguradoras.

**Objetivo del MVP:** una demo funcional end-to-end del flujo de usuario, con **datos de
demostración**, utilizable para validar la experiencia y para mostrar el producto a
inversionistas y a aseguradoras potenciales socias.

**Este MVP no cotiza de verdad.** No hay integración con aseguradoras, no hay tarifas reales y
no se vende ninguna póliza. Eso condiciona decisiones que están marcadas abajo como no
negociables.

### Decisiones ya tomadas

| Decisión | Valor |
| --- | --- |
| Línea de producto | Solo **auto** |
| Motor de cotización | **Datos mock** deterministas, sin integraciones |
| Cuentas de usuario final | **No.** Flujo anónimo; el email se pide solo al final |
| Auth | Ninguna. No hay login público ni backoffice en este MVP |
| Punto de partida | Proyecto Next.js con estructura de carpetas creada, **sin páginas ni componentes** |
| Idioma activo | **Español.** `en.json` se mantiene en paridad de claves, pero el cambio de idioma queda fuera del MVP (ver §3.4) |
| Moneda | Colones (₡) |

### Qué NO se construye en este MVP

- Integraciones con aseguradoras (APIs, scraping, portales de agente).
- Compra en línea, checkout o pasarela de pagos.
- Cuentas de usuario final, login público, historial por usuario.
- Backoffice de administración.
- Monitoreo de tarifas, alertas de renovación, notificaciones programadas.
- Hogar, bundle, vida o cualquier otro ramo.
- Blog / centro de contenido / SEO de artículos.
- Chat en vivo, click-to-call, CRM de agentes.
- Selector de idioma en la UI (la infraestructura i18n sí se monta; el switcher no).

---

## 1. Restricciones no negociables

Requisitos de producto, no sugerencias. Aplican a todo el código y a toda la UI.

### 1.1 Los resultados van marcados como demostración, siempre

Los precios son inventados. Presentarlos como cotizaciones reales es engañoso y, en Costa Rica,
expone a un problema de publicidad engañosa bajo la Ley de Promoción de la Competencia y Defensa
Efectiva del Consumidor. Por lo tanto:

- Todo `QuoteOffer` lleva `isDemo: true` en el tipo. No es opcional.
- La pantalla de resultados muestra un **banner permanente** (no un tooltip, no un pie de página)
  con el texto de `quote.results.demoNotice`: *"Datos de demostración. Estos montos son
  ilustrativos y no constituyen una cotización real ni una oferta de ninguna aseguradora."*
- Cada tarjeta de resultado lleva además un `DemoBadge` compacto.
- El banner y el badge **no se pueden ocultar, cerrar ni condicionar** a una variable de entorno.

### 1.2 Nombres de aseguradoras ficticios

Usá **nombres inventados** en `lib/mock-data/insurers.ts`: `Aseguradora Central`,
`Grupo Volcán Seguros`, `Pacífico Seguros`, `Aurora Seguros`, `Coral Seguros`, `Meseta Seguros`.

No uses nombres ni logos de INS, Mapfre, ASSA, Quálitas, Oceánica ni Lafise: atribuirles precios
inventados es un riesgo legal y de marca innecesario, y ninguna autorizó su uso. Todo el catálogo
vive en un solo archivo para que migrar a nombres reales, cuando existan convenios, sea editar
una constante.

### 1.3 Consentimiento explícito antes de capturar datos personales

La Ley 8968 exige consentimiento informado. En el paso de conductor y en la captura de email:

- Checkbox **no premarcado**, obligatorio para enviar.
- Texto de consentimiento visible en pantalla, no escondido en términos y condiciones.
- Valor del consentimiento y timestamp se guardan junto con el lead.

### 1.4 El mock vive detrás de una interfaz estable

El día que existan tarifas reales, la UI y los hooks no deben cambiar:

```ts
// features/quote/quote.types.ts
export type QuoteProvider = (request: QuoteRequest) => Promise<QuoteOffer[]>;

// lib/mock-data/quote-provider.ts
export const mockQuoteProvider: QuoteProvider = async (request) =>
  generateMockOffers(request);
```

La API route consume `mockQuoteProvider`, nunca `generateMockOffers` directamente. Nada fuera de
`lib/mock-data/` sabe que los datos son falsos (salvo el flag `isDemo`, que es intencional).

---

## 2. Arquitectura

`components/` = cómo se ve. `features/` = qué hace y de dónde vienen los datos. Ningún componente
hace fetch directo.

### 2.1 Rutas (App Router)

```
app/
  layout.tsx                     Root: html/body, fuente, providers, next-intl
  globals.css                    @theme + base
  (public)/
    layout.tsx                   SiteHeader + SiteFooter
    page.tsx                     Landing
    error.tsx                    Error boundary del grupo público
    quote/
      layout.tsx                 WizardShell + WizardStepper
      profile/page.tsx           Paso 1 — perfil y ubicación
      vehicle/page.tsx           Paso 2 — vehículo
      driver/page.tsx            Paso 3 — conductor
      coverage/page.tsx          Paso 4 — cobertura deseada
      results/page.tsx           Paso 5 — comparación
  api/
    catalog/route.ts             GET  — catálogo de vehículos y geografía CR
    insurers/route.ts            GET  — aseguradoras demo
    quotes/route.ts              POST — QuoteRequest → QuoteOffer[]
    leads/route.ts               POST — LeadInput → { id }
```

Rutas sin prefijo de locale. Rutas y código en inglés; UI en español vía `messages/`.

**Todas las páginas del wizard y la de resultados son `"use client"`**, porque leen el store de
Zustand. La landing puede ser server component.

### 2.2 Features (dominio, sin JSX)

```
features/
  quote/
    quote.schema.ts     Zod: profileSchema, vehicleSchema, driverSchema, coverageSchema,
                        quoteRequestSchema, leadSchema
    quote.api.ts        POST /api/quotes, POST /api/leads
    quote.hooks.ts      useQuoteResults(request), useSubmitLead()
    quote.types.ts      QuoteRequest, QuoteOffer, CoverageLevel, QuoteProvider, LeadInput,
                        QuoteWizardState, buildQuoteRequest()
  catalog/
    catalog.schema.ts   validación de año/marca/modelo/versión y provincia/cantón
    catalog.api.ts      GET /api/catalog
    catalog.hooks.ts    useCatalog(), useVehicleMakes(year), useVehicleModels(makeId),
                        useVehicleTrims(modelId), useProvinces(), useCantons(provinceId)
    catalog.types.ts    VehicleMake, VehicleModel, VehicleTrim, Province, Canton
  insurers/
    insurers.schema.ts
    insurers.api.ts     GET /api/insurers
    insurers.hooks.ts   useInsurers()
    insurers.types.ts   (re-exporta el tipo compartido, no lo redefine)
```

`Insurer` lo consumen `insurers` y `quote`, así que **vive en `types/index.ts`** y ambos lo
importan de ahí. No se duplica ni se define dentro de un feature.

Los hooks de catálogo derivan del mismo `useCatalog()` cacheado por React Query (una sola
petición); las cascadas se resuelven filtrando en memoria, no con una petición por nivel.

### 2.3 Componentes

```
components/
  ui/                          shadcn/ui + primitivos propios
    demo-badge.tsx             DemoBadge
    error-state.tsx            ErrorState (error menor dentro de un panel)
    (button, card, input, select, radio-group, checkbox, badge, dialog, form, label,
     separator, skeleton, sonner — vía shadcn CLI)
  layout/
    site-header.tsx
    site-footer.tsx
    wizard-shell.tsx           title, description, slot, footer de navegación OPCIONAL
    wizard-stepper.tsx         5 pasos
  features/quote/
    profile-form.tsx
    vehicle-form.tsx
    driver-form.tsx
    coverage-form.tsx
    consent-notice.tsx
    demo-notice-banner.tsx
    quote-results-list.tsx
    quote-offer-card.tsx
    quote-compare-table.tsx    ≥ md; la lista es el fallback móvil
    quote-savings-summary.tsx
    lead-capture-dialog.tsx
```

`WizardShell` recibe `showNav?: boolean` (default `true`). La pantalla de resultados lo monta con
`showNav={false}`: no lleva "Atrás / Continuar" del wizard, y el stepper la marca como paso 5
completado.

### 2.4 Estado

- **Datos de servidor** (ofertas, catálogo, aseguradoras) → **TanStack Query**. Nunca en Zustand.
- **Estado del wizard** (respuestas compartidas entre rutas hermanas) → **Zustand** en
  `stores/quote-wizard.store.ts`.
- **Estado local de un formulario** → `react-hook-form` con `zodResolver`, usando los schemas de
  `features/quote/quote.schema.ts`. Al enviar cada paso, el resultado validado se escribe en el
  store y se navega al siguiente paso.

**Hidratación (importante).** El store persiste en `sessionStorage` para que un refresh no borre
el progreso. Con App Router, la rehidratación ocurre *después* del primer render de cliente, así
que una redirección ingenua "si no hay datos, volver al paso 1" se dispara con datos válidos.
Por eso:

```ts
export const useQuoteWizard = create<QuoteWizardStore>()(
  persist(
    (set, get) => ({ /* ... */ hasHydrated: false }),
    {
      name: "quote-wizard",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
```

y un `useEffect(() => { useQuoteWizard.persist.rehydrate(); }, [])` en el layout del wizard.
**Toda lógica de redirección y todo fetch de resultados se bloquea hasta `hasHydrated === true`**;
mientras tanto se renderiza el skeleton del paso.

### 2.5 Datos mock

```
lib/
  mock-data/
    insurers.ts          6 aseguradoras ficticias: id, name, slug, rating (0–5), colorToken
    vehicle-catalog.ts   10 marcas × 3–5 modelos × 2–3 versiones, años 2010–2026
    cr-geo.ts            7 provincias de Costa Rica con sus cantones
    coverage-plans.ts    3 niveles + includedFeatures (claves i18n, no texto)
    quote-generator.ts   generateMockOffers(request): QuoteOffer[] — pura y determinista
    quote-provider.ts    mockQuoteProvider: QuoteProvider
  constants.ts
  leads.ts               persistLead()
  utils.ts                cn(), formatCrc(), hashString()
```

**`generateMockOffers` debe ser determinista:** la misma `QuoteRequest` produce siempre las mismas
ofertas. Usá `hashString(JSON.stringify(request))` como semilla de un PRNG local (mulberry32 o
similar). Nunca `Math.random()`.

**Devuelve ofertas de los tres niveles de cobertura**, no solo del que el usuario eligió: 4–6
aseguradoras × 3 niveles. Así el filtro por nivel de la pantalla de resultados tiene algo real que
filtrar y el usuario puede ver qué le costaría subir o bajar de cobertura. El nivel elegido en el
paso 4 es simplemente el filtro activo por defecto.

Heurística de precios (ajustala si algo se ve raro, pero **todos los campos que el formulario pide
deben influir en algo**):

| Factor | Efecto |
| --- | --- |
| Nivel de cobertura | Base anual: responsabilidad civil ≈ ₡180.000 · extendida ≈ ₡420.000 · todo riesgo ≈ ₡780.000 |
| Antigüedad del vehículo | −2% por año desde el año modelo, piso 0.7× |
| Valor de marca/versión | Multiplicador por marca (0.9×–1.4×) definido en el catálogo |
| Edad del conductor | < 25 → 1.35× · 25–65 → 1.0× · > 65 → 1.15× |
| Años de licencia | < 3 → 1.2× · 3–10 → 1.05× · > 10 → 1.0× |
| Uso | placer 0.95× · commuting 1.0× · comercial 1.25× |
| Km anuales | escalonado 0.9×–1.2× |
| Siniestros en 3 años | +18% por siniestro |
| Provincia | San José / Alajuela 1.08× · resto 1.0× (densidad de tránsito) |
| Factor por aseguradora | ±18% fijo por aseguradora, para que la comparación tenga dispersión |
| Deducible | inversamente correlacionado con la prima |

`hasCurrentInsurance` y `purchaseIntent` **no afectan el precio**: son campos de calificación del
lead y así deben justificarse en la UI (`quote.profile.*.help`). Si en la revisión se decide que
no aportan, se eliminan del formulario según la regla de UX de §4.

---

## 3. Contratos

### 3.1 Tipos de dominio

```ts
// types/index.ts  (compartido entre features)
export type Insurer = {
  id: string;
  name: string;
  slug: string;
  rating: number;       // 0–5, un decimal. Única fuente de verdad del rating
  colorToken: string;   // nombre de token de @theme, no un hex
};

// features/quote/quote.types.ts
export type CoverageLevel = "liability" | "extended" | "full";
export type VehicleUse = "commuting" | "pleasure" | "business";
export type OwnershipType = "owned" | "financed" | "leased";

export type QuoteProfile = {
  provinceId: string;
  cantonId: string;
  hasCurrentInsurance: boolean;
  purchaseIntent: "now" | "exploring";
};

export type QuoteVehicle = {
  year: number;
  makeId: string;
  modelId: string;
  trimId: string;
  ownership: OwnershipType;
  use: VehicleUse;
  annualKm: number;
};

export type QuoteDriver = {
  birthDate: string;        // ISO (YYYY-MM-DD)
  licenseYears: number;
  claimsLast3Years: number;
  consentAccepted: true;
  consentTimestamp: string; // ISO
};

export type QuoteCoverage = {
  level: CoverageLevel;
  preferredDeductibleCrc: number | null;
};

export type QuoteRequest = {
  profile: QuoteProfile;
  vehicle: QuoteVehicle;
  driver: QuoteDriver;
  coverage: QuoteCoverage;
};

export type QuoteOffer = {
  id: string;
  insurerId: string;
  coverageLevel: CoverageLevel;
  monthlyPremiumCrc: number;
  annualPremiumCrc: number;
  deductibleCrc: number;
  includedFeatures: string[];  // claves bajo coverage.features.*
  isDemo: true;
};
// El rating se lee del Insurer, no se duplica en la oferta.

// Estado del wizard: parcial por naturaleza
export type QuoteWizardState = {
  profile: QuoteProfile | null;
  vehicle: QuoteVehicle | null;
  driver: QuoteDriver | null;
  coverage: QuoteCoverage | null;
};

// Único puente entre estado parcial y request completo
export function buildQuoteRequest(state: QuoteWizardState): QuoteRequest | null;
// Devuelve null si falta cualquiera de los cuatro bloques.
// La pantalla de resultados redirige al primer paso incompleto cuando devuelve null
// (y solo después de hasHydrated === true).

export type LeadInput = {
  email: string;
  fullName: string;
  phone?: string;
  selectedOfferId: string | null;
  request: QuoteRequest;
  consentAccepted: true;
  consentTimestamp: string;
};
```

### 3.2 API Routes

Patrón fijo: **validar con Zod → resolver → responder**. Errores siempre con la misma forma.

```
GET  /api/catalog
  200 → { data: { makes, models, trims, provinces, cantons } }

GET  /api/insurers
  200 → { data: Insurer[] }

POST /api/quotes      body: QuoteRequest
  200 → { data: QuoteOffer[] }
  400 → { error: { message: "Invalid quote request", code: "VALIDATION_ERROR" } }
  500 → { error: { message: "Unexpected error", code: "INTERNAL_ERROR" } }

POST /api/leads       body: LeadInput
  201 → { data: { id: string } }
  400 → { error: { message: "Invalid lead", code: "VALIDATION_ERROR" } }
  500 → { error: { message: "Unexpected error", code: "INTERNAL_ERROR" } }
```

El mismo schema de Zod valida en el formulario (cliente) y en la route (servidor).

`/api/quotes` aplica un retardo artificial **fijo de 800 ms** para que el estado de carga sea
observable en la demo, salteable con `QUOTE_DELAY_MS=0` para que los tests E2E no se vuelvan
lentos ni flaky.

### 3.3 Persistencia del lead

`lib/leads.ts` expone `persistLead(input: LeadInput): Promise<{ id: string }>`. Dos
implementaciones posibles, decididas por presencia de env vars, sin que la UI se entere:

1. **Sin Supabase:** log estructurado en servidor + id generado con `crypto.randomUUID()`.
2. **Con Supabase** (si `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` existen):

```sql
create table public.quote_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  full_name text not null,
  phone text,
  selected_offer_id text,
  request jsonb not null,
  consent_accepted boolean not null,
  consent_timestamp timestamptz not null
);

alter table public.quote_leads enable row level security;
-- Sin policies para anon/authenticated: nadie lee ni escribe desde el cliente.
-- El insert ocurre solo desde el servidor con la service role key, que omite RLS.
```

El insert es **exclusivamente server-side**. No se expone la tabla al cliente ni se usa la anon key.

### 3.4 i18n

next-intl con `es` como locale por defecto y sin prefijo de ruta. `messages/es.json` es el archivo
activo; `messages/en.json` se mantiene con **exactamente las mismas claves** por convención del
proyecto (verificado por test), aunque en este MVP no hay forma de cambiar de idioma en la UI.

El siguiente paso, fuera de este MVP, es: leer la cookie `NEXT_LOCALE` en `i18n/request.ts` +
un `LocaleSwitcher` en el footer que la escriba. Dejalo documentado en el README, no lo construyas.

Namespaces:

```
common.*             acciones, navegación, estados vacíos
landing.hero.*       landing.howItWorks.*   landing.insurers.*
landing.faq.*        landing.demoNotice
quote.profile.*      labels, help, errores del paso 1
quote.vehicle.*      paso 2
quote.driver.*       paso 3
quote.coverage.*     paso 4
quote.results.*      encabezados, filtros, orden, demoNotice, resumen de ahorro
quote.lead.*         diálogo de captura
consent.*            texto de consentimiento, compartido por driver y lead
coverage.levels.*    nombres de los 3 niveles, usados en paso 4 y en resultados
coverage.features.*  claves de includedFeatures, usadas en paso 4 y en resultados
errors.*             mensajes por código de error de la API
```

`coverage.*` y `consent.*` son namespaces propios precisamente porque los consumen dos pantallas
distintas: `useTranslations` necesita un namespace fijo por llamada.

---

## 4. Sistema de diseño

Tailwind 4 CSS-first. Todo token vive en `@theme` dentro de `app/globals.css`. **Cero valores
hardcodeados** de color, tipografía, espaciado o radio en componentes.

El bloque incluye los tokens que los primitivos de shadcn/ui esperan (`popover`, `secondary`,
`input`, `ring`, `--radius`). Ojo con `accent`: en shadcn es la **superficie sutil de hover**, no
el color de marca; el acento de marca va en `--color-brand`.

```css
@import "tailwindcss";

@theme {
  /* Marca */
  --color-primary: oklch(0.45 0.19 264);
  --color-primary-foreground: oklch(0.99 0 0);
  --color-brand: oklch(0.62 0.17 162);
  --color-brand-foreground: oklch(0.99 0 0);

  /* Superficies */
  --color-background: oklch(0.99 0.004 264);
  --color-foreground: oklch(0.21 0.02 264);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.21 0.02 264);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.21 0.02 264);
  --color-muted: oklch(0.96 0.006 264);
  --color-muted-foreground: oklch(0.48 0.02 264);
  --color-secondary: oklch(0.96 0.006 264);
  --color-secondary-foreground: oklch(0.28 0.02 264);
  --color-accent: oklch(0.95 0.01 264);          /* hover sutil, NO el color de marca */
  --color-accent-foreground: oklch(0.21 0.02 264);

  /* Bordes y foco */
  --color-border: oklch(0.91 0.008 264);
  --color-input: oklch(0.91 0.008 264);
  --color-ring: oklch(0.45 0.19 264);

  /* Estados */
  --color-destructive: oklch(0.55 0.21 27);
  --color-destructive-foreground: oklch(0.99 0 0);
  --color-warning: oklch(0.86 0.13 88);
  --color-warning-foreground: oklch(0.28 0.05 60);
  --color-success: oklch(0.6 0.15 155);
  --color-success-foreground: oklch(0.99 0 0);

  /* Tipografía — la variable la define next/font en app/layout.tsx */
  --font-sans: var(--font-inter, ui-sans-serif), system-ui, sans-serif;

  /* Radios */
  --radius: 0.625rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.625rem;
  --radius-lg: 1rem;
}
```

El banner de demo usa `--color-warning` / `--color-warning-foreground`. Verificá contraste ≥ 4.5:1
en ese par y en `primary/primary-foreground`, `destructive/destructive-foreground` y
`success/success-foreground` antes de darlos por buenos.

### Reglas de UX por pantalla

De `CLAUDE.md` §5, con lo específico de este producto:

1. Una sola acción primaria por pantalla. En el wizard: "Continuar" primaria, "Atrás" ghost.
2. Cada campo pedido necesita justificación visible (`*.help` en `messages/`). Si un campo no
   afecta el precio ni califica el lead, se elimina.
3. Mobile-first, hit areas ≥ 44px, validado en 375 / 768 / 1280 px.
4. Cifras concretas antes que adjetivos: en resultados se muestra la diferencia anual en colones
   entre la oferta más cara y la más barata, no "ahorrá mucho".
5. Skeletons con la forma del contenido real. Nunca un spinner genérico en listas.

---

## 5. Milestones

Uno a la vez. Al terminar, verificá los criterios y detenete para revisión.

---

### M0 — Verificación de la base y tooling

**Objetivo:** confirmar que el proyecto cumple lo que el plan asume. Sin funcionalidad todavía.

**Tareas**

1. Reportar la versión exacta de Next.js instalada y **fijar el major**. Si es 15+, tener presente
   que `params` y `searchParams` son asíncronos y ajustar las firmas de las páginas.
2. Verificar: TypeScript `strict: true`, alias `@/*`, Tailwind 4, pnpm (sin `package-lock.json`
   ni `yarn.lock`).
3. Completar las carpetas de `CLAUDE.md` §2 que falten, vacías.
4. Instalar dependencias de runtime: `zod`, `@tanstack/react-query`, `zustand`, `next-intl`,
   `react-hook-form`, `@hookform/resolvers`.
5. Instalar tooling de pruebas: `vitest`, `@vitejs/plugin-react`, `jsdom`,
   `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`,
   `@playwright/test`, `@axe-core/playwright`. Crear `vitest.config.ts` y `playwright.config.ts`.
6. Agregar scripts a `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`,
   `"test:e2e": "playwright test"`.
7. Inicializar shadcn/ui e instalar: `button card input select radio-group checkbox badge dialog
   form label separator skeleton sonner`.

**Criterios de aceptación**

- [ ] `pnpm build` termina con código 0, sin errores de tipos.
- [ ] `pnpm test` corre y termina en 0 (sin tests todavía es válido).
- [ ] `pnpm test:e2e --list` no falla (Playwright configurado).
- [ ] `pnpm build && pnpm start &` seguido de `curl -sf http://localhost:3000` responde 200; el
      proceso se cierra al terminar la verificación. **No uses `pnpm dev` como criterio: no termina.**
- [ ] Reporte corto de qué había y qué agregaste, con la versión de Next.js fijada.

> **Prompt:** *"Lee `docs/mvp-plan.md` y ejecutá M0. Sin features todavía: verificá la base,
> instalá dependencias y tooling de pruebas, configurá shadcn y reportá el estado."*

---

### M1 — Tokens, fuente, i18n y layout público

**Objetivo:** cascarón navegable con sistema de diseño y textos cableados.

**Tareas**

1. `app/globals.css` con el bloque `@theme` completo de §4.
2. `app/layout.tsx`: `next/font/google` Inter con `variable: "--font-inter"`, clase aplicada al
   `<html>`, `NextIntlClientProvider`, `QueryClientProvider`, `<Toaster />`.
3. next-intl: `i18n/request.ts` con locale fijo `es`, `messages/es.json` y `messages/en.json`.
4. `app/(public)/layout.tsx` con `SiteHeader` y `SiteFooter`.
5. Primitivos propios: `DemoBadge`, `ErrorState`.
6. `lib/utils.ts`:
   - `cn()`
   - `hashString(input: string): number`
   - `formatCrc(value: number): string` — **formato determinista, sin depender del build de ICU**:
     separador de miles `.`, sin decimales, prefijo `₡`. `formatCrc(780000) === "₡780.000"`.
7. Test `lib/utils.test.ts`: `formatCrc` con 0, 1.500, 780.000 y 1.250.000.
8. Test `messages/messages.test.ts`: aplana `es.json` y `en.json` y compara los sets de claves.

**Criterios de aceptación**

- [ ] `grep -rEn "#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(" app components --include="*.tsx"` no devuelve
      resultados (los colores solo existen en `globals.css`).
- [ ] `grep -rn ">[A-ZÁÉÍÓÚÑ][a-záéíóúñ ]\{3,\}<" components app --include="*.tsx"` no revela texto
      visible inline; todo sale de `messages/`.
- [ ] `pnpm test` pasa: `formatCrc(780000) === "₡780.000"` y las claves de `es`/`en` son idénticas.
- [ ] La fuente Inter se aplica (`getComputedStyle(document.body).fontFamily` la incluye).
- [ ] Header y footer sin scroll horizontal en 375 px.

> **Prompt:** *"Ejecutá M1: tokens `@theme`, Inter vía next/font, next-intl con locale fijo es,
> providers, layout público con header y footer, DemoBadge, ErrorState, `formatCrc` determinista
> y los dos tests (formatCrc y paridad de claves i18n)."*

---

### M2 — Datos mock y dominio

**Objetivo:** toda la lógica de dominio lista y testeada, sin UI y sin hooks que apunten a rutas
que aún no existen.

**Tareas**

1. `lib/mock-data/insurers.ts` — 6 aseguradoras ficticias (§1.2), con `rating` y `colorToken`.
2. `lib/mock-data/vehicle-catalog.ts` — 10 marcas comunes en Costa Rica (Toyota, Hyundai, Nissan,
   Mitsubishi, Suzuki, Kia, Honda, Mazda, Chevrolet, Ford), 3–5 modelos cada una, 2–3 versiones
   por modelo, años 2010–2026, con el multiplicador de valor por marca.
3. `lib/mock-data/cr-geo.ts` — las 7 provincias con sus cantones.
4. `lib/mock-data/coverage-plans.ts` — 3 niveles con `includedFeatures` como claves
   `coverage.features.*`.
5. `lib/mock-data/quote-generator.ts` — `generateMockOffers` determinista, con la heurística de
   §2.5, devolviendo ofertas de los 3 niveles.
6. `lib/mock-data/quote-provider.ts` — `mockQuoteProvider: QuoteProvider`.
7. `types/index.ts` — `Insurer`.
8. `features/quote/quote.types.ts` y `quote.schema.ts` (todos los schemas de §3.1, incluido
   `leadSchema`) y `buildQuoteRequest()`.
9. `features/catalog/*` e `features/insurers/*` completos, con sus rutas `GET /api/catalog` y
   `GET /api/insurers`.
10. Tests: `quote-generator.test.ts` (determinismo en 100 corridas, presencia de los 3 niveles,
    `isDemo` siempre true, primas dentro de rangos razonables, dispersión entre aseguradoras),
    `quote.schema.test.ts` (casos válidos e inválidos por bloque) y
    `build-quote-request.test.ts` (devuelve `null` con estado parcial).

**No hagas en M2:** `quote.api.ts` ni `quote.hooks.ts`. Se construyen en M4 y M5, cuando sus
endpoints existan.

**Criterios de aceptación**

- [ ] `generateMockOffers` con el mismo input devuelve output idéntico en 100 corridas.
- [ ] Toda oferta lleva `isDemo: true` y hay ofertas de los tres niveles de cobertura.
- [ ] Los nombres de aseguradoras son ficticios (assert explícito en el test contra la lista de
      marcas reales prohibidas de §1.2).
- [ ] `GET /api/catalog` y `GET /api/insurers` responden 200 con la forma `{ data: ... }`.
- [ ] `grep -rn ": any\|as any" features lib types` no devuelve resultados.
- [ ] `features/` no contiene JSX.
- [ ] `pnpm test` pasa.

> **Prompt:** *"Ejecutá M2: datos mock (aseguradoras ficticias, catálogo de vehículos, geografía
> CR, planes de cobertura), generador determinista, `mockQuoteProvider`, tipos y schemas,
> `buildQuoteRequest`, features `catalog` e `insurers` con sus GET routes, y los tests. No
> construyas `quote.api.ts` ni `quote.hooks.ts` todavía."*

---

### M3 — Wizard de cotización

**Objetivo:** los cuatro pasos de captura, navegables, validados y con estado persistente.

**Tareas**

1. `stores/quote-wizard.store.ts` con el patrón de hidratación de §2.4 (`skipHydration`,
   `hasHydrated`, `setHasHydrated`, setters por bloque, `reset()`).
2. `app/(public)/quote/layout.tsx` (`"use client"`): dispara `rehydrate()`, monta `WizardShell` +
   `WizardStepper`, y bloquea render hasta `hasHydrated`.
3. Los cuatro formularios con react-hook-form + `zodResolver`:
   - **Perfil:** provincia → cantón (cascada desde `useCatalog`), si ya tiene seguro, intención
     de compra. Cada campo con su `*.help` justificando por qué se pide.
   - **Vehículo:** año → marca → modelo → versión (cada select habilitado solo cuando el anterior
     tiene valor), tenencia, uso, km anuales.
   - **Conductor:** fecha de nacimiento, años de licencia, siniestros en 3 años, `ConsentNotice`
     con checkbox no premarcado; al aceptar se guarda `consentTimestamp`.
   - **Cobertura:** nivel en radio-cards mostrando `coverage.features.*` de cada uno, y deducible
     preferido opcional.
4. Navegación: no se avanza con el paso inválido; "Atrás" conserva lo capturado; entrar directo a
   un paso posterior sin datos previos redirige al primer paso incompleto **solo después de
   `hasHydrated`**.

**Criterios de aceptación**

- [ ] Los 4 pasos validan con los schemas de `features/quote` y muestran errores por campo desde
      `messages/`.
- [ ] Refrescar en cualquier paso conserva lo capturado y **no** redirige al paso 1 (verificado en
      el E2E de M7 con un `page.reload()` en el paso 3).
- [ ] Los selects de vehículo y de provincia/cantón funcionan en cascada y se deshabilitan
      correctamente.
- [ ] El consentimiento arranca desmarcado y bloquea el envío del paso 3.
- [ ] `grep -rn "fetch(" components` no devuelve resultados: todo pasa por hooks de `features/`.
- [ ] En 375 px, `document.documentElement.scrollWidth <= window.innerWidth` en los 4 pasos.

> **Prompt:** *"Ejecutá M3: store Zustand con el patrón de hidratación del plan, layout del wizard,
> stepper, y los cuatro pasos con react-hook-form + zodResolver. Cuidado con la redirección: debe
> esperar a `hasHydrated`."*

---

### M4 — Resultados y comparación

**Objetivo:** la pantalla que justifica el producto.

**Tareas**

1. `features/quote/quote.api.ts` (`postQuotes`) y `quote.hooks.ts` (`useQuoteResults`).
2. `app/api/quotes/route.ts`: validar con `quoteRequestSchema` → `mockQuoteProvider` → responder,
   con el retardo fijo de 800 ms parametrizado por `QUOTE_DELAY_MS`.
3. `app/(public)/quote/results/page.tsx`: `buildQuoteRequest(state)`; si devuelve `null` (y ya
   hidrató), redirige al primer paso incompleto; si no, llama `useQuoteResults`.
4. `DemoNoticeBanner` permanente arriba de los resultados (§1.1).
5. `QuoteResultsList` + `QuoteOfferCard`: aseguradora (nombre + rating desde `useInsurers`), prima
   mensual y anual, deducible, nivel, incluidos y `DemoBadge`.
6. `QuoteCompareTable` para ≥ `md`, con scroll horizontal **interno** si hace falta.
7. Filtro por nivel de cobertura (default: el elegido en el paso 4) y orden (precio asc por
   defecto, precio desc, rating). Ambos operan **en cliente sobre los datos ya cacheados**.
8. `QuoteSavingsSummary`: oferta más baja, más alta y diferencia anual en colones del nivel activo.
9. Estados: skeletons con la forma de las tarjetas; `ErrorState` con reintento;
   `app/(public)/quote/error.tsx` y `app/(public)/error.tsx`.

**Criterios de aceptación**

- [ ] En 375×667, el banner de demo cumple `getBoundingClientRect().bottom <= window.innerHeight`
      sin scroll, y no tiene control de cierre.
- [ ] Cada tarjeta muestra `DemoBadge`.
- [ ] Cambiar filtro u orden **no** dispara una nueva petición (verificado contando requests a
      `/api/quotes` en el E2E).
- [ ] Mientras carga hay skeletons, no un spinner.
- [ ] Entrar a `/quote/results` con el store vacío redirige al paso 1; entrar con el store completo
      tras un reload muestra resultados.
- [ ] En 375 px, `document.documentElement.scrollWidth <= window.innerWidth` (la tabla scrollea
      dentro de su contenedor, no la página).
- [ ] Un POST inválido a `/api/quotes` devuelve 400 con `{ error: { message, code } }`.

> **Prompt:** *"Ejecutá M4: `quote.api.ts`, `useQuoteResults`, API route `/api/quotes`, pantalla de
> resultados con banner de demo permanente, tarjetas, tabla comparativa, filtro y orden en cliente,
> resumen de ahorro, skeletons y error boundaries."*

---

### M5 — Captura de lead

**Objetivo:** cerrar el flujo con la única conversión del MVP.

**Tareas**

1. `LeadCaptureDialog`: se abre desde "Me interesa esta opción" en una tarjeta o desde el CTA
   general. Nombre, email, teléfono opcional y consentimiento (`consent.*`, mismo texto que el
   paso 3).
2. `useSubmitLead()` en `quote.hooks.ts` y `postLead` en `quote.api.ts` (usan el `leadSchema` que
   ya existe desde M2).
3. `app/api/leads/route.ts` con el patrón fijo y `lib/leads.ts` con `persistLead()` (§3.3).
4. Si hay credenciales de Supabase: migración de `quote_leads` con RLS.
5. Confirmación con toast y estado de éxito que deja claro que **alguien del equipo dará
   seguimiento** y que lo mostrado fue una simulación.

**Criterios de aceptación**

- [ ] No se puede enviar sin aceptar el consentimiento.
- [ ] Se persisten `consentAccepted` y `consentTimestamp`.
- [ ] El email se valida con el mismo `leadSchema` en cliente y en la route.
- [ ] Un error de red no borra lo que el usuario escribió en el diálogo.
- [ ] El texto de éxito no promete una póliza ni una cotización en firme (revisión manual del copy).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` no aparece en ningún archivo que corra en cliente
      (`grep -rn "SERVICE_ROLE" app components features stores` solo la encuentra en rutas de API
      o en `lib/leads.ts`).

> **Prompt:** *"Ejecutá M5: diálogo de captura de lead con consentimiento, `useSubmitLead`, API
> route `/api/leads` y `persistLead()` con las dos implementaciones. Si hay credenciales de
> Supabase, agregá la migración con RLS."*

---

### M6 — Landing

**Tareas**

1. Hero con propuesta de valor y CTA único a `/quote/profile`.
2. "Cómo funciona" en 3 pasos.
3. Franja de aseguradoras ficticias con nota de demo.
4. FAQ de 4–5 preguntas (`landing.faq.*`).
5. `landing.demoNotice` discreto pero presente.
6. Metadata: título, descripción, Open Graph.

**Criterios de aceptación**

- [ ] Un solo CTA primario visible sin scroll en 375×667.
- [ ] Todo el texto sale de `messages/`.
- [ ] En 375 px, sin scroll horizontal.
- [ ] Accesibilidad: `@axe-core/playwright` sin violaciones serias ni críticas en la landing.

> **Prompt:** *"Ejecutá M6: landing con hero, cómo funciona, aseguradoras, FAQ, nota de demo y
> metadata. Todo el texto vía next-intl."*

---

### M7 — Calidad

**Tareas**

1. Revisión responsive de las 6 pantallas (landing, 4 pasos, resultados) en 375 / 768 / 1280 px.
2. Accesibilidad: labels asociados, foco visible, navegación completa por teclado, contraste AA en
   los pares de tokens usados. `@axe-core/playwright` en las 6 pantallas.
3. Tests RTL de `profile-form`, `vehicle-form` y `driver-form` con validación real.
4. E2E `e2e/quote-flow.spec.ts`, con `QUOTE_DELAY_MS=0`:
   - recorrer los 4 pasos → ver resultados → abrir el diálogo → enviar el lead;
   - `page.reload()` en el paso 3 y verificar que no redirige ni pierde datos;
   - contar requests a `/api/quotes` al cambiar filtro y orden (debe seguir en 1);
   - `page.on("console")` acumulando errores y warnings: la aserción final es que el array está
     vacío;
   - en cada pantalla, `scrollWidth <= innerWidth` a 375 px.
5. `pnpm build` limpio, sin `any`, sin imports relativos profundos, sin `console.log`.

**Criterios de aceptación**

- [ ] El flujo completo se recorre solo con teclado.
- [ ] Axe: cero violaciones serias o críticas en las 6 pantallas.
- [ ] `pnpm test` y `pnpm test:e2e` pasan.
- [ ] El E2E falla si aparece un error de consola (no es revisión manual).

> **Prompt:** *"Ejecutá M7: tests RTL de los tres formularios y el E2E `quote-flow.spec.ts` con
> todas las aserciones del plan (reload, conteo de requests, consola limpia, scrollWidth), más la
> pasada de axe en las 6 pantallas."*

---

### M8 — Deploy

**Tareas**

1. Deploy a Vercel.
2. Variables de entorno cargadas (§6).
3. Verificación del flujo completo en producción desde un teléfono real.
4. Lighthouse móvil **contra la URL de Vercel**: performance ≥ 85, accesibilidad ≥ 95.
5. `README.md`: qué es, que los datos son simulados (primer párrafo), cómo correrlo, cómo cambiar
   los datos mock, y la nota del `LocaleSwitcher` pendiente (§3.4).

**Criterios de aceptación**

- [ ] URL pública funcionando, flujo completo verificado en móvil real.
- [ ] Banner de demo visible en producción.
- [ ] Lighthouse móvil en producción: performance ≥ 85, accesibilidad ≥ 95.
- [ ] El README dice en su primer párrafo que los datos son simulados.

---

## 6. Variables de entorno

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
QUOTE_DELAY_MS=800                # 0 en los tests E2E

# Opcionales — solo si se persisten leads en Supabase (M5)
SUPABASE_URL=                     # sin NEXT_PUBLIC: es de servidor
SUPABASE_SERVICE_ROLE_KEY=        # jamás importada desde código de cliente
```

No se usa la anon key: en este MVP el cliente nunca habla con Supabase. Mantené `.env.example`
actualizado.

---

## 7. Definición de "hecho" (todo milestone)

- `pnpm build` corre limpio, sin errores de tipos.
- Cero `any`, cero valores de diseño hardcodeados, cero texto visible inline.
- Ningún componente hace fetch directo.
- Ningún tipo duplicado; nada importado de un feature a otro (lo compartido vive en `types/`).
- Imports con alias `@/`, nunca `../../../`.
- Pantalla verificada en 375 / 768 / 1280 px sin scroll horizontal.
- Errores de API con la forma `{ error: { message, code } }`.

---

## 8. Decisiones abiertas (para el humano, no para el agente)

1. **Marca y paleta definitiva.** La paleta de §4 es de arranque; si hay identidad de marca, se
   reemplazan los valores dentro de `@theme` y nada más cambia.
2. **Nombres de aseguradoras.** El MVP usa marcas ficticias por §1.2. Pasar a nombres reales exige
   convenio firmado con cada aseguradora — y en ese momento deja de tener sentido mostrar precios
   simulados.
3. **Figura jurídica.** Antes de cualquier versión que cotice o venda de verdad hay que resolver el
   licenciamiento ante SUGESE (sociedad corredora vs. sociedad agencia, o alianza con una correduría
   autorizada). No bloquea esta demo; sí bloquea la siguiente etapa.
4. **Qué sigue.** Orden natural: backoffice de administración → captura de tarifas reales por
   aseguradora → cotización asistida por agente → compra en línea.

---

## 9. Cómo trabajar con este plan

1. Guardá este archivo en el repo como `docs/mvp-plan.md`.
2. Arrancá cada sesión con: *"Lee `docs/mvp-plan.md` y `CLAUDE.md`. Vamos por el milestone MX."*
3. Al terminar cada milestone, pedile al agente el checklist de criterios marcado con el comando o
   test que lo respalda, y revisá antes de avanzar.
4. Si un milestone se desvía del plan, actualizá el plan en el mismo commit. El plan y el código no
   deben divergir.
