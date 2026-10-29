import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  DEMO_PRODUCTS, DEMO_BRANDS, DEMO_CATEGORIES, DEMO_BANNERS,
  DEMO_INSTAGRAM_POSTS, DEMO_SETTINGS,
} from '@/data/demoData';
import type { Product, Brand, Category, Banner, InstagramPost, SiteSettings } from '@/types';

// ----------------------------------------------------------------------------
// Camada de acesso a dados. Enquanto o Supabase não estiver configurado
// (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes), tudo aqui retorna os
// dados de demonstração de src/data/demoData.ts. Assim que as variáveis forem
// preenchidas, os mesmos componentes passam a consumir dados reais sem
// precisar de nenhuma alteração de código.
// ----------------------------------------------------------------------------

const PRODUCT_SELECT = `
  id, slug, name, description, details, composition, price, compare_at_price, sku, tags,
  is_new, is_featured, is_best_seller, is_limited, is_sale, is_active, show_on_home,
  low_stock_threshold, related_product_ids, complete_the_look_ids, drop_id, is_demo, created_at,
  brand:brands(id, name, slug, logo_url, is_active),
  category:categories(id, name, slug, image_url, parent_id, display_order, is_active),
  images:product_images(id, product_id, url, alt, position, is_primary),
  variants:product_variants(id, product_id, size, color, sku, stock)
`;

function mapProduct(row: any): Product {
  return {
    ...row,
    images: (row.images ?? []).sort((a: any, b: any) => a.position - b.position),
  };
}

export async function fetchProducts(filters?: {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  onlyActive?: boolean;
}): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    let items = DEMO_PRODUCTS;
    if (filters?.categorySlug) items = items.filter(p => p.category?.slug === filters.categorySlug);
    if (filters?.brandSlug) items = items.filter(p => p.brand?.slug === filters.brandSlug);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.name.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return items;
  }

  // IMPORTANTE: filtrar por coluna de tabela relacionada via `.eq('category.slug', x)`
  // não funciona no PostgREST sem o join hint `!inner` (e usar `!inner` sempre
  // excluiria produtos sem marca/categoria de TODAS as consultas, mesmo sem
  // filtro). Por isso resolvemos o slug para o id real antes de filtrar —
  // simples, correto, e não depende de nenhum join hint.
  let query = supabase.from('products').select(PRODUCT_SELECT).eq('is_active', true);

  if (filters?.categorySlug) {
    const { data: cat, error: catErr } = await supabase.from('categories').select('id').eq('slug', filters.categorySlug).maybeSingle();
    if (catErr) throw catErr;
    if (!cat) return []; // categoria inexistente: nenhum produto, sem erro
    query = query.eq('category_id', cat.id);
  }
  if (filters?.brandSlug) {
    const { data: brand, error: brandErr } = await supabase.from('brands').select('id').eq('slug', filters.brandSlug).maybeSingle();
    if (brandErr) throw brandErr;
    if (!brand) return [];
    query = query.eq('brand_id', brand.id);
  }
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return DEMO_PRODUCTS.find(p => p.slug === slug) ?? null;
  }
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('slug', slug).single();
  if (error) return null;
  return mapProduct(data);
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  if (!isSupabaseConfigured) {
    return DEMO_PRODUCTS.filter(p => ids.includes(p.id));
  }
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).in('id', ids);
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchBrands(): Promise<Brand[]> {
  if (!isSupabaseConfigured) return DEMO_BRANDS;
  const { data, error } = await supabase.from('brands').select('*').eq('is_active', true);
  if (error) throw error;
  return data ?? [];
}

export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return DEMO_CATEGORIES;
  const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('display_order');
  if (error) throw error;
  return data ?? [];
}

export async function fetchBanners(): Promise<Banner[]> {
  if (!isSupabaseConfigured) return DEMO_BANNERS;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('banners').select('*').eq('is_active', true)
    .or(`start_at.is.null,start_at.lte.${now}`)
    .order('display_order');
  if (error) throw error;
  return data ?? [];
}

export async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  if (!isSupabaseConfigured) return DEMO_INSTAGRAM_POSTS;
  const { data, error } = await supabase.from('instagram_posts').select('*').order('display_order');
  if (error) throw error;
  return data ?? [];
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return DEMO_SETTINGS;
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (error) return DEMO_SETTINGS;
  return data as SiteSettings;
}
