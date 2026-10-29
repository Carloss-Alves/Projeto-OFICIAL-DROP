import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import type { CartItem } from '@/types';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'p1', variantId: 'v1', name: 'Camiseta Nike', brand: 'Nike', image: '',
    size: 'M', price: 100, quantity: 1, slug: 'camiseta-nike', maxStock: 3, ...overrides,
  };
}

describe('CartContext', () => {
  beforeEach(() => localStorage.clear());

  it('adiciona item ao carrinho', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(makeItem()));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(1);
  });

  it('soma quantidade ao adicionar o mesmo variant novamente', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(makeItem()));
    act(() => result.current.addItem(makeItem()));
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('nunca ultrapassa o estoque máximo do variant', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(makeItem({ maxStock: 2 })));
    act(() => result.current.updateQuantity('v1', 10));
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('remove item quando quantidade cai para zero', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(makeItem()));
    act(() => result.current.updateQuantity('v1', 0));
    expect(result.current.items).toHaveLength(0);
  });

  it('calcula subtotal corretamente', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(makeItem({ price: 100, quantity: 2, maxStock: 5 })));
    expect(result.current.subtotal).toBe(200);
  });

  it('persiste itens no localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(makeItem()));
    const stored = JSON.parse(localStorage.getItem('asfalto:cart') ?? '[]');
    expect(stored).toHaveLength(1);
  });
});
