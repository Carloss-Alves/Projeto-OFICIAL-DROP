import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { fetchProductsByIds } from '@/services/catalog';
import type { Product } from '@/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function FavoritesPage() {
  const { ids } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsByIds([...ids]).then(setProducts).finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      <h1 className="text-display text-4xl mb-8">Favoritos</h1>
      {!loading && products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Você ainda não favoritou nada"
          description="Toque no coração de um produto para guardá-lo aqui."
          action={<Link to="/produtos"><Button variant="secondary">Explorar produtos</Button></Link>}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
