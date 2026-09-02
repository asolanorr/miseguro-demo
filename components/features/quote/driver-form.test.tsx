import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { useQuoteWizard } from "@/stores/quote-wizard.store";
import { DriverForm } from "./driver-form";
import { renderWithProviders } from "./test-utils";

describe("DriverForm", () => {
  beforeEach(() => {
    useQuoteWizard.setState({ driver: null });
    const { push } = useRouter();
    vi.mocked(push).mockClear();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DriverForm />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      await screen.findByText("Ingresá una fecha válida (debés ser mayor de edad)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ingresá un número de años válido")).toBeInTheDocument();
    expect(screen.getByText("Ingresá un número válido (0 a 5)")).toBeInTheDocument();

    const { push } = useRouter();
    expect(push).not.toHaveBeenCalled();
  });

  it("blocks submission when the fields are valid but consent is not accepted", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DriverForm />);

    await user.type(screen.getByLabelText("Fecha de nacimiento"), "1990-05-15");
    await user.type(screen.getByLabelText("Años con licencia de conducir"), "10");
    await user.type(
      screen.getByLabelText("Siniestros reportados en los últimos 3 años"),
      "0",
    );

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      await screen.findByText("Debés aceptar el consentimiento para continuar"),
    ).toBeInTheDocument();

    const { push } = useRouter();
    expect(push).not.toHaveBeenCalled();
    expect(useQuoteWizard.getState().driver).toBeNull();
  });

  it("submits valid data with consent, updates the store, and navigates to /quote/coverage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DriverForm />);

    await user.type(screen.getByLabelText("Fecha de nacimiento"), "1990-05-15");
    await user.type(screen.getByLabelText("Años con licencia de conducir"), "10");
    await user.type(
      screen.getByLabelText("Siniestros reportados en los últimos 3 años"),
      "0",
    );
    await user.click(screen.getAllByRole("checkbox")[0]);

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    const { push } = useRouter();
    expect(push).toHaveBeenCalledWith("/quote/coverage");

    const driver = useQuoteWizard.getState().driver;
    expect(driver).not.toBeNull();
    expect(driver?.birthDate).toBe("1990-05-15");
    expect(driver?.licenseYears).toBe(10);
    expect(driver?.claimsLast3Years).toBe(0);
    expect(driver?.consentAccepted).toBe(true);
    expect(driver?.consentTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
