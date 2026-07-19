-- Product size variants (500g, 1kg, 2kg etc.)
create table if not exists public.product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products on delete cascade,
  label text not null,           -- e.g. "500g", "1kg", "2kg"
  price numeric(10,2) not null,
  compare_price numeric(10,2),
  stock_qty numeric(10,2) default 0,
  sort_order int default 0,
  is_active boolean default true
);
alter table public.product_variants enable row level security;
create policy "Anyone reads variants" on public.product_variants for select using (true);
create policy "All manage variants" on public.product_variants for all using (true);
