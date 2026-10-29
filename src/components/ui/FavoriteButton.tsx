import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

export function FavoriteButton({ productId, size = 18 }: { productId: string; size?: number }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(productId);

  return (
    <button
      type="button"
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={active}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink-950/60 backdrop-blur hover:bg-ink-950 transition-colors"
    >
      <Heart size={size} fill={active ? '#B7FF00' : 'none'} color={active ? '#B7FF00' : '#E8E8E8'} />
    </button>
  );
}
