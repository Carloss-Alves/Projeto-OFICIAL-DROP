import type { ReactNode } from 'react';

type BadgeTone = 'new' | 'sale' | 'low' | 'limited' | 'neutral';

const TONE_STYLES: Record<BadgeTone, string> = {
  new: 'bg-signal-500 text-ink-950',
  sale: 'bg-sale-500 text-white',
  low: 'bg-ink-100 text-ink-950',
  limited: 'bg-ink-950 text-bone-50 border border-ink-100/30',
  neutral: 'bg-ink-800 text-bone-50',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-[10px] font-mono font-semibold tracking-widest uppercase rounded-sm ${TONE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}
