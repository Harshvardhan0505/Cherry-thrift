-- One-time links for resetting a forgotten password. Only the SHA-256 hash of
-- each link's token is stored; links expire after 30 minutes and work once.
create table public.password_resets (
  token_hash text primary key,
  customer_id uuid not null references public.customers (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);
create index password_resets_customer_id on public.password_resets (customer_id, created_at desc);

-- No policies: only the site's server (secret key) can read or write these.
alter table public.password_resets enable row level security;
