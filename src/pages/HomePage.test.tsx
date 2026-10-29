import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Product, Category } from '@/types';

vi.mock('@/services/catalog', () => ({
  fetchCategories: vi.fn(),
  fetchProducts: vi.fn(),
}));

import { fetchCategories, fetchProducts } from '@/services/catalog';
import { HomePage } from './HomePage';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';

const CATS: Category[] = [
  { id: 'c1', name: 'Camisetas', slug: 'camisetas', image_url: null, parent_id: null, display_order: 1, is_active: true },
];

function product(overrides: Partial<Product> & { id: string; name: string }): Product {
  return {
    slug: overrides.id,
    brand: { id: 'b', name: 'Nike', slug: 'nike', logo_url: null, is_active: true },
    category: CATS[0],
    description: '',
    details: null,
    composition: null,
    price: 100,
    compare_at_price: null,
    sku: overrides.id,
    tags: [],
    is_new: false,
    is_featured: false,
    is_best_seller: false,
    is_limited: false,
    is_sale: false,
    is_active: true,
    show_on_home: false,
    low_stock_threshold: 3,
    images: [{ id: 'i', product_id: overrides.id, url: 'https://x/y.jpg', alt: null, position: 0, is_primary: true }],
    variants: [{ id: 'v', product_id: overrides.id, size: 'M', color: null, sku: null, stock: 5 }],
    related_product_ids: [],
    complete_the_look_ids: [],
    drop_id: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const PRODUCTS: Product[] = [
  product({ id: 'new-ok-old', name: 'Novo Antigo', is_new: true, created_at: '2026-01-01T00:00:00Z' }),
  product({ id: 'new-ok-recent', name: 'Novo Recente', is_new: true, created_at: '2026-03-01T00:00:00Z' }),
  product({ id: 'new-home-off', name: 'Novo Sem Home', is_new: true, show_on_home: false }),
  product({ id: 'new-inactive', name: 'Novo Inativo', is_new: true, is_active: false }),
  product({ id: 'new-no-stock', name: 'Novo Esgotado', is_new: true, variants: [{ id: 'z', product_id: 'x', size: 'M', color: null, sku: null, stock: 0 }] }),
  product({ id: 'not-new', name: 'Clássico', is_new: false, show_on_home: true }),
];

function renderHome() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <FavoritesProvider>
          <HomePage />
        </FavoritesProvider>
      </CartProvider>
    </MemoryRouter>
  );
}

// jsdom não implementa IntersectionObserver (usado por whileInView do framer-motion).
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver = IOStub;

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(fetchCategories).mockResolvedValue(CATS);
    vi.mocked(fetchProducts).mockResolvedValue(PRODUCTS);
  });

  it('exibe as quatro partes na ordem: Categorias, Novos Drop, botão, Stories', async () => {
    const { container } = renderHome();
    await waitFor(() => expect(screen.getByText('Novos Drop')).toBeInTheDocument());

    const html = container.innerHTML;
    const pos = (t: string) => html.indexOf(t);
    const idx = [pos('>Categorias<'), pos('>Novos Drop<'), pos('Ver todas as roupas'), pos('Vitrine em Stories')];
    idx.forEach(i => expect(i).toBeGreaterThan(-1));
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it('não exibe as seções removidas da Home', async () => {
    renderHome();
    await waitFor(() => expect(screen.getByText('Novos Drop')).toBeInTheDocument());
    for (const removed of ['Recém-chegaram', 'Em Destaque', 'Mais Vendidos', 'Últimas Peças', 'Ofertas', 'Novos na DROP']) {
      expect(screen.queryByText(removed)).toBeNull();
    }
  });

  it('Novos Drop mostra is_new disponível, sem exigir show_on_home, e exclui inativos e esgotados', async () => {
    renderHome();
    const heading = await screen.findByText('Novos Drop');
    const section = heading.closest('section') as HTMLElement;
    expect(section).toBeTruthy();

    expect(section.textContent).toContain('Novo Recente');
    expect(section.textContent).toContain('Novo Antigo');
    expect(section.textContent).toContain('Novo Sem Home');
    expect(section.textContent).not.toContain('Novo Inativo');
    expect(section.textContent).not.toContain('Novo Esgotado');
    expect(section.textContent).not.toContain('Clássico');
  });

  it('Novos Drop é ordenado do mais recente para o mais antigo', async () => {
    const { container } = renderHome();
    await waitFor(() => expect(screen.getByText('Novos Drop')).toBeInTheDocument());
    const html = container.innerHTML;
    expect(html.indexOf('Novo Recente')).toBeLessThan(html.indexOf('Novo Antigo'));
  });

  it('botão "Ver todas as roupas" aponta para /produtos', async () => {
    renderHome();
    await waitFor(() => expect(screen.getByText('Novos Drop')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Ver todas as roupas' })).toHaveAttribute('href', '/produtos');
  });
});
