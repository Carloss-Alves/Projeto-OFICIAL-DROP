import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { fetchProductsByIds } from '@/services/catalog';
import { ProductCard } from './ProductCard';

export function CompleteTheLook({ productIds }: { productIds: string[] }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (productIds.length === 0) return;
    fetchProductsByIds(productIds).then(setProducts);
  }, [productIds]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-16 border-t border-ink-800">
      <div className="mb-6">
        <span className="eyebrow">Combine com</span>
        <h2 className="text-display text-2xl sm:text-3xl mt-1">Complete o Look</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4">
        {products.map(p => (
          <div key={p.id} className="min-w-[45%] sm:min-w-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
