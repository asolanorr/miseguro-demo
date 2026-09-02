create table public.quote_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  full_name text not null,
  phone text,
  selected_offer_id text,
  request jsonb not null,
  consent_accepted boolean not null,
  consent_timestamp timestamptz not null
);

alter table public.quote_leads enable row level security;
-- Sin policies para anon/authenticated: nadie lee ni escribe desde el cliente.
-- El insert ocurre solo desde el servidor (lib/leads.ts) con la service role
-- key, que omite RLS.
