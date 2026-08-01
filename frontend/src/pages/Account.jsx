import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useCustomer } from "../context/CustomerContext";
import { getCustomerOrders } from "../api";

export default function Account() {
  const { customer, loading, login, register, logout } = useCustomer();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const next = searchParams.get("next");
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!customer) return;
    setOrdersLoading(true);
    getCustomerOrders().then(setOrders).finally(() => setOrdersLoading(false));
  }, [customer]);

  const submit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      if (next) navigate(next);
    } catch (err) {
      setAuthError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return <div className="container py-40 text-center text-muted" data-testid="account-checking">Loading…</div>;
  }

  if (!customer) {
    return (
      <div className="container py-20 flex justify-center" data-testid="account-login">
        <div className="w-full max-w-sm bg-paper border border-line rounded-[4px] p-8">
          <div className="w-12 h-12 rounded-full bg-plum text-cream flex items-center justify-center mb-6"><User size={20} strokeWidth={1.6} /></div>
          <p className="text-[12px] tracking-[0.22em] uppercase text-muted mb-2">Oblic Account</p>
          <h1 className="font-display text-3xl mb-6">{mode === "login" ? "Sign in" : "Create account"}</h1>

          {next && (
            <p className="text-[13.5px] text-ink-soft bg-cream-deep border border-line rounded-[3px] px-4 py-3 mb-6" data-testid="account-next-notice">
              Sign in to add that item to your cart — we'll take you right back.
            </p>
          )}

          <div className="flex gap-2 border-b border-line mb-6">
            <button type="button" onClick={() => { setMode("login"); setAuthError(""); }} data-testid="account-login-tab"
              className={`px-3 py-2.5 text-[13px] tracking-wide border-b-2 -mb-px transition-colors ${mode === "login" ? "border-plum text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              Sign in
            </button>
            <button type="button" onClick={() => { setMode("register"); setAuthError(""); }} data-testid="account-register-tab"
              className={`px-3 py-2.5 text-[13px] tracking-wide border-b-2 -mb-px transition-colors ${mode === "register" ? "border-plum text-ink" : "border-transparent text-muted hover:text-ink"}`}>
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name"
                data-testid="account-name" className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            )}
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email"
              data-testid="account-email" className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password"
              data-testid="account-password" className="w-full bg-cream border border-line rounded-full px-5 py-3 outline-none focus:border-ink" />
            {authError && <p className="text-red-600 text-[13px]" data-testid="account-auth-error">{authError}</p>}
            <button type="submit" disabled={authLoading} data-testid="account-submit-btn"
              className="w-full bg-plum text-cream py-3.5 rounded-full text-[13px] tracking-[0.14em] uppercase hover:bg-ink transition-colors disabled:opacity-50">
              {authLoading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          <Link to="/" className="block text-center text-[13px] text-muted hover:text-ink mt-6 underline underline-offset-4">Back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12" data-testid="account-page">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[12px] tracking-[0.22em] uppercase text-muted mb-2">Oblic Account</p>
          <h1 className="font-display text-5xl">Hi, {customer.name || customer.email}</h1>
        </div>
        <button onClick={logout} data-testid="account-logout" className="flex items-center gap-2 border border-line rounded-full px-5 py-2.5 text-[13px] tracking-wide hover:border-ink transition-colors">
          <LogOut size={14} /> Logout
        </button>
      </div>

      <h2 className="text-[12px] tracking-[0.1em] uppercase text-muted mb-4">Order history</h2>

      {ordersLoading ? (
        <p className="text-muted py-16 text-center">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-muted py-16 text-center">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]" data-testid="account-orders-table">
            <thead>
              <tr className="text-left text-muted text-[12px] tracking-[0.1em] uppercase border-b border-line">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Items</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line/60 align-top" data-testid={`account-order-row-${o.order_number}`}>
                  <td className="py-4 pr-4 font-medium">#{o.order_number}</td>
                  <td className="py-4 pr-4 max-w-[280px]">
                    {(o.items || []).map((it, i) => (
                      <div key={i} className="text-ink-soft text-[13px]">{it.qty}× {it.name} {it.size ? `(${it.size})` : ""}</div>
                    ))}
                  </td>
                  <td className="py-4 pr-4 whitespace-nowrap">₹{Number(o.total).toFixed(0)}</td>
                  <td className="py-4 pr-4 text-muted text-[13px] whitespace-nowrap">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}</td>
                  <td className="py-4 pr-4">
                    <span className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-cream-deep text-ink">{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10">
        <Link to="/" className="text-[13px] text-muted hover:text-ink underline underline-offset-4">Back to store</Link>
      </div>
    </div>
  );
}
