import React, { createContext, useContext, useEffect, useState } from "react";
import { useCustomer } from "./CustomerContext";
import { getWishlist, addToWishlist, removeFromWishlist } from "../api";

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { customer } = useCustomer();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!customer) { setItems([]); return; }
    getWishlist().then(setItems).catch(() => {});
  }, [customer]);

  const isWishlisted = (productId) => items.some((p) => p.id === productId);

  const toggleWishlistItem = async (product) => {
    if (!customer) return;
    if (isWishlisted(product.id)) {
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      try { await removeFromWishlist(product.id); } catch { getWishlist().then(setItems).catch(() => {}); }
    } else {
      setItems((prev) => [...prev, product]);
      try { await addToWishlist(product.id); } catch { getWishlist().then(setItems).catch(() => {}); }
    }
  };

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggleWishlistItem }}>
      {children}
    </WishlistContext.Provider>
  );
}
