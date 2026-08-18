import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, IndianRupee, ShoppingCart, CheckCircle2, RefreshCw, Lock, LogOut, Plus, Pencil, Trash2, X, Star } from "lucide-react";
import {
  getAdminOrders, updateOrderStatus, updateOrderTracking, getAbandonedCarts, getAdminStats, adminLogin, adminMe, setAdminToken,
  getProducts, createProduct, updateProduct, deleteProduct, uploadImage,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
} from "../api";

// "fulfilled" is kept as the stored status value (existing orders already use it) - only
// the label shown to the founder changed to "Delivered", which is the term she actually uses.
const STATUS_OPTIONS = ["created", "paid", "fulfilled", "cancelled", "verification_failed"];

const STATUS_LABELS = {
  created: "Created",
  paid: "Paid",
  fulfilled: "Delivered",
  cancelled: "Cancelled",
  verification_failed: "Verification Failed",
};

const STATUS_STYLE = {
  paid: "bg-green-100 text-green-800",
  created: "bg-amber-100 text-amber-800",
  fulfilled: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-700",
  verification_failed: "bg-red-100 text-red-700",
};

const ORDER_STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "fulfilled", label: "Delivered" },
  { key: "created", label: "Created" },
  { key: "cancelled", label: "Cancelled" },
  { key: "verification_failed", label: "Verification Failed" },
];

const BADGE_OPTIONS = ["", "Best Seller", "New", "Limited Offer", "Award Winning", "20% Off"];

const EMPTY_PRODUCT_FORM = {
  name: "", category: "", price: "", compare_at_price: "", on_sale: false, badge: "", in_stock: true,
  images: [], sizes: "", description: "", benefits: "", how_to_use: "", ingredients: "", detail: "",
};

function productToForm(p) {
  return {
    name: p.name || "", category: p.category || "", price: p.price ?? "", compare_at_price: p.compare_at_price ?? "",
    on_sale: !!p.on_sale, badge: p.badges?.[0] || "", in_stock: p.in_stock !== false,
    images: p.images || [], sizes: (p.sizes || []).join(", "),
    description: p.description || "", benefits: (p.benefits || []).join("\n"),
    how_to_use: p.how_to_use || "", ingredients: p.ingredients || "", detail: p.detail || "",
  };
}

function formToPayload(f) {
  return {
    name: f.name.trim(),
    category: f.category.trim(),
    price: Number(f.price),
    compare_at_price: f.compare_at_price === "" ? null : Number(f.compare_at_price),
    on_sale: f.on_sale,
    in_stock: f.in_stock,
    badges: f.badge ? [f.badge] : [],
    images: f.images.filter(Boolean),
    sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    description: f.description.trim(),
    benefits: f.benefits.split("\n").map((s) => s.trim()).filter(Boolean),
    how_to_use: f.how_to_use.trim(),
    ingredients: f.ingredients.trim(),
    detail: f.detail.trim(),
  };
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[12px] tracking-[0.12em] uppercase text-muted mb-2">{label}</label>
      {children}
    </div>
  );
}

function ImageUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > 8 * 1024 * 1024) {
          setError(`"${file.name}" is over 8MB and was skipped.`);
          continue;
        }
        const { url } = await uploadImage(file);
        uploaded.push(url);
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
    } catch (err) {
      setError("Couldn't upload one or more photos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (i) => onChange(images.filter((_, idx) => idx !== i));
  const makeMain = (i) => {
    const next = [...images];
    const [item] = next.splice(i, 1);
    onChange([item, ...next]);
  };

  return (
    <div>
      <label className="block text-[12px] tracking-[0.12em] uppercase text-muted mb-2">Product Photos</label>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url + i} className="relative w-24 h-24 rounded-[8px] overflow-hidden border border-line group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 flex items-center gap-1 bg-ink text-cream text-[9px] px-1.5 py-0.5 rounded-full">
                <Star size={9} fill="currentColor" /> Main
              </span>
            )}
            {i !== 0 && (
              <button type="button" onClick={() => makeMain(i)}
                className="absolute inset-x-0 bottom-0 bg-ink/70 text-cream text-[9px] py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Make main
              </button>
            )}
            <button type="button" onClick={() => removeAt(i)} aria-label="Remove photo"
              className="absolute top-1 right-1 bg-ink/70 text-cream rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={12} />
            </button>
          </div>
        ))}
        <label
          data-testid="product-image-upload"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
          className={`w-24 h-24 rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer text-muted hover:text-ink hover:border-ink transition-colors ${dragOver ? "border-ink text-ink bg-cream" : "border-line"}`}
        >
          {uploading ? <RefreshCw size={18} className="animate-spin" /> : (
            <>
              <Plus size={18} />
              <span className="text-[10px] mt-1 text-center px-1">Add Photo</span>
            </>
          )}
          <input type="file" accept="image/*" multiple hidden disabled={uploading}
            onChange={(e) => { uploadFiles(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      <p className="text-[11px] text-muted mt-2">First photo is used as the main listing image. Hover a photo to remove it or make it the main one.</p>
      {error && <p className="text-red-600 text-[12px] mt-1">{error}</p>}
    </div>
  );
}

function ProductForm({ initial, onCancel, onSaved }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(initial ? productToForm(initial) : EMPTY_PRODUCT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.category.trim() || !form.price) {
      setError("Name, category and price are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = formToPayload(form);
      const saved = isEdit ? await updateProduct(initial.id, payload) : await createProduct(payload);
      onSaved(saved);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not save the product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-start justify-center overflow-y-auto py-10 px-4" data-testid="product-form-overlay">
      <div className="bg-paper rounded-[4px] w-full max-w-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl">{isEdit ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onCancel} aria-label="Close" data-testid="product-form-close"><X size={22} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Product Name">
              <input required value={form.name} onChange={set("name")} placeholder="e.g. Niacinamide Face Serum" data-testid="product-name"
                className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            </Field>
            <Field label="Category">
              <input required value={form.category} onChange={set("category")} placeholder="e.g. Skincare" data-testid="product-category"
                className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Price (₹)">
              <input required type="number" min="1" step="0.01" value={form.price} onChange={set("price")} placeholder="e.g. 540" data-testid="product-price"
                className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            </Field>
            <Field label="Compare-at Price (₹)">
              <input type="number" min="0" step="0.01" value={form.compare_at_price} onChange={set("compare_at_price")} placeholder="Optional, e.g. 675" data-testid="product-compare-price"
                className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            </Field>
            <Field label="Badge">
              <select value={form.badge} onChange={set("badge")} data-testid="product-badge"
                className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink cursor-pointer">
                {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b || "No badge"}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.on_sale} onChange={(e) => setForm({ ...form, on_sale: e.target.checked })} data-testid="product-on-sale" />
              On sale (shows on the Offers page)
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} data-testid="product-in-stock" />
              In stock (uncheck to hide "Add to Cart" and show "Out of Stock")
            </label>
          </div>
          <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
          <Field label="Sizes">
            <input value={form.sizes} onChange={set("sizes")} placeholder="Comma separated, e.g. 100ml, 200ml" data-testid="product-sizes"
              className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
          </Field>
          <Field label="Description">
            <textarea required value={form.description} onChange={set("description")} placeholder="Shown on the product page" rows={3} data-testid="product-description"
              className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />
          </Field>
          <Field label="Benefits">
            <textarea value={form.benefits} onChange={set("benefits")} placeholder="One per line" rows={3} data-testid="product-benefits"
              className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />
          </Field>
          <Field label="How to Use">
            <textarea value={form.how_to_use} onChange={set("how_to_use")} placeholder="e.g. Apply 2-3 drops to clean, dry skin" rows={2} data-testid="product-how-to-use"
              className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />
          </Field>
          <Field label="Ingredients">
            <textarea value={form.ingredients} onChange={set("ingredients")} placeholder="e.g. Niacinamide, Hyaluronic Acid, Glycerin" rows={2} data-testid="product-ingredients"
              className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />
          </Field>
          <Field label="Additional Detail">
            <textarea value={form.detail} onChange={set("detail")} placeholder="e.g. size, storage instructions" rows={2} data-testid="product-detail"
              className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />
          </Field>

          {error && <p className="text-red-600 text-[13px]" data-testid="product-form-error">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} data-testid="product-form-submit"
              className="bg-plum text-cream px-6 py-3 rounded-full text-[13px] tracking-[0.12em] uppercase hover:bg-ink transition-colors disabled:opacity-50">
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
            </button>
            <button type="button" onClick={onCancel} className="text-[13px] text-muted hover:text-ink underline underline-offset-4">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TrackingCell({ order, onSaved }) {
  const [carrier, setCarrier] = useState(order.carrier || "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Keep in sync if this order's tracking gets updated elsewhere (e.g. a fresh admin_orders load).
  useEffect(() => {
    setCarrier(order.carrier || "");
    setTrackingNumber(order.tracking_number || "");
  }, [order.carrier, order.tracking_number]);

  const dirty = carrier !== (order.carrier || "") || trackingNumber !== (order.tracking_number || "");

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      const updated = await updateOrderTracking(order.id, trackingNumber.trim(), carrier.trim());
      onSaved(updated);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[150px]">
      <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Carrier"
        data-testid={`order-carrier-${order.order_number}`}
        className="bg-paper border border-line rounded-full px-3 py-1.5 text-[12px] outline-none focus:border-ink" />
      <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking number"
        data-testid={`order-tracking-${order.order_number}`}
        className="bg-paper border border-line rounded-full px-3 py-1.5 text-[12px] outline-none focus:border-ink" />
      <button type="button" onClick={save} disabled={!dirty || saving} data-testid={`order-tracking-save-${order.order_number}`}
        className="text-[11px] tracking-[0.08em] uppercase border border-ink rounded-full px-3 py-1.5 transition-colors hover:bg-ink hover:text-cream disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink">
        {saving ? "Saving…" : savedFlash ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}

function OrdersView({ orders, changeStatus, setOrders }) {
  const [orderTab, setOrderTab] = useState("paid");
  const counts = ORDER_STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "all" ? orders.length : orders.filter((o) => o.status === t.key).length;
    return acc;
  }, {});
  const visible = orderTab === "all" ? orders : orders.filter((o) => o.status === orderTab);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6" data-testid="order-status-tabs">
        {ORDER_STATUS_TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setOrderTab(t.key)} data-testid={`order-tab-${t.key}`}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-[13px] tracking-wide transition-colors ${
              orderTab === t.key ? "text-cream" : "bg-cream-deep text-ink-soft hover:text-ink"
            }`}>
            {orderTab === t.key && (
              <motion.span layoutId="order-tab-pill" className="absolute inset-0 rounded-full bg-ink -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            {t.label}
            <span className={`text-[11px] ${orderTab === t.key ? "text-cream/70" : "text-muted"}`}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted py-16 text-center">No orders here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" data-testid="orders-table">
            <thead>
              <tr className="text-left text-muted text-[12px] tracking-[0.1em] uppercase border-b border-line">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Ship To</th>
                <th className="py-3 pr-4">Items</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Tracking</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((o) => (
                  <motion.tr key={o.id} layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.25 }}
                    className={`border-b align-top ${o.status === "paid" ? "bg-green-50/70 border-green-100" : "border-line/60"}`}
                    data-testid={`order-row-${o.order_number}`}>
                    <td className="py-4 pr-4 font-medium">#{o.order_number}</td>
                    <td className="py-4 pr-4">
                      <div>{o.name}</div>
                      <div className="text-muted text-[12px]">{o.email}</div>
                      {o.contact && <div className="text-muted text-[12px]">{o.contact}</div>}
                    </td>
                    <td className="py-4 pr-4 max-w-[220px] text-[13px]">
                      {o.address ? (
                        <>
                          <div>{o.address}</div>
                          <div className="text-muted">{[o.pincode, o.state].filter(Boolean).join(", ")}</div>
                        </>
                      ) : <span className="text-muted">-</span>}
                    </td>
                    <td className="py-4 pr-4 max-w-[260px]">
                      {(o.items || []).map((it, i) => (
                        <div key={i} className="text-ink-soft text-[13px]">{it.qty}× {it.name} {it.size ? `(${it.size})` : ""}</div>
                      ))}
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap">₹{Number(o.total).toFixed(0)}</td>
                    <td className="py-4 pr-4 text-muted text-[13px] whitespace-nowrap">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}</td>
                    <td className="py-4 pr-4">
                      <span className={`inline-block text-[11px] px-2.5 py-1 rounded-full mb-2 ${STATUS_STYLE[o.status] || "bg-cream-deep text-ink"}`}>{STATUS_LABELS[o.status] || o.status}</span>
                      <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)} data-testid={`order-status-${o.order_number}`}
                        className="block bg-paper border border-line rounded-full px-3 py-1.5 text-[12px] outline-none cursor-pointer">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="py-4 pr-4">
                      <TrackingCell order={o} onSaved={(updated) => setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, ...updated } : x)))} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CouponForm({ initial, onCancel, onSaved }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(initial ? {
    code: initial.code, percent: initial.percent, first_order_only: initial.first_order_only,
    active: initial.active, expires_at: initial.expires_at ? initial.expires_at.slice(0, 10) : "",
  } : { code: "", percent: "", first_order_only: false, active: true, expires_at: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.code.trim() || !form.percent) {
      setError("Code and percent off are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        percent: Number(form.percent),
        first_order_only: form.first_order_only,
        active: form.active,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      const saved = isEdit
        ? await updateCoupon(initial.id, payload)
        : await createCoupon({ code: form.code, ...payload });
      onSaved(saved);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not save the discount code. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-start justify-center overflow-y-auto py-10 px-4" data-testid="coupon-form-overlay">
      <div className="bg-paper rounded-[4px] w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl">{isEdit ? "Edit Discount Code" : "Add Discount Code"}</h2>
          <button onClick={onCancel} aria-label="Close" data-testid="coupon-form-close"><X size={22} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Code">
            <input required disabled={isEdit} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. OBLIC20" data-testid="coupon-code"
              className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink disabled:opacity-60" />
          </Field>
          <Field label="Percent Off">
            <input required type="number" min="1" max="100" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })}
              placeholder="e.g. 20" data-testid="coupon-percent"
              className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
          </Field>
          <Field label="Expires (optional)">
            <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              data-testid="coupon-expires"
              className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
          </Field>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.first_order_only} onChange={(e) => setForm({ ...form, first_order_only: e.target.checked })} data-testid="coupon-first-order" />
              First order only
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} data-testid="coupon-active" />
              Active
            </label>
          </div>

          {error && <p className="text-red-600 text-[13px]" data-testid="coupon-form-error">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} data-testid="coupon-form-submit"
              className="bg-plum text-cream px-6 py-3 rounded-full text-[13px] tracking-[0.12em] uppercase hover:bg-ink transition-colors disabled:opacity-50">
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Code"}
            </button>
            <button type="button" onClick={onCancel} className="text-[13px] text-muted hover:text-ink underline underline-offset-4">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-paper border border-line rounded-[4px] p-6" data-testid={`stat-${label.toLowerCase().replace(/ /g, "-")}`}>
      <div className="flex items-center gap-2 text-muted text-[12px] tracking-[0.12em] uppercase mb-3">
        <Icon size={15} /> {label}
      </div>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(null); // null=checking, true, false
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [carts, setCarts] = useState([]);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(null); // null | "new" | product object being edited
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState(null); // null | "new" | coupon object being edited
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [o, c, s, p, cp] = await Promise.all([getAdminOrders(), getAbandonedCarts(), getAdminStats(), getProducts(), getCoupons()]);
      setOrders(o); setCarts(c); setStats(s); setProducts(p); setCoupons(cp);
    } finally { setLoading(false); }
  };

  const onProductSaved = (saved) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
    setProductForm(null);
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    await deleteProduct(product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const onCouponSaved = (saved) => {
    setCoupons((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev];
    });
    setCouponForm(null);
  };

  const removeCoupon = async (coupon) => {
    if (!window.confirm(`Delete code "${coupon.code}"? This can't be undone.`)) return;
    await deleteCoupon(coupon.id);
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
  };

  const toggleCouponActive = async (coupon) => {
    const updated = await updateCoupon(coupon.id, { active: !coupon.active });
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? updated : c)));
  };

  useEffect(() => {
    const token = localStorage.getItem("oblic_admin_token");
    if (!token) { setAuthed(false); return; }
    adminMe().then(() => { setAuthed(true); load(); }).catch(() => { setAdminToken(null); setAuthed(false); });
  }, []);

  // Orders can flip status server-side (e.g. the Razorpay webhook marking one paid) without
  // this page doing anything - poll quietly while the Orders tab is open so that shows up
  // without needing a manual Refresh click.
  useEffect(() => {
    if (!authed || tab !== "orders") return;
    const interval = setInterval(() => {
      getAdminOrders().then(setOrders).catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, [authed, tab]);

  const doLogin = async (e) => {
    e.preventDefault();
    setAuthError(""); setAuthLoading(true);
    try {
      const data = await adminLogin(creds.email, creds.password);
      setAdminToken(data.token);
      setAuthed(true);
      load();
    } catch (err) {
      setAuthError(err?.response?.data?.detail || "Login failed. Please try again.");
    } finally { setAuthLoading(false); }
  };

  const logout = () => { setAdminToken(null); setAuthed(false); setCreds({ email: "", password: "" }); };

  const changeStatus = async (id, status) => {
    const updated = await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o)));
    getAdminStats().then(setStats);
  };

  if (authed === null) {
    return <div className="container py-40 text-center text-muted" data-testid="admin-checking">Loading…</div>;
  }

  if (!authed) {
    return (
      <div className="container py-20 flex justify-center" data-testid="admin-login">
        <div className="w-full max-w-sm bg-paper border border-line rounded-[4px] p-8">
          <div className="w-12 h-12 rounded-full bg-plum text-cream flex items-center justify-center mb-6"><Lock size={20} strokeWidth={1.6} /></div>
          <p className="text-[12px] tracking-[0.22em] uppercase text-muted mb-2">Oblic Admin</p>
          <h1 className="font-display text-3xl mb-6">Sign in</h1>
          <form onSubmit={doLogin} className="space-y-4">
            <input required type="email" value={creds.email} onChange={(e) => setCreds({ ...creds, email: e.target.value })} placeholder="Admin email"
              data-testid="admin-email" className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            <input required type="password" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} placeholder="Password"
              data-testid="admin-password" className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            {authError && <p className="text-red-600 text-[13px]" data-testid="admin-login-error">{authError}</p>}
            <button type="submit" disabled={authLoading} data-testid="admin-login-btn"
              className="w-full bg-plum text-cream py-3.5 rounded-full text-[13px] tracking-[0.14em] uppercase hover:bg-ink transition-colors disabled:opacity-50">
              {authLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <Link to="/" className="block text-center text-[13px] text-muted hover:text-ink mt-6 underline underline-offset-4">Back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12" data-testid="admin-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[12px] tracking-[0.22em] uppercase text-muted mb-2">Oblic Admin</p>
          <h1 className="font-display text-5xl">Order Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} data-testid="admin-refresh" className="flex items-center gap-2 border border-ink rounded-full px-5 py-2.5 text-[13px] tracking-wide hover:bg-ink hover:text-cream transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={logout} data-testid="admin-logout" className="flex items-center gap-2 border border-line rounded-full px-5 py-2.5 text-[13px] tracking-wide hover:border-ink transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Stat icon={Package} label="Total Orders" value={stats.total_orders} />
          <Stat icon={CheckCircle2} label="Paid Orders" value={stats.paid_orders} />
          <Stat icon={IndianRupee} label="Revenue" value={`₹${Number(stats.revenue).toFixed(0)}`} />
          <Stat icon={ShoppingCart} label="Abandoned Carts" value={stats.abandoned_carts} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-y-3 border-b border-line mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {[["orders", "Orders"], ["abandoned", "Abandoned Carts"], ["products", "Products"], ["discounts", "Discounts"]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} data-testid={`admin-tab-${k}`}
              className={`px-4 sm:px-5 py-3 text-[14px] tracking-wide border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === k ? "border-plum text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              {label}
            </button>
          ))}
        </div>
        {tab === "products" && (
          <button onClick={() => setProductForm("new")} data-testid="add-product-btn"
            className="flex items-center gap-2 bg-plum text-cream rounded-full px-5 py-2.5 text-[13px] tracking-wide hover:bg-ink transition-colors mb-3">
            <Plus size={15} /> Add Product
          </button>
        )}
        {tab === "discounts" && (
          <button onClick={() => setCouponForm("new")} data-testid="add-coupon-btn"
            className="flex items-center gap-2 bg-plum text-cream rounded-full px-5 py-2.5 text-[13px] tracking-wide hover:bg-ink transition-colors mb-3">
            <Plus size={15} /> Add Discount Code
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-muted py-16 text-center">Loading…</p>
      ) : tab === "orders" ? (
        orders.length === 0 ? <p className="text-muted py-16 text-center">No orders yet.</p> : (
          <OrdersView orders={orders} changeStatus={changeStatus} setOrders={setOrders} />
        )
      ) : tab === "abandoned" ? (
        carts.length === 0 ? <p className="text-muted py-16 text-center">No abandoned carts.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]" data-testid="abandoned-table">
              <thead>
                <tr className="text-left text-muted text-[12px] tracking-[0.1em] uppercase border-b border-line">
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Items</th>
                  <th className="py-3 pr-4">Value</th>
                  <th className="py-3 pr-4">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {carts.map((c, idx) => (
                  <tr key={idx} className="border-b border-line/60 align-top" data-testid={`cart-row-${idx}`}>
                    <td className="py-4 pr-4">
                      <div>{c.name || "Guest"}</div>
                      <div className="text-muted text-[12px]">{c.email}</div>
                    </td>
                    <td className="py-4 pr-4 max-w-[280px]">
                      {(c.items || []).map((it, i) => (
                        <div key={i} className="text-ink-soft text-[13px]">{it.qty}× {it.name} {it.size ? `(${it.size})` : ""}</div>
                      ))}
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap">₹{Number(c.total).toFixed(0)}</td>
                    <td className="py-4 pr-4 text-muted text-[13px] whitespace-nowrap">{c.updated_at ? new Date(c.updated_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : tab === "products" ? (
        products.length === 0 ? <p className="text-muted py-16 text-center">No products yet — add your first one.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]" data-testid="products-table">
              <thead>
                <tr className="text-left text-muted text-[12px] tracking-[0.1em] uppercase border-b border-line">
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Price</th>
                  <th className="py-3 pr-4">Offer</th>
                  <th className="py-3 pr-4">Stock</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-line/60 align-top" data-testid={`product-row-${p.slug}`}>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-11 h-14 object-cover rounded-[2px]" />}
                        <div>
                          <div className="font-medium">{p.name}</div>
                          {p.badges?.[0] && <div className="text-muted text-[12px]">{p.badges[0]}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">{p.category}</td>
                    <td className="py-4 pr-4 whitespace-nowrap">
                      ₹{Number(p.price).toFixed(0)}
                      {p.compare_at_price && <span className="text-muted line-through ml-2 text-[12px]">₹{Number(p.compare_at_price).toFixed(0)}</span>}
                    </td>
                    <td className="py-4 pr-4">
                      {p.on_sale ? (
                        <span className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-green-100 text-green-800">On Sale</span>
                      ) : (
                        <span className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-cream-deep text-ink">Regular</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      {p.in_stock !== false ? (
                        <span className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-green-100 text-green-800">In Stock</span>
                      ) : (
                        <span className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-red-100 text-red-700">Out of Stock</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setProductForm(p)} aria-label="Edit" data-testid={`edit-product-${p.slug}`} className="text-muted hover:text-ink transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => removeProduct(p)} aria-label="Delete" data-testid={`delete-product-${p.slug}`} className="text-muted hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        coupons.length === 0 ? <p className="text-muted py-16 text-center">No discount codes yet — add your first one.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]" data-testid="coupons-table">
              <thead>
                <tr className="text-left text-muted text-[12px] tracking-[0.1em] uppercase border-b border-line">
                  <th className="py-3 pr-4">Code</th>
                  <th className="py-3 pr-4">Off</th>
                  <th className="py-3 pr-4">Rules</th>
                  <th className="py-3 pr-4">Expires</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-line/60 align-top" data-testid={`coupon-row-${c.code}`}>
                    <td className="py-4 pr-4 font-medium">{c.code}</td>
                    <td className="py-4 pr-4">{c.percent}%</td>
                    <td className="py-4 pr-4 text-muted text-[13px]">{c.first_order_only ? "First order only" : "Any order"}</td>
                    <td className="py-4 pr-4 text-muted text-[13px] whitespace-nowrap">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</td>
                    <td className="py-4 pr-4">
                      <button onClick={() => toggleCouponActive(c)} data-testid={`toggle-coupon-${c.code}`}
                        className={`inline-block text-[11px] px-2.5 py-1 rounded-full transition-colors ${c.active ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-cream-deep text-muted hover:bg-line"}`}>
                        {c.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setCouponForm(c)} aria-label="Edit" data-testid={`edit-coupon-${c.code}`} className="text-muted hover:text-ink transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => removeCoupon(c)} aria-label="Delete" data-testid={`delete-coupon-${c.code}`} className="text-muted hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <div className="mt-10">
        <Link to="/" className="text-[13px] text-muted hover:text-ink underline underline-offset-4">Back to store</Link>
      </div>

      {couponForm && (
        <CouponForm
          initial={couponForm === "new" ? null : couponForm}
          onCancel={() => setCouponForm(null)}
          onSaved={onCouponSaved}
        />
      )}

      {productForm && (
        <ProductForm
          initial={productForm === "new" ? null : productForm}
          onCancel={() => setProductForm(null)}
          onSaved={onProductSaved}
        />
      )}
    </div>
  );
}
