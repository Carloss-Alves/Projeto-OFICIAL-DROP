import { Link } from 'react-router-dom';
import { Camera, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatPhoneBR } from '@/utils/format';

export function Footer() {
  const { settings } = useSiteSettings();
  const instagramUrl = `https://www.instagram.com/${settings.instagram_handle.replace('@', '')}/`;
  const whatsappUrl = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent('Olá! Vim pelo site e quero saber mais sobre os produtos.')}`
    : null;

  return (
    <footer className="border-t border-ink-800 mt-24 pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <span className="text-display text-xl">{settings.store_name}</span>
          <p className="text-ink-400 text-sm mt-3 max-w-xs">
            Loja multimarcas de streetwear. Curadoria própria de Nike, Lacoste e mais.
          </p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-ink-300 hover:text-bone-50"
          >
            {settings.instagram_profile_image_url ? (
              <img src={settings.instagram_profile_image_url} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <Camera size={16} />
            )}
            {settings.instagram_handle}
          </a>
        </div>
        <div>
          <span className="eyebrow">Loja</span>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-300">
            <li><Link to="/produtos" className="hover:text-bone-50">Produtos</Link></li>
            <li><Link to="/categorias" className="hover:text-bone-50">Categorias</Link></li>
            <li><Link to="/sobre" className="hover:text-bone-50">Sobre a marca</Link></li>
          </ul>
        </div>
        <div>
          <span className="eyebrow">Marcas</span>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-300">
            <li><Link to="/produtos?marca=nike" className="hover:text-bone-50">Nike</Link></li>
            <li><Link to="/produtos?marca=lacoste" className="hover:text-bone-50">Lacoste</Link></li>
          </ul>
        </div>
        <div>
          <span className="eyebrow">Contato</span>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-300">
            {whatsappUrl && (
              <li>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-bone-50">
                  <MessageCircle size={15} className="text-[#25D366]" /> {formatPhoneBR(settings.whatsapp_number)}
                </a>
              </li>
            )}
            {settings.email && <li>{settings.email}</li>}
            {settings.address && <li>{settings.address}</li>}
            {settings.hours && <li>{settings.hours}</li>}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 border-t border-ink-900 text-xs text-ink-500 flex justify-between">
        <span>© {new Date().getFullYear()} {settings.store_name}. Loja revendedora multimarcas.</span>
        <Link to="/admin" className="hover:text-ink-300">Admin</Link>
      </div>
    </footer>
  );
}
