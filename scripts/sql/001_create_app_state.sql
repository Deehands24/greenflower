-- Create extensions as needed
create extension if not exists pgcrypto;

-- Minimal table to persist the entire app state as JSON.
create table if not exists public.app_state (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Helpful index for querying by name and updated_at
create index if not exists app_state_name_idx on public.app_state (name);
create index if not exists app_state_updated_at_idx on public.app_state (updated_at desc);
