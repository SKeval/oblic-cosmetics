import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api";

const INSTAMOJO_URL = "https://www.instamojo.com/@obliccosmetics/";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 59;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || items.length === 0) return;
    setLoading(true);
    try {
      const res = await createOrder({ items: items.map((i) => ({ product_id: i.product_id, name: i.name, price: i.price, size: i.size, image: i.image, qty: i.qty })), ...form });
      setOrder(res);
      clear();
    } finally { setLoading(false); }
  };

  if (order) {
    return (
      <div className="container py-28 text-center max-w-lg" data-testid="order-confirmation">
        <CheckCircle2 size={52} className="mx-auto text-sage-deep" strokeWidth={1.3} />
        <h1 className="font-display text-4xl mt-6">Almost there, {order.name.split(" ")[0]}!</h1>
        <p className="text-ink-soft mt-3">Your order <span className="font-medium">#{order.order_number}</span> has been placed. Complete your secure payment via Instamojo to confirm it.</p>
        <p className="font-display text-2xl mt-6">Amount to pay: ₹{order.total.toFixed(0)}</p>
        <a href={INSTAMOJO_URL} target="_blank" rel="noopener noreferrer" data-testid="pay-instamojo-btn"
          className="inline-flex items-center gap-2 mt-8 bg-plum text-cream px-8 py-4 rounded-full text-[13px] tracking-[0.12em] uppercase hover:bg-ink transition-colors">
          Pay ₹{order.total.toFixed(0)} on Instamojo <ExternalLink size={15} />
        </a>
        <div className="mt-5">
          <Link to="/shop" className="text-[13px] text-muted hover:text-ink underline underline-offset-4">Continue shopping</Link>
        </div>
        <p className="text-[12px] text-muted mt-6 max-w-sm mx-auto">You'll be redirected to Oblic's secure Instamojo page. Please mention your order number <span className="font-medium">#{order.order_number}</span> during payment.</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink mb-8"><ArrowLeft size={14} /> Back</button>
      <h1 className="font-display text-5xl mb-10">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <form onSubmit={submit} className="space-y-5" data-testid="checkout-form">
          <p className="text-[12px] tracking-[0.18em] uppercase text-muted">Contact & Shipping</p>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name"
            data-testid="checkout-name" className="w-full bg-paper border border-line rounded-full px-5 py-3.5 outline-none focus:border-ink" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address"
            data-testid="checkout-email" className="w-full bg-paper border border-line rounded-full px-5 py-3.5 outline-none focus:border-ink" />
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Shipping address" rows={3}
            data-testid="checkout-address" className="w-full bg-paper border border-line rounded-[20px] px-5 py-3.5 outline-none focus:border-ink resize-none" />
          <button type="submit" disabled={loading || items.length === 0} data-testid="place-order-btn"
            className="w-full bg-plum text-cream py-4 rounded-full text-[13px] tracking-[0.14em] uppercase hover:bg-ink transition-colors disabled:opacity-50">
            {loading ? "Processing…" : "Proceed to Payment"}
          </button>
          <p className="text-[12px] text-muted text-center">Secure payment powered by Instamojo · UPI, Cards & Netbanking</p>
        </form>

        <div className="bg-cream-deep/50 rounded-[3px] p-6 h-fit">
          <h2 className="font-display text-2xl mb-5">Order Summary</h2>
          {items.length === 0 ? <p className="text-muted text-[14px]">Your bag is empty.</p> : (
            <div className="space-y-4">
              {items.map((i) => (
                <div key={i.key} className="flex gap-3">
                  <img src={i.image} alt={i.name} className="w-14 h-16 object-cover rounded-[2px]" />
                  <div className="flex-1 text-[14px]">
                    <p className="font-display text-[16px] leading-tight">{i.name}</p>
                    <p className="text-muted text-[12px]">{i.size} · Qty {i.qty}</p>
                  </div>
                  <span className="text-[14px]">₹{(i.price * i.qty).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-line mt-6 pt-4 space-y-2 text-[14px]">
            <div className="flex justify-between"><span className="text-ink-soft">Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(0)}`}</span></div>
            <div className="flex justify-between font-display text-xl pt-2"><span>Total</span><span>₹{(subtotal + shipping).toFixed(0)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
