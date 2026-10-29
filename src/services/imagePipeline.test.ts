import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------------------------------------------
// Testa o fluxo real de imagens (não o modo demo) mockando o cliente Supabase.
// Isso é importante porque catalog.test.ts roda sem VITE_SUPABASE_URL definido,
// então sempre exercita src/data/demoData.ts — nunca as queries reais do
// PostgREST. Foi exatamente por isso que o bug do filtro `.eq('category.slug')`
// (sintaxe inválida sem join hint `!inner`) passou despercebido antes: nenhum
// teste chamava esse caminho de código. Aqui simulamos o Supabase configurado
// para validar a montagem real das queries e do payload de imagens.
//
// Não fazemos uma requisição HTTP real às URLs do Storage: este sandbox de
// testes não tem acesso de rede a domínios do Supabase (só ao registry do
// npm), então uma checagem HTTP verdadeira ficaria falsa/instável aqui.
// Em vez disso validamos que a URL final é uma URL pública bem formada
// (https, sem "blob:") — a mesma forma que getPublicUrl() do Supabase Storage
// sempre retorna. Depois de configurar seu projeto, um teste manual abrindo a
// URL do produto no navegador é o complemento natural desta suíte.
// ----------------------------------------------------------------------------

function makeQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {
    calls: {} as Record<string, any>,
    select: vi.fn((arg: any) => { builder.calls.select = arg; return builder; }),
    eq: vi.fn((col: string, val: any) => {
      builder.calls.eq = builder.calls.eq ?? [];
      builder.calls.eq.push([col, val]);
      return builder;
    }),
    in: vi.fn((col: string, vals: any) => { builder.calls.in = [col, vals]; return builder; }),
    ilike: vi.fn(() => builder),
    or: vi.fn(() => builder),
    order: vi.fn(() => builder),
    upsert: vi.fn((arg: any) => { builder.calls.upsert = arg; return builder; }),
    insert: vi.fn((arg: any) => { builder.calls.insert = arg; return builder; }),
    delete: vi.fn(() => { builder.calls.delete = true; return builder; }),
    update: vi.fn((arg: any) => { builder.calls.update = arg; return builder; }),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: any) => resolve(result),
  };
  return builder;
}

const builders = new Map<string, ReturnType<typeof makeQueryBuilder>>();

function setTableResult(table: string, result: { data: any; error: any }) {
  const b = makeQueryBuilder(result);
  builders.set(table, b);
  return b;
}

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  PRODUCT_IMAGES_BUCKET: 'product-images',
  BANNER_IMAGES_BUCKET: 'banner-images',
  BRAND_LOGOS_BUCKET: 'brand-logos',
  supabase: {
    from: vi.fn((table: string) => builders.get(table) ?? makeQueryBuilder({ data: null, error: null })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(async () => ({ data: { path: 'chinelo-nike/123-abc.jpg' }, error: null })),
        getPublicUrl: vi.fn((path: string) => ({
          data: { publicUrl: `https://meuprojeto.supabase.co/storage/v1/object/public/product-images/${path}` },
        })),
      })),
    },
  },
}));

beforeEach(() => {
  builders.clear();
  vi.clearAllMocks();
});

describe('Pipeline de imagens — upload até o catálogo (Supabase real, mockado)', () => {
  it('uploadProductImage retorna uma URL pública https bem formada (não blob:, não vazia)', async () => {
    const { uploadProductImage } = await import('@/services/admin');
    const fakeFile = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])], 'chinelo.jpg', { type: 'image/jpeg' });

    const url = await uploadProductImage(fakeFile, 'chinelo-nike');

    expect(url).toMatch(/^https:\/\//);
    expect(url).not.toMatch(/^blob:/);
    expect(url).toContain('product-images');
  });

  it('adminSaveProduct grava em product_images a URL real enviada (não a prévia local em blob:)', async () => {
    setTableResult('products', { data: { id: 'prod-123' }, error: null });
    setTableResult('product_images', { data: null, error: null });
    setTableResult('product_variants', { data: null, error: null });

    const { adminSaveProduct } = await import('@/services/admin');

    const realUrl = 'https://meuprojeto.supabase.co/storage/v1/object/public/product-images/chinelo-nike/123-abc.jpg';
    const secondUrl = 'https://meuprojeto.supabase.co/storage/v1/object/public/product-images/chinelo-nike/456-def.jpg';

    await adminSaveProduct({
      slug: 'chinelo-nike-victori-one-masculino',
      name: 'Chinelo Nike Victori One Masculino',
      brand_id: 'b-nike', category_id: 'c-chinelos',
      description: 'desc', details: '', composition: '',
      price: 149.9, compare_at_price: null, sku: 'DEMO-NK-007', tags: ['nike', 'chinelo'],
      is_new: true, is_featured: true, is_best_seller: false, is_limited: false, is_sale: false,
      is_active: true, show_on_home: true, low_stock_threshold: 4, drop_id: null,
      related_product_ids: [], complete_the_look_ids: [],
      images: [
        { url: realUrl, alt: 'Chinelo Nike', position: 0, is_primary: true },
        { url: secondUrl, alt: 'Chinelo Nike, detalhe', position: 1, is_primary: false },
      ],
      variants: [{ size: '40', color: null, stock: 5 }],
    });

    const imagesInsertPayload = builders.get('product_images')!.calls.insert;
    expect(imagesInsertPayload).toHaveLength(2);
    expect(imagesInsertPayload[0]).toMatchObject({ product_id: 'prod-123', url: realUrl, is_primary: true, position: 0 });
    expect(imagesInsertPayload[1]).toMatchObject({ product_id: 'prod-123', url: secondUrl, is_primary: false, position: 1 });
    // Nenhuma URL de preview local deve chegar ao banco — se chegasse, a imagem
    // nunca apareceria no site para outros visitantes (blob: só existe na aba
    // de quem fez o upload).
    for (const row of imagesInsertPayload) expect(row.url).not.toMatch(/^blob:/);
  });

  it(
    'fetchProducts filtra por categoria resolvendo slug -> id, sem usar a sintaxe quebrada .eq("category.slug", x)',
    async () => {
      setTableResult('categories', { data: { id: 'cat-chinelos' }, error: null });
      setTableResult('products', {
        data: [
          {
            id: 'prod-123', slug: 'chinelo-nike-victori-one-masculino', name: 'Chinelo Nike Victori One Masculino',
            description: '', details: null, composition: null, price: 149.9, compare_at_price: null,
            sku: 'DEMO-NK-007', tags: [], is_new: true, is_featured: true, is_best_seller: false,
            is_limited: false, is_sale: false, is_active: true, show_on_home: true, low_stock_threshold: 4,
            related_product_ids: [], complete_the_look_ids: [], drop_id: null, is_demo: true,
            created_at: new Date().toISOString(),
            brand: { id: 'b-nike', name: 'Nike', slug: 'nike', logo_url: null, is_active: true },
            category: { id: 'cat-chinelos', name: 'Chinelos', slug: 'chinelos', image_url: null, parent_id: null, display_order: 6, is_active: true },
            images: [
              { id: 'img-2', product_id: 'prod-123', url: 'https://x.supabase.co/.../b.jpg', alt: '', position: 1, is_primary: false },
              { id: 'img-1', product_id: 'prod-123', url: 'https://x.supabase.co/.../a.jpg', alt: '', position: 0, is_primary: true },
            ],
            variants: [{ id: 'v-1', product_id: 'prod-123', size: '40', color: null, sku: null, stock: 5 }],
          },
        ],
        error: null,
      });

      const { fetchProducts } = await import('@/services/catalog');
      const products = await fetchProducts({ categorySlug: 'chinelos' });

      // A resolução do slug precisa ter acontecido via tabela `categories`...
      expect(builders.get('categories')!.calls.eq).toContainEqual(['slug', 'chinelos']);
      // ...e o filtro real na tabela `products` precisa ser por category_id (coluna própria),
      // nunca pela sintaxe embutida quebrada `category.slug`.
      const productEqCalls = builders.get('products')!.calls.eq ?? [];
      expect(productEqCalls).toContainEqual(['category_id', 'cat-chinelos']);
      expect(productEqCalls.some((c: any[]) => c[0] === 'category.slug')).toBe(false);

      // E a imagem principal precisa vir ordenada corretamente (position 0 primeiro),
      // pronta para o ProductCard/ProductGallery renderizarem.
      expect(products).toHaveLength(1);
      expect(products[0].images[0].is_primary).toBe(true);
      expect(products[0].images[0].url).toContain('a.jpg');
    }
  );

  it('fetchProducts retorna lista vazia (sem erro) quando a categoria filtrada não existe', async () => {
    setTableResult('categories', { data: null, error: null });
    setTableResult('products', { data: [], error: null });

    const { fetchProducts } = await import('@/services/catalog');
    const products = await fetchProducts({ categorySlug: 'categoria-que-nao-existe' });

    expect(products).toEqual([]);
  });
});
