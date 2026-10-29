import type { Brand, Category } from '@/types';

export interface ProductFilters {
  brands: string[];
  categories: string[];
  sizes: string[];
  onlyNew: boolean;
  onlySale: boolean;
}

const ALL_SIZES = ['P', 'M', 'G', 'GG', '38', '39', '40', '41', '42'];

export function FilterPanel({
  brandOptions,
  categoryOptions,
  filters,
  onChange,
}: {
  brandOptions: Brand[];
  categoryOptions: Category[];
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
}) {
  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-ink-300 mb-3 block">Marca</span>
        <div className="flex flex-col gap-2">
          {brandOptions.map(b => (
            <label key={b.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.brands.includes(b.slug)}
                onChange={() => onChange({ ...filters, brands: toggle(filters.brands, b.slug) })}
                className="accent-signal-500"
              />
              {b.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-ink-300 mb-3 block">Categoria</span>
        <div className="flex flex-col gap-2">
          {categoryOptions.map(c => (
            <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(c.slug)}
                onChange={() => onChange({ ...filters, categories: toggle(filters.categories, c.slug) })}
                className="accent-signal-500"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-ink-300 mb-3 block">Tamanho</span>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => onChange({ ...filters, sizes: toggle(filters.sizes, size) })}
              className={`h-9 px-3 rounded-sm border text-xs ${
                filters.sizes.includes(size) ? 'border-bone-50 bg-bone-50 text-ink-950' : 'border-ink-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-ink-300 mb-3 block">Disponibilidade</span>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={filters.onlyNew} onChange={() => onChange({ ...filters, onlyNew: !filters.onlyNew })} className="accent-signal-500" />
            Novidades
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={filters.onlySale} onChange={() => onChange({ ...filters, onlySale: !filters.onlySale })} className="accent-signal-500" />
            Em oferta
          </label>
        </div>
      </div>
    </div>
  );
}

export const EMPTY_FILTERS: ProductFilters = { brands: [], categories: [], sizes: [], onlyNew: false, onlySale: false };
