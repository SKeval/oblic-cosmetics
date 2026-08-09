import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, IndianRupee, ShoppingCart, CheckCircle2, RefreshCw, Lock, LogOut, Plus, Pencil, Trash2, X, Star } from "lucide-react";
import {
  getAdminOrders, updateOrderStatus, getAbandonedCarts, getAdminStats, adminLogin, adminMe, setAdminToken,
  getProducts, createProduct, updateProduct, deleteProduct, uploadImage,
} from "../api";

const STATUS_OPTIONS = ["created", "paid", "fulfilled", "cancelled", "verification_failed"];

const STATUS_STYLE = {
  paid: "bg-green-100 text-green-800",
  created: "bg-amber-100 text-amber-800",
  fulfilled: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-700",
  verification_failed: "bg-red-100 text-red-700",
};

const BADGE_OPTIONS = ["", "Best Seller", "New", "Limited Offer", "Award Winning", "20% Off"];

const EMPTY_PRODUCT_FORM = {
  name: "", category: "", price: "", compare_at_price: "", on_sale: false, badge: "",
  images: [], sizes: "", description: "", benefits: "", how_to_use: "", ingredients: "", detail: "",
};

function productToForm(p) {
  return {
    name: p.name || "", category: p.category || "", price: p.price ?? "", compare_at_price: p.compare_at_price ?? "",
    on_sale: !!p.on_sale, badge: p.badges?.[0] || "",
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
            <input required value={form.name} onChange={set("name")} placeholder="Product name" data-testid="product-name"
              className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            <input required value={form.category} onChange={set("category")} placeholder="Category (e.g. Skincare)" data-testid="product-category"
              className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <input required type="number" min="1" step="0.01" value={form.price} onChange={set("price")} placeholder="Price (₹)" data-testid="product-price"
              className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            <input type="number" min="0" step="0.01" value={form.compare_at_price} onChange={set("compare_at_price")} placeholder="Compare-at price (₹)" data-testid="product-compare-price"
              className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            <select value={form.badge} onChange={set("badge")} data-testid="product-badge"
              className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink cursor-pointer">
              {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b || "No badge"}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={form.on_sale} onChange={(e) => setForm({ ...form, on_sale: e.target.checked })} data-testid="product-on-sale" />
            On sale (shows on the Offers page)
          </label>
          <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
          <input value={form.sizes} onChange={set("sizes")} placeholder="Sizes, comma separated (e.g. 100ml, 200ml)" data-testid="product-sizes"
            className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
          <textarea required value={form.description} onChange={set("description")} placeholder="Description" rows={3} data-testid="product-description"
            className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />
          <textarea value={form.benefits} onChange={set("benefits")} placeholder="Benefits, one per line" rows={3} data-testid="product-benefits"
            className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />
          <textarea value={form.how_to_use} onChange={set("how_to_use")} placeholder="How to use" rows={2} data-testid="product-how-to-use"
            className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />
          <textarea value={form.ingredients} onChange={set("ingredients")} placeholder="Ingredients" rows={2} data-testid="product-ingredients"
            className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />
          <textarea value={form.detail} onChange={set("detail")} placeholder="Additional detail (size, storage, etc.)" rows={2} data-testid="product-detail"
            className="w-full bg-cream border border-line rounded-[16px] px-5 py-3 outline-none focus:border-ink resize-none" />

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
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [o, c, s, p] = await Promise.all([getAdminOrders(), getAbandonedCarts(), getAdminStats(), getProducts()]);
      setOrders(o); setCarts(c); setStats(s); setProducts(p);
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

  useEffect(() => {
    const token = localStorage.getItem("oblic_admin_token");
    if (!token) { setAuthed(false); return; }
    adminMe().then(() => { setAuthed(true); load(); }).catch(() => { setAdminToken(null); setAuthed(false); });
  }, []);

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
          {[["orders", "Orders"], ["abandoned", "Abandoned Carts"], ["products", "Products"]].map(([k, label]) => (
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
      </div>

      {loading ? (
        <p className="text-muted py-16 text-center">Loading…</p>
      ) : tab === "orders" ? (
        orders.length === 0 ? <p className="text-muted py-16 text-center">No orders yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]" data-testid="orders-table">
              <thead>
                <tr className="text-left text-muted text-[12px] tracking-[0.1em] uppercase border-b border-line">
                  <th className="py-3 pr-4">Order</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Items</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-line/60 align-top" data-testid={`order-row-${o.order_number}`}>
                    <td className="py-4 pr-4 font-medium">#{o.order_number}</td>
                    <td className="py-4 pr-4">
                      <div>{o.name}</div>
                      <div className="text-muted text-[12px]">{o.email}</div>
                      {o.contact && <div className="text-muted text-[12px]">{o.contact}</div>}
                    </td>
                    <td className="py-4 pr-4 max-w-[260px]">
                      {(o.items || []).map((it, i) => (
                        <div key={i} className="text-ink-soft text-[13px]">{it.qty}× {it.name} {it.size ? `(${it.size})` : ""}</div>
                      ))}
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap">₹{Number(o.total).toFixed(0)}</td>
                    <td className="py-4 pr-4 text-muted text-[13px] whitespace-nowrap">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}</td>
                    <td className="py-4 pr-4">
                      <span className={`inline-block text-[11px] px-2.5 py-1 rounded-full mb-2 ${STATUS_STYLE[o.status] || "bg-cream-deep text-ink"}`}>{o.status}</span>
                      <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)} data-testid={`order-status-${o.order_number}`}
                        className="block bg-paper border border-line rounded-full px-3 py-1.5 text-[12px] outline-none cursor-pointer">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      ) : (
        products.length === 0 ? <p className="text-muted py-16 text-center">No products yet — add your first one.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]" data-testid="products-table">
              <thead>
                <tr className="text-left text-muted text-[12px] tracking-[0.1em] uppercase border-b border-line">
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Price</th>
                  <th className="py-3 pr-4">Offer</th>
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
      )}

      <div className="mt-10">
        <Link to="/" className="text-[13px] text-muted hover:text-ink underline underline-offset-4">Back to store</Link>
      </div>

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
