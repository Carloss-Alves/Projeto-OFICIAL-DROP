import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function WhatsAppFloatingButton() {
  const { settings } = useSiteSettings();
  if (!settings.whatsapp_number) return null;

  const link = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent('Olá! Vim pelo site e quero saber mais sobre os produtos.')}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed z-30 bottom-20 lg:bottom-6 right-4 sm:right-6 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lift hover:scale-105 transition-transform"
    >
      <MessageCircle size={26} color="#0B0B0D" fill="#0B0B0D" />
    </a>
  );
}
