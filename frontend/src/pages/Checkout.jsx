import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft, ShieldCheck, AlertCircle, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useCustomer } from "../context/CustomerContext";
import { getPaymentConfig, createRazorpayOrder, verifyRazorpayPayment, cancelRazorpayOrder, loadRazorpayScript, saveAbandonedCart, customerAuthHeaders, getPincodeState, applyCoupon } from "../api";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];
const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;
const INDIAN_PINCODE_RE = /^[1-9]\d{5}$/;
const STATE_ALIASES = { pondicherry: "puducherry", orissa: "odisha", "nct of delhi": "delhi" };
const normalizeStateName = (s) => {
  const key = s.trim().toLowerCase();
  return STATE_ALIASES[key] || key;
};

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", contact: "", address: "", pincode: "", state: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [pincodeState, setPincodeState] = useState({ pincode: "", state: null, checking: false });
  const [paidOrder, setPaidOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const shipping = 0;
  const discount = appliedCoupon?.discount_amount || 0;
  const total = Math.max(subtotal - discount + shipping, 0);

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponInput.trim()) return;
    if (!form.email.trim()) {
      setCouponError("Enter your email above first, then apply the code.");
      return;
    }
    setCouponLoading(true);
    try {
      const applied = await applyCoupon(couponInput.trim(), form.email.trim(), subtotal);
      setAppliedCoupon(applied);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err?.response?.data?.detail || "Couldn't apply that code. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  // Resolved via the pincode -> state lookup once the pincode field is complete and valid.
  const pincodeStateMismatch = () => {
    if (!form.state || pincodeState.pincode !== form.pincode.trim() || !pincodeState.state) return null;
    if (normalizeStateName(pincodeState.state) === normalizeStateName(form.state)) return null;
    return `This PIN code belongs to ${pincodeState.state}, not ${form.state}. Please check your address.`;
  };

  const checkPincode = async () => {
    const pin = form.pincode.trim();
    if (!INDIAN_PINCODE_RE.test(pin)) return;
    setPincodeState({ pincode: pin, state: null, checking: true });
    try {
      const { state } = await getPincodeState(pin);
      setPincodeState({ pincode: pin, state: state || null, checking: false });
    } catch {
      setPincodeState({ pincode: pin, state: null, checking: false });
    }
  };

  // Keeps the pincode error in sync as either the lookup result or the chosen state changes,
  // so the mismatch shows up immediately rather than only after a submit attempt.
  useEffect(() => {
    setFieldErrors((f) => {
      const mismatch = pincodeStateMismatch();
      if (mismatch) return { ...f, pincode: mismatch };
      if (f.pincode?.startsWith("This PIN code belongs to")) {
        const { pincode, ...rest } = f;
        return rest;
      }
      return f;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.state, pincodeState]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!form.email.trim()) errs.email = "Please enter your email.";
    if (!INDIAN_MOBILE_RE.test(form.contact.trim())) errs.contact = "Enter a valid 10-digit Indian mobile number.";
    if (!form.address.trim()) errs.address = "Please enter your shipping address.";
    if (!INDIAN_PINCODE_RE.test(form.pincode.trim())) {
      errs.pincode = "Enter a valid 6-digit PIN code.";
    } else {
      const mismatch = pincodeStateMismatch();
      if (mismatch) errs.pincode = mismatch;
    }
    if (!INDIAN_STATES.includes(form.state)) errs.state = "Please select your state.";
    return errs;
  };

  useEffect(() => {
    if (customer) {
      setForm((f) => ({ ...f, name: f.name || customer.name, email: f.email || customer.email }));
    }
  }, [customer]);

  const captureAbandoned = () => {
    if (!form.email || items.length === 0) return;
    saveAbandonedCart({
      email: form.email,
      name: form.name,
      items: items.map((i) => ({ product_id: i.product_id, name: i.name, price: i.price, size: i.size, image: i.image, qty: i.qty })),
    }).catch(() => {});
  };

  useEffect(() => {
    loadRazorpayScript();
    getPaymentConfig().then((c) => setGatewayEnabled(c.enabled)).catch(() => setGatewayEnabled(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) return;

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) { setError("Could not load the payment gateway. Please check your connection and retry."); return; }

      const payload = {
        items: items.map((i) => ({ product_id: i.product_id, name: i.name, price: i.price, size: i.size, image: i.image, qty: i.qty })),
        name: form.name, email: form.email, address: form.address, contact: form.contact,
        pincode: form.pincode, state: form.state,
        coupon_code: appliedCoupon?.code || undefined,
      };
      const data = await createRazorpayOrder(payload, customer ? customerAuthHeaders() : undefined);

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
        modal: {
          ondismiss: () => {
            // Closed the checkout without paying — mark the pending order cancelled rather
            // than leaving it stuck as "created" forever in the admin dashboard. The backend
            // only flips orders still in "created", so this can never clobber a real payment.
            cancelRazorpayOrder(data.razorpay_order_id).catch(() => {});
            setLoading(false);
          },
        },
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
        <Link to="/#shop" className="inline-block mt-8 bg-plum text-cream px-8 py-4 rounded-full text-[13px] tracking-[0.12em] uppercase hover:bg-ink transition-colors">Continue Shopping</Link>
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

          <div className="space-y-1.5">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name"
              data-testid="checkout-name" className="w-full bg-paper border border-line rounded-full px-5 py-3.5 outline-none focus:border-ink" />
            {fieldErrors.name && <p className="text-red-600 text-[12.5px] pl-1" data-testid="err-name">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={captureAbandoned} placeholder="Email address"
              data-testid="checkout-email" className="w-full bg-paper border border-line rounded-full px-5 py-3.5 outline-none focus:border-ink" />
            {fieldErrors.email && <p className="text-red-600 text-[12.5px] pl-1" data-testid="err-email">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center bg-paper border border-line rounded-full pl-5 pr-1 focus-within:border-ink">
              <span className="text-ink-soft text-[15px] pr-2 border-r border-line mr-2">+91</span>
              <input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                placeholder="10-digit mobile number" inputMode="numeric" maxLength={10}
                data-testid="checkout-contact" className="flex-1 bg-transparent py-3.5 outline-none" />
            </div>
            {fieldErrors.contact && <p className="text-red-600 text-[12.5px] pl-1" data-testid="err-contact">{fieldErrors.contact}</p>}
          </div>

          <div className="space-y-1.5">
            <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Shipping address" rows={3}
              data-testid="checkout-address" className="w-full bg-paper border border-line rounded-[20px] px-5 py-3.5 outline-none focus:border-ink resize-none" />
            {fieldErrors.address && <p className="text-red-600 text-[12.5px] pl-1" data-testid="err-address">{fieldErrors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                onBlur={checkPincode} placeholder="Pincode" inputMode="numeric" maxLength={6}
                data-testid="checkout-pincode" className="w-full bg-paper border border-line rounded-full px-5 py-3.5 outline-none focus:border-ink" />
              {pincodeState.checking && <p className="text-muted text-[12.5px] pl-1" data-testid="pincode-checking">Verifying pincode…</p>}
              {fieldErrors.pincode && <p className="text-red-600 text-[12.5px] pl-1" data-testid="err-pincode">{fieldErrors.pincode}</p>}
            </div>
            <div className="space-y-1.5">
              <select required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                data-testid="checkout-state" className="w-full bg-paper border border-line rounded-full px-5 py-3.5 outline-none focus:border-ink cursor-pointer">
                <option value="" disabled>Select state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {fieldErrors.state && <p className="text-red-600 text-[12.5px] pl-1" data-testid="err-state">{fieldErrors.state}</p>}
            </div>
          </div>

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

          <div className="mt-6 pt-4 border-t border-line">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-sage/40 border border-sage-deep/40 rounded-full pl-4 pr-2 py-2" data-testid="coupon-applied">
                <span className="text-[13px] text-ink flex items-center gap-1.5">
                  <Check size={14} className="text-sage-deep" /> <strong>{appliedCoupon.code}</strong> applied — {appliedCoupon.percent}% off
                </span>
                <button type="button" onClick={removeCoupon} data-testid="coupon-remove"
                  className="text-[12px] text-muted hover:text-ink underline underline-offset-2 px-2">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Coupon code"
                  data-testid="coupon-input" className="flex-1 min-w-0 bg-paper border border-line rounded-full px-4 py-2.5 text-[13.5px] outline-none focus:border-ink" />
                <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()} data-testid="coupon-apply-btn"
                  className="text-[12px] tracking-[0.1em] uppercase border border-ink rounded-full px-5 py-2.5 hover:bg-ink hover:text-cream transition-colors disabled:opacity-50 whitespace-nowrap">
                  {couponLoading ? "…" : "Apply"}
                </button>
              </div>
            )}
            {couponError && <p className="text-red-600 text-[12.5px] mt-2 pl-1" data-testid="coupon-error">{couponError}</p>}
          </div>

          <div className="border-t border-line mt-4 pt-4 space-y-2 text-[14px]">
            <div className="flex justify-between"><span className="text-ink-soft">Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-sage-deep"><span>Discount ({appliedCoupon.code})</span><span>−₹{discount.toFixed(0)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-ink-soft">Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(0)}`}</span></div>
            <div className="flex justify-between font-display text-xl pt-2"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
