import { quoteOffersResponseSchema } from "./quote.schema";
import type { QuoteOffer, QuoteRequest } from "./quote.types";

export async function postQuotes(request: QuoteRequest): Promise<QuoteOffer[]> {
  const res = await fetch("/api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error.message);
  }

  return quoteOffersResponseSchema.parse(json.data);
}
