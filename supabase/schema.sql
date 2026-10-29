-- ============================================================================
-- DROP BSB — Schema PostgreSQL (Supabase)
-- Rode este arquivo no SQL Editor do seu projeto Supabase (ordem: schema -> rls -> seed)
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- BRANDS
-- ---------------------------------------------------------------------------
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CATEGORIES (auto-relacionada para permitir subcategorias no futuro)
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  parent_id uuid references categories(id) on delete set null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- DROPS
-- NOTA: a DROP BSB não usa mais lançamento por horário programado — "DROP" é
-- só o nome da marca. Esta tabela fica no schema por compatibilidade (não
-- excluímos sem necessidade), mas o frontend atual não a consome; produtos
-- entram no catálogo direto (ver "products") e ficam disponíveis até acabar
-- o estoque. Ignore esta tabela a menos que decida reativar campanhas com
-- data de lançamento no futuro.
-- ---------------------------------------------------------------------------
create table if not exists drops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  code text not null,               -- ex: "DROP #001"
  name text not null,               -- ex: "Coleção Inverno"
  description text,
  banner_desktop_url text,
  banner_mobile_url text,
  launch_at timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand_id uuid references brands(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  description text not null default '',
  details text,
  composition text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  sku text unique,
  tags text[] not null default '{}',
  is_new boolean not null default false,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_limited boolean not null default false,
  is_sale boolean not null default false,
  is_active boolean not null default true,
  show_on_home boolean not null default false,
  low_stock_threshold integer not null default 3,
  related_product_ids uuid[] not null default '{}',
  complete_the_look_ids uuid[] not null default '{}',
  drop_id uuid references drops(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_brand on products(brand_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_drop on products(drop_id);
create index if not exists idx_products_active on products(is_active);
create index if not exists idx_products_flags on products(is_new, is_featured, is_best_seller, is_sale);
create index if not exists idx_products_tags on products using gin(tags);

-- ---------------------------------------------------------------------------
-- PRODUCT IMAGES
-- ---------------------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text,
  position integer not null default 0,
  is_primary boolean not null default false
);
create index if not exists idx_product_images_product on product_images(product_id);

-- ---------------------------------------------------------------------------
-- PRODUCT VARIANTS (tamanho / cor / estoque)
-- ---------------------------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  color text,
  sku text,
  stock integer not null default 0 check (stock >= 0),
  unique (product_id, size, color)
);
create index if not exists idx_product_variants_product on product_variants(product_id);

-- ---------------------------------------------------------------------------
-- BANNERS
-- ---------------------------------------------------------------------------
create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_desktop_url text not null,
  image_mobile_url text not null,
  cta_label text,
  cta_link text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- COLLECTIONS (agrupamentos livres, ex: "Mais vendidos", curadorias manuais)
-- ---------------------------------------------------------------------------
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  product_ids uuid[] not null default '{}',
  is_active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- FAVORITES (usuários autenticados; visitantes usam localStorage no client)
-- ---------------------------------------------------------------------------
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- ORDERS / ORDER_ITEMS (pedido finalizado via WhatsApp; preparado p/ gateway futuro)
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  status text not null default 'pending_whatsapp'
    check (status in ('pending_whatsapp','confirmed','paid','shipped','completed','cancelled')),
  total numeric(10,2) not null default 0,
  coupon_code text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  size text not null,
  unit_price numeric(10,2) not null,
  quantity integer not null check (quantity > 0)
);
create index if not exists idx_order_items_order on order_items(order_id);

-- ---------------------------------------------------------------------------
-- COUPONS
-- ---------------------------------------------------------------------------
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off numeric(5,2),
  amount_off numeric(10,2),
  is_active boolean not null default true,
  expires_at timestamptz
);

-- ---------------------------------------------------------------------------
-- INSTAGRAM POSTS (cadastro manual até integrar API oficial — Seção 19)
-- ---------------------------------------------------------------------------
create table if not exists instagram_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  link text not null,
  display_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- SITE_SETTINGS (linha única de configuração global da loja)
-- ---------------------------------------------------------------------------
create table if not exists site_settings (
  id integer primary key default 1 check (id = 1), -- singleton
  store_name text not null default 'DROP BSB',
  logo_url text,
  instagram_handle text default '@dropbsb_',
  instagram_profile_image_url text,
  whatsapp_number text not null default '5561996943237',
  whatsapp_message_template text not null default
    'Olá! Tenho interesse neste produto:%0A%0AProduto: {product}%0ATamanho: {size}%0APreço: {price}%0ALink: {link}',
  email text default 'dropbsb.contato@gmail.com',
  address text,
  hours text,
  primary_color text default '#B7FF00'
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- Se este schema já foi executado antes da coluna abaixo existir, este ALTER
-- idempotente garante que projetos existentes recebam o campo sem precisar
-- recriar a tabela (upload da imagem de perfil do Instagram — Seção 7).
alter table site_settings add column if not exists instagram_profile_image_url text;

-- ---------------------------------------------------------------------------
-- ADMIN_USERS (perfil administrativo vinculado ao auth.users do Supabase)
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Trigger: updated_at automático em products
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- View auxiliar: estoque total por produto (para listagens "esgotado")
-- ---------------------------------------------------------------------------
create or replace view product_stock_summary as
select
  p.id as product_id,
  coalesce(sum(v.stock), 0) as total_stock,
  min(v.stock) filter (where v.stock > 0) as lowest_positive_stock
from products p
left join product_variants v on v.product_id = p.id
group by p.id;
