import type { LucideIcon } from 'lucide-react';
import { PackageSearch } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon = PackageSearch,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <Icon size={40} className="text-ink-500 mb-4" strokeWidth={1.5} />
      <h3 className="text-display text-lg mb-2">{title}</h3>
      {description && <p className="text-ink-400 text-sm max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  );
}
