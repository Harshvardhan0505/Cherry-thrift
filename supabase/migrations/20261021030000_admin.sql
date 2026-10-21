-- The admin panel: the shop's team, their sign-ins, and what they track on
-- each order.

-- "In transit" sits between shipped and delivered.
alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('placed', 'confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'));

alter table public.orders
  add column paid boolean not null default false,
  add column courier text,
  add column tracking_number text,
  -- Private to the team; never shown to the customer.
  add column notes text;

-- The owner and helpers who run the shop. Separate from customer accounts.
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  -- Stored in lowercase; what staff log in with.
  email text not null unique,
  role text not null check (role in ('owner', 'helper')),
  password_hash text not null
);

-- Signed-in admin browsers; as with customers, only token hashes are stored.
create table public.staff_sessions (
  token_hash text primary key,
  staff_id uuid not null references public.staff (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index staff_sessions_staff_id on public.staff_sessions (staff_id);

-- What happened to each order and who did it, e.g. "Confirmed by Riya".
create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  staff_id uuid references public.staff (id) on delete set null,
  -- Kept in case the staff member is later removed.
  staff_name text,
  message text not null,
  created_at timestamptz not null default now()
);
create index order_events_order_id on public.order_events (order_id, created_at);

-- No policies: only the site's server (secret key) can read or write these.
alter table public.staff enable row level security;
alter table public.staff_sessions enable row level security;
alter table public.order_events enable row level security;
