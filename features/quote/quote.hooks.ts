"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { postLead, postQuotes } from "./quote.api";
import type { QuoteRequest } from "./quote.types";

/**
 * `request` en null significa "todavía no hay datos suficientes en el
 * wizard" (ver buildQuoteRequest): la query queda deshabilitada hasta que
 * exista un QuoteRequest completo.
 */
export function useQuoteResults(request: QuoteRequest | null) {
  return useQuery({
    queryKey: ["quotes", request],
    queryFn: () => postQuotes(request as QuoteRequest),
    enabled: request !== null,
    staleTime: Infinity,
  });
}

export function useSubmitLead() {
  return useMutation({
    mutationFn: postLead,
  });
}
