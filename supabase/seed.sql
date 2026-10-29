-- ============================================================================
-- DROP BSB — Dados de demonstração
-- Todo produto aqui tem is_demo = true e usa imagens de placeholder (Unsplash),
-- só para você ver a interface funcionando. As imagens NÃO são fotos oficiais
-- da DROP BSB — substitua pelas suas fotos reais pelo /admin (Produtos →
-- Editar → Fotos) antes de publicar a loja.
-- ============================================================================

insert into brands (name, slug, is_active) values
  ('Nike', 'nike', true),
  ('Lacoste', 'lacoste', true),
  ('Tommy Hilfiger', 'tommy-hilfiger', true)
on conflict (slug) do nothing;

insert into categories (name, slug, display_order, is_active) values
  ('Camisetas', 'camisetas', 1, true),
  ('Bermudas', 'bermudas', 2, true),
  ('Conjuntos', 'conjuntos', 3, true),
  ('Corta-vento', 'corta-vento', 4, true),
  ('Polos', 'polos', 5, true),
  ('Chinelos', 'chinelos', 6, true),
  ('Calçados', 'calcados', 7, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- PRODUTOS NIKE
-- ---------------------------------------------------------------------------
insert into products (slug, name, brand_id, category_id, description, details, composition, price, compare_at_price, sku, tags, is_new, is_featured, is_best_seller, is_sale, is_active, show_on_home, is_demo)
select 'camiseta-nike-sportswear-preta', 'Camiseta Nike Sportswear Preta',
  (select id from brands where slug = 'nike'), (select id from categories where slug = 'camisetas'),
  'Camiseta de algodão macio com corte reto e logo bordado no peito.', '100% algodão penteado. Modelagem unissex.', '100% algodão',
  199.90, 249.90, 'DEMO-NK-001', array['nike','camiseta','preta'], true, true, true, true, true, true, true
where not exists (select 1 from products where slug = 'camiseta-nike-sportswear-preta');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_new, is_active, show_on_home, is_demo)
select 'camiseta-nike-branca', 'Camiseta Nike Sportswear Branca',
  (select id from brands where slug = 'nike'), (select id from categories where slug = 'camisetas'),
  'Camiseta branca essencial, corte reto e caimento leve para o dia a dia.', '100% algodão penteado. Modelagem unissex.', '100% algodão',
  199.90, 'DEMO-NK-002', array['nike','camiseta','branca'], true, true, true, true
where not exists (select 1 from products where slug = 'camiseta-nike-branca');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_best_seller, is_active, show_on_home, is_demo)
select 'bermuda-nike-preta', 'Bermuda Nike Tech Fleece Preta',
  (select id from brands where slug = 'nike'), (select id from categories where slug = 'bermudas'),
  'Bermuda em moletom Tech Fleece, leve e quentinha sem pesar.', 'Bolsos com zíper. Cintura elástica com cordão.', 'Poliéster/algodão',
  279.90, 'DEMO-NK-003', array['nike','bermuda','preta'], true, true, true, true
where not exists (select 1 from products where slug = 'bermuda-nike-preta');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_active, show_on_home, is_demo)
select 'bermuda-nike-cinza', 'Bermuda Nike Tech Fleece Cinza',
  (select id from brands where slug = 'nike'), (select id from categories where slug = 'bermudas'),
  'A mesma bermuda Tech Fleece, na variação cinza mescla.', 'Bolsos com zíper. Cintura elástica com cordão.', 'Poliéster/algodão',
  279.90, 'DEMO-NK-004', array['nike','bermuda','cinza'], true, false, true
where not exists (select 1 from products where slug = 'bermuda-nike-cinza');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_new, is_featured, is_active, show_on_home, is_demo)
select 'conjunto-nike-preto', 'Conjunto Nike Tech Fleece Preto',
  (select id from brands where slug = 'nike'), (select id from categories where slug = 'conjuntos'),
  'Conjunto moletom + bermuda em Tech Fleece, mesma pegada, dois volumes.', 'Vendido em conjunto. Composição idêntica nas duas peças.', 'Poliéster/algodão',
  549.90, 'DEMO-NK-005', array['nike','conjunto','preto'], true, true, true, true, true
where not exists (select 1 from products where slug = 'conjunto-nike-preto');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_limited, is_active, show_on_home, is_demo)
select 'corta-vento-nike-preto', 'Corta-vento Nike Windrunner Preto',
  (select id from brands where slug = 'nike'), (select id from categories where slug = 'corta-vento'),
  'Corta-vento icônico, leve, dobrável, com capuz.', 'Tecido ripstop resistente à água leve. Bolso frontal tipo canguru.', 'Nylon ripstop',
  399.90, 'DEMO-NK-006', array['nike','corta-vento','preto'], true, true, true, true
where not exists (select 1 from products where slug = 'corta-vento-nike-preto');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, compare_at_price, sku, tags, is_new, is_featured, is_best_seller, is_sale, is_active, show_on_home, low_stock_threshold, is_demo)
select 'chinelo-nike-victori-one-masculino', 'Chinelo Nike Victori One Masculino',
  (select id from brands where slug = 'nike'), (select id from categories where slug = 'chinelos'),
  'Chinelo slide leve e confortável, com tira acolchoada e solado de espuma macia.', 'Cabedal sintético. Solado injetado com boa amortização para uso no dia a dia.', 'Sintético/EVA',
  149.90, 179.90, 'DEMO-NK-007', array['nike','chinelo','victori one','calcado'], true, true, true, true, true, true, 4, true
where not exists (select 1 from products where slug = 'chinelo-nike-victori-one-masculino');

-- ---------------------------------------------------------------------------
-- PRODUTOS LACOSTE
-- ---------------------------------------------------------------------------
insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_active, show_on_home, is_demo)
select 'camiseta-lacoste-preta', 'Camiseta Lacoste Preta',
  (select id from brands where slug = 'lacoste'), (select id from categories where slug = 'camisetas'),
  'Camiseta básica em algodão, com o crocodilo bordado no peito.', 'Corte reto, gola careca reforçada.', '100% algodão',
  249.90, 'DEMO-LC-001', array['lacoste','camiseta','preta'], true, false, true
where not exists (select 1 from products where slug = 'camiseta-lacoste-preta');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_active, show_on_home, is_demo)
select 'camiseta-lacoste-branca', 'Camiseta Lacoste Branca',
  (select id from brands where slug = 'lacoste'), (select id from categories where slug = 'camisetas'),
  'Camiseta básica branca, com o crocodilo bordado no peito.', 'Corte reto, gola careca reforçada.', '100% algodão',
  249.90, 'DEMO-LC-002', array['lacoste','camiseta','branca'], true, false, true
where not exists (select 1 from products where slug = 'camiseta-lacoste-branca');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_new, is_featured, is_active, show_on_home, is_demo)
select 'polo-lacoste-preta', 'Polo Lacoste Classic Fit Preta',
  (select id from brands where slug = 'lacoste'), (select id from categories where slug = 'polos'),
  'Polo clássica em piqué de algodão, o essencial atemporal da Lacoste.', 'Gola tricô. Fenda lateral. Crocodilo bordado.', '100% algodão piqué',
  349.90, 'DEMO-LC-003', array['lacoste','polo','preta'], true, true, true, true, true
where not exists (select 1 from products where slug = 'polo-lacoste-preta');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_active, show_on_home, low_stock_threshold, is_demo)
select 'bermuda-lacoste', 'Bermuda Lacoste',
  (select id from brands where slug = 'lacoste'), (select id from categories where slug = 'bermudas'),
  'Bermuda leve em sarja, corte reto e acabamento premium.', 'Bolsos frontais e traseiro com botão.', 'Algodão/elastano',
  299.90, 'DEMO-LC-004', array['lacoste','bermuda'], true, false, 5, true
where not exists (select 1 from products where slug = 'bermuda-lacoste');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, compare_at_price, sku, tags, is_sale, is_active, show_on_home, is_demo)
select 'conjunto-lacoste', 'Conjunto Lacoste',
  (select id from brands where slug = 'lacoste'), (select id from categories where slug = 'conjuntos'),
  'Conjunto moletom e bermuda em algodão macio, com o crocodilo bordado.', 'Vendido em conjunto. Composição idêntica nas duas peças.', '100% algodão',
  599.90, 649.90, 'DEMO-LC-005', array['lacoste','conjunto'], true, true, true, true
where not exists (select 1 from products where slug = 'conjunto-lacoste');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_active, show_on_home, is_demo)
select 'corta-vento-lacoste', 'Corta-vento Lacoste',
  (select id from brands where slug = 'lacoste'), (select id from categories where slug = 'corta-vento'),
  'Corta-vento leve, ideal para os dias mais frescos, com o crocodilo bordado no peito.', 'Capuz embutido na gola. Fecho frontal em zíper.', 'Nylon',
  449.90, 'DEMO-LC-006', array['lacoste','corta-vento'], true, false, true
where not exists (select 1 from products where slug = 'corta-vento-lacoste');

-- ---------------------------------------------------------------------------
-- PRODUTOS TOMMY HILFIGER
-- ---------------------------------------------------------------------------
insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_new, is_active, show_on_home, is_demo)
select 'camiseta-tommy-hilfiger-masculina', 'Camiseta Tommy Hilfiger Masculina',
  (select id from brands where slug = 'tommy-hilfiger'), (select id from categories where slug = 'camisetas'),
  'Camiseta em algodão com a bandeira Tommy bordada no peito, corte reto clássico.', '100% algodão. Gola careca reforçada.', '100% algodão',
  279.90, 'DEMO-TH-001', array['tommy hilfiger','camiseta'], true, true, false, true
where not exists (select 1 from products where slug = 'camiseta-tommy-hilfiger-masculina');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_active, show_on_home, is_demo)
select 'bermuda-tommy-hilfiger-masculina', 'Bermuda Tommy Hilfiger Masculina',
  (select id from brands where slug = 'tommy-hilfiger'), (select id from categories where slug = 'bermudas'),
  'Bermuda em sarja com acabamento premium e bandeira Tommy bordada.', 'Bolsos frontais e traseiro com botão.', 'Algodão/elastano',
  329.90, 'DEMO-TH-002', array['tommy hilfiger','bermuda'], true, false, true
where not exists (select 1 from products where slug = 'bermuda-tommy-hilfiger-masculina');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, compare_at_price, sku, tags, is_new, is_featured, is_sale, is_active, show_on_home, is_demo)
select 'polo-tommy-hilfiger', 'Polo Tommy Hilfiger',
  (select id from brands where slug = 'tommy-hilfiger'), (select id from categories where slug = 'polos'),
  'Polo clássica em piqué de algodão, com a bandeira Tommy bordada no peito.', 'Gola tricô, fenda lateral.', '100% algodão piqué',
  349.90, 399.90, 'DEMO-TH-003', array['tommy hilfiger','polo'], true, true, true, true, true, true
where not exists (select 1 from products where slug = 'polo-tommy-hilfiger');

insert into products (slug, name, brand_id, category_id, description, details, composition, price, sku, tags, is_active, show_on_home, is_demo)
select 'conjunto-tommy-hilfiger', 'Conjunto Tommy Hilfiger',
  (select id from brands where slug = 'tommy-hilfiger'), (select id from categories where slug = 'conjuntos'),
  'Conjunto moletom e bermuda em algodão macio, com a bandeira Tommy bordada.', 'Vendido em conjunto. Composição idêntica nas duas peças.', '100% algodão',
  579.90, 'DEMO-TH-004', array['tommy hilfiger','conjunto'], true, false, true
where not exists (select 1 from products where slug = 'conjunto-tommy-hilfiger');

-- ---------------------------------------------------------------------------
-- IMAGENS (placeholders — troque pelas fotos reais via /admin)
-- ---------------------------------------------------------------------------
insert into product_images (product_id, url, alt, position, is_primary)
select p.id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80', p.name, 0, true
from products p where p.is_demo = true
and not exists (select 1 from product_images pi where pi.product_id = p.id);

-- ---------------------------------------------------------------------------
-- VARIANTES / ESTOQUE
-- ---------------------------------------------------------------------------
-- Roupas (camisetas, bermudas, conjuntos, corta-vento, polos): tamanhos P–GG
insert into product_variants (product_id, size, stock)
select p.id, s.size, s.stock
from products p
cross join (values ('P', 4), ('M', 6), ('G', 3), ('GG', 0)) as s(size, stock)
where p.is_demo = true
  and p.category_id in (select id from categories where slug in ('camisetas','bermudas','conjuntos','corta-vento','polos'))
  and p.slug not in ('bermuda-nike-cinza', 'bermuda-lacoste')
  and not exists (select 1 from product_variants v where v.product_id = p.id);

-- Produtos com estoque baixo de propósito (aparecem em "Últimas Peças" na Home)
insert into product_variants (product_id, size, stock)
select p.id, s.size, s.stock
from products p
cross join (values ('P', 1), ('M', 1), ('G', 1), ('GG', 0)) as s(size, stock)
where p.is_demo = true and p.slug in ('bermuda-nike-cinza', 'bermuda-lacoste')
and not exists (select 1 from product_variants v where v.product_id = p.id);

-- Chinelo Nike Victori One: numeração 39–44
insert into product_variants (product_id, size, stock)
select p.id, s.size, s.stock
from products p
cross join (values ('39', 3), ('40', 5), ('41', 4), ('42', 2), ('43', 1), ('44', 0)) as s(size, stock)
where p.is_demo = true and p.category_id in (select id from categories where slug = 'chinelos')
and not exists (select 1 from product_variants v where v.product_id = p.id);

-- ---------------------------------------------------------------------------
-- BANNER DA HOME
-- Sem isto, a Home fica sem Hero num projeto novo — fetchBanners() retornaria
-- vazio e o componente Hero simplesmente não renderiza nada (Section 5).
-- ---------------------------------------------------------------------------
insert into banners (title, subtitle, image_desktop_url, image_mobile_url, cta_label, cta_link, display_order, is_active)
select 'DROP BSB', 'NIKE • LACOSTE • TOMMY HILFIGER — Seu estilo. Suas marcas.',
  'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=1920&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=900&q=80&auto=format&fit=crop',
  'Ver produtos', '/produtos', 0, true
where not exists (select 1 from banners where title = 'DROP BSB');

-- ---------------------------------------------------------------------------
-- CONFIGURAÇÕES DA LOJA
-- ---------------------------------------------------------------------------
update site_settings set
  store_name = 'DROP BSB',
  instagram_handle = '@dropbsb_',
  whatsapp_number = '5561996943237',
  whatsapp_message_template = 'Olá! Tenho interesse neste produto:%0A%0AProduto: {product}%0ATamanho: {size}%0APreço: {price}%0ALink: {link}',
  email = 'dropbsb.contato@gmail.com'
where id = 1;
