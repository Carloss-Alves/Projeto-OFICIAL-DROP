import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Brand } from '@/types';

export function BrandShowcase({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="mb-8">
        <span className="eyebrow">Curadoria</span>
        <h2 className="text-display text-3xl sm:text-4xl mt-1">Nossas Marcas</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {brands.map((brand, i) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <Link
              to={`/produtos?marca=${brand.slug}`}
              className="group relative flex items-center justify-center h-28 sm:h-36 rounded-md border border-ink-800 bg-ink-900 overflow-hidden hover:border-signal-500/60 transition-colors"
            >
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="max-h-10 max-w-[60%] object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
              ) : (
                <span className="text-display text-2xl sm:text-3xl tracking-tight group-hover:text-signal-400 transition-colors">
                  {brand.name}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
