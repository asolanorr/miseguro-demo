import type { QuoteProvider } from "@/features/quote/quote.types";
import { generateMockOffers } from "./quote-generator";

export const mockQuoteProvider: QuoteProvider = async (request) =>
  generateMockOffers(request);
