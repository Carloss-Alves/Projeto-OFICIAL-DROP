import { describe, it, expect } from 'vitest';
import { buildProductWhatsAppLink, buildCartWhatsAppLink } from '@/utils/whatsapp';
import { DEMO_SETTINGS } from '@/data/demoData';

describe('buildProductWhatsAppLink', () => {
  it('monta link com número e dados do produto', () => {
    const link = buildProductWhatsAppLink(DEMO_SETTINGS, {
      product: 'Camiseta Nike', size: 'M', price: 199.9, link: 'https://loja.com/produto/x',
    });
    expect(link).toContain(`https://wa.me/${DEMO_SETTINGS.whatsapp_number}`);
    expect(link).toContain('text=');
  });
});

describe('buildCartWhatsAppLink', () => {
  it('inclui todos os itens do carrinho e o total', () => {
    const items = [
      { productId: 'p1', variantId: 'v1', name: 'Camiseta', brand: 'Nike', image: '', size: 'M', price: 100, quantity: 2, slug: 'x', maxStock: 5 },
    ];
    const link = buildCartWhatsAppLink(DEMO_SETTINGS, items, 200);
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('Camiseta');
    expect(decoded).toContain('200');
  });
});
