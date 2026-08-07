import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";

const NAV = [
  { label: "Shop", to: "/#shop" },
  { label: "Offers", to: "/?on_sale=true#shop" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/?search=${encodeURIComponent(q)}#shop`);
    setSearchOpen(false);
    setMobile(false);
  };

  return (
    <>
      <div className="bg-plum text-cream text-center text-[12px] tracking-[0.15em] uppercase py-2.5 px-4" data-testid="announcement-bar">
        Free shipping across India on all orders
      </div>
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-line">
        <div className="container flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center" data-testid="logo-link">
              <img src="/oblic-logo.png" alt="Oblic" className="h-7 md:h-8 w-auto" />
            </Link>
            <nav className="hidden lg:flex items-center gap-7">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  data-testid={`nav-${n.label.toLowerCase()}`}
                  className="text-[13.5px] tracking-wide text-ink-soft hover:text-ink transition-colors flex items-center gap-1"
                >
                  {n.label}
                  {n.label === "Shop" && <ChevronDown size={13} className="mt-0.5" />}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setSearchOpen((s) => !s)} className="p-2 hover:opacity-60 transition-opacity" data-testid="search-btn" aria-label="Search">
              {searchOpen ? <X size={19} strokeWidth={1.5} /> : <Search size={19} strokeWidth={1.5} />}
            </button>
            <button onClick={() => setOpen(true)} className="p-2 hover:opacity-60 transition-opacity" data-testid="cart-btn" aria-label="Cart">
              <span className="relative block">
                <ShoppingBag size={19} strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-plum text-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center" data-testid="cart-count">
                    {count}
                  </span>
                )}
              </span>
            </button>
            <Link to="/account" className="p-2 hover:opacity-60 transition-opacity" aria-label="Account" data-testid="account-btn">
              <User size={19} strokeWidth={1.5} />
            </Link>
            <button className="p-2 lg:hidden" onClick={() => setMobile(true)} aria-label="Menu" data-testid="mobile-menu-btn">
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="border-t border-line bg-paper anim-fade-in" data-testid="search-bar">
            <form onSubmit={submitSearch} className="container flex items-center gap-3 py-4">
              <Search size={18} className="text-muted shrink-0" strokeWidth={1.5} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                data-testid="search-input"
                className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-muted"
              />
              <button type="submit" data-testid="search-submit"
                className="text-[13px] tracking-[0.1em] uppercase bg-ink text-cream px-5 py-2.5 rounded-full hover:bg-plum transition-colors">
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {mobile && (
        <div className="fixed inset-0 z-50 bg-paper lg:hidden anim-fade-in" data-testid="mobile-menu">
          <div className="container flex items-center justify-between h-[72px] border-b border-line">
            <img src="/oblic-logo.png" alt="Oblic" className="h-7 w-auto" />
            <button onClick={() => setMobile(false)} className="p-2 -mr-2" aria-label="Close menu"><X size={24} /></button>
          </div>
          <nav className="flex flex-col p-6 gap-1">
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} onClick={() => setMobile(false)}
                className="font-display text-3xl py-3 border-b border-line/60">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
