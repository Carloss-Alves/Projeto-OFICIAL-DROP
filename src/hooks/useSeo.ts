import { useEffect } from 'react';

/**
 * Define document.title e a meta description da página atual, restaurando
 * os valores padrão do site ao desmontar. Evita depender de uma lib extra
 * de "head management" só para isso.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute('content') ?? '';
    if (description && metaDescription) metaDescription.setAttribute('content', description);

    return () => {
      document.title = previousTitle;
      if (metaDescription) metaDescription.setAttribute('content', previousDescription);
    };
  }, [title, description]);
}

/** Injeta JSON-LD de Product (schema.org) para SEO e rich snippets. */
export function useProductStructuredData(data: {
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand: string;
  price: number;
  currency?: string;
  availability: 'InStock' | 'OutOfStock';
  url: string;
} | null) {
  useEffect(() => {
    if (!data) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: data.name,
      description: data.description,
      image: data.image,
      sku: data.sku,
      brand: { '@type': 'Brand', name: data.brand },
      offers: {
        '@type': 'Offer',
        url: data.url,
        priceCurrency: data.currency ?? 'BRL',
        price: data.price,
        availability: `https://schema.org/${data.availability}`,
      },
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [data]);
}
