import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatPrice } from '@/utils/format';
import { buildCartWhatsAppLink } from '@/utils/whatsapp';
import { createOrderFromCart } from '@/services/admin';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, clear } = useCart();
  const { settings } = useSiteSettings();
  const [checkingOut, setCheckingOut] = useState(false);

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      await createOrderFromCart(
        items.map(i => ({ productId: i.productId, variantId: i.variantId, name: i.name, size: i.size, price: i.price, quantity: i.quantity })),
        subtotal
      );
    } catch {
      // Se o registro do pedido falhar, ainda deixamos o cliente seguir pelo WhatsApp —
      // a venda não pode travar por causa de uma falha de log interno.
    }
    window.open(buildCartWhatsAppLink(settings, items, subtotal), '_blank', 'noreferrer');
    clear();
    setCheckingOut(false);
    closeCart();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-50 top-0 right-0 h-full w-full sm:w-[420px] bg-ink-950 border-l border-ink-800 flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-ink-800">
              <span className="text-display text-lg">Seu carrinho</span>
              <button onClick={closeCart} aria-label="Fechar carrinho">
                <X size={22} />
              </button>
            </div>

            {items.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Seu carrinho está vazio"
                description="Explore os drops e novidades para começar."
                action={
                  <Link to="/produtos" onClick={closeCart}>
                    <Button variant="secondary">Ver produtos</Button>
                  </Link>
                }
              />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
                  {items.map(item => (
                    <div key={item.variantId} className="flex gap-4">
                      <div className="w-20 h-24 rounded-sm overflow-hidden bg-ink-900 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="eyebrow">{item.brand}</span>
                        <span className="text-sm">{item.name}</span>
                        <span className="text-xs text-ink-400 mt-0.5">Tam {item.size}</span>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-ink-700 rounded-sm">
                            <button
                              className="w-7 h-7 flex items-center justify-center"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              aria-label="Diminuir quantidade"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              className="w-7 h-7 flex items-center justify-center disabled:opacity-30"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              aria-label="Aumentar quantidade"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                        {item.quantity >= item.maxStock && (
                          <span className="text-[11px] text-sale-500 mt-1">Estoque máximo atingido</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        aria-label="Remover item"
                        className="self-start text-ink-500 hover:text-sale-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-ink-800 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-300">Subtotal</span>
                    <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <Button variant="whatsapp" fullWidth onClick={handleCheckout} disabled={checkingOut}>
                    {checkingOut ? 'Abrindo WhatsApp…' : 'Finalizar pelo WhatsApp'}
                  </Button>
                  <p className="text-xs text-ink-500 text-center">
                    Frete e formas de pagamento são combinados diretamente no WhatsApp.
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
