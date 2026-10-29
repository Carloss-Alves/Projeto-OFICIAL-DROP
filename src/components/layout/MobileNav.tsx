import { Link, useLocation } from 'react-router-dom';
import { Home, Search, LayoutGrid, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';

export function MobileNav() {
  const location = useLocation();
  const { count, openCart } = useCart();
  const { ids } = useFavorites();

  const items = [
    { icon: Home, label: 'Home', to: '/' },
    { icon: Search, label: 'Buscar', to: '/produtos' },
    { icon: LayoutGrid, label: 'Categorias', to: '/categorias' },
    { icon: Heart, label: 'Favoritos', to: '/favoritos', badge: ids.size },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-ink-950/95 backdrop-blur border-t border-ink-800 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {items.map(item => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="relative flex flex-col items-center justify-center gap-1">
              <Icon size={20} color={active ? '#B7FF00' : '#B3B3BA'} />
              <span className={`text-[10px] ${active ? 'text-signal-400' : 'text-ink-400'}`}>{item.label}</span>
              {!!item.badge && (
                <span className="absolute top-1 right-6 text-[9px] bg-signal-500 rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button onClick={openCart} className="relative flex flex-col items-center justify-center gap-1">
          <ShoppingBag size={20} color="#B3B3BA" />
          <span className="text-[10px] text-ink-400">Carrinho</span>
          {count > 0 && (
            <span className="absolute top-1 right-6 text-[9px] bg-signal-500 rounded-full w-4 h-4 flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
