import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/features/quote/quote.schema";
import { mockQuoteProvider } from "@/lib/mock-data/quote-provider";

// Retardo artificial fijo para que el estado de carga sea observable en la
// demo. Se salta con QUOTE_DELAY_MS=0 en los tests E2E (ver playwright.config.ts).
const QUOTE_DELAY_MS = Number(process.env.QUOTE_DELAY_MS ?? 800);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid quote request", code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Invalid quote request", code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  if (QUOTE_DELAY_MS > 0) {
    await new Promise((resolve) => setTimeout(resolve, QUOTE_DELAY_MS));
  }

  try {
    const offers = await mockQuoteProvider(parsed.data);
    return NextResponse.json({ data: offers });
  } catch {
    return NextResponse.json(
      { error: { message: "Unexpected error", code: "INTERNAL_ERROR" } },
      { status: 500 },
    );
  }
}
