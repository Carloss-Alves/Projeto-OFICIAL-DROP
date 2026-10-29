import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminFetchAllProducts, adminSetProductActive, adminDeleteProduct } from '@/services/admin';
import type { Product } from '@/types';
import { formatPrice } from '@/utils/format';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await adminFetchAllProducts();
      setProducts(data);
    } catch (e: any) {
      notify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSupabaseConfigured) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleActive(product: Product) {
    try {
      await adminSetProductActive(product.id, !product.is_active);
      setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)));
      notify(product.is_active ? 'Produto desativado.' : 'Produto ativado.');
    } catch (e: any) {
      notify(e.message, 'error');
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Excluir "${product.name}" permanentemente? Essa ação não pode ser desfeita.`)) return;
    try {
      await adminDeleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      notify('Produto excluído.');
    } catch (e: any) {
      notify(e.message, 'error');
    }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-display text-3xl">Produtos</h1>
          <p className="text-ink-400 text-sm mt-1">{products.length} produto{products.length === 1 ? '' : 's'} cadastrado{products.length === 1 ? '' : 's'}</p>
        </div>
        <Link to="/admin/produtos/novo" className="inline-flex items-center gap-2 h-11 px-4 bg-bone-50 text-ink-950 rounded-sm text-sm font-semibold">
          <Plus size={16} /> Novo produto
        </Link>
      </div>

      {!isSupabaseConfigured ? (
        <EmptyState icon={Package} title="Conecte o Supabase" description="O CRUD de produtos precisa de um projeto Supabase configurado (veja README)." />
      ) : loading ? (
        <p className="text-ink-400 text-sm">Carregando…</p>
      ) : (
        <>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produto…"
            className="h-11 bg-ink-900 border border-ink-700 rounded-sm px-3 text-sm outline-none mb-4 w-full max-w-sm"
          />

          {filtered.length === 0 ? (
            <EmptyState icon={Package} title="Nenhum produto cadastrado" description="Comece cadastrando seu primeiro produto." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-400 border-b border-ink-800">
                    <th className="py-3 pr-4 font-medium">Produto</th>
                    <th className="py-3 pr-4 font-medium">Marca</th>
                    <th className="py-3 pr-4 font-medium">Preço</th>
                    <th className="py-3 pr-4 font-medium">Estoque</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                    return (
                      <tr key={p.id} className="border-b border-ink-900 hover:bg-ink-900/50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-sm overflow-hidden bg-ink-800 shrink-0">
                              {p.images[0] && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <span className="line-clamp-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-ink-300">{p.brand?.name ?? '—'}</td>
                        <td className="py-3 pr-4">{formatPrice(p.price)}</td>
                        <td className="py-3 pr-4">
                          <span className={stock === 0 ? 'text-sale-500' : stock <= p.low_stock_threshold ? 'text-signal-400' : 'text-ink-300'}>
                            {stock} un.
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-sm ${p.is_active ? 'bg-signal-500/20 text-signal-400' : 'bg-ink-800 text-ink-400'}`}>
                            {p.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => toggleActive(p)} aria-label="Ativar/desativar" className="text-ink-400 hover:text-bone-50">
                              {p.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <Link to={`/admin/produtos/${p.id}`} aria-label="Editar" className="text-ink-400 hover:text-bone-50">
                              <Pencil size={16} />
                            </Link>
                            <button onClick={() => handleDelete(p)} aria-label="Excluir" className="text-ink-400 hover:text-sale-500">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
