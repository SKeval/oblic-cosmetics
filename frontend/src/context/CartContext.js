import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomer } from "./CustomerContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const PENDING_ADD_KEY = "oblic_pending_cart_add";

export function CartProvider({ children }) {
  const { customer, loading: customerLoading } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("oblic_cart")) || []; }
    catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("oblic_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product, size, qty = 1) => {
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

  // Adding to the cart requires being logged in. If not, stash the intended item and
  // send the shopper to sign in/create an account; the effect below finishes the add
  // automatically once they're authenticated, then they're returned to where they were.
  const addItem = (product, size, qty = 1) => {
    if (!customer) {
      sessionStorage.setItem(PENDING_ADD_KEY, JSON.stringify({ product, size, qty }));
      navigate(`/account?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    addToCart(product, size, qty);
  };

  useEffect(() => {
    if (customerLoading || !customer) return;
    const raw = sessionStorage.getItem(PENDING_ADD_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_ADD_KEY);
    try {
      const { product, size, qty } = JSON.parse(raw);
      addToCart(product, size, qty);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, customerLoading]);

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
