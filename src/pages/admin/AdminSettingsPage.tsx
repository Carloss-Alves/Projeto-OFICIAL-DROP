import { useEffect, useState } from 'react';
import { fetchSiteSettings } from '@/services/catalog';
import { adminUpdateSiteSettings, uploadBannerImage } from '@/services/admin';
import type { SiteSettings } from '@/types';
import { Field, inputClass, textareaClass } from '@/components/admin/Field';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { isSupabaseConfigured } from '@/lib/supabase';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    fetchSiteSettings().then(setSettings);
  }, []);

  async function handleAvatarUpload(file: File) {
    if (!settings) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadBannerImage(file, 'instagram-profile');
      setSettings({ ...settings, instagram_profile_image_url: url });
    } catch (e: any) { notify(e.message, 'error'); } finally { setUploadingAvatar(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    if (!isSupabaseConfigured) {
      notify('Conecte o Supabase para salvar configurações reais.', 'error');
      return;
    }
    setSaving(true);
    try {
      await adminUpdateSiteSettings(settings);
      notify('Configurações salvas.');
    } catch (e: any) { notify(e.message, 'error'); } finally { setSaving(false); }
  }

  if (!settings) return <p className="text-ink-400 text-sm">Carregando…</p>;

  return (
    <form onSubmit={handleSave} className="max-w-xl">
      <h1 className="text-display text-3xl mb-2">Configurações da loja</h1>
      <p className="text-ink-400 text-sm mb-8">Essas informações alimentam o header, footer, WhatsApp e SEO — sem precisar tocar em código.</p>

      {!isSupabaseConfigured && (
        <div className="mb-6 p-4 rounded-sm bg-ink-900 border border-ink-700 text-sm text-ink-300">
          Modo demo: alterações aqui não são salvas até o Supabase ser configurado.
        </div>
      )}

      <div className="flex flex-col gap-5">
        <Field label="Nome da loja"><input className={inputClass} value={settings.store_name} onChange={e => setSettings({ ...settings, store_name: e.target.value })} /></Field>
        <Field label="URL do logo"><input className={inputClass} value={settings.logo_url ?? ''} onChange={e => setSettings({ ...settings, logo_url: e.target.value })} /></Field>
        <Field label="Instagram (@handle)"><input className={inputClass} value={settings.instagram_handle} onChange={e => setSettings({ ...settings, instagram_handle: e.target.value })} /></Field>
        <Field label="Imagem de perfil do Instagram" hint="Usada na Home e no rodapé, ao lado do @handle">
          <div className="flex items-center gap-3">
            {settings.instagram_profile_image_url && (
              <img src={settings.instagram_profile_image_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            )}
            <label className="text-xs text-signal-400 cursor-pointer">
              {uploadingAvatar ? 'Enviando…' : settings.instagram_profile_image_url ? 'Trocar imagem' : 'Enviar imagem'}
              <input type="file" accept="image/*" className="hidden" disabled={!isSupabaseConfigured} onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
            </label>
          </div>
        </Field>
        <Field label="WhatsApp" hint="Formato internacional, só números. Ex: 5561996943237">
          <input className={inputClass} value={settings.whatsapp_number} onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value.replace(/\D/g, '') })} />
        </Field>
        <Field label="Mensagem padrão do WhatsApp" hint="Use {product}, {size}, {price}, {link}">
          <textarea className={textareaClass} rows={3} value={settings.whatsapp_message_template} onChange={e => setSettings({ ...settings, whatsapp_message_template: e.target.value })} />
        </Field>
        <Field label="E-mail"><input className={inputClass} value={settings.email ?? ''} onChange={e => setSettings({ ...settings, email: e.target.value })} /></Field>
        <Field label="Endereço"><input className={inputClass} value={settings.address ?? ''} onChange={e => setSettings({ ...settings, address: e.target.value })} /></Field>
        <Field label="Horário de atendimento"><input className={inputClass} value={settings.hours ?? ''} onChange={e => setSettings({ ...settings, hours: e.target.value })} /></Field>
      </div>

      <Button type="submit" variant="primary" className="mt-8" disabled={saving}>
        {saving ? 'Salvando…' : 'Salvar configurações'}
      </Button>
    </form>
  );
}
