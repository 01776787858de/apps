create extension if not exists pgcrypto;

create table if not exists public.single_use_download_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  app_name text not null,
  apk_url text not null,
  created_at timestamptz not null default now(),
  redeemed_at timestamptz
);

alter table public.single_use_download_links enable row level security;

-- No client-side policies: only Edge Functions using the service role may access this table.
revoke all on public.single_use_download_links from anon, authenticated;
