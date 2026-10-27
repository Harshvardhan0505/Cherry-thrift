-- Every piece is one of a kind: once it's in an order, it's sold. The primary
-- key on piece_id is what stops two people buying the same piece, even at the
-- same moment. Cancelling the order frees the piece again.
create table public.sold_pieces (
  -- The piece's web name (its slug in Sanity).
  piece_id text primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  sold_at timestamptz not null default now()
);
create index sold_pieces_order_id on public.sold_pieces (order_id);

alter table public.sold_pieces enable row level security;

-- Saves an order and marks its pieces sold in one go: if any piece is already
-- sold, nothing is saved (the unique piece_id makes the insert fail and the
-- whole function roll back).
create or replace function public.place_order(new_order jsonb, piece_ids text[])
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  new_id uuid;
begin
  insert into public.orders (
    customer_id, first_name, last_name, phone, email, address, apartment, city, state, pin,
    items, subtotal, discount, total
  )
  values (
    (new_order ->> 'customer_id')::uuid,
    new_order ->> 'first_name',
    new_order ->> 'last_name',
    new_order ->> 'phone',
    new_order ->> 'email',
    new_order ->> 'address',
    new_order ->> 'apartment',
    new_order ->> 'city',
    new_order ->> 'state',
    new_order ->> 'pin',
    new_order -> 'items',
    (new_order ->> 'subtotal')::integer,
    (new_order ->> 'discount')::integer,
    (new_order ->> 'total')::integer
  )
  returning id into new_id;

  insert into public.sold_pieces (piece_id, order_id)
  select piece_id, new_id from unnest(piece_ids) as piece_id;

  return new_id;
end;
$$;

-- Only the site's server may place orders this way.
revoke execute on function public.place_order(jsonb, text[]) from public, anon, authenticated;
