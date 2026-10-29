import { useState } from 'react';
import type { ProductImage } from '@/types';

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const current = sorted[active] ?? sorted[0];

  return (
    <div>
      {/* Mobile: carrossel horizontal com swipe */}
      <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-4 px-4">
        {sorted.map(img => (
          <div key={img.id} className="min-w-[86%] aspect-[3/4] snap-center rounded-md overflow-hidden bg-ink-900">
            <img src={img.url} alt={img.alt ?? name} className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>

      {/* Desktop: imagem grande + miniaturas */}
      <div className="hidden md:flex gap-4">
        <div className="flex flex-col gap-3 w-20">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`aspect-square rounded-sm overflow-hidden bg-ink-900 border transition-colors ${
                i === active ? 'border-bone-50' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`Ver imagem ${i + 1}`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
        <div className="flex-1 aspect-[3/4] rounded-md overflow-hidden bg-ink-900 group">
          {current && (
            <img
              src={current.url}
              alt={current.alt ?? name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
            />
          )}
        </div>
      </div>
    </div>
  );
}
