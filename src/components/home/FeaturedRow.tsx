import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types';
import { ProductGrid } from '@/components/product/ProductGrid';

export function FeaturedRow({
  eyebrow,
  title,
  products,
  seeAllHref,
}: {
  eyebrow: string;
  title: string;
  products: Product[];
  seeAllHref?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="text-display text-3xl sm:text-4xl mt-1">{title}</h2>
        </div>
        {seeAllHref && (
          <Link to={seeAllHref} className="hidden sm:flex items-center gap-1 text-sm text-ink-300 hover:text-bone-50">
            Ver tudo <ArrowRight size={16} />
          </Link>
        )}
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
