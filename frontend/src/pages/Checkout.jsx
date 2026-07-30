import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getPaymentConfig, createRazorpayOrder, verifyRazorpayPayment, loadRazorpayScript } from "../api";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", contact: "", address: "" });
  const [paidOrder, setPaidOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const shipping = 0;
  const total = subtotal + shipping;

  useEffect(() => {
    loadRazorpayScript();
    getPaymentConfig().then((c) => setGatewayEnabled(c.enabled)).catch(() => setGatewayEnabled(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || items.length === 0) return;

    setLoading(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) { setError("Could not load the payment gateway. Please check your connection and retry."); return; }

      const payload = {
        items: items.map((i) => ({ product_id: i.product_id, name: i.name, price: i.price, size: i.size, image: i.image, qty: i.qty })),
        name: form.name, email: form.email, address: form.address, contact: form.contact,
      };
      const data = await createRazorpayOrder(payload);

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Oblic",
        description: `Order ${data.order_number}`,
        order_id: data.razorpay_order_id,
        prefill: { name: form.name, email: form.email, contact: form.contact },
        notes: { order_number: data.order_number },
        theme: { color: "#2E2438" },
        handler: async (response) => {
          try {
            const res = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPaidOrder(res.order || { order_number: data.order_number, name: form.name, email: form.email, total: data.total });
            clear();
          } catch {
            setError("Payment was received but could not be verified. Please contact support with your payment reference.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setError(resp?.error?.description || "Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Something went wrong starting the payment. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (paidOrder) {
    return (
      <div className="container py-28 text-center max-w-lg" data-testid="order-confirmation">
        <CheckCircle2 size={52} className="mx-auto text-sage-deep" strokeWidth={1.3} />
        <h1 className="font-display text-4xl mt-6">Thank you, {paidOrder.name?.split(" ")[0] || "friend"}!</h1>
        <p className="text-ink-soft mt-3">Your payment was successful and order <span className="font-medium">#{paidOrder.order_number}</span> is confirmed. A confirmation has been sent to {paidOrder.email}.</p>
        <p className="font-display text-2xl mt-6">Paid: ₹{Number(paidOrder.total).toFixed(0)}</p>
        <Link to="/shop" className="inline-block mt-8 bg-plum text-cream px-8 py-4 rounded-full text-[13px] tracking-[0.12em] uppercase hover:bg-ink transition-colors">Continue Shopping</Link>
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
          <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Mobile number" inputMode="tel"
            data-testid="checkout-contact" className="w-full bg-paper border border-line rounded-full px-5 py-3.5 outline-none focus:border-ink" />
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Shipping address" rows={3}
            data-testid="checkout-address" className="w-full bg-paper border border-line rounded-[20px] px-5 py-3.5 outline-none focus:border-ink resize-none" />

          {!gatewayEnabled && (
            <div className="flex items-start gap-2 bg-cream-deep border border-line rounded-[14px] p-4 text-[13.5px] text-ink-soft" data-testid="gateway-disabled-note">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <span>Online payment is not active yet. Add your Razorpay API keys to enable secure card, UPI and netbanking payments.</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-[14px] p-4 text-[13.5px] text-red-700" data-testid="checkout-error">
              <AlertCircle size={17} className="shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading || items.length === 0 || !gatewayEnabled} data-testid="place-order-btn"
            className="w-full bg-plum text-cream py-4 rounded-full text-[13px] tracking-[0.14em] uppercase hover:bg-ink transition-colors disabled:opacity-50">
            {loading ? "Processing…" : `Pay ₹${total.toFixed(0)}`}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[12px] text-muted"><ShieldCheck size={14} /> Secure payment powered by Razorpay · UPI, Cards & Netbanking</p>
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
            <div className="flex justify-between font-display text-xl pt-2"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
