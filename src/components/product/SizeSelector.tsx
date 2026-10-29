import type { ProductVariant } from '@/types';

export function SizeSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: ProductVariant[];
  selected: string | null;
  onSelect: (variant: ProductVariant) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-ink-300">Tamanho</span>
        {selected && <span className="text-xs text-ink-400">Selecionado: {selected}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {variants.map(v => {
          const disabled = v.stock === 0;
          const active = selected === v.size;
          return (
            <button
              key={v.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(v)}
              aria-label={`Tamanho ${v.size}${disabled ? ' (esgotado)' : ''}`}
              aria-pressed={active}
              className={[
                'relative min-w-11 h-11 px-3 rounded-sm border text-sm font-medium transition-colors',
                disabled
                  ? 'border-ink-800 text-ink-600 cursor-not-allowed overflow-hidden'
                  : active
                  ? 'border-bone-50 bg-bone-50 text-ink-950'
                  : 'border-ink-700 text-bone-50 hover:border-bone-50',
              ].join(' ')}
            >
              {v.size}
              {disabled && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-[140%] h-px bg-ink-600 rotate-[-20deg]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
