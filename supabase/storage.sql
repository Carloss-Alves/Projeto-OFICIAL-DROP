-- ============================================================================
-- DROP BSB — Supabase Storage
-- Cria os buckets usados pelo admin (upload de imagens) e as policies de acesso.
-- Buckets são públicos para LEITURA (as imagens aparecem na loja),
-- mas a ESCRITA é restrita a administradores autenticados.
--
-- Os limites de tamanho/tipo abaixo (file_size_limit, allowed_mime_types) são
-- reforçados pelo próprio Supabase Storage no servidor — não dependem do
-- frontend. A validação de conteúdo real (magic bytes) fica no cliente
-- (src/services/admin.ts) como primeira barreira; isto aqui é a segunda,
-- que não pode ser contornada só pulando a validação do navegador.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('banner-images', 'banner-images', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('brand-logos', 'brand-logos', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública
create policy "public_read_product_images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "public_read_banner_images" on storage.objects
  for select using (bucket_id = 'banner-images');
create policy "public_read_brand_logos" on storage.objects
  for select using (bucket_id = 'brand-logos');

-- Escrita restrita a administradores (reutiliza is_admin() de rls.sql)
create policy "admin_write_product_images" on storage.objects
  for insert with check (bucket_id = 'product-images' and is_admin());
create policy "admin_update_product_images" on storage.objects
  for update using (bucket_id = 'product-images' and is_admin());
create policy "admin_delete_product_images" on storage.objects
  for delete using (bucket_id = 'product-images' and is_admin());

create policy "admin_write_banner_images" on storage.objects
  for insert with check (bucket_id = 'banner-images' and is_admin());
create policy "admin_delete_banner_images" on storage.objects
  for delete using (bucket_id = 'banner-images' and is_admin());

create policy "admin_write_brand_logos" on storage.objects
  for insert with check (bucket_id = 'brand-logos' and is_admin());
create policy "admin_delete_brand_logos" on storage.objects
  for delete using (bucket_id = 'brand-logos' and is_admin());
