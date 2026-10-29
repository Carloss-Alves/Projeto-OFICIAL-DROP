import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { SearchOverlay } from './SearchOverlay';

// `to: null` = página ainda não existe no projeto. O item aparece, mas sem link.
// Quando a página for criada, basta informar a rota aqui.
const NAV_LINKS: { label: string; to: string | null }[] = [
  { label: 'Novidades', to: '/produtos?filtro=novos' },
  { label: 'Quem somos', to: '/sobre' },
  { label: 'Formas de pagamento', to: null },
  { label: 'Perguntas frequentes', to: null },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, openCart } = useCart();
  const { ids } = useFavorites();
  const { settings } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled || !isHome || menuOpen;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          solid ? 'bg-ink-950/95 backdrop-blur border-b border-ink-800' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>

          <Link to="/" className="text-display text-xl tracking-tight">
            {settings.store_name}
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(link =>
              link.to ? (
                <Link key={link.label} to={link.to} className="text-sm tracking-wide uppercase text-ink-300 hover:text-bone-50 transition-colors">
                  {link.label}
                </Link>
              ) : (
                <span key={link.label} aria-disabled="true" className="text-sm tracking-wide uppercase text-ink-500 cursor-default">
                  {link.label}
                </span>
              )
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} aria-label="Buscar">
              <Search size={20} />
            </button>
            <Link to="/favoritos" className="relative hidden sm:inline-flex" aria-label="Favoritos">
              <Heart size={20} />
              {ids.size > 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] bg-signal-500 rounded-full w-4 h-4 flex items-center justify-center">
                  {ids.size}
                </span>
              )}
            </Link>
            <button onClick={openCart} className="relative" aria-label="Carrinho">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] bg-signal-500 rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile fullscreen */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-ink-950 flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-ink-800">
            <span className="text-display text-xl">{settings.store_name}</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col p-6 gap-6">
            {NAV_LINKS.map(link =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="text-display text-2xl"
                >
                  {link.label}
                </Link>
              ) : (
                <span key={link.label} aria-disabled="true" className="text-display text-2xl text-ink-500 cursor-default">
                  {link.label}
                </span>
              )
            )}
            <Link to="/favoritos" onClick={() => setMenuOpen(false)} className="text-display text-2xl">
              Favoritos
            </Link>
          </nav>
        </div>
      )}

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSubmit={q => {
          setSearchOpen(false);
          navigate(`/produtos?busca=${encodeURIComponent(q)}`);
        }}
      />
    </>
  );
}
