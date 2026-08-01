import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { items, open, setOpen, updateQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 z-50" onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-paper z-50 flex flex-col"
            data-testid="cart-drawer"
          >
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="font-display text-2xl">Your Bag</h2>
              <button onClick={() => setOpen(false)} data-testid="cart-close" aria-label="Close"><X size={22} /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted">
                <ShoppingBag size={40} strokeWidth={1} />
                <p>Your bag is empty.</p>
                <button onClick={() => { setOpen(false); navigate("/shop"); }} className="text-ink underline underline-offset-4">Continue shopping</button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {items.map((i) => (
                    <div key={i.key} className="flex gap-4" data-testid={`cart-item-${i.product_id}`}>
                      <img src={i.image} alt={i.name} className="w-20 h-24 object-cover bg-cream-deep rounded-[2px]" />
                      <div className="flex-1">
                        <p className="text-[11px] tracking-[0.12em] uppercase text-muted">{i.brand}</p>
                        <h4 className="font-display text-[17px] leading-tight">{i.name}</h4>
                        {i.size && <p className="text-[13px] text-muted mt-0.5">{i.size}</p>}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-line rounded-full">
                            <button onClick={() => updateQty(i.key, i.qty - 1)} className="p-1.5" aria-label="Decrease"><Minus size={13} /></button>
                            <span className="w-7 text-center text-[13px]">{i.qty}</span>
                            <button onClick={() => updateQty(i.key, i.qty + 1)} className="p-1.5" aria-label="Increase"><Plus size={13} /></button>
                          </div>
                          <span className="text-[14px]">₹{(i.price * i.qty).toFixed(0)}</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(i.key)} className="text-muted hover:text-ink self-start" aria-label="Remove"><X size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-line space-y-4">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-ink-soft">Subtotal</span>
                    <span className="font-display text-xl">₹{subtotal.toFixed(0)}</span>
                  </div>
                  <button
                    onClick={() => { setOpen(false); navigate("/checkout"); }}
                    data-testid="checkout-btn"
                    className="w-full bg-plum text-cream py-4 rounded-full text-[13px] tracking-[0.14em] uppercase hover:bg-ink transition-colors"
                  >
                    Checkout
                  </button>
                  <p className="text-[12px] text-muted text-center">Your bag is saved, come back anytime to finish.</p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
