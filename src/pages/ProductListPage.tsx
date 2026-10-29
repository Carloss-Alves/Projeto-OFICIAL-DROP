import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { fetchProducts, fetchBrands, fetchCategories } from '@/services/catalog';
import type { Product, Brand, Category } from '@/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { FilterPanel, EMPTY_FILTERS, type ProductFilters } from '@/components/product/FilterPanel';
import { SortSelect, sortProducts, type SortKey } from '@/components/product/SortSelect';
import { usePageMeta } from '@/hooks/useSeo';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertTriangle } from 'lucide-react';

export function ProductListPage() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>('recent');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categorySlug = params.get('categoria') ?? undefined;
  const brandSlug = params.get('marca') ?? undefined;
  const search = params.get('busca') ?? undefined;
  const quickFilter = params.get('filtro') ?? undefined;

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    Promise.all([fetchProducts({ search }), fetchBrands(), fetchCategories()])
      .then(([products, brandList, categoryList]) => {
        setAllProducts(products);
        setBrands(brandList);
        setCategories(categoryList);
      })
      .catch(err => {
        console.error('Falha ao carregar produtos:', err);
        setLoadError('Não foi possível carregar os produtos agora. Tente novamente em instantes.');
      })
      .finally(() => setLoading(false));
  }, [search]);

  // Sincroniza filtros vindos da URL (link de categoria/marca/quick filter)
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      categories: categorySlug ? [categorySlug] : prev.categories,
      brands: brandSlug ? [brandSlug] : prev.brands,
      onlyNew: quickFilter === 'novos' ? true : prev.onlyNew,
      onlySale: quickFilter === 'ofertas' ? true : prev.onlySale,
    }));
    if (quickFilter === 'mais-vendidos') setSort('best-selling');
  }, [categorySlug, brandSlug, quickFilter]);

  const filtered = useMemo(() => {
    let items = allProducts;
    if (filters.brands.length) items = items.filter(p => p.brand && filters.brands.includes(p.brand.slug));
    if (filters.categories.length) items = items.filter(p => p.category && filters.categories.includes(p.category.slug));
    if (filters.sizes.length) items = items.filter(p => p.variants.some(v => filters.sizes.includes(v.size) && v.stock > 0));
    if (filters.onlyNew) items = items.filter(p => p.is_new);
    if (filters.onlySale) items = items.filter(p => p.is_sale);
    return sortProducts(items, sort);
  }, [allProducts, filters, sort]);

  const title = search ? `Resultados para "${search}"` : categorySlug
    ? categories.find(c => c.slug === categorySlug)?.name ?? 'Produtos'
    : 'Todos os produtos';

  usePageMeta(`${title} | DROP BSB`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
      <div className="mb-8">
        <h1 className="text-display text-3xl sm:text-4xl">{title}</h1>
        <p className="text-ink-400 text-sm mt-1">{filtered.length} produto{filtered.length === 1 ? '' : 's'}</p>
      </div>

      <div className="flex items-center justify-between mb-6 lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 border border-ink-700 rounded-sm text-sm"
        >
          <SlidersHorizontal size={15} /> Filtros
        </button>
        <SortSelect value={sort} onChange={setSort} />
      </div>

      <div className="flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-ink-300">Filtros</span>
            <SortSelect value={sort} onChange={setSort} />
          </div>
          <FilterPanel brandOptions={brands} categoryOptions={categories} filters={filters} onChange={setFilters} />
        </aside>

        <div className="flex-1">
          {loadError ? (
            <EmptyState icon={AlertTriangle} title="Algo deu errado" description={loadError} />
          ) : loading ? (
            <ProductGridSkeleton />
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>
      </div>

      {/* Sheet de filtros no mobile */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-ink-950 overflow-y-auto lg:hidden">
          <div className="sticky top-0 bg-ink-950 h-16 flex items-center justify-between px-4 border-b border-ink-800">
            <span className="text-display text-lg">Filtros</span>
            <button onClick={() => setMobileFiltersOpen(false)} aria-label="Fechar filtros">
              <X size={22} />
            </button>
          </div>
          <div className="p-4 pb-28">
            <FilterPanel brandOptions={brands} categoryOptions={categories} filters={filters} onChange={setFilters} />
          </div>
          <div className="fixed bottom-0 inset-x-0 p-4 bg-ink-950 border-t border-ink-800">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full h-12 bg-bone-50 text-ink-950 rounded-sm font-semibold uppercase text-sm"
            >
              Ver {filtered.length} produtos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
