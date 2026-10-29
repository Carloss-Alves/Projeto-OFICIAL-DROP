import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  adminFetchAllProducts, adminSaveProduct, uploadProductImage, type ProductFormInput,
} from '@/services/admin';
import { adminFetchBrands, adminFetchCategories } from '@/services/admin';
import type { Brand, Category } from '@/types';
import { Field, inputClass, textareaClass } from '@/components/admin/Field';
import { ImageUploader, type UploadableImage } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const APPAREL_SIZES = ['P', 'M', 'G', 'GG'];
const SHOE_SIZES = ['39', '40', '41', '42', '43', '44'];

interface VariantRow { size: string; stock: number }

const FLAGS: { key: keyof ProductFormInput; label: string }[] = [
  { key: 'is_new', label: 'Produto novo' },
  { key: 'is_featured', label: 'Em destaque' },
  { key: 'is_best_seller', label: 'Mais vendido' },
  { key: 'is_limited', label: 'Edição limitada' },
  { key: 'is_sale', label: 'Em promoção' },
  { key: 'show_on_home', label: 'Mostrar na Home' },
  { key: 'is_active', label: 'Ativo (visível na loja)' },
];

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'novo';
  const navigate = useNavigate();
  const { notify } = useToast();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [composition, setComposition] = useState('');
  const [price, setPrice] = useState('');
  const [compareAt, setCompareAt] = useState('');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState('');
  const [sizeKind, setSizeKind] = useState<'apparel' | 'shoe'>('apparel');
  const [variants, setVariants] = useState<VariantRow[]>(APPAREL_SIZES.map(size => ({ size, stock: 0 })));
  const [lowStockThreshold, setLowStockThreshold] = useState('3');
  const [images, setImages] = useState<UploadableImage[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({
    is_new: false, is_featured: false, is_best_seller: false, is_limited: false, is_sale: false, show_on_home: true, is_active: true,
  });

  useEffect(() => {
    Promise.all([adminFetchBrands(), adminFetchCategories()])
      .then(([b, c]) => { setBrands(b); setCategories(c); })
      .catch(e => notify(e.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isNew) return;
    adminFetchAllProducts().then(all => {
      const product = all.find(p => p.id === id);
      if (!product) { notify('Produto não encontrado.', 'error'); navigate('/admin/produtos'); return; }
      setName(product.name);
      setSlug(product.slug);
      setSlugTouched(true);
      setBrandId(product.brand?.id ?? '');
      setCategoryId(product.category?.id ?? '');
      setDescription(product.description);
      setDetails(product.details ?? '');
      setComposition(product.composition ?? '');
      setPrice(String(product.price));
      setCompareAt(product.compare_at_price ? String(product.compare_at_price) : '');
      setSku(product.sku ?? '');
      setTags(product.tags.join(', '));
      setLowStockThreshold(String(product.low_stock_threshold));
      const isShoe = product.variants.some(v => SHOE_SIZES.includes(v.size));
      setSizeKind(isShoe ? 'shoe' : 'apparel');
      setVariants(product.variants.map(v => ({ size: v.size, stock: v.stock })));
      setImages(product.images.map(img => ({ id: img.id, url: img.url, alt: img.alt ?? '', isPrimary: img.is_primary })));
      setFlags({
        is_new: product.is_new, is_featured: product.is_featured, is_best_seller: product.is_best_seller,
        is_limited: product.is_limited, is_sale: product.is_sale, show_on_home: product.show_on_home, is_active: product.is_active,
      });
      setLoading(false);
    }).catch(e => { notify(e.message, 'error'); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!slugTouched && name) setSlug(slugify(name));
  }, [name, slugTouched]);

  function handleSizeKindChange(kind: 'apparel' | 'shoe') {
    setSizeKind(kind);
    setVariants((kind === 'apparel' ? APPAREL_SIZES : SHOE_SIZES).map(size => ({ size, stock: 0 })));
  }

  function updateVariantStock(size: string, stock: number) {
    setVariants(prev => prev.map(v => (v.size === size ? { ...v, stock: Math.max(0, stock) } : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !price) {
      notify('Preencha nome, slug e preço.', 'error');
      return;
    }
    if (Number(price) < 0 || (compareAt && Number(compareAt) < 0)) {
      notify('Preço não pode ser negativo.', 'error');
      return;
    }
    if (variants.some(v => v.stock < 0)) {
      notify('Estoque não pode ser negativo.', 'error');
      return;
    }
    if (images.some(i => i.uploading)) {
      notify('Aguarde o upload das imagens terminar.', 'error');
      return;
    }
    setSaving(true);
    try {
      const input: ProductFormInput = {
        id: isNew ? undefined : id,
        slug,
        name,
        brand_id: brandId || null,
        category_id: categoryId || null,
        description,
        details,
        composition,
        price: Number(price),
        compare_at_price: compareAt ? Number(compareAt) : null,
        sku,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        is_new: flags.is_new, is_featured: flags.is_featured, is_best_seller: flags.is_best_seller,
        is_limited: flags.is_limited, is_sale: flags.is_sale, is_active: flags.is_active, show_on_home: flags.show_on_home,
        low_stock_threshold: Number(lowStockThreshold) || 3,
        drop_id: null,
        related_product_ids: [],
        complete_the_look_ids: [],
        images: images.map((img, i) => ({ url: img.url, alt: img.alt || name, position: i, is_primary: img.isPrimary })),
        variants: variants.map(v => ({ size: v.size, color: null, stock: v.stock })),
      };
      await adminSaveProduct(input);
      notify(isNew ? 'Produto cadastrado com sucesso.' : 'Produto atualizado.');
      navigate('/admin/produtos');
    } catch (err: any) {
      notify(err.message ?? 'Erro ao salvar produto.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-ink-400 text-sm">Carregando produto…</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <h1 className="text-display text-3xl mb-8">{isNew ? 'Novo produto' : 'Editar produto'}</h1>

      <div className="flex flex-col gap-6 bg-ink-900/40 border border-ink-800 rounded-md p-5 mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-300">Fotos do produto</span>
        <ImageUploader images={images} onChange={setImages} onUpload={file => uploadProductImage(file, slug || 'produto')} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <Field label="Nome do produto">
          <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="URL amigável (slug)" hint="/produto/{slug}">
          <input className={inputClass} value={slug} onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} required />
        </Field>
        <Field label="Marca">
          <select className={inputClass} value={brandId} onChange={e => setBrandId(e.target.value)}>
            <option value="">Selecione…</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="Categoria">
          <select className={inputClass} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Selecione…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Preço (R$)">
          <input className={inputClass} type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} required />
        </Field>
        <Field label="Preço promocional (R$)" hint="Opcional — mostrado riscado com desconto">
          <input className={inputClass} type="number" step="0.01" min="0" value={compareAt} onChange={e => setCompareAt(e.target.value)} />
        </Field>
        <Field label="SKU">
          <input className={inputClass} value={sku} onChange={e => setSku(e.target.value)} />
        </Field>
      </div>

      <div className="flex flex-col gap-5 mb-6">
        <Field label="Descrição">
          <textarea className={textareaClass} rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        </Field>
        <Field label="Detalhes" hint="Ex: bolsos, fechos, tecnologia do tecido">
          <textarea className={textareaClass} rows={2} value={details} onChange={e => setDetails(e.target.value)} />
        </Field>
        <Field label="Composição">
          <input className={inputClass} value={composition} onChange={e => setComposition(e.target.value)} placeholder="Ex: 100% algodão" />
        </Field>
        <Field label="Tags" hint="Separadas por vírgula — usadas na busca">
          <input className={inputClass} value={tags} onChange={e => setTags(e.target.value)} placeholder="nike, camiseta, preta" />
        </Field>
      </div>

      <div className="bg-ink-900/40 border border-ink-800 rounded-md p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-300">Tamanhos e estoque</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleSizeKindChange('apparel')} className={`text-xs px-3 py-1.5 rounded-sm ${sizeKind === 'apparel' ? 'bg-ink-100 text-ink-950' : 'bg-ink-800'}`}>Roupa (P–GG)</button>
            <button type="button" onClick={() => handleSizeKindChange('shoe')} className={`text-xs px-3 py-1.5 rounded-sm ${sizeKind === 'shoe' ? 'bg-ink-100 text-ink-950' : 'bg-ink-800'}`}>Calçado (39–44)</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {variants.map(v => (
            <div key={v.size} className="flex items-center justify-between gap-2 bg-ink-900 border border-ink-700 rounded-sm px-3 h-11">
              <span className="text-sm font-medium">{v.size}</span>
              <input
                type="number"
                min={0}
                value={v.stock}
                onChange={e => updateVariantStock(v.size, Number(e.target.value))}
                className="w-16 bg-transparent text-right outline-none text-sm"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 max-w-[200px]">
          <Field label="Limite p/ 'últimas peças'">
            <input className={inputClass} type="number" min={0} value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="bg-ink-900/40 border border-ink-800 rounded-md p-5 mb-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-300 mb-4 block">Sinalizações</span>
        <div className="grid sm:grid-cols-2 gap-3">
          {FLAGS.map(f => (
            <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={flags[f.key as string]}
                onChange={() => setFlags(prev => ({ ...prev, [f.key]: !prev[f.key as string] }))}
                className="accent-signal-500"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Salvando…' : isNew ? 'Cadastrar produto' : 'Salvar alterações'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/admin/produtos')}>Cancelar</Button>
      </div>
    </form>
  );
}
