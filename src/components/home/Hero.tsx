import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { Banner } from '@/types';

export function Hero({ banner }: { banner: Banner | null }) {
  if (!banner) return null;

  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden">
      <picture>
        <source media="(max-width: 767px)" srcSet={banner.image_mobile_url} />
        <img
          src={banner.image_desktop_url}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-ink-950/10" />

      <div className="relative h-full flex flex-col justify-end px-4 sm:px-6 pb-16 sm:pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow">Nova coleção</span>
          <h1 className="text-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] mt-2 max-w-3xl">
            {banner.title}
          </h1>
          {banner.subtitle && (
            <p className="text-ink-200 text-base sm:text-lg mt-4 max-w-md">{banner.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/produtos">
              <Button variant="primary">Comprar agora</Button>
            </Link>
            {banner.cta_link && (
              <Link to={banner.cta_link}>
                <Button variant="secondary">{banner.cta_label ?? 'Ver drop'}</Button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
