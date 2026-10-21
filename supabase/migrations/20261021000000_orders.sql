-- Orders placed on the site. Payment is arranged with the customer after the
-- order is placed, so an order starts as "placed" and the shop moves it along.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- The friendly number shown to customers, e.g. #1001.
  number bigint generated always as identity (start with 1001) unique,
  created_at timestamptz not null default now(),
  status text not null default 'placed'
    check (status in ('placed', 'confirmed', 'shipped', 'delivered', 'cancelled')),

  -- Customer details: only the shop sees these, never the order page.
  first_name text not null,
  last_name text,
  phone text not null,
  email text,
  address text not null,
  apartment text,
  city text not null,
  state text not null,
  pin text not null,

  -- What was bought, as it was at the time: [{ id, name, size, price, image }].
  items jsonb not null,
  -- Rupees.
  subtotal integer not null,
  discount integer not null default 0,
  total integer not null
);

-- Row level security with no policies: the public API keys can't read or
-- write orders at all. The site's server uses the secret key.
alter table public.orders enable row level security;
