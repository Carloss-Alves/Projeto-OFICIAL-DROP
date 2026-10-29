import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'asfalto:cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(newItem: CartItem) {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === newItem.variantId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + newItem.quantity, existing.maxStock);
        return prev.map(i => (i.variantId === newItem.variantId ? { ...i, quantity: nextQty } : i));
      }
      return [...prev, { ...newItem, quantity: Math.min(newItem.quantity, newItem.maxStock) }];
    });
    setIsOpen(true);
  }

  function removeItem(variantId: string) {
    setItems(prev => prev.filter(i => i.variantId !== variantId));
  }

  function updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) return removeItem(variantId);
    setItems(prev =>
      prev.map(i => (i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i))
    );
  }

  function clear() {
    setItems([]);
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
        addItem, removeItem, updateQuantity, clear, subtotal, count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>');
  return ctx;
}
