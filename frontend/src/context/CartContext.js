import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lumina_cart")) || []; }
    catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("lumina_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, size, qty = 1) => {
    const key = `${product.id}-${size || "default"}`;
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...prev, {
        key,
        product_id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        size: size || null,
        image: product.images?.[0],
        qty,
      }];
    });
    setOpen(true);
  };

  const updateQty = (key, qty) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear, count, subtotal, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}
