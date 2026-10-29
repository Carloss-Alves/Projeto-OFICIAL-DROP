export type SortKey = 'recent' | 'best-selling' | 'price-asc' | 'price-desc' | 'name';

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'best-selling', label: 'Mais vendidos' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'name', label: 'Nome' },
];

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as SortKey)}
      className="bg-ink-900 border border-ink-700 rounded-sm h-10 px-3 text-sm outline-none"
      aria-label="Ordenar produtos"
    >
      {OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export function sortProducts<T extends { price: number; name: string; is_best_seller: boolean; created_at: string }>(
  items: T[],
  sort: SortKey
): T[] {
  const copy = [...items];
  switch (sort) {
    case 'price-asc': return copy.sort((a, b) => a.price - b.price);
    case 'price-desc': return copy.sort((a, b) => b.price - a.price);
    case 'name': return copy.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    case 'best-selling': return copy.sort((a, b) => Number(b.is_best_seller) - Number(a.is_best_seller));
    case 'recent':
    default:
      return copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
