import "server-only";
import type { LeadInput } from "@/features/quote/quote.types";

/**
 * Persiste un lead. Dos implementaciones posibles, decididas por la
 * presencia de las env vars de Supabase, sin que la UI se entere de cuál
 * se usó (docs/mvp-plan.md §3.3). Solo se llama desde app/api/leads/route.ts.
 */
export async function persistLead(input: LeadInput): Promise<{ id: string }> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseServiceRoleKey) {
    return persistLeadToSupabase(input, supabaseUrl, supabaseServiceRoleKey);
  }

  return persistLeadToLog(input);
}

async function persistLeadToLog(input: LeadInput): Promise<{ id: string }> {
  const id = crypto.randomUUID();

  console.log(
    JSON.stringify({
      event: "lead.created",
      id,
      email: input.email,
      fullName: input.fullName,
      phone: input.phone ?? null,
      selectedOfferId: input.selectedOfferId,
      consentAccepted: input.consentAccepted,
      consentTimestamp: input.consentTimestamp,
    }),
  );

  return { id };
}

async function persistLeadToSupabase(
  input: LeadInput,
  supabaseUrl: string,
  supabaseServiceRoleKey: string,
): Promise<{ id: string }> {
  const res = await fetch(`${supabaseUrl}/rest/v1/quote_leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      email: input.email,
      full_name: input.fullName,
      phone: input.phone ?? null,
      selected_offer_id: input.selectedOfferId,
      request: input.request,
      consent_accepted: input.consentAccepted,
      consent_timestamp: input.consentTimestamp,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to persist lead to Supabase: ${res.status}`);
  }

  const rows = (await res.json()) as Array<{ id: string }>;
  return { id: rows[0].id };
}
