import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminFetchBrands, adminUpsertBrand, adminDeleteBrand, uploadBrandLogo } from '@/services/admin';
import type { Brand } from '@/types';
import { Field, inputClass } from '@/components/admin/Field';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { Award } from 'lucide-react';

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const emptyForm = { id: '', name: '', slug: '', logo_url: '', is_active: true };

export function AdminBrandsPage() {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const [uploading, setUploading] = useState(false);
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try { setItems(await adminFetchBrands()); } catch (e: any) { notify(e.message, 'error'); } finally { setLoading(false); }
  }

  useEffect(() => { if (isSupabaseConfigured) load(); else setLoading(false); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    try {
      await adminUpsertBrand({
        id: form.id || undefined,
        name: form.name,
        slug: form.slug || slugify(form.name),
        logo_url: form.logo_url || null,
        is_active: form.is_active,
      } as any);
      notify('Marca salva.');
      setForm(null);
      load();
    } catch (e: any) { notify(e.message, 'error'); }
  }

  async function handleLogoUpload(file: File) {
    if (!form) return;
    setUploading(true);
    try {
      const url = await uploadBrandLogo(file, form.slug || slugify(form.name) || 'marca');
      setForm({ ...form, logo_url: url });
    } catch (e: any) { notify(e.message, 'error'); } finally { setUploading(false); }
  }

  async function handleDelete(brand: Brand) {
    if (!confirm(`Excluir marca "${brand.name}"? Produtos vinculados perderão a marca.`)) return;
    try { await adminDeleteBrand(brand.id); notify('Marca excluída.'); load(); } catch (e: any) { notify(e.message, 'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-3xl">Marcas</h1>
        <Button variant="primary" onClick={() => setForm(emptyForm)}><Plus size={16} /> Nova marca</Button>
      </div>

      {!isSupabaseConfigured ? (
        <EmptyState icon={Award} title="Conecte o Supabase" description="Configure as variáveis de ambiente para gerenciar marcas." />
      ) : loading ? <p className="text-ink-400 text-sm">Carregando…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(b => (
            <div key={b.id} className="bg-ink-900 border border-ink-800 rounded-md p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-ink-800 shrink-0 flex items-center justify-center text-[10px]">
                {b.logo_url ? <img src={b.logo_url} alt="" className="w-full h-full object-cover" /> : b.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">{b.name}</span>
                <span className={`text-[11px] ${b.is_active ? 'text-signal-400' : 'text-ink-500'}`}>{b.is_active ? 'Ativa' : 'Inativa'}</span>
              </div>
              <button onClick={() => setForm({ ...b, logo_url: b.logo_url ?? '' })} className="text-ink-400 hover:text-bone-50"><Pencil size={15} /></button>
              <button onClick={() => handleDelete(b)} className="text-ink-400 hover:text-sale-500"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-ink-900 border border-ink-700 rounded-md p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <span className="text-display text-lg">{form.id ? 'Editar marca' : 'Nova marca'}</span>
              <button type="button" onClick={() => setForm(null)}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <Field label="Nome"><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} required /></Field>
              <Field label="Slug"><input className={inputClass} value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} required /></Field>
              <Field label="Logo">
                <div className="flex items-center gap-3">
                  {form.logo_url && <img src={form.logo_url} alt="" className="w-10 h-10 rounded-full object-cover" />}
                  <label className="text-xs text-signal-400 cursor-pointer">
                    {uploading ? 'Enviando…' : 'Enviar logo'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                  </label>
                </div>
              </Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={() => setForm({ ...form, is_active: !form.is_active })} className="accent-signal-500" /> Ativa</label>
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
