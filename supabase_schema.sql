-- ============================================================
-- AGRENES DATABASE SCHEMA
-- Run this in your Supabase SQL Editor at supabase.com
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES (extends Supabase auth.users) ──────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'customer' check (role in ('customer','vendor','admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── ADDRESSES ────────────────────────────────────────────────
create table public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade,
  label text default 'Home',
  full_name text,
  phone text,
  line1 text,
  line2 text,
  city text,
  postcode text,
  country text default 'United Kingdom',
  is_default boolean default false,
  created_at timestamptz default now()
);
alter table public.addresses enable row level security;
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id);

-- ── VENDORS ──────────────────────────────────────────────────
create table public.vendors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete set null,
  name text not null,
  slug text unique,
  logo_url text,
  cover_url text,
  description text,
  location text,
  region text,
  certifications text[],
  rating numeric(3,2) default 0,
  review_count int default 0,
  total_sales int default 0,
  is_verified boolean default false,
  is_active boolean default true,
  joined_at timestamptz default now()
);
alter table public.vendors enable row level security;
create policy "Anyone can read active vendors" on public.vendors for select using (is_active = true);
create policy "Vendors manage own store" on public.vendors for update using (auth.uid() = user_id);
create policy "Admins full access vendors" on public.vendors for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── CATEGORIES ───────────────────────────────────────────────
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique,
  emoji text,
  image_url text,
  parent_id uuid references public.categories(id),
  sort_order int default 0,
  is_active boolean default true
);
alter table public.categories enable row level security;
create policy "Anyone can read categories" on public.categories for select using (is_active = true);
create policy "Admins manage categories" on public.categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── PRODUCTS ─────────────────────────────────────────────────
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors on delete cascade,
  category_id uuid references public.categories,
  name text not null,
  slug text unique,
  description text,
  images text[],
  price numeric(10,2) not null,
  compare_price numeric(10,2),
  unit text default 'kg',
  min_order_qty numeric(10,2) default 1,
  bulk_price numeric(10,2),
  bulk_min_qty numeric(10,2),
  stock_qty numeric(10,2) default 0,
  tags text[],
  certifications text[],
  origin text,
  weight_g int,
  is_flash_deal boolean default false,
  flash_ends_at timestamptz,
  is_featured boolean default false,
  is_active boolean default true,
  rating numeric(3,2) default 0,
  review_count int default 0,
  sales_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.products enable row level security;
create policy "Anyone can read active products" on public.products for select using (is_active = true);
create policy "Vendors manage own products" on public.products for all using (
  exists (select 1 from public.vendors where id = vendor_id and user_id = auth.uid())
);
create policy "Admins full access products" on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── REVIEWS ──────────────────────────────────────────────────
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  order_id uuid,
  rating int check (rating between 1 and 5),
  title text,
  body text,
  images text[],
  is_verified boolean default false,
  helpful_count int default 0,
  created_at timestamptz default now()
);
alter table public.reviews enable row level security;
create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Users create own reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users update own reviews" on public.reviews for update using (auth.uid() = user_id);

-- ── ORDERS ───────────────────────────────────────────────────
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  reference text unique default 'AGR-' || upper(substring(md5(random()::text) from 1 for 6)),
  user_id uuid references public.profiles on delete set null,
  vendor_id uuid references public.vendors,
  address_id uuid references public.addresses,
  status text default 'pending' check (status in ('pending','confirmed','preparing','dispatched','in_transit','customs','out_for_delivery','delivered','cancelled','refunded')),
  order_type text default 'retail' check (order_type in ('retail','bulk')),
  subtotal numeric(10,2),
  delivery_fee numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2),
  currency text default 'GBP',
  payment_method text,
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  stripe_payment_intent text,
  notes text,
  estimated_delivery date,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins full access orders" on public.orders for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Vendors view their orders" on public.orders for select using (
  exists (select 1 from public.vendors where id = vendor_id and user_id = auth.uid())
);

-- ── ORDER ITEMS ───────────────────────────────────────────────
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade,
  product_id uuid references public.products,
  vendor_id uuid references public.vendors,
  name text,
  image text,
  price numeric(10,2),
  qty numeric(10,2),
  unit text,
  subtotal numeric(10,2)
);
alter table public.order_items enable row level security;
create policy "Users view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Users insert order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Admins full access order items" on public.order_items for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── WISHLIST ─────────────────────────────────────────────────
create table public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade,
  product_id uuid references public.products on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);
alter table public.wishlist enable row level security;
create policy "Users manage own wishlist" on public.wishlist for all using (auth.uid() = user_id);

-- ── PROMO CODES ──────────────────────────────────────────────
create table public.promo_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique,
  type text check (type in ('percent','fixed')),
  value numeric(10,2),
  min_order numeric(10,2) default 0,
  max_uses int,
  used_count int default 0,
  expires_at timestamptz,
  is_active boolean default true
);
alter table public.promo_codes enable row level security;
create policy "Anyone can read active promos" on public.promo_codes for select using (is_active = true);
create policy "Admins manage promos" on public.promo_codes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── SEED CATEGORIES ──────────────────────────────────────────
insert into public.categories (name, slug, emoji, sort_order) values
  ('All Produce', 'all', '🥬', 0),
  ('Fruits', 'fruits', '🥑', 1),
  ('Vegetables', 'vegetables', '🫛', 2),
  ('Bananas & Plantain', 'bananas', '🍌', 3),
  ('Roots & Tubers', 'tubers', '🍠', 4),
  ('Herbs & Spices', 'herbs', '🌶', 5),
  ('Legumes', 'legumes', '🫘', 6),
  ('Dried Goods', 'dried', '🌾', 7);

-- ── TRACKING EVENTS ──────────────────────────────────────────
create table public.tracking_events (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade,
  status text,
  description text,
  location text,
  created_at timestamptz default now()
);
alter table public.tracking_events enable row level security;
create policy "Users view own tracking" on public.tracking_events for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);
create policy "Admins manage tracking" on public.tracking_events for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
