import type { ReactNode } from 'react';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-300">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ink-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  'h-11 bg-ink-900 border border-ink-700 rounded-sm px-3 text-sm outline-none focus:border-signal-500 w-full';
export const textareaClass =
  'bg-ink-900 border border-ink-700 rounded-sm px-3 py-2 text-sm outline-none focus:border-signal-500 w-full resize-y';
