import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink-800 text-ink-100 hover:bg-ink-700',
  secondary: 'bg-transparent text-bone-50 border border-ink-100/40 hover:border-bone-50',
  ghost: 'bg-ink-800 text-bone-50 hover:bg-ink-700',
  whatsapp: 'bg-[#25D366] text-ink-950 hover:brightness-95',
};

export function Button({ variant = 'primary', fullWidth, className = '', children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 h-12 px-6 text-sm font-semibold tracking-wide uppercase transition-colors duration-200 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
