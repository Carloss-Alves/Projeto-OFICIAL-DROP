import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedRow } from '@/components/home/FeaturedRow';
import { StoryProductCarousel } from '@/components/home/StoryProductCarousel';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertTriangle } from 'lucide-react';
import { fetchCategories, fetchProducts } from '@/services/catalog';
import type { Category, Product } from '@/types';

// Ordem fixa da Home: Categorias → Novos Drop → botão → Stories.
// Hero, Marcas, Instagram, Destaques, Mais Vendidos, Últimas Peças e Ofertas
// deixaram de ser exibidos aqui. Os componentes e dados continuam existindo.

/** Disponível para venda: ativo e com estoque total maior que zero. */
function isAvailableForSale(p: Product) {
  return p.is_active && p.variants.reduce((sum, v) => sum + v.stock, 0) > 0;
}

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()])
      .then(([cats, allProducts]) => {
        setCategories(cats);
        setProducts(allProducts);
      })
      .catch(err => {
        console.error('Falha ao carregar a Home:', err);
        setError('Não foi possível carregar a loja agora. Verifique sua conexão e tente novamente em instantes.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Novos Drop: todos os produtos com is_new disponíveis para venda.
  // Não depende de show_on_home, para não ocultar novidades cadastradas.
  const newDrops = products
    .filter(p => p.is_new && isAvailableForSale(p))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Vitrine Stories: mantém a curadoria atual (show_on_home) sem alterações.
  const storyProducts = products.filter(p => p.show_on_home);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24">
        <ProductGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState icon={AlertTriangle} title="Algo deu errado" description={error} />
      </div>
    );
  }

  return (
    <div>
      <CategoryGrid categories={categories} />
      <FeaturedRow eyebrow="Chegaram agora" title="Novos Drop" products={newDrops} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 flex justify-center">
        <Link
          to="/produtos"
          className="inline-flex w-full sm:w-auto items-center justify-center h-12 px-8 text-sm font-semibold tracking-wide uppercase rounded-sm border border-ink-100/40 text-bone-50 hover:border-bone-50 transition-colors duration-200"
        >
          Ver todas as roupas
        </Link>
      </section>
      <StoryProductCarousel products={storyProducts} />
    </div>
  );
}
