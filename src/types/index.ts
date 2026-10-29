// Tipos centrais do domínio — espelham as tabelas do Supabase (ver supabase/schema.sql)

export type UUID = string;

export interface Brand {
  id: UUID;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: UUID | null;
  display_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: UUID;
  product_id: UUID;
  url: string;
  alt: string | null;
  position: number;
  is_primary: boolean;
}

export type SizeLabel = string; // "P" | "M" | "G" | "GG" | "38" | "39" ...

export interface ProductVariant {
  id: UUID;
  product_id: UUID;
  size: SizeLabel;
  color: string | null;
  sku: string | null;
  stock: number;
}

export interface Product {
  id: UUID;
  slug: string;
  name: string;
  brand: Brand | null;
  category: Category | null;
  description: string;
  details: string | null;
  composition: string | null;
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
  images: ProductImage[];
  variants: ProductVariant[];
  related_product_ids: UUID[];
  complete_the_look_ids: UUID[];
  drop_id: UUID | null;
  created_at: string;
  is_demo?: boolean;
}

export interface Drop {
  id: UUID;
  slug: string;
  name: string;
  code: string; // "DROP #001"
  description: string;
  banner_desktop_url: string | null;
  banner_mobile_url: string | null;
  launch_at: string; // ISO date
  is_active: boolean;
  product_ids: UUID[];
}

export interface Banner {
  id: UUID;
  title: string;
  subtitle: string | null;
  image_desktop_url: string;
  image_mobile_url: string;
  cta_label: string | null;
  cta_link: string | null;
  display_order: number;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
}

export interface SiteSettings {
  store_name: string;
  logo_url: string | null;
  instagram_handle: string;
  instagram_profile_image_url: string | null;
  whatsapp_number: string; // E.164, ex: 5561996943237
  whatsapp_message_template: string;
  email: string | null;
  address: string | null;
  hours: string | null;
  primary_color: string | null;
}

export interface InstagramPost {
  id: UUID;
  image_url: string;
  caption: string | null;
  link: string;
  display_order: number;
}

export interface CartItem {
  productId: UUID;
  variantId: UUID;
  name: string;
  brand: string;
  image: string;
  size: SizeLabel;
  price: number;
  quantity: number;
  slug: string;
  maxStock: number;
}

export interface Coupon {
  id: UUID;
  code: string;
  percent_off: number | null;
  amount_off: number | null;
  is_active: boolean;
  expires_at: string | null;
}
