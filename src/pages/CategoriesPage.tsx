import { useEffect, useState } from 'react';
import { fetchCategories } from '@/services/catalog';
import type { Category } from '@/types';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-display text-4xl">Categorias</h1>
      </div>
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8"><ProductGridSkeleton count={6} /></div>
      ) : (
        <CategoryGrid categories={categories} />
      )}
    </div>
  );
}
