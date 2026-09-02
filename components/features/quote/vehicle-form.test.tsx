import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { useQuoteWizard } from "@/stores/quote-wizard.store";
import { VehicleForm } from "./vehicle-form";
import { renderWithProviders } from "./test-utils";

vi.mock("@/features/catalog/catalog.hooks", () => ({
  useVehicleMakes: () => ({ data: [{ id: "toyota", name: "Toyota" }] }),
  useVehicleModels: (makeId?: string) => ({
    data: makeId === "toyota" ? [{ id: "toyota-corolla", name: "Corolla" }] : undefined,
  }),
  useVehicleTrims: (modelId?: string) => ({
    data: modelId === "toyota-corolla" ? [{ id: "toyota-corolla-ex", name: "EX" }] : undefined,
  }),
}));

describe("VehicleForm", () => {
  beforeEach(() => {
    useQuoteWizard.setState({ vehicle: null });
    const { push } = useRouter();
    vi.mocked(push).mockClear();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VehicleForm />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Debés seleccionar el año")).toBeInTheDocument();
    expect(screen.getByText("Debés seleccionar la marca")).toBeInTheDocument();
    expect(screen.getByText("Debés seleccionar el modelo")).toBeInTheDocument();
    expect(screen.getByText("Debés seleccionar la versión")).toBeInTheDocument();
    expect(screen.getByText("Ingresá un kilometraje válido")).toBeInTheDocument();
  });

  it("submits valid data, updates the store, and navigates to /quote/driver", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VehicleForm />);

    await user.click(screen.getByLabelText("Año"));
    await user.click(await screen.findByRole("option", { name: "2020" }));

    await user.click(screen.getByLabelText("Marca"));
    await user.click(await screen.findByRole("option", { name: "Toyota" }));

    await user.click(screen.getByLabelText("Modelo"));
    await user.click(await screen.findByRole("option", { name: "Corolla" }));

    await user.click(screen.getByLabelText("Versión"));
    await user.click(await screen.findByRole("option", { name: "EX" }));

    await user.click(screen.getAllByRole("radio", { name: "Para ir al trabajo o estudio" })[0]);
    await user.type(screen.getByLabelText("Kilómetros que recorrés al año"), "15000");

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    const { push } = useRouter();
    expect(push).toHaveBeenCalledWith("/quote/driver");
    expect(useQuoteWizard.getState().vehicle).toEqual({
      year: 2020,
      makeId: "toyota",
      modelId: "toyota-corolla",
      trimId: "toyota-corolla-ex",
      ownership: "owned",
      use: "commuting",
      annualKm: 15000,
    });
  });
});
