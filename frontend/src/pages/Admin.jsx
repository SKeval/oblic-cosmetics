import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, IndianRupee, ShoppingCart, CheckCircle2, RefreshCw } from "lucide-react";
import { getAdminOrders, updateOrderStatus, getAbandonedCarts, getAdminStats } from "../api";

const STATUS_OPTIONS = ["created", "paid", "fulfilled", "cancelled", "verification_failed"];

const STATUS_STYLE = {
  paid: "bg-green-100 text-green-800",
  created: "bg-amber-100 text-amber-800",
  fulfilled: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-700",
  verification_failed: "bg-red-100 text-red-700",
};

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
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [carts, setCarts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [o, c, s] = await Promise.all([getAdminOrders(), getAbandonedCarts(), getAdminStats()]);
      setOrders(o); setCarts(c); setStats(s);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    const updated = await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o)));
    getAdminStats().then(setStats);
  };

  return (
    <div className="container py-12" data-testid="admin-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[12px] tracking-[0.22em] uppercase text-muted mb-2">Oblic Admin</p>
          <h1 className="font-display text-5xl">Order Dashboard</h1>
        </div>
        <button onClick={load} data-testid="admin-refresh" className="flex items-center gap-2 border border-ink rounded-full px-5 py-2.5 text-[13px] tracking-wide hover:bg-ink hover:text-cream transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Stat icon={Package} label="Total Orders" value={stats.total_orders} />
          <Stat icon={CheckCircle2} label="Paid Orders" value={stats.paid_orders} />
          <Stat icon={IndianRupee} label="Revenue" value={`₹${Number(stats.revenue).toFixed(0)}`} />
          <Stat icon={ShoppingCart} label="Abandoned Carts" value={stats.abandoned_carts} />
        </div>
      )}

      <div className="flex gap-2 border-b border-line mb-6">
        {[["orders", "Orders"], ["abandoned", "Abandoned Carts"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} data-testid={`admin-tab-${k}`}
            className={`px-5 py-3 text-[14px] tracking-wide border-b-2 -mb-px transition-colors ${tab === k ? "border-plum text-ink" : "border-transparent text-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
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
      ) : (
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
      )}

      <div className="mt-10">
        <Link to="/" className="text-[13px] text-muted hover:text-ink underline underline-offset-4">Back to store</Link>
      </div>
    </div>
  );
}
