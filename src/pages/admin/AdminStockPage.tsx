import { useEffect, useState } from 'react';
import { adminFetchAllProducts, adminUpdateVariantStock } from '@/services/admin';
import type { Product } from '@/types';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { Boxes } from 'lucide-react';

export function AdminStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    adminFetchAllProducts().then(setProducts).catch(e => notify(e.message, 'error')).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpdate(productId: string, variantId: string, stock: number) {
    setSavingId(variantId);
    try {
      await adminUpdateVariantStock(variantId, Math.max(0, stock));
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, variants: p.variants.map(v => (v.id === variantId ? { ...v, stock: Math.max(0, stock) } : v)) } : p
      ));
    } catch (e: any) { notify(e.message, 'error'); } finally { setSavingId(null); }
  }

  if (!isSupabaseConfigured) return <EmptyState icon={Boxes} title="Conecte o Supabase" description="Configure as variáveis de ambiente para gerenciar estoque." />;
  if (loading) return <p className="text-ink-400 text-sm">Carregando…</p>;

  return (
    <div>
      <h1 className="text-display text-3xl mb-2">Estoque</h1>
      <p className="text-ink-400 text-sm mb-8">Ajuste rápido de estoque por tamanho.</p>

      <div className="flex flex-col gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-ink-900 border border-ink-800 rounded-md p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-12 rounded-sm overflow-hidden bg-ink-800 shrink-0">
                {p.images[0] && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
              </div>
              <span className="text-sm font-medium">{p.name}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {p.variants.map(v => (
                <div key={v.id} className="flex items-center gap-2 bg-ink-950 border border-ink-700 rounded-sm px-3 h-10">
                  <span className="text-xs text-ink-400 w-8">{v.size}</span>
                  <input
                    type="number"
                    min={0}
                    defaultValue={v.stock}
                    onBlur={e => {
                      const value = Number(e.target.value);
                      if (value !== v.stock) handleUpdate(p.id, v.id, value);
                    }}
                    className="w-14 bg-transparent text-sm outline-none"
                    disabled={savingId === v.id}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
