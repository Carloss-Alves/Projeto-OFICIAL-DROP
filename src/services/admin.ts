import { supabase, isSupabaseConfigured, PRODUCT_IMAGES_BUCKET, BANNER_IMAGES_BUCKET, BRAND_LOGOS_BUCKET } from '@/lib/supabase';
import type { Brand, Category, Product, Banner, SiteSettings, Coupon, InstagramPost } from '@/types';

function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase não está configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env (veja .env.example) para usar o painel administrativo com dados reais.'
    );
  }
}

// ---------------------------------------------------------------------------
// BRANDS
// ---------------------------------------------------------------------------
export async function adminFetchBrands(): Promise<Brand[]> {
  assertConfigured();
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertBrand(brand: Partial<Brand> & { name: string; slug: string }) {
  assertConfigured();
  const { error } = await supabase.from('brands').upsert(brand);
  if (error) throw error;
}

export async function adminDeleteBrand(id: string) {
  assertConfigured();
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------
export async function adminFetchCategories(): Promise<Category[]> {
  assertConfigured();
  const { data, error } = await supabase.from('categories').select('*').order('display_order');
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertCategory(category: Partial<Category> & { name: string; slug: string }) {
  assertConfigured();
  const { error } = await supabase.from('categories').upsert(category);
  if (error) throw error;
}

export async function adminDeleteCategory(id: string) {
  assertConfigured();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// PRODUCTS (create/update com imagens + variantes em cascata)
// ---------------------------------------------------------------------------
export interface ProductFormInput {
  id?: string;
  slug: string;
  name: string;
  brand_id: string | null;
  category_id: string | null;
  description: string;
  details: string;
  composition: string;
  price: number;
  compare_at_price: number | null;
  sku: string;
  tags: string[];
  is_new: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_limited: boolean;
  is_sale: boolean;
  is_active: boolean;
  show_on_home: boolean;
  low_stock_threshold: number;
  drop_id: string | null;
  related_product_ids: string[];
  complete_the_look_ids: string[];
  images: { id?: string; url: string; alt: string; position: number; is_primary: boolean }[];
  variants: { id?: string; size: string; color: string | null; stock: number }[];
}

export async function adminFetchAllProducts(): Promise<Product[]> {
  assertConfigured();
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, slug, name, description, details, composition, price, compare_at_price, sku, tags,
      is_new, is_featured, is_best_seller, is_limited, is_sale, is_active, show_on_home,
      low_stock_threshold, related_product_ids, complete_the_look_ids, drop_id, is_demo, created_at,
      brand:brands(id, name, slug, logo_url, is_active),
      category:categories(id, name, slug, image_url, parent_id, display_order, is_active),
      images:product_images(id, product_id, url, alt, position, is_primary),
      variants:product_variants(id, product_id, size, color, sku, stock)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function adminSaveProduct(input: ProductFormInput): Promise<string> {
  assertConfigured();
  const productPayload = {
    id: input.id,
    slug: input.slug,
    name: input.name,
    brand_id: input.brand_id,
    category_id: input.category_id,
    description: input.description,
    details: input.details || null,
    composition: input.composition || null,
    price: input.price,
    compare_at_price: input.compare_at_price,
    sku: input.sku || null,
    tags: input.tags,
    is_new: input.is_new,
    is_featured: input.is_featured,
    is_best_seller: input.is_best_seller,
    is_limited: input.is_limited,
    is_sale: input.is_sale,
    is_active: input.is_active,
    show_on_home: input.show_on_home,
    low_stock_threshold: input.low_stock_threshold,
    drop_id: input.drop_id,
    related_product_ids: input.related_product_ids,
    complete_the_look_ids: input.complete_the_look_ids,
  };

  const { data: saved, error } = await supabase.from('products').upsert(productPayload).select('id').single();
  if (error) throw error;
  const productId = saved.id as string;

  // Substitui imagens (delete + insert é o mais previsível para reordenação)
  const { error: delImgErr } = await supabase.from('product_images').delete().eq('product_id', productId);
  if (delImgErr) throw delImgErr;
  if (input.images.length > 0) {
    const { error: imgErr } = await supabase.from('product_images').insert(
      input.images.map((img, i) => ({
        product_id: productId,
        url: img.url,
        alt: img.alt || input.name,
        position: i,
        is_primary: img.is_primary,
      }))
    );
    if (imgErr) throw imgErr;
  }

  // Substitui variantes/estoque
  const { error: delVarErr } = await supabase.from('product_variants').delete().eq('product_id', productId);
  if (delVarErr) throw delVarErr;
  if (input.variants.length > 0) {
    const { error: varErr } = await supabase.from('product_variants').insert(
      input.variants.map(v => ({
        product_id: productId,
        size: v.size,
        color: v.color,
        stock: v.stock,
      }))
    );
    if (varErr) throw varErr;
  }

  return productId;
}

export async function adminSetProductActive(id: string, isActive: boolean) {
  assertConfigured();
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

export async function adminDeleteProduct(id: string) {
  assertConfigured();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function adminUpdateVariantStock(variantId: string, stock: number) {
  assertConfigured();
  const { error } = await supabase.from('product_variants').update({ stock }).eq('id', variantId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// IMAGE UPLOAD (Supabase Storage)
// ---------------------------------------------------------------------------
const ALLOWED_IMAGE_MIME_TYPES: Record<string, number[][]> = {
  // Assinatura binária (magic bytes) de cada formato aceito — checamos o
  // conteúdo real do arquivo, não só a extensão do nome ou o MIME que o
  // navegador reportou (ambos podem ser forjados facilmente).
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // "RIFF" — WEBP confirma nos bytes 8-11 ("WEBP"), checado à parte
};
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

async function assertValidImageFile(file: File): Promise<void> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Imagem muito grande. O limite é 10 MB por arquivo.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Formato não permitido. Envie apenas JPEG, PNG ou WEBP.');
  }

  const signatures = ALLOWED_IMAGE_MIME_TYPES[file.type];
  if (!signatures) {
    throw new Error('Formato não permitido. Envie apenas JPEG, PNG ou WEBP.');
  }

  // Confere a assinatura binária real dos primeiros bytes do arquivo —
  // impede que alguém renomeie um .html/.js/.svg malicioso para .jpg e
  // dependa só da extensão ou do MIME reportado pelo navegador para passar.
  const headerBytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const matchesSignature = signatures.some(sig => sig.every((byte, i) => headerBytes[i] === byte));
  if (!matchesSignature) {
    throw new Error('O conteúdo do arquivo não corresponde a uma imagem válida.');
  }
  if (file.type === 'image/webp') {
    const marker = String.fromCharCode(...headerBytes.slice(8, 12));
    if (marker !== 'WEBP') throw new Error('O conteúdo do arquivo não corresponde a uma imagem WEBP válida.');
  }
}

function uniqueFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const uuid = crypto.randomUUID();
  return `${uuid}.${ext}`;
}

export async function uploadProductImage(file: File, productSlug: string): Promise<string> {
  assertConfigured();
  await assertValidImageFile(file);
  // Estrutura de pasta por produto (slug é conhecido antes do product_id
  // existir, para produtos novos ainda não salvos) + nome de arquivo UUID —
  // nunca confiamos no nome original enviado pelo usuário.
  const path = `${productSlug}/${uniqueFileName(file.name)}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBannerImage(file: File, label: string): Promise<string> {
  assertConfigured();
  await assertValidImageFile(file);
  const path = `${label}/${uniqueFileName(file.name)}`;
  const { error } = await supabase.storage.from(BANNER_IMAGES_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BANNER_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBrandLogo(file: File, brandSlug: string): Promise<string> {
  assertConfigured();
  await assertValidImageFile(file);
  const path = `${brandSlug}/${uniqueFileName(file.name)}`;
  const { error } = await supabase.storage.from(BRAND_LOGOS_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BRAND_LOGOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// BANNERS
// ---------------------------------------------------------------------------
export async function adminFetchBanners(): Promise<Banner[]> {
  assertConfigured();
  const { data, error } = await supabase.from('banners').select('*').order('display_order');
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertBanner(banner: Partial<Banner> & { title: string; image_desktop_url: string; image_mobile_url: string }) {
  assertConfigured();
  const { error } = await supabase.from('banners').upsert(banner);
  if (error) throw error;
}

export async function adminDeleteBanner(id: string) {
  assertConfigured();
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// COUPONS
// ---------------------------------------------------------------------------
export async function adminFetchCoupons(): Promise<Coupon[]> {
  assertConfigured();
  const { data, error } = await supabase.from('coupons').select('*').order('code');
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertCoupon(coupon: Partial<Coupon> & { code: string }) {
  assertConfigured();
  const { error } = await supabase.from('coupons').upsert(coupon);
  if (error) throw error;
}

export async function adminDeleteCoupon(id: string) {
  assertConfigured();
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// ORDERS (Section 19)
// ---------------------------------------------------------------------------
export interface OrderRow {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  status: string;
  total: number;
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
}

export async function adminFetchOrders(): Promise<OrderRow[]> {
  assertConfigured();
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateOrderStatus(id: string, status: string) {
  assertConfigured();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

/** Cria o registro do pedido no momento em que o cliente finaliza pelo WhatsApp. */
export async function createOrderFromCart(
  items: { productId: string; variantId: string; name: string; size: string; price: number; quantity: number }[],
  total: number
): Promise<void> {
  if (!isSupabaseConfigured) return; // modo demo: não persiste, só o link do WhatsApp abre
  const { data: order, error } = await supabase
    .from('orders')
    .insert({ status: 'pending_whatsapp', total })
    .select('id')
    .single();
  if (error) throw error;

  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map(i => ({
      order_id: order.id,
      product_id: i.productId,
      variant_id: i.variantId,
      product_name: i.name,
      size: i.size,
      unit_price: i.price,
      quantity: i.quantity,
    }))
  );
  if (itemsError) throw itemsError;
}

// ---------------------------------------------------------------------------
// INSTAGRAM POSTS
// ---------------------------------------------------------------------------
export async function adminFetchInstagramPosts(): Promise<InstagramPost[]> {
  assertConfigured();
  const { data, error } = await supabase.from('instagram_posts').select('*').order('display_order');
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertInstagramPost(post: Partial<InstagramPost> & { image_url: string; link: string }) {
  assertConfigured();
  const { error } = await supabase.from('instagram_posts').upsert(post);
  if (error) throw error;
}

export async function adminDeleteInstagramPost(id: string) {
  assertConfigured();
  const { error } = await supabase.from('instagram_posts').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// SITE SETTINGS
// ---------------------------------------------------------------------------
export async function adminUpdateSiteSettings(settings: Partial<SiteSettings>) {
  assertConfigured();
  const { error } = await supabase.from('site_settings').update(settings).eq('id', 1);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// DASHBOARD STATS (Section 49)
// ---------------------------------------------------------------------------
export async function adminFetchDashboardStats() {
  assertConfigured();
  const [{ count: totalProducts }, { count: activeProducts }, { data: variants }, { count: orders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('product_variants').select('product_id, stock'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
  ]);

  const stockByProduct = new Map<string, number>();
  (variants ?? []).forEach(v => stockByProduct.set(v.product_id, (stockByProduct.get(v.product_id) ?? 0) + v.stock));
  const lowStockCount = [...stockByProduct.values()].filter(s => s > 0 && s <= 3).length;
  const outOfStockCount = [...stockByProduct.values()].filter(s => s === 0).length;

  return {
    totalProducts: totalProducts ?? 0,
    activeProducts: activeProducts ?? 0,
    lowStockCount,
    outOfStockCount,
    totalOrders: orders ?? 0,
  };
}
