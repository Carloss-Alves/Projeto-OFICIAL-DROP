import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchProducts } from '@/services/catalog';
import type { Product } from '@/types';
import { formatPrice } from '@/utils/format';
import { Link } from 'react-router-dom';

export function SearchOverlay({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (query: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const debounced = useDebounce(query, 220);

  useEffect(() => {
    if (!debounced.trim()) return setResults([]);
    fetchProducts({ search: debounced }).then(items => setResults(items.slice(0, 6)));
  }, [debounced]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/98 backdrop-blur flex flex-col">
      <div className="mx-auto w-full max-w-2xl px-4 pt-8">
        <div className="flex items-center gap-3 border-b border-ink-700 pb-3">
          <Search size={20} className="text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && query.trim() && onSubmit(query.trim())}
            placeholder="Nike, Lacoste, bermuda, corta-vento..."
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-ink-500"
          />
          <button onClick={onClose} aria-label="Fechar busca">
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-1">
          {results.map(p => (
            <Link
              key={p.id}
              to={`/produto/${p.slug}`}
              onClick={onClose}
              className="flex items-center gap-4 p-2 rounded-md hover:bg-ink-900 transition-colors"
            >
              <div className="w-14 h-16 rounded-sm overflow-hidden bg-ink-900 shrink-0">
                {p.images[0] && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col">
                <span className="eyebrow">{p.brand?.name}</span>
                <span className="text-sm">{p.name}</span>
                <span className="text-sm text-ink-300">{formatPrice(p.price)}</span>
              </div>
            </Link>
          ))}
          {debounced && results.length === 0 && (
            <p className="text-ink-400 text-sm mt-4">Nenhum resultado para "{debounced}".</p>
          )}
        </div>
      </div>
    </div>
  );
}
