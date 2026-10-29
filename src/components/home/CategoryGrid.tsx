import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Category } from '@/types';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-8">
        <span className="eyebrow">Explore</span>
        <h2 className="text-display text-3xl sm:text-4xl mt-1">Categorias</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
          >
            <Link to={`/produtos?categoria=${cat.slug}`} className="group relative block aspect-square overflow-hidden rounded-md bg-ink-900">
              {cat.image_url && (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
              <span className="absolute bottom-3 left-3 text-display text-sm sm:text-base">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
