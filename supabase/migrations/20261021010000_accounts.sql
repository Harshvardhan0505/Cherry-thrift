-- Shopper accounts. The phone number is each shopper's unique id; email is
-- optional. Passwords are stored only as scrypt hashes.
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null unique,
  -- Stored in lowercase.
  email text unique,
  password_hash text not null,
  -- The delivery address from their last order, to fill in checkout next
  -- time: { firstName, lastName, address, apartment, pin, city, state }.
  address jsonb
);

-- Signed-in browsers. The cookie holds a random token; only its SHA-256 hash
-- is stored, so a leaked table can't be used to sign in.
create table public.sessions (
  token_hash text primary key,
  customer_id uuid not null references public.customers (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index sessions_customer_id on public.sessions (customer_id);

-- Orders now belong to an account.
alter table public.orders
  add column customer_id uuid references public.customers (id) on delete set null;
create index orders_customer_id on public.orders (customer_id, created_at desc);

-- As with orders: no policies, so only the site's server (secret key) can
-- read or write these.
alter table public.customers enable row level security;
alter table public.sessions enable row level security;
