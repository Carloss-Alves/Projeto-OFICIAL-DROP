import { describe, it, expect } from 'vitest';
import { fetchProducts, fetchProductBySlug } from '@/services/catalog';

// Sem VITE_SUPABASE_URL configurado nos testes, o serviço cai automaticamente
// para os dados de demonstração — cobrindo o mesmo caminho de código usado
// em produção quando o Supabase não está configurado.

describe('fetchProducts (modo demo)', () => {
  it('retorna todos os produtos sem filtro', async () => {
    const products = await fetchProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  it('filtra por marca', async () => {
    const products = await fetchProducts({ brandSlug: 'nike' });
    expect(products.every(p => p.brand?.slug === 'nike')).toBe(true);
  });

  it('filtra por categoria', async () => {
    const products = await fetchProducts({ categorySlug: 'chinelos' });
    expect(products.every(p => p.category?.slug === 'chinelos')).toBe(true);
  });

  it('busca por nome/marca/tag', async () => {
    const products = await fetchProducts({ search: 'lacoste' });
    expect(products.length).toBeGreaterThan(0);
    expect(products.every(p => p.brand?.name.toLowerCase().includes('lacoste'))).toBe(true);
  });

  it('retorna vazio para busca sem correspondência', async () => {
    const products = await fetchProducts({ search: 'zzz-produto-inexistente' });
    expect(products).toHaveLength(0);
  });
});

describe('fetchProductBySlug (modo demo)', () => {
  it('encontra produto existente', async () => {
    const product = await fetchProductBySlug('camiseta-nike-sportswear-preta');
    expect(product?.name).toBe('Camiseta Nike Sportswear Preta');
  });

  it('retorna null para slug inexistente', async () => {
    const product = await fetchProductBySlug('produto-que-nao-existe');
    expect(product).toBeNull();
  });
});
