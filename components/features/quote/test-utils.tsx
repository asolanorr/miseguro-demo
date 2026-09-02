import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import esMessages from "@/messages/es.json";

export function renderWithProviders(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es" messages={esMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}
