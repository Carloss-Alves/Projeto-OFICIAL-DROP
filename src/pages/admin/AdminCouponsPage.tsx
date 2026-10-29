import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { adminFetchCoupons, adminUpsertCoupon, adminDeleteCoupon } from '@/services/admin';
import type { Coupon } from '@/types';
import { Field, inputClass } from '@/components/admin/Field';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ticket } from 'lucide-react';

const emptyForm = { code: '', type: 'percent' as 'percent' | 'amount', value: '', expires_at: '', is_active: true };

export function AdminCouponsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try { setItems(await adminFetchCoupons()); } catch (e: any) { notify(e.message, 'error'); } finally { setLoading(false); }
  }

  useEffect(() => { if (isSupabaseConfigured) load(); else setLoading(false); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    try {
      await adminUpsertCoupon({
        code: form.code.toUpperCase(),
        percent_off: form.type === 'percent' ? Number(form.value) : null,
        amount_off: form.type === 'amount' ? Number(form.value) : null,
        is_active: form.is_active,
        expires_at: form.expires_at || null,
      });
      notify('Cupom salvo.');
      setForm(null);
      load();
    } catch (e: any) { notify(e.message, 'error'); }
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Excluir cupom "${coupon.code}"?`)) return;
    try { await adminDeleteCoupon(coupon.id); notify('Cupom excluído.'); load(); } catch (e: any) { notify(e.message, 'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-3xl">Cupons</h1>
        <Button variant="primary" onClick={() => setForm(emptyForm)}><Plus size={16} /> Novo cupom</Button>
      </div>
      <p className="text-ink-400 text-sm mb-6 max-w-lg">
        Estrutura pronta para quando o checkout online (Mercado Pago/Stripe/Pix) for integrado. Por enquanto, use os cupons como referência manual durante o atendimento pelo WhatsApp.
      </p>

      {!isSupabaseConfigured ? (
        <EmptyState icon={Ticket} title="Conecte o Supabase" description="Configure as variáveis de ambiente para gerenciar cupons." />
      ) : loading ? <p className="text-ink-400 text-sm">Carregando…</p> : items.length === 0 ? (
        <EmptyState icon={Ticket} title="Nenhum cupom cadastrado" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-ink-800">
                <th className="py-3 pr-4 font-medium">Código</th>
                <th className="py-3 pr-4 font-medium">Desconto</th>
                <th className="py-3 pr-4 font-medium">Expira</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-b border-ink-900">
                  <td className="py-3 pr-4 font-mono">{c.code}</td>
                  <td className="py-3 pr-4">{c.percent_off ? `${c.percent_off}%` : c.amount_off ? `R$ ${c.amount_off}` : '—'}</td>
                  <td className="py-3 pr-4 text-ink-400">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('pt-BR') : 'Sem prazo'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-sm ${c.is_active ? 'bg-signal-500/20 text-signal-400' : 'bg-ink-800 text-ink-400'}`}>{c.is_active ? 'Ativo' : 'Inativo'}</span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <button onClick={() => handleDelete(c)} className="text-ink-400 hover:text-sale-500"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-ink-900 border border-ink-700 rounded-md p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <span className="text-display text-lg">Novo cupom</span>
              <button type="button" onClick={() => setForm(null)}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <Field label="Código"><input className={inputClass} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required /></Field>
              <Field label="Tipo">
                <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
                  <option value="percent">Percentual (%)</option>
                  <option value="amount">Valor fixo (R$)</option>
                </select>
              </Field>
              <Field label="Valor"><input type="number" className={inputClass} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required /></Field>
              <Field label="Expira em (opcional)"><input type="date" className={inputClass} value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={() => setForm({ ...form, is_active: !form.is_active })} className="accent-signal-500" /> Ativo</label>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="submit" variant="primary">Salvar</Button>
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
