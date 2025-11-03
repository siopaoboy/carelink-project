-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- Profiles table to store parent profiles as JSON
create table if not exists profiles (
  email text primary key,
  data jsonb
);

create index if not exists profiles_data_gin on profiles using gin (data);

-- Children table (optional normalization)
create table if not exists children (
  id uuid default gen_random_uuid() primary key,
  parent_email text not null,
  data jsonb not null,
  created_at timestamptz default now()
);
create index if not exists children_parent_email_idx on children(parent_email);
create index if not exists children_data_gin on children using gin (data);

-- Notification settings per parent (optional normalization)
create table if not exists notify_settings (
  email text primary key,
  data jsonb not null
);

-- Provider profiles stored as JSON
create table if not exists provider_profiles (
  email text primary key,
  data jsonb not null
);
create index if not exists provider_profiles_data_gin on provider_profiles using gin (data);
