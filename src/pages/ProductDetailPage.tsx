import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductBySlug } from '@/services/catalog';
import type { Product, ProductVariant } from '@/types';
import { ProductGallery } from '@/components/product/ProductGallery';
import { SizeSelector } from '@/components/product/SizeSelector';
import { CompleteTheLook } from '@/components/product/CompleteTheLook';
import { Badge } from '@/components/ui/Badge';
import { PriceTag } from '@/components/ui/PriceTag';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/context/CartContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { usePageMeta, useProductStructuredData } from '@/hooks/useSeo';
import { stockLabel } from '@/utils/format';
import { buildProductWhatsAppLink } from '@/utils/whatsapp';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { addItem, openCart } = useCart();
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setSelectedVariant(null);
    fetchProductBySlug(slug).then(p => {
      setProduct(p);
      setLoading(false);
    });
  }, [slug]);

  const totalStock = product ? product.variants.reduce((s, v) => s + v.stock, 0) : 0;
  const productUrl = product ? `${window.location.origin}/produto/${product.slug}` : '';
  const canAdd = Boolean(selectedVariant && selectedVariant.stock > 0);

  usePageMeta(
    product ? `${product.name} | ${settings.store_name}` : settings.store_name,
    product?.description
  );
  useProductStructuredData(
    product
      ? {
          name: product.name,
          description: product.description,
          image: product.images.map(i => i.url),
          sku: product.sku,
          brand: product.brand?.name ?? settings.store_name,
          price: product.price,
          availability: totalStock > 0 ? 'InStock' : 'OutOfStock',
          url: productUrl,
        }
      : null
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 grid md:grid-cols-2 gap-10">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        title="Produto não encontrado"
        description="Esse produto pode ter saído do catálogo ou o link está incorreto."
        action={<Link to="/produtos"><Button variant="secondary">Ver todos os produtos</Button></Link>}
      />
    );
  }

  function handleAddToCart() {
    if (!product || !selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      brand: product.brand?.name ?? '',
      image: product.images[0]?.url ?? '',
      size: selectedVariant.size,
      price: product.price,
      quantity: 1,
      slug: product.slug,
      maxStock: selectedVariant.stock,
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16">
      <div className="grid md:grid-cols-2 gap-8 md:gap-14">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="eyebrow">{product.brand?.name}</span>
            <FavoriteButton productId={product.id} />
          </div>
          <h1 className="text-display text-3xl sm:text-4xl mt-2 leading-tight">{product.name}</h1>

          <div className="flex flex-wrap gap-2 mt-3">
            {product.is_new && <Badge tone="new">Novo</Badge>}
            {product.is_sale && <Badge tone="sale">Sale</Badge>}
            {product.is_limited && <Badge tone="limited">Edição limitada</Badge>}
            {product.is_demo && <Badge tone="neutral">Produto demo</Badge>}
          </div>

          <div className="mt-4">
            <PriceTag price={product.price} compareAt={product.compare_at_price} size="lg" />
          </div>

          <p className="text-ink-300 text-sm mt-4 leading-relaxed">{product.description}</p>

          <div className="mt-6">
            <SizeSelector
              variants={product.variants}
              selected={selectedVariant?.size ?? null}
              onSelect={setSelectedVariant}
            />
            {selectedVariant && (
              <p className={`text-xs mt-2 ${stockLabel(selectedVariant.stock, product.low_stock_threshold).tone === 'low' ? 'text-sale-500' : 'text-ink-400'}`}>
                {stockLabel(selectedVariant.stock, product.low_stock_threshold).label}
              </p>
            )}
            {totalStock === 0 && <p className="text-sale-500 text-xs mt-2">Produto esgotado em todos os tamanhos.</p>}
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <Button variant="primary" fullWidth disabled={!canAdd} onClick={() => { handleAddToCart(); openCart(); }}>
              Adicionar ao carrinho
            </Button>
            <a
              href={buildProductWhatsAppLink(settings, {
                product: product.name,
                size: selectedVariant?.size ?? 'a definir',
                price: product.price,
                link: productUrl,
              })}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="whatsapp" fullWidth>Comprar pelo WhatsApp</Button>
            </a>
          </div>

          {(product.details || product.composition) && (
            <div className="mt-10 border-t border-ink-800 pt-6 flex flex-col gap-4 text-sm">
              {product.details && (
                <div>
                  <span className="text-ink-300 font-medium block mb-1">Detalhes</span>
                  <p className="text-ink-400">{product.details}</p>
                </div>
              )}
              {product.composition && (
                <div>
                  <span className="text-ink-300 font-medium block mb-1">Composição</span>
                  <p className="text-ink-400">{product.composition}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CompleteTheLook productIds={product.complete_the_look_ids} />
    </div>
  );
}
