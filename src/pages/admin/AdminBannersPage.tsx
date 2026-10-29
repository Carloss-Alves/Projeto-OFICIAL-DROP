import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminFetchBanners, adminUpsertBanner, adminDeleteBanner, uploadBannerImage } from '@/services/admin';
import type { Banner } from '@/types';
import { Field, inputClass } from '@/components/admin/Field';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { Image } from 'lucide-react';

const emptyForm = {
  id: '', title: '', subtitle: '', image_desktop_url: '', image_mobile_url: '',
  cta_label: '', cta_link: '', display_order: 0, is_active: true, start_at: '', end_at: '',
};

export function AdminBannersPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try { setItems(await adminFetchBanners()); } catch (e: any) { notify(e.message, 'error'); } finally { setLoading(false); }
  }

  useEffect(() => { if (isSupabaseConfigured) load(); else setLoading(false); }, []);

  async function handleUpload(file: File, field: 'image_desktop_url' | 'image_mobile_url') {
    if (!form) return;
    try {
      const url = await uploadBannerImage(file, field);
      setForm({ ...form, [field]: url });
    } catch (e: any) { notify(e.message, 'error'); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.image_desktop_url || !form.image_mobile_url) {
      notify('Envie as imagens desktop e mobile.', 'error');
      return;
    }
    try {
      await adminUpsertBanner({
        id: form.id || undefined,
        title: form.title,
        subtitle: form.subtitle || null,
        image_desktop_url: form.image_desktop_url,
        image_mobile_url: form.image_mobile_url,
        cta_label: form.cta_label || null,
        cta_link: form.cta_link || null,
        display_order: form.display_order,
        is_active: form.is_active,
        start_at: form.start_at || null,
        end_at: form.end_at || null,
      } as any);
      notify('Banner salvo.');
      setForm(null);
      load();
    } catch (e: any) { notify(e.message, 'error'); }
  }

  async function handleDelete(banner: Banner) {
    if (!confirm(`Excluir o banner "${banner.title}"?`)) return;
    try { await adminDeleteBanner(banner.id); notify('Banner excluído.'); load(); } catch (e: any) { notify(e.message, 'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-3xl">Banners</h1>
        <Button variant="primary" onClick={() => setForm(emptyForm)}><Plus size={16} /> Novo banner</Button>
      </div>

      {!isSupabaseConfigured ? (
        <EmptyState icon={Image} title="Conecte o Supabase" description="Configure as variáveis de ambiente para gerenciar banners." />
      ) : loading ? <p className="text-ink-400 text-sm">Carregando…</p> : items.length === 0 ? (
        <EmptyState icon={Image} title="Nenhum banner cadastrado" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map(b => (
            <div key={b.id} className="bg-ink-900 border border-ink-800 rounded-md overflow-hidden">
              <div className="aspect-[21/9] bg-ink-800">
                <img src={b.image_desktop_url} alt={b.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium">{b.title}</span>
                  <p className="text-[11px] text-ink-400">Ordem {b.display_order} · {b.is_active ? 'Ativo' : 'Inativo'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setForm({ ...b, subtitle: b.subtitle ?? '', cta_label: b.cta_label ?? '', cta_link: b.cta_link ?? '', start_at: b.start_at ?? '', end_at: b.end_at ?? '' })} className="text-ink-400 hover:text-bone-50"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(b)} className="text-ink-400 hover:text-sale-500"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-ink-900 border border-ink-700 rounded-md p-6 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between mb-5">
              <span className="text-display text-lg">{form.id ? 'Editar banner' : 'Novo banner'}</span>
              <button type="button" onClick={() => setForm(null)}><X size={18} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Título"><input className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></Field>
              <Field label="Subtítulo"><input className={inputClass} value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} /></Field>
              <Field label="Texto do botão"><input className={inputClass} value={form.cta_label} onChange={e => setForm({ ...form, cta_label: e.target.value })} placeholder="Ver drop" /></Field>
              <Field label="Link do botão"><input className={inputClass} value={form.cta_link} onChange={e => setForm({ ...form, cta_link: e.target.value })} placeholder="/drops" /></Field>
              <Field label="Ordem"><input type="number" className={inputClass} value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} /></Field>
              <Field label="Data inicial (opcional)"><input type="datetime-local" className={inputClass} value={form.start_at} onChange={e => setForm({ ...form, start_at: e.target.value })} /></Field>
              <Field label="Data final (opcional)"><input type="datetime-local" className={inputClass} value={form.end_at} onChange={e => setForm({ ...form, end_at: e.target.value })} /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field label="Imagem desktop">
                <label className="text-xs text-signal-400 cursor-pointer">
                  {form.image_desktop_url ? 'Trocar imagem' : 'Enviar imagem'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'image_desktop_url')} />
                </label>
                {form.image_desktop_url && <img src={form.image_desktop_url} alt="" className="mt-2 h-20 rounded-sm object-cover" />}
              </Field>
              <Field label="Imagem mobile">
                <label className="text-xs text-signal-400 cursor-pointer">
                  {form.image_mobile_url ? 'Trocar imagem' : 'Enviar imagem'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'image_mobile_url')} />
                </label>
                {form.image_mobile_url && <img src={form.image_mobile_url} alt="" className="mt-2 h-20 rounded-sm object-cover" />}
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm mt-4"><input type="checkbox" checked={form.is_active} onChange={() => setForm({ ...form, is_active: !form.is_active })} className="accent-signal-500" /> Ativo</label>
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
