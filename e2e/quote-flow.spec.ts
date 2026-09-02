import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function selectOption(page: import("@playwright/test").Page, triggerId: string, optionText: string) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole("option", { name: optionText, exact: true }).click();
}

async function assertScreenIsHealthy(page: import("@playwright/test").Page, label: string) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow, `${label}: no debe haber scroll horizontal a 375px`).toBe(false);

  const axeResults = await new AxeBuilder({ page }).analyze();
  const seriousOrCritical = axeResults.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(
    seriousOrCritical,
    `${label}: sin violaciones serias/críticas de accesibilidad`,
  ).toEqual([]);
}

test.describe("Quote flow", () => {
  test("full journey: landing -> wizard -> results -> lead, with reload, request-count and console assertions", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const consoleIssues: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => consoleIssues.push(`[pageerror] ${String(err)}`));

    let quotesRequestCount = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/quotes")) quotesRequestCount += 1;
    });

    await page.setViewportSize({ width: 375, height: 667 });

    // --- Landing ---
    await page.goto("/", { waitUntil: "networkidle" });
    await assertScreenIsHealthy(page, "landing");
    await page.getByRole("link", { name: "Cotizar gratis" }).click();
    await page.waitForURL("**/quote/profile");

    // --- Step 1: Profile ---
    await assertScreenIsHealthy(page, "quote/profile");
    await selectOption(page, "provinceId", "San José");
    await selectOption(page, "cantonId", "Escazú");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.waitForURL("**/quote/vehicle");

    // --- Step 2: Vehicle ---
    await assertScreenIsHealthy(page, "quote/vehicle");
    await selectOption(page, "year", "2020");
    await selectOption(page, "makeId", "Toyota");
    await selectOption(page, "modelId", "Corolla");
    await selectOption(page, "trimId", "EX");
    await page.getByRole("radio", { name: "Para ir al trabajo o estudio" }).click();
    await page.locator("#annualKm").fill("15000");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.waitForURL("**/quote/driver");

    // --- Step 3: Driver (+ reload mid-step) ---
    // El store solo persiste el "progreso" del wizard (pasos ya enviados),
    // no cada tecla del paso activo (stores/quote-wizard.store.ts persiste
    // vía setDriver, que recién corre al enviar el paso). Lo que hay que
    // garantizar es que un reload a mitad del paso 3 no te manda de vuelta
    // al paso 1: eso probaría que perdiste el progreso de los pasos 1-2 ya
    // guardados.
    await assertScreenIsHealthy(page, "quote/driver");
    await page.locator("#birthDate").fill("1990-05-15");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/quote\/driver$/);

    await page.locator("#birthDate").fill("1990-05-15");
    await page.locator("#licenseYears").fill("10");
    await page.locator("#claimsLast3Years").fill("0");
    await page.getByRole("checkbox").click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.waitForURL("**/quote/coverage");

    // --- Step 4: Coverage ---
    await assertScreenIsHealthy(page, "quote/coverage");
    await page.getByRole("radio", { name: /Extendida/ }).click();

    const quotesResponsePromise = page.waitForResponse((res) => res.url().includes("/api/quotes"));
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.waitForURL("**/quote/results");
    await quotesResponsePromise;
    await page.getByText("Aseguradora Central", { exact: true }).first().waitFor();

    // --- Step 5: Results ---
    await assertScreenIsHealthy(page, "quote/results");
    expect(quotesRequestCount, "un solo POST a /api/quotes tras cargar resultados").toBe(1);

    await page.locator("#level-filter").click();
    await page.getByRole("option", { name: "Todo riesgo", exact: true }).click();
    await page.locator("#sort-select").click();
    await page.getByRole("option", { name: "Precio: mayor a menor", exact: true }).click();
    await page.waitForTimeout(300);
    expect(
      quotesRequestCount,
      "cambiar filtro/orden no debe disparar una nueva petición a /api/quotes",
    ).toBe(1);

    // --- Lead capture ---
    await page.getByRole("button", { name: "Me interesa esta opción" }).first().click();
    await page.getByRole("dialog").waitFor();
    await page.locator("#lead-fullName").fill("Ana Test");
    await page.locator("#lead-email").fill("ana@example.com");
    await page.getByRole("checkbox").click();

    const leadResponsePromise = page.waitForResponse((res) => res.url().includes("/api/leads"));
    await page.getByRole("button", { name: "Enviar" }).click();
    const leadResponse = await leadResponsePromise;
    expect(leadResponse.status()).toBe(201);
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // --- Console cleanliness (checked last, across the whole journey) ---
    expect(consoleIssues, "sin errores ni warnings de consola durante todo el flujo").toEqual([]);
  });
});
