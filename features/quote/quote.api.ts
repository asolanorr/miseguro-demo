import { z } from "zod";
import { quoteOffersResponseSchema } from "./quote.schema";
import type { LeadInput, QuoteOffer, QuoteRequest } from "./quote.types";

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

const leadResponseSchema = z.object({ id: z.string().min(1) });

export async function postLead(input: LeadInput): Promise<{ id: string }> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error.message);
  }

  return leadResponseSchema.parse(json.data);
}
