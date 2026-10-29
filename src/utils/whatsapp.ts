import type { SiteSettings, CartItem } from '@/types';
import { formatPrice } from './format';

/** Monta o link "wa.me" para um único produto (página de produto). */
export function buildProductWhatsAppLink(
  settings: SiteSettings,
  params: { product: string; size: string; price: number; link: string }
): string {
  const message = settings.whatsapp_message_template
    .replaceAll('{product}', params.product)
    .replaceAll('{size}', params.size)
    .replaceAll('{price}', formatPrice(params.price))
    .replaceAll('{link}', params.link);
  return `https://wa.me/${settings.whatsapp_number}?text=${message}`;
}

/** Monta o link "wa.me" para o carrinho inteiro (finalizar pedido). */
export function buildCartWhatsAppLink(settings: SiteSettings, items: CartItem[], total: number): string {
  const lines = [
    'Olá! Quero finalizar este pedido:',
    '',
    ...items.map(i => `• ${i.quantity}x ${i.brand} ${i.name} (Tam ${i.size}) — ${formatPrice(i.price * i.quantity)}`),
    '',
    `Total: ${formatPrice(total)}`,
  ];
  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${settings.whatsapp_number}?text=${message}`;
}
