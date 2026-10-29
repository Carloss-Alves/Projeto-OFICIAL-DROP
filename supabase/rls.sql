-- ============================================================================
-- DROP BSB — Row Level Security
-- Regra geral: leitura pública apenas do que é "ativo"; escrita somente para
-- usuários presentes em admin_users. Nada administrativo fica público.
-- ============================================================================

-- Helper: verifica se o usuário autenticado atual é admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$ language sql stable security definer;

-- ---------------------------------------------------------------------------
alter table brands enable row level security;
alter table categories enable row level security;
alter table drops enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table banners enable row level security;
alter table collections enable row level security;
alter table favorites enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table coupons enable row level security;
alter table instagram_posts enable row level security;
alter table site_settings enable row level security;
alter table admin_users enable row level security;

-- BRANDS
create policy "brands_public_read" on brands for select using (is_active = true or is_admin());
create policy "brands_admin_write" on brands for all using (is_admin()) with check (is_admin());

-- CATEGORIES
create policy "categories_public_read" on categories for select using (is_active = true or is_admin());
create policy "categories_admin_write" on categories for all using (is_admin()) with check (is_admin());

-- DROPS
create policy "drops_public_read" on drops for select using (true); -- inclui "próximos" e "encerrados" para a página /drops
create policy "drops_admin_write" on drops for all using (is_admin()) with check (is_admin());

-- PRODUCTS
create policy "products_public_read" on products for select using (is_active = true or is_admin());
create policy "products_admin_write" on products for all using (is_admin()) with check (is_admin());

-- PRODUCT IMAGES
create policy "product_images_public_read" on product_images for select using (
  exists (select 1 from products p where p.id = product_id and (p.is_active or is_admin()))
);
create policy "product_images_admin_write" on product_images for all using (is_admin()) with check (is_admin());

-- PRODUCT VARIANTS
create policy "product_variants_public_read" on product_variants for select using (
  exists (select 1 from products p where p.id = product_id and (p.is_active or is_admin()))
);
create policy "product_variants_admin_write" on product_variants for all using (is_admin()) with check (is_admin());

-- BANNERS
create policy "banners_public_read" on banners for select using (
  is_active = true and (start_at is null or start_at <= now()) and (end_at is null or end_at >= now())
  or is_admin()
);
create policy "banners_admin_write" on banners for all using (is_admin()) with check (is_admin());

-- COLLECTIONS
create policy "collections_public_read" on collections for select using (is_active = true or is_admin());
create policy "collections_admin_write" on collections for all using (is_admin()) with check (is_admin());

-- FAVORITES (cada usuário só vê/edita os próprios)
create policy "favorites_owner_read" on favorites for select using (auth.uid() = user_id);
create policy "favorites_owner_write" on favorites for insert with check (auth.uid() = user_id);
create policy "favorites_owner_delete" on favorites for delete using (auth.uid() = user_id);

-- ORDERS (criação pública controlada — pedido feito no fluxo de checkout;
-- leitura restrita ao admin, já que não há login de cliente nesta fase)
create policy "orders_public_insert" on orders for insert with check (true);
create policy "orders_admin_read" on orders for select using (is_admin());
create policy "orders_admin_write" on orders for update using (is_admin());

create policy "order_items_public_insert" on order_items for insert with check (true);
create policy "order_items_admin_read" on order_items for select using (is_admin());

-- COUPONS (validação de cupom é feita via RPC segura; não expor tabela crua)
create policy "coupons_admin_all" on coupons for all using (is_admin()) with check (is_admin());

-- INSTAGRAM POSTS
create policy "instagram_posts_public_read" on instagram_posts for select using (true);
create policy "instagram_posts_admin_write" on instagram_posts for all using (is_admin()) with check (is_admin());

-- SITE_SETTINGS (leitura pública da linha única; escrita só admin)
create policy "site_settings_public_read" on site_settings for select using (true);
create policy "site_settings_admin_write" on site_settings for update using (is_admin()) with check (is_admin());

-- ADMIN_USERS (só o próprio admin enxerga seu registro; nunca lista pública)
create policy "admin_users_self_read" on admin_users for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RPC segura para validar cupom sem expor a tabela inteira
-- ---------------------------------------------------------------------------
create or replace function validate_coupon(coupon_code text)
returns table(percent_off numeric, amount_off numeric) as $$
  select percent_off, amount_off
  from coupons
  where code = coupon_code
    and is_active = true
    and (expires_at is null or expires_at > now())
  limit 1;
$$ language sql security definer;
