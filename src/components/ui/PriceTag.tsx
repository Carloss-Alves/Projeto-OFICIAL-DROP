import { formatPrice, discountPercent } from '@/utils/format';

export function PriceTag({ price, compareAt, size = 'md' }: { price: number; compareAt?: number | null; size?: 'sm' | 'md' | 'lg' }) {
  const discount = discountPercent(price, compareAt);
  const priceClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`font-semibold ${priceClass}`}>{formatPrice(price)}</span>
      {compareAt && discount && (
        <>
          <span className="text-ink-400 line-through text-sm">{formatPrice(compareAt)}</span>
          <span className="text-sale-500 text-xs font-mono font-semibold">-{discount}%</span>
        </>
      )}
    </div>
  );
}
