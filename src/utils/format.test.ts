import { describe, it, expect } from 'vitest';
import { formatPrice, discountPercent, stockLabel } from '@/utils/format';

describe('formatPrice', () => {
  it('formata número como moeda brasileira', () => {
    expect(formatPrice(199.9)).toContain('199,90');
  });
});

describe('discountPercent', () => {
  it('calcula desconto corretamente', () => {
    expect(discountPercent(199.9, 249.9)).toBe(20);
  });
  it('retorna null quando não há preço promocional', () => {
    expect(discountPercent(199.9, null)).toBeNull();
  });
  it('retorna null quando o preço comparado é menor ou igual', () => {
    expect(discountPercent(199.9, 100)).toBeNull();
  });
});

describe('stockLabel', () => {
  it('marca como esgotado quando estoque é zero', () => {
    expect(stockLabel(0, 3).tone).toBe('out');
  });
  it('marca como baixo estoque dentro do limite', () => {
    const result = stockLabel(2, 3);
    expect(result.tone).toBe('low');
    expect(result.label).toContain('2');
  });
  it('marca como disponível acima do limite', () => {
    expect(stockLabel(10, 3).tone).toBe('ok');
  });
});
