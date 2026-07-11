import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DELIVERY_FEE, FREE_DELIVERY_OVER } from '../api/client.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: Math.min(i.qty + qty, 50) } : i
        );
      }
      return [...prev, { product, qty }];
    });

  const setQty = (productId, qty) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, qty: Math.min(qty, 50) } : i))
    );

  const remove = (productId) => setItems((prev) => prev.filter((i) => i.product.id !== productId));
  const clear = () => setItems([]);

  const { count, subtotal, deliveryFee, total } = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
    return { count, subtotal, deliveryFee, total: subtotal + deliveryFee };
  }, [items]);

  const value = {
    items, count, subtotal, deliveryFee, total,
    add, setQty, remove, clear,
    open, setOpen,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
