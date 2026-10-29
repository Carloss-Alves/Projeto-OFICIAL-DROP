import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SizeSelector } from '@/components/product/SizeSelector';
import type { ProductVariant } from '@/types';

const variants: ProductVariant[] = [
  { id: 'v-p', product_id: 'p1', size: 'P', color: null, sku: null, stock: 4 },
  { id: 'v-m', product_id: 'p1', size: 'M', color: null, sku: null, stock: 0 },
];

describe('SizeSelector', () => {
  it('bloqueia seleção de tamanho sem estoque', () => {
    const onSelect = vi.fn();
    render(<SizeSelector variants={variants} selected={null} onSelect={onSelect} />);
    const mButton = screen.getByRole('button', { name: /Tamanho M \(esgotado\)/i });
    expect(mButton).toBeDisabled();
    fireEvent.click(mButton);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('permite selecionar tamanho disponível', () => {
    const onSelect = vi.fn();
    render(<SizeSelector variants={variants} selected={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tamanho P' }));
    expect(onSelect).toHaveBeenCalledWith(variants[0]);
  });
});
