import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  QuoteCoverage,
  QuoteDriver,
  QuoteProfile,
  QuoteVehicle,
  QuoteWizardState,
} from "@/features/quote/quote.types";

const initialState: QuoteWizardState = {
  profile: null,
  vehicle: null,
  driver: null,
  coverage: null,
};

type QuoteWizardStore = QuoteWizardState & {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setProfile: (profile: QuoteProfile) => void;
  setVehicle: (vehicle: QuoteVehicle) => void;
  setDriver: (driver: QuoteDriver) => void;
  setCoverage: (coverage: QuoteCoverage) => void;
  reset: () => void;
};

export const useQuoteWizard = create<QuoteWizardStore>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setProfile: (profile) => set({ profile }),
      setVehicle: (vehicle) => set({ vehicle }),
      setDriver: (driver) => set({ driver }),
      setCoverage: (coverage) => set({ coverage }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: "quote-wizard",
      storage: createJSONStorage(() => sessionStorage),
      // La rehidratación desde sessionStorage ocurre después del primer
      // render de cliente en App Router. Sin skipHydration + hasHydrated,
      // una redirección "si no hay datos, volver al paso 1" se dispara
      // antes de que el store termine de leer lo persistido.
      skipHydration: true,
      partialize: (state) => ({
        profile: state.profile,
        vehicle: state.vehicle,
        driver: state.driver,
        coverage: state.coverage,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
