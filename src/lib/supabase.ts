import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Sinaliza se o Supabase está configurado neste ambiente.
 * Enquanto as variáveis de ambiente não forem preenchidas (ver .env.example),
 * a loja funciona em MODO DEMO com os dados de src/data/demoData.ts,
 * claramente identificados como demonstração (Seção 43 do briefing).
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (null as unknown as ReturnType<typeof createClient>);

export const PRODUCT_IMAGES_BUCKET = 'product-images';
export const BANNER_IMAGES_BUCKET = 'banner-images';
export const BRAND_LOGOS_BUCKET = 'brand-logos';
