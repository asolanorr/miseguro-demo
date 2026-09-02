import { expect, test, type Page } from "@playwright/test";

/**
 * Abre un Select (Base UI) con Enter, baja `arrowDownCount` posiciones desde
 * el primer ítem (que queda resaltado al abrir un select vacío) y confirma
 * con Enter. `arrowDownCount` es el índice de la opción deseada dentro del
 * listado real que devuelve el catálogo (lib/mock-data/*), no un valor
 * arbitrario -- ver el comentario en cada llamado.
 */
async function selectViaKeyboard(
  page: Page,
  triggerId: string,
  optionName: string,
  arrowDownCount: number,
) {
  const trigger = page.locator(`#${triggerId}`);
  await expect(trigger).toBeEnabled();
  // Un select recién habilitado (por ejemplo tras elegir la marca) puede
  // tardar un tick en quedar listo para abrir de forma fiable.
  await page.waitForTimeout(150);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("option", { name: optionName, exact: true }).waitFor();
  // Un instante para que el popup termine de montar antes de que el
  // teclado empiece a moverlo -- sin esto, las pulsaciones se pierden de
  // forma intermitente.
  await page.waitForTimeout(200);
  // "Home" fija el resaltado en el primer ítem de forma explícita: abrir el
  // popup por sí solo no deja el listbox en un estado que un Enter
  // inmediato pueda confirmar.
  await page.keyboard.press("Home");
  await page.waitForTimeout(50);
  for (let i = 0; i < arrowDownCount; i++) {
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
  }
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
}

/**
 * Recorre el flujo completo (landing -> wizard -> resultados -> lead) sin
 * usar el mouse: cada control se enfoca y se opera con teclado (Enter,
 * Espacio, flechas). No reproduce el orden exacto de Tab paso a paso (sería
 * frágil ante cambios de layout); en cambio prueba que cada control
 * responde a las teclas estándar de su rol ARIA una vez que tiene foco,
 * que es la parte sustantiva de "operable con teclado".
 */
test("full journey is operable via keyboard only", async ({ page }) => {
  test.setTimeout(60_000);

  // Ancho móvil para que sea el grid de tarjetas (no la tabla ≥md) el que
  // quede visible, evitando ambigüedad con textos duplicados entre ambos.
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");

  // Landing: Tab desde el body pasa primero por el link de marca del
  // header, luego llega al único CTA.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "MiSeguro" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Cotizar gratis" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/quote/profile");

  // --- Step 1: Profile ---
  // provinces: San José es el índice 0 (lib/mock-data/cr-geo.ts).
  await selectViaKeyboard(page, "provinceId", "San José", 0);
  await expect(page.locator("#provinceId")).toContainText("San José");

  // cantones de San José: San José(0), Escazú(1).
  await selectViaKeyboard(page, "cantonId", "Escazú", 1);
  await expect(page.locator("#cantonId")).toContainText("Escazú");

  await page.getByRole("button", { name: "Continuar" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/quote/vehicle");

  // --- Step 2: Vehicle ---
  // VEHICLE_YEARS baja desde 2026: 2026(0) 2025(1) 2024(2) 2023(3) 2022(4)
  // 2021(5) 2020(6).
  await selectViaKeyboard(page, "year", "2020", 6);
  await expect(page.locator("#year")).toContainText("2020");

  // vehicleMakes: Toyota es el índice 0.
  await selectViaKeyboard(page, "makeId", "Toyota", 0);
  await expect(page.locator("#makeId")).toContainText("Toyota");

  // modelos de Toyota: Corolla es el índice 0.
  await selectViaKeyboard(page, "modelId", "Corolla", 0);

  // TRIM_LADDER: LX(0), EX(1).
  await selectViaKeyboard(page, "trimId", "EX", 1);

  await page.locator("#annualKm").focus();
  await page.keyboard.type("15000");

  await page.getByRole("button", { name: "Continuar" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/quote/driver");

  // --- Step 3: Driver ---
  await page.locator("#birthDate").focus();
  await page.keyboard.type("05/15/1990");

  await page.locator("#licenseYears").focus();
  await page.keyboard.type("10");

  await page.locator("#claimsLast3Years").focus();
  await page.keyboard.type("0");

  await page.getByRole("checkbox").focus();
  await page.keyboard.press("Space");

  await page.getByRole("button", { name: "Continuar" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/quote/coverage");

  // --- Step 4: Coverage (radiogroup: Enter/Space selecciona, no hace falta
  // moverse con flechas porque "extended" no es el foco inicial del grupo). ---
  await page.getByRole("radio", { name: /Extendida/ }).focus();
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: "Continuar" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/quote/results");
  await page.getByText("Aseguradora Central", { exact: true }).first().waitFor();

  // --- Results: abrir el diálogo de lead con teclado y enviarlo ---
  await page.getByRole("button", { name: "Me interesa esta opción" }).first().focus();
  await page.keyboard.press("Enter");
  await page.getByRole("dialog").waitFor();

  await page.locator("#lead-fullName").focus();
  await page.keyboard.type("Ana Teclado");

  await page.locator("#lead-email").focus();
  await page.keyboard.type("ana.teclado@example.com");

  await page.locator("#lead-consent-accepted").focus();
  await page.keyboard.press("Space");

  await page.getByRole("button", { name: "Enviar" }).focus();
  const leadResponsePromise = page.waitForResponse((res) => res.url().includes("/api/leads"));
  await page.keyboard.press("Enter");
  const leadResponse = await leadResponsePromise;
  expect(leadResponse.status()).toBe(201);
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
