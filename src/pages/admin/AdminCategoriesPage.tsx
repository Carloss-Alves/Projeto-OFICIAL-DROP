import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminFetchCategories, adminUpsertCategory, adminDeleteCategory } from '@/services/admin';
import type { Category } from '@/types';
import { Field, inputClass } from '@/components/admin/Field';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tags } from 'lucide-react';

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const emptyForm = { id: '', name: '', slug: '', image_url: '', display_order: 0, is_active: true };

export function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try { setItems(await adminFetchCategories()); } catch (e: any) { notify(e.message, 'error'); } finally { setLoading(false); }
  }

  useEffect(() => { if (isSupabaseConfigured) load(); else setLoading(false); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    try {
      await adminUpsertCategory({
        id: form.id || undefined,
        name: form.name,
        slug: form.slug || slugify(form.name),
        image_url: form.image_url || null,
        display_order: form.display_order,
        is_active: form.is_active,
      } as any);
      notify('Categoria salva.');
      setForm(null);
      load();
    } catch (e: any) { notify(e.message, 'error'); }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Excluir categoria "${cat.name}"?`)) return;
    try { await adminDeleteCategory(cat.id); notify('Categoria excluída.'); load(); } catch (e: any) { notify(e.message, 'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-3xl">Categorias</h1>
        <Button variant="primary" onClick={() => setForm(emptyForm)}><Plus size={16} /> Nova categoria</Button>
      </div>

      {!isSupabaseConfigured ? (
        <EmptyState icon={Tags} title="Conecte o Supabase" description="Configure as variáveis de ambiente para gerenciar categorias." />
      ) : loading ? <p className="text-ink-400 text-sm">Carregando…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(cat => (
            <div key={cat.id} className="bg-ink-900 border border-ink-800 rounded-md p-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-sm overflow-hidden bg-ink-800 shrink-0">
                {cat.image_url && <img src={cat.image_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">{cat.name}</span>
                <span className={`text-[11px] ${cat.is_active ? 'text-signal-400' : 'text-ink-500'}`}>{cat.is_active ? 'Ativa' : 'Inativa'}</span>
              </div>
              <button onClick={() => setForm({ ...cat, image_url: cat.image_url ?? '' })} className="text-ink-400 hover:text-bone-50"><Pencil size={15} /></button>
              <button onClick={() => handleDelete(cat)} className="text-ink-400 hover:text-sale-500"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-ink-900 border border-ink-700 rounded-md p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <span className="text-display text-lg">{form.id ? 'Editar categoria' : 'Nova categoria'}</span>
              <button type="button" onClick={() => setForm(null)}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <Field label="Nome"><input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} required /></Field>
              <Field label="Slug"><input className={inputClass} value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} required /></Field>
              <Field label="URL da imagem"><input className={inputClass} value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></Field>
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
