import { describe, it, expect, vi } from 'vitest';

const uploadMock = vi.fn(async () => ({ data: { path: 'x' }, error: null }));
const getPublicUrlMock = vi.fn(() => ({ data: { publicUrl: 'https://x.supabase.co/storage/v1/object/public/product-images/x' } }));

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  PRODUCT_IMAGES_BUCKET: 'product-images',
  BANNER_IMAGES_BUCKET: 'banner-images',
  BRAND_LOGOS_BUCKET: 'brand-logos',
  supabase: {
    storage: { from: vi.fn(() => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock })) },
  },
}));

function makeFile(bytes: number[], name: string, type: string, size?: number): File {
  const buffer = new Uint8Array(size ?? bytes.length);
  buffer.set(bytes.slice(0, buffer.length));
  return new File([buffer], name, { type });
}

const JPEG_HEADER = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0];
const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const WEBP_HEADER = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]; // "RIFF"...."WEBP"

describe('Validação de upload de imagem (Seções 49-50 do briefing)', () => {
  it('aceita um JPEG válido (assinatura + extensão + MIME corretos)', async () => {
    const { uploadProductImage } = await import('@/services/admin');
    const file = makeFile(JPEG_HEADER, 'foto.jpg', 'image/jpeg');
    const url = await uploadProductImage(file, 'produto-x');
    expect(url).toContain('product-images');
  });

  it('rejeita arquivo maior que 10 MB', async () => {
    const { uploadProductImage } = await import('@/services/admin');
    const file = makeFile(JPEG_HEADER, 'grande.jpg', 'image/jpeg', 10 * 1024 * 1024 + 1);
    await expect(uploadProductImage(file, 'produto-x')).rejects.toThrow(/10 MB/);
  });

  it('rejeita extensão não permitida (ex: .svg)', async () => {
    const { uploadProductImage } = await import('@/services/admin');
    const file = makeFile(JPEG_HEADER, 'arquivo.svg', 'image/jpeg');
    await expect(uploadProductImage(file, 'produto-x')).rejects.toThrow(/Formato não permitido/);
  });

  it('rejeita arquivo malicioso disfarçado de imagem (extensão .jpg, conteúdo HTML/script)', async () => {
    const { uploadProductImage } = await import('@/services/admin');
    const htmlBytes = Array.from(new TextEncoder().encode('<script>alert(1)</script>'));
    const file = makeFile(htmlBytes, 'inofensivo.jpg', 'image/jpeg');
    await expect(uploadProductImage(file, 'produto-x')).rejects.toThrow(/não corresponde a uma imagem/);
  });

  it('rejeita MIME não suportado mesmo com extensão permitida', async () => {
    const { uploadProductImage } = await import('@/services/admin');
    const file = makeFile(JPEG_HEADER, 'foto.jpg', 'application/pdf');
    await expect(uploadProductImage(file, 'produto-x')).rejects.toThrow(/Formato não permitido/);
  });

  it('aceita PNG e WEBP válidos', async () => {
    const { uploadProductImage } = await import('@/services/admin');
    await expect(uploadProductImage(makeFile(PNG_HEADER, 'a.png', 'image/png'), 'produto-x')).resolves.toContain('product-images');
    await expect(uploadProductImage(makeFile(WEBP_HEADER, 'a.webp', 'image/webp'), 'produto-x')).resolves.toContain('product-images');
  });

  it('nunca reutiliza o nome original do arquivo — gera nome único (path contém uuid, não "foto.jpg")', async () => {
    uploadMock.mockClear();
    const { uploadProductImage } = await import('@/services/admin');
    await uploadProductImage(makeFile(JPEG_HEADER, 'nome-original-sensivel.jpg', 'image/jpeg'), 'produto-x');
    const uploadedPath = (uploadMock.mock.calls[0] as unknown as string[])[0];
    expect(uploadedPath).not.toContain('nome-original-sensivel');
    expect(uploadedPath).toMatch(/^produto-x\/[0-9a-f-]{36}\.jpg$/);
  });
});
