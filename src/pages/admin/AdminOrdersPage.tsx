import { useEffect, useState } from 'react';
import { adminFetchOrders, adminUpdateOrderStatus, type OrderRow } from '@/services/admin';
import { formatPrice } from '@/utils/format';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingCart } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending_whatsapp', label: 'Pendente' },
  { value: 'confirmed', label: 'Em atendimento' },
  { value: 'paid', label: 'Pago' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    adminFetchOrders().then(setOrders).catch(e => notify(e.message, 'error')).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStatusChange(id: string, status: string) {
    try {
      await adminUpdateOrderStatus(id, status);
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
    } catch (e: any) { notify(e.message, 'error'); }
  }

  if (!isSupabaseConfigured) return <EmptyState icon={ShoppingCart} title="Conecte o Supabase" description="Configure as variáveis de ambiente para ver pedidos." />;
  if (loading) return <p className="text-ink-400 text-sm">Carregando…</p>;

  return (
    <div>
      <h1 className="text-display text-3xl mb-2">Pedidos</h1>
      <p className="text-ink-400 text-sm mb-8">
        Registrados automaticamente quando o cliente finaliza pelo WhatsApp. Pronto para futura integração com gateway de pagamento.
      </p>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Nenhum pedido ainda" description="Assim que um cliente finalizar pelo WhatsApp, o pedido aparece aqui." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-ink-800">
                <th className="py-3 pr-4 font-medium">Data</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Cupom</th>
                <th className="py-3 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-ink-900">
                  <td className="py-3 pr-4 text-ink-300">{new Date(o.created_at).toLocaleString('pt-BR')}</td>
                  <td className="py-3 pr-4">{formatPrice(o.total)}</td>
                  <td className="py-3 pr-4 text-ink-400">{o.coupon_code ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={o.status}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                      className="bg-ink-900 border border-ink-700 rounded-sm h-9 px-2 text-xs outline-none"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
