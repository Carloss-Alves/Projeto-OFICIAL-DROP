import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Nenhum produto encontrado"
        description="Tente ajustar os filtros ou volte para conferir os novos drops em breve."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}
