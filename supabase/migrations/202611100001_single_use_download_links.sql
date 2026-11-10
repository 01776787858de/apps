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
revoke all on public.single_use_download_links from anon, authenticated;

create table if not exists public.download_link_admin_keys (
  key_hash text primary key,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.download_link_admin_keys enable row level security;
revoke all on public.download_link_admin_keys from anon, authenticated;
-- The live project has one admin key hash inserted during provisioning.
