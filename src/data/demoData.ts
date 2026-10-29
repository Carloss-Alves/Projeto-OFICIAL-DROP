// ============================================================================
// DADOS DE DEMONSTRAÇÃO — usados apenas quando o Supabase não está configurado
// (ver src/lib/supabase.ts). Todo item aqui tem is_demo: true e é sinalizado
// na UI. Substitua pelo seu catálogo real cadastrando pelo /admin.
//
// IMPORTANTE: as imagens abaixo são fotos de referência públicas (Unsplash),
// usadas SOMENTE para visualizar o layout funcionando. Elas NÃO são fotos
// oficiais da DROP BSB e devem ser substituídas pelas suas fotos reais antes
// de publicar a loja (Admin → Produtos → Editar → Fotos).
// ============================================================================
import type { Brand, Category, Product, Banner, InstagramPost, SiteSettings } from '@/types';

export const DEMO_BRANDS: Brand[] = [
  { id: 'b-nike', name: 'Nike', slug: 'nike', logo_url: null, is_active: true },
  { id: 'b-lacoste', name: 'Lacoste', slug: 'lacoste', logo_url: null, is_active: true },
  { id: 'b-tommy', name: 'Tommy Hilfiger', slug: 'tommy-hilfiger', logo_url: null, is_active: true },
];

export const DEMO_CATEGORIES: Category[] = [
  { id: 'c-camisetas', name: 'Camisetas', slug: 'camisetas', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', parent_id: null, display_order: 1, is_active: true },
  { id: 'c-bermudas', name: 'Bermudas', slug: 'bermudas', image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80', parent_id: null, display_order: 2, is_active: true },
  { id: 'c-conjuntos', name: 'Conjuntos', slug: 'conjuntos', image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80', parent_id: null, display_order: 3, is_active: true },
  { id: 'c-cortavento', name: 'Corta-vento', slug: 'corta-vento', image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80', parent_id: null, display_order: 4, is_active: true },
  { id: 'c-polos', name: 'Polos', slug: 'polos', image_url: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80', parent_id: null, display_order: 5, is_active: true },
  { id: 'c-chinelos', name: 'Chinelos', slug: 'chinelos', image_url: 'https://images.unsplash.com/photo-1603808033176-c68b9877252b?w=800&q=80', parent_id: null, display_order: 6, is_active: true },
  { id: 'c-calcados', name: 'Calçados', slug: 'calcados', image_url: null, parent_id: null, display_order: 7, is_active: true },
];

const img = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

function apparelVariants(productId: string, stock: [number, number, number, number] = [4, 6, 3, 0]) {
  const [p, m, g, gg] = stock;
  return [
    { id: `${productId}-P`, product_id: productId, size: 'P', color: null, sku: null, stock: p },
    { id: `${productId}-M`, product_id: productId, size: 'M', color: null, sku: null, stock: m },
    { id: `${productId}-G`, product_id: productId, size: 'G', color: null, sku: null, stock: g },
    { id: `${productId}-GG`, product_id: productId, size: 'GG', color: null, sku: null, stock: gg },
  ];
}

function sandalVariants(productId: string) {
  return ['39', '40', '41', '42', '43', '44'].map((size, i) => ({
    id: `${productId}-${size}`, product_id: productId, size, color: null, sku: null, stock: [3, 5, 4, 2, 1, 0][i],
  }));
}

export const DEMO_PRODUCTS: Product[] = [
  // ---------------------------------------------------------------- NIKE ---
  {
    id: 'p-1', slug: 'camiseta-nike-sportswear-preta', name: 'Camiseta Nike Sportswear Preta',
    brand: DEMO_BRANDS[0], category: DEMO_CATEGORIES[0],
    description: 'Camiseta de algodão macio com corte reto e logo bordado no peito.',
    details: '100% algodão penteado. Modelagem unissex.', composition: '100% algodão',
    price: 199.9, compare_at_price: 249.9, sku: 'DEMO-NK-001', tags: ['nike', 'camiseta', 'preta'],
    is_new: true, is_featured: true, is_best_seller: true, is_limited: false, is_sale: true, is_active: true,
    show_on_home: true, low_stock_threshold: 3,
    images: [
      { id: 'img-1a', product_id: 'p-1', url: img('photo-1521572163474-6864f9cf17ab'), alt: 'Camiseta Nike preta, vista frontal', position: 0, is_primary: true },
      { id: 'img-1b', product_id: 'p-1', url: img('photo-1503341504253-dff4815485f1'), alt: 'Camiseta Nike preta, detalhe', position: 1, is_primary: false },
    ],
    variants: apparelVariants('p-1'), related_product_ids: ['p-3', 'p-6'], complete_the_look_ids: ['p-3', 'p-6'],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), is_demo: true,
  },
  {
    id: 'p-2', slug: 'camiseta-nike-branca', name: 'Camiseta Nike Sportswear Branca',
    brand: DEMO_BRANDS[0], category: DEMO_CATEGORIES[0],
    description: 'Camiseta branca essencial, corte reto e caimento leve para o dia a dia.',
    details: '100% algodão penteado. Modelagem unissex.', composition: '100% algodão',
    price: 199.9, compare_at_price: null, sku: 'DEMO-NK-002', tags: ['nike', 'camiseta', 'branca'],
    is_new: true, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: true, low_stock_threshold: 3,
    images: [{ id: 'img-2a', product_id: 'p-2', url: img('photo-1503341504253-dff4815485f1'), alt: 'Camiseta Nike branca', position: 0, is_primary: true }],
    variants: apparelVariants('p-2'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), is_demo: true,
  },
  {
    id: 'p-3', slug: 'bermuda-nike-preta', name: 'Bermuda Nike Tech Fleece Preta',
    brand: DEMO_BRANDS[0], category: DEMO_CATEGORIES[1],
    description: 'Bermuda em moletom Tech Fleece, leve e quentinha sem pesar.',
    details: 'Bolsos com zíper. Cintura elástica com cordão.', composition: 'Poliéster/algodão',
    price: 279.9, compare_at_price: null, sku: 'DEMO-NK-003', tags: ['nike', 'bermuda', 'preta'],
    is_new: false, is_featured: false, is_best_seller: true, is_limited: false, is_sale: false, is_active: true,
    show_on_home: true, low_stock_threshold: 3,
    images: [{ id: 'img-3a', product_id: 'p-3', url: img('photo-1591195853828-11db59a44f6b'), alt: 'Bermuda Nike Tech Fleece preta', position: 0, is_primary: true }],
    variants: apparelVariants('p-3'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), is_demo: true,
  },
  {
    id: 'p-4', slug: 'bermuda-nike-cinza', name: 'Bermuda Nike Tech Fleece Cinza',
    brand: DEMO_BRANDS[0], category: DEMO_CATEGORIES[1],
    description: 'A mesma bermuda Tech Fleece, na variação cinza mescla.',
    details: 'Bolsos com zíper. Cintura elástica com cordão.', composition: 'Poliéster/algodão',
    price: 279.9, compare_at_price: null, sku: 'DEMO-NK-004', tags: ['nike', 'bermuda', 'cinza'],
    is_new: false, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: false, low_stock_threshold: 3,
    images: [{ id: 'img-4a', product_id: 'p-4', url: img('photo-1591195853828-11db59a44f6b'), alt: 'Bermuda Nike Tech Fleece cinza', position: 0, is_primary: true }],
    variants: apparelVariants('p-4', [3, 2, 1, 0]), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), is_demo: true,
  },
  {
    id: 'p-5', slug: 'conjunto-nike-preto', name: 'Conjunto Nike Tech Fleece Preto',
    brand: DEMO_BRANDS[0], category: DEMO_CATEGORIES[2],
    description: 'Conjunto moletom + bermuda em Tech Fleece, mesma pegada, dois volumes.',
    details: 'Vendido em conjunto. Composição idêntica nas duas peças.', composition: 'Poliéster/algodão',
    price: 549.9, compare_at_price: null, sku: 'DEMO-NK-005', tags: ['nike', 'conjunto', 'preto'],
    is_new: true, is_featured: true, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: true, low_stock_threshold: 3,
    images: [{ id: 'img-5a', product_id: 'p-5', url: img('photo-1552902865-b72c031ac5ea'), alt: 'Conjunto Nike Tech Fleece preto', position: 0, is_primary: true }],
    variants: apparelVariants('p-5'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), is_demo: true,
  },
  {
    id: 'p-6', slug: 'corta-vento-nike-preto', name: 'Corta-vento Nike Windrunner Preto',
    brand: DEMO_BRANDS[0], category: DEMO_CATEGORIES[3],
    description: 'Corta-vento icônico, leve, dobrável, com capuz.',
    details: 'Tecido ripstop resistente à água leve. Bolso frontal tipo canguru.', composition: 'Nylon ripstop',
    price: 399.9, compare_at_price: null, sku: 'DEMO-NK-006', tags: ['nike', 'corta-vento', 'preto'],
    is_new: false, is_featured: false, is_best_seller: false, is_limited: true, is_sale: false, is_active: true,
    show_on_home: true, low_stock_threshold: 3,
    images: [{ id: 'img-6a', product_id: 'p-6', url: img('photo-1544966503-7cc5ac882d5f'), alt: 'Corta-vento Nike Windrunner preto', position: 0, is_primary: true }],
    variants: apparelVariants('p-6'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), is_demo: true,
  },
  {
    id: 'p-7', slug: 'chinelo-nike-victori-one-masculino', name: 'Chinelo Nike Victori One Masculino',
    brand: DEMO_BRANDS[0], category: DEMO_CATEGORIES[5],
    description: 'Chinelo slide leve e confortável, com tira acolchoada e solado de espuma macia.',
    details: 'Cabedal sintético. Solado injetado com boa amortização para uso no dia a dia.', composition: 'Sintético/EVA',
    price: 149.9, compare_at_price: 179.9, sku: 'DEMO-NK-007', tags: ['nike', 'chinelo', 'victori one', 'calçado'],
    is_new: true, is_featured: true, is_best_seller: true, is_limited: false, is_sale: true, is_active: true,
    show_on_home: true, low_stock_threshold: 4,
    images: [{ id: 'img-7a', product_id: 'p-7', url: img('photo-1603808033176-c68b9877252b'), alt: 'Chinelo Nike Victori One masculino', position: 0, is_primary: true }],
    variants: sandalVariants('p-7'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date().toISOString(), is_demo: true,
  },
  // ------------------------------------------------------------- LACOSTE ---
  {
    id: 'p-8', slug: 'camiseta-lacoste-preta', name: 'Camiseta Lacoste Preta',
    brand: DEMO_BRANDS[1], category: DEMO_CATEGORIES[0],
    description: 'Camiseta básica em algodão, com o crocodilo bordado no peito.',
    details: 'Corte reto, gola careca reforçada.', composition: '100% algodão',
    price: 249.9, compare_at_price: null, sku: 'DEMO-LC-001', tags: ['lacoste', 'camiseta', 'preta'],
    is_new: false, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: false, low_stock_threshold: 3,
    images: [{ id: 'img-8a', product_id: 'p-8', url: img('photo-1521572163474-6864f9cf17ab'), alt: 'Camiseta Lacoste preta', position: 0, is_primary: true }],
    variants: apparelVariants('p-8'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(), is_demo: true,
  },
  {
    id: 'p-9', slug: 'camiseta-lacoste-branca', name: 'Camiseta Lacoste Branca',
    brand: DEMO_BRANDS[1], category: DEMO_CATEGORIES[0],
    description: 'Camiseta básica branca, com o crocodilo bordado no peito.',
    details: 'Corte reto, gola careca reforçada.', composition: '100% algodão',
    price: 249.9, compare_at_price: null, sku: 'DEMO-LC-002', tags: ['lacoste', 'camiseta', 'branca'],
    is_new: false, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: false, low_stock_threshold: 3,
    images: [{ id: 'img-9a', product_id: 'p-9', url: img('photo-1503341504253-dff4815485f1'), alt: 'Camiseta Lacoste branca', position: 0, is_primary: true }],
    variants: apparelVariants('p-9'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(), is_demo: true,
  },
  {
    id: 'p-10', slug: 'polo-lacoste-preta', name: 'Polo Lacoste Classic Fit Preta',
    brand: DEMO_BRANDS[1], category: DEMO_CATEGORIES[4],
    description: 'Polo clássica em piqué de algodão, o essencial atemporal da Lacoste.',
    details: 'Gola tricô. Fenda lateral. Crocodilo bordado.', composition: '100% algodão piqué',
    price: 349.9, compare_at_price: null, sku: 'DEMO-LC-003', tags: ['lacoste', 'polo', 'preta'],
    is_new: true, is_featured: true, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: true, low_stock_threshold: 3,
    images: [{ id: 'img-10a', product_id: 'p-10', url: img('photo-1620012253295-c15cc3e65df4'), alt: 'Polo Lacoste preta, vista frontal', position: 0, is_primary: true }],
    variants: apparelVariants('p-10'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), is_demo: true,
  },
  {
    id: 'p-11', slug: 'bermuda-lacoste', name: 'Bermuda Lacoste',
    brand: DEMO_BRANDS[1], category: DEMO_CATEGORIES[1],
    description: 'Bermuda leve em sarja, corte reto e acabamento premium.',
    details: 'Bolsos frontais e traseiro com botão.', composition: 'Algodão/elastano',
    price: 299.9, compare_at_price: null, sku: 'DEMO-LC-004', tags: ['lacoste', 'bermuda'],
    is_new: false, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: false, low_stock_threshold: 5,
    images: [{ id: 'img-11a', product_id: 'p-11', url: img('photo-1591195853828-11db59a44f6b'), alt: 'Bermuda Lacoste', position: 0, is_primary: true }],
    variants: apparelVariants('p-11', [1, 1, 1, 0]), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), is_demo: true,
  },
  {
    id: 'p-12', slug: 'conjunto-lacoste', name: 'Conjunto Lacoste',
    brand: DEMO_BRANDS[1], category: DEMO_CATEGORIES[2],
    description: 'Conjunto moletom e bermuda em algodão macio, com o crocodilo bordado.',
    details: 'Vendido em conjunto. Composição idêntica nas duas peças.', composition: '100% algodão',
    price: 599.9, compare_at_price: 649.9, sku: 'DEMO-LC-005', tags: ['lacoste', 'conjunto'],
    is_new: false, is_featured: false, is_best_seller: false, is_limited: false, is_sale: true, is_active: true,
    show_on_home: true, low_stock_threshold: 3,
    images: [{ id: 'img-12a', product_id: 'p-12', url: img('photo-1552902865-b72c031ac5ea'), alt: 'Conjunto Lacoste', position: 0, is_primary: true }],
    variants: apparelVariants('p-12'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), is_demo: true,
  },
  {
    id: 'p-13', slug: 'corta-vento-lacoste', name: 'Corta-vento Lacoste',
    brand: DEMO_BRANDS[1], category: DEMO_CATEGORIES[3],
    description: 'Corta-vento leve, ideal para os dias mais frescos, com o crocodilo bordado no peito.',
    details: 'Capuz embutido na gola. Fecho frontal em zíper.', composition: 'Nylon',
    price: 449.9, compare_at_price: null, sku: 'DEMO-LC-006', tags: ['lacoste', 'corta-vento'],
    is_new: false, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: false, low_stock_threshold: 3,
    images: [{ id: 'img-13a', product_id: 'p-13', url: img('photo-1544966503-7cc5ac882d5f'), alt: 'Corta-vento Lacoste', position: 0, is_primary: true }],
    variants: apparelVariants('p-13'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(), is_demo: true,
  },
  // ------------------------------------------------------------ TOMMY HILFIGER ---
  {
    id: 'p-14', slug: 'camiseta-tommy-hilfiger-masculina', name: 'Camiseta Tommy Hilfiger Masculina',
    brand: DEMO_BRANDS[2], category: DEMO_CATEGORIES[0],
    description: 'Camiseta em algodão com a bandeira Tommy bordada no peito, corte reto clássico.',
    details: '100% algodão. Gola careca reforçada.', composition: '100% algodão',
    price: 279.9, compare_at_price: null, sku: 'DEMO-TH-001', tags: ['tommy hilfiger', 'camiseta'],
    is_new: true, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: false, low_stock_threshold: 3,
    images: [{ id: 'img-14a', product_id: 'p-14', url: img('photo-1622445275576-721325763afe'), alt: 'Camiseta Tommy Hilfiger masculina', position: 0, is_primary: true }],
    variants: apparelVariants('p-14'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), is_demo: true,
  },
  {
    id: 'p-15', slug: 'bermuda-tommy-hilfiger-masculina', name: 'Bermuda Tommy Hilfiger Masculina',
    brand: DEMO_BRANDS[2], category: DEMO_CATEGORIES[1],
    description: 'Bermuda em sarja com acabamento premium e bandeira Tommy bordada.',
    details: 'Bolsos frontais e traseiro com botão.', composition: 'Algodão/elastano',
    price: 329.9, compare_at_price: null, sku: 'DEMO-TH-002', tags: ['tommy hilfiger', 'bermuda'],
    is_new: false, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: false, low_stock_threshold: 3,
    images: [{ id: 'img-15a', product_id: 'p-15', url: img('photo-1591195853828-11db59a44f6b'), alt: 'Bermuda Tommy Hilfiger masculina', position: 0, is_primary: true }],
    variants: apparelVariants('p-15'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), is_demo: true,
  },
  {
    id: 'p-16', slug: 'polo-tommy-hilfiger', name: 'Polo Tommy Hilfiger',
    brand: DEMO_BRANDS[2], category: DEMO_CATEGORIES[4],
    description: 'Polo clássica em piqué de algodão, com a bandeira Tommy bordada no peito.',
    details: 'Gola tricô, fenda lateral.', composition: '100% algodão piqué',
    price: 349.9, compare_at_price: 399.9, sku: 'DEMO-TH-003', tags: ['tommy hilfiger', 'polo'],
    is_new: true, is_featured: true, is_best_seller: false, is_limited: false, is_sale: true, is_active: true,
    show_on_home: true, low_stock_threshold: 3,
    images: [{ id: 'img-16a', product_id: 'p-16', url: img('photo-1583743814966-8936f5b7be1a'), alt: 'Polo Tommy Hilfiger', position: 0, is_primary: true }],
    variants: apparelVariants('p-16'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4.5).toISOString(), is_demo: true,
  },
  {
    id: 'p-17', slug: 'conjunto-tommy-hilfiger', name: 'Conjunto Tommy Hilfiger',
    brand: DEMO_BRANDS[2], category: DEMO_CATEGORIES[2],
    description: 'Conjunto moletom e bermuda em algodão macio, com a bandeira Tommy bordada.',
    details: 'Vendido em conjunto. Composição idêntica nas duas peças.', composition: '100% algodão',
    price: 579.9, compare_at_price: null, sku: 'DEMO-TH-004', tags: ['tommy hilfiger', 'conjunto'],
    is_new: false, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, is_active: true,
    show_on_home: false, low_stock_threshold: 3,
    images: [{ id: 'img-17a', product_id: 'p-17', url: img('photo-1552902865-b72c031ac5ea'), alt: 'Conjunto Tommy Hilfiger', position: 0, is_primary: true }],
    variants: apparelVariants('p-17'), related_product_ids: [], complete_the_look_ids: [],
    drop_id: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), is_demo: true,
  },
];

export const DEMO_BANNERS: Banner[] = [
  {
    id: 'ban-1', title: 'DROP BSB', subtitle: 'NIKE • LACOSTE • TOMMY HILFIGER — Seu estilo. Suas marcas.',
    image_desktop_url: img('photo-1516762689617-e1cffcef479d', 1920),
    image_mobile_url: img('photo-1516762689617-e1cffcef479d', 900),
    cta_label: 'Ver produtos', cta_link: '/produtos', display_order: 0, is_active: true, start_at: null, end_at: null,
  },
];

export const DEMO_INSTAGRAM_POSTS: InstagramPost[] = [
  { id: 'ig-1', image_url: img('photo-1523398002811-999ca8dec234', 600), caption: 'Look do dia', link: 'https://www.instagram.com/dropbsb_/', display_order: 0 },
  { id: 'ig-2', image_url: img('photo-1552346154-21d32810aba3', 600), caption: 'Peças novas chegando', link: 'https://www.instagram.com/dropbsb_/', display_order: 1 },
  { id: 'ig-3', image_url: img('photo-1512436991641-6745cdb1723f', 600), caption: 'Street style', link: 'https://www.instagram.com/dropbsb_/', display_order: 2 },
  { id: 'ig-4', image_url: img('photo-1490114538077-0a7f8cb49891', 600), caption: 'Curadoria da semana', link: 'https://www.instagram.com/dropbsb_/', display_order: 3 },
];

export const DEMO_SETTINGS: SiteSettings = {
  store_name: 'DROP BSB',
  logo_url: '/logo-drop.png',
  instagram_handle: '@dropbsb_',
  instagram_profile_image_url: null,
  whatsapp_number: '5561996943237',
  whatsapp_message_template: 'Olá! Tenho interesse neste produto:%0A%0AProduto: {product}%0ATamanho: {size}%0APreço: {price}%0ALink: {link}',
  email: 'dropbsb.contato@gmail.com',
  address: null,
  hours: null,
  primary_color: '#B7FF00',
};
