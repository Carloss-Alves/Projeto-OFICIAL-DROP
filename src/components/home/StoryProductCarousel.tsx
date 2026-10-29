import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { PriceTag } from '@/components/ui/PriceTag';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDE_DURATION = 4500;

/**
 * Carrossel formato "story": pensado para quem chega pelo Instagram e já
 * está acostumado a esse gesto de navegação. Avança sozinho, mostra
 * progresso, e cada "story" é um produto em destaque — ponte natural
 * entre o feed do Instagram e a loja (Seção 51).
 */
export function StoryProductCarousel({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const items = products.slice(0, 6);

  useEffect(() => {
    if (paused || items.length === 0) return;
    startRef.current = performance.now() - progress * SLIDE_DURATION;

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const pct = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        setIndex(i => (i + 1) % items.length);
        setProgress(0);
        startRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, index, items.length]);

  if (items.length === 0) return null;
  const current = items[index];
  const image = current.images[0];

  function goTo(next: number) {
    setIndex((next + items.length) % items.length);
    setProgress(0);
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="mb-6">
        <span className="eyebrow">Direto do feed</span>
        <h2 className="text-display text-3xl sm:text-4xl mt-1">Vitrine em Stories</h2>
      </div>

      <div
        className="relative w-full max-w-sm mx-auto aspect-[9/16] rounded-lg overflow-hidden bg-ink-900 select-none"
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {image && (
          <img
            key={current.id}
            src={image.url}
            alt={image.alt ?? current.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />

        {/* Barras de progresso, estilo stories */}
        <div className="absolute top-3 left-3 right-3 flex gap-1.5">
          {items.map((p, i) => (
            <div key={p.id} className="h-0.5 flex-1 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{ width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        <button
          aria-label="Story anterior"
          onClick={() => goTo(index - 1)}
          className="absolute inset-y-0 left-0 w-1/3 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          aria-label="Próximo story"
          onClick={() => goTo(index + 1)}
          className="absolute inset-y-0 right-0 w-1/3 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={22} />
        </button>

        <div className="absolute bottom-0 inset-x-0 p-5">
          <span className="eyebrow">{current.brand?.name}</span>
          <h3 className="text-display text-xl mt-1">{current.name}</h3>
          <div className="mt-2">
            <PriceTag price={current.price} compareAt={current.compare_at_price} />
          </div>
          <Link
            to={`/produto/${current.slug}`}
            className="mt-4 inline-flex h-11 px-5 items-center justify-center bg-bone-50 text-ink-950 text-sm font-semibold uppercase tracking-wide rounded-sm"
          >
            Ver produto
          </Link>
        </div>
      </div>
    </section>
  );
}
