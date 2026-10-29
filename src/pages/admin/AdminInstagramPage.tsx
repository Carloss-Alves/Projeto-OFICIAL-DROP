import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import {
  adminFetchInstagramPosts, adminUpsertInstagramPost, adminDeleteInstagramPost,
  adminUpdateSiteSettings, uploadBannerImage,
} from '@/services/admin';
import { fetchSiteSettings } from '@/services/catalog';
import type { InstagramPost, SiteSettings } from '@/types';
import { Field, inputClass } from '@/components/admin/Field';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { Camera } from 'lucide-react';

const emptyForm = { id: '', image_url: '', caption: '', link: 'https://www.instagram.com/dropbsb_/', display_order: 0 };

export function AdminInstagramPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([adminFetchInstagramPosts(), fetchSiteSettings()]);
      setPosts(p);
      setSettings(s);
    } catch (e: any) { notify(e.message, 'error'); } finally { setLoading(false); }
  }

  useEffect(() => {
    if (isSupabaseConfigured) load();
    else { fetchSiteSettings().then(setSettings); setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleProfileImageUpload(file: File) {
    if (!settings) return;
    setUploadingProfile(true);
    try {
      const url = await uploadBannerImage(file, 'instagram-profile');
      await adminUpdateSiteSettings({ instagram_profile_image_url: url });
      setSettings({ ...settings, instagram_profile_image_url: url });
      notify('Imagem de perfil do Instagram atualizada.');
    } catch (e: any) { notify(e.message, 'error'); } finally { setUploadingProfile(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    try {
      await adminUpsertInstagramPost({
        id: form.id || undefined,
        image_url: form.image_url,
        caption: form.caption || null,
        link: form.link,
        display_order: form.display_order,
      });
      notify('Post salvo.');
      setForm(null);
      load();
    } catch (e: any) { notify(e.message, 'error'); }
  }

  async function handleImageUpload(file: File) {
    try {
      const url = await uploadBannerImage(file, 'instagram-post');
      setForm(prev => (prev ? { ...prev, image_url: url } : prev));
    } catch (e: any) { notify(e.message, 'error'); }
  }

  async function handleDelete(post: InstagramPost) {
    if (!confirm('Remover este post da vitrine do Instagram?')) return;
    try { await adminDeleteInstagramPost(post.id); notify('Post removido.'); load(); } catch (e: any) { notify(e.message, 'error'); }
  }

  return (
    <div>
      <h1 className="text-display text-3xl mb-2">Instagram</h1>
      <p className="text-ink-400 text-sm mb-8">
        Conta oficial: <span className="text-signal-400">@dropbsb_</span> — enquanto a integração automática com a API do Instagram não é feita, cadastre os posts manualmente aqui.
      </p>

      {/* Imagem de perfil / identidade visual usada na seção do Instagram (Seção 7) */}
      <div className="bg-ink-900 border border-ink-800 rounded-md p-5 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-ink-800 shrink-0 flex items-center justify-center">
          {settings?.instagram_profile_image_url ? (
            <img src={settings.instagram_profile_image_url} alt="Perfil do Instagram" className="w-full h-full object-cover" />
          ) : (
            <Camera size={22} className="text-ink-500" />
          )}
        </div>
        <div>
          <span className="text-sm font-medium block mb-1">Imagem de perfil do Instagram</span>
          <p className="text-xs text-ink-400 mb-2">Usada na seção "Siga no Instagram" da Home. Fica salva no Supabase Storage.</p>
          <label className="text-xs text-signal-400 cursor-pointer">
            {uploadingProfile ? 'Enviando…' : settings?.instagram_profile_image_url ? 'Trocar imagem' : 'Enviar imagem'}
            <input
              type="file" accept="image/*" className="hidden" disabled={!isSupabaseConfigured}
              onChange={e => e.target.files?.[0] && handleProfileImageUpload(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-300">Posts da vitrine</span>
        <Button variant="primary" onClick={() => setForm(emptyForm)}><Plus size={16} /> Novo post</Button>
      </div>

      {!isSupabaseConfigured ? (
        <EmptyState icon={Camera} title="Conecte o Supabase" description="Configure as variáveis de ambiente para gerenciar os posts do Instagram." />
      ) : loading ? <p className="text-ink-400 text-sm">Carregando…</p> : posts.length === 0 ? (
        <EmptyState icon={Camera} title="Nenhum post cadastrado" description="Adicione algumas fotos para preencher a vitrine na Home." />
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map(post => (
            <div key={post.id} className="relative aspect-square rounded-md overflow-hidden bg-ink-900 group">
              <img src={post.image_url} alt={post.caption ?? ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/60 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button onClick={() => setForm({ ...post, caption: post.caption ?? '' })} className="text-xs bg-ink-800 px-2 py-1 rounded-sm">Editar</button>
                <button onClick={() => handleDelete(post)} className="text-ink-300 hover:text-sale-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-ink-900 border border-ink-700 rounded-md p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <span className="text-display text-lg">{form.id ? 'Editar post' : 'Novo post'}</span>
              <button type="button" onClick={() => setForm(null)}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <Field label="Imagem">
                <label className="text-xs text-signal-400 cursor-pointer">
                  {form.image_url ? 'Trocar imagem' : 'Enviar imagem'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
                {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-24 w-24 object-cover rounded-sm" />}
              </Field>
              <Field label="Legenda (opcional)"><input className={inputClass} value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} /></Field>
              <Field label="Link" hint="Para onde o post leva ao ser clicado"><input className={inputClass} value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} required /></Field>
              <Field label="Ordem"><input type="number" className={inputClass} value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} /></Field>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="submit" variant="primary" disabled={!form.image_url}>Salvar</Button>
              <Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
