import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { useQuoteWizard } from "@/stores/quote-wizard.store";
import { ProfileForm } from "./profile-form";
import { renderWithProviders } from "./test-utils";

vi.mock("@/features/catalog/catalog.hooks", () => ({
  useProvinces: () => ({
    data: [
      { id: "san-jose", name: "San José" },
      { id: "alajuela", name: "Alajuela" },
    ],
  }),
  useCantons: (provinceId?: string) => ({
    data:
      provinceId === "san-jose"
        ? [{ id: "san-jose-escazu", name: "Escazú" }]
        : provinceId === "alajuela"
          ? [{ id: "alajuela-grecia", name: "Grecia" }]
          : undefined,
  }),
}));

describe("ProfileForm", () => {
  beforeEach(() => {
    useQuoteWizard.setState({ profile: null });
    const { push } = useRouter();
    vi.mocked(push).mockClear();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Seleccioná una provincia")).toBeInTheDocument();
    expect(screen.getByText("Seleccioná un cantón")).toBeInTheDocument();
  });

  it("submits valid data, updates the store, and navigates to /quote/vehicle", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileForm />);

    await user.click(screen.getByLabelText("Provincia"));
    await user.click(await screen.findByRole("option", { name: "San José" }));

    await user.click(screen.getByLabelText("Cantón"));
    await user.click(await screen.findByRole("option", { name: "Escazú" }));

    // Base UI renderiza un input nativo oculto además del radio visible;
    // ambos exponen role="radio" con el mismo nombre accesible en jsdom
    // (en un navegador real, Playwright sí filtra el oculto). El primero
    // en el DOM es el elemento visible con el que interactúa la persona.
    await user.click(screen.getAllByRole("radio", { name: "Solo estoy explorando" })[0]);

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    const { push } = useRouter();
    expect(push).toHaveBeenCalledWith("/quote/vehicle");
    expect(useQuoteWizard.getState().profile).toEqual({
      provinceId: "san-jose",
      cantonId: "san-jose-escazu",
      hasCurrentInsurance: false,
      purchaseIntent: "exploring",
    });
  });
});
