export function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function discountPercent(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function stockLabel(stock: number, lowThreshold: number): { label: string; tone: 'ok' | 'low' | 'out' } {
  if (stock <= 0) return { label: 'Esgotado', tone: 'out' };
  if (stock <= lowThreshold) return { label: `Últimas ${stock} unidades`, tone: 'low' };
  return { label: 'Disponível', tone: 'ok' };
}

/** Formata número E.164 (ex: "5561996943237") como "+55 61 99694-3237" para exibição. */
export function formatPhoneBR(e164: string): string {
  const digits = e164.replace(/\D/g, '');
  const match = digits.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  if (!match) return e164;
  const [, ddd, first, second] = match;
  return `+55 ${ddd} ${first}-${second}`;
}
