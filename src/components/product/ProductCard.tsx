import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { PriceTag } from '@/components/ui/PriceTag';
import { FavoriteButton } from '@/components/ui/FavoriteButton';

export function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const primary = product.images.find(i => i.is_primary) ?? product.images[0];
  const secondary = product.images[1];
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const lowStock = totalStock > 0 && totalStock <= product.low_stock_threshold;
  const outOfStock = totalStock === 0;

  return (
    <Link
      to={`/produto/${product.slug}`}
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-900 rounded-md">
        {primary && (
          <img
            src={hovered && secondary ? secondary.url : primary.url}
            alt={primary.alt ?? product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-[var(--ease-signature)] group-hover:scale-[1.03]"
          />
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-ink-950/60 flex items-center justify-center">
            <span className="text-display text-sm">Esgotado</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.is_new && <Badge tone="new">Novo</Badge>}
          {product.is_sale && <Badge tone="sale">Sale</Badge>}
          {product.is_limited && <Badge tone="limited">Edição limitada</Badge>}
          {lowStock && <Badge tone="low">Últimas peças</Badge>}
          {product.is_demo && <Badge tone="neutral">Demo</Badge>}
        </div>
        <div className="absolute top-2 right-2">
          <FavoriteButton productId={product.id} />
        </div>
      </div>
      <div className="pt-3 flex flex-col gap-0.5">
        <span className="eyebrow">{product.brand?.name}</span>
        <span className="text-sm sm:text-[15px] leading-snug">{product.name}</span>
        <div className="pt-1">
          <PriceTag price={product.price} compareAt={product.compare_at_price} size="sm" />
        </div>
      </div>
    </Link>
  );
}
