import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, SlidersHorizontal, X } from "lucide-react";
import { getCategories, getProducts } from "../api";
import ProductCard from "../components/ProductCard";

const HERO = "https://customer-assets-39nsmqrw.emergentagent.net/job_admiring-beaver-9/artifacts/i7rowu0f_1234.png";
const LIFESTYLE = "https://images.unsplash.com/photo-1555820585-c5ae44394b79?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

const CATS = [
  { name: "Skincare", soon: false, img: "https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/ea440177fda1ce339730408c4835940fb25ebeb5c4907431406699e0fbe315e5.jpeg" },
  { name: "Haircare", soon: false, img: "https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/aa4daf1a289a885e3ff7e33822d2663887859cb841d434cdebbc36e450beecc3.jpeg" },
  { name: "Makeup", soon: true, img: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?crop=entropy&cs=srgb&fm=jpg&q=85&w=700" },
  { name: "Fragrances", soon: true, img: "https://images.unsplash.com/photo-1696894756299-345f1c0feb00?crop=entropy&cs=srgb&fm=jpg&q=85&w=700" },
];

const MARQUEE = ["Vegan & Cruelty-Free", "Dermatologist Created", "Paraben & Sulphate Free", "Made in India", "Free Shipping Across India"];

const SORTS = [
  { v: "featured", label: "Featured" },
  { v: "price_asc", label: "Price: Low to High" },
  { v: "price_desc", label: "Price: High to Low" },
  { v: "rating", label: "Top Rated" },
];

const COMING_SOON = ["Makeup", "Fragrances", "Bodycare"];

function scrollToShop() {
  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  const category = searchParams.get("category") || "All";
  const onSale = searchParams.get("on_sale") === "true";
  const sort = searchParams.get("sort") || "featured";

  useEffect(() => { getCategories().then(setCats).catch(() => {}); }, []);

  const load = useCallback(() => {
    setLoading(true);
    getProducts({ category, on_sale: onSale || undefined, sort })
      .then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [category, onSale, sort]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (location.hash === "#shop") scrollToShop();
  }, [location]);

  const update = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val === null || val === "All" || val === false) next.delete(key);
    else next.set(key, val);
    setSearchParams(next);
  };

  const filterAndScroll = (key, val) => {
    update(key, val);
    scrollToShop();
  };

  const clearAll = () => setSearchParams(new URLSearchParams());
  const activeCount = (category !== "All" ? 1 : 0) + (onSale ? 1 : 0);

  return (
    <div>
      {/* Hero */}
      <section className="container pt-6">
        <div className="relative rounded-[4px] overflow-hidden">
          <img src={HERO} alt="Oblic - Luxury in Every Touch. Premium skincare and haircare."
            className="w-full h-auto block" />
          {/* Overlays the "Shop Now" pill baked into the hero image, so only that button navigates */}
          <button type="button" onClick={scrollToShop} aria-label="Shop now" data-testid="hero-cta"
            className="absolute"
            style={{ left: "4.4%", top: "65.2%", width: "11.6%", height: "5.4%" }} />
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-line mt-10 py-4 bg-cream-deep/40">
        <div className="flex marquee-track whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="mx-8 text-[13px] tracking-[0.2em] uppercase text-ink-soft flex items-center gap-8">
              {m} <span className="text-sage-deep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Shop All */}
      <section className="container py-20" id="shop" data-testid="shop-section">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-5xl md:text-6xl leading-none">Shop All</h2>
            <p className="text-ink-soft mt-3 max-w-md text-[15px]">Browse our full range of clean, effective skincare and haircare.</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-line pb-5 mb-8">
          <button onClick={() => setShowFilters((s) => !s)} data-testid="toggle-filters"
            className="flex items-center gap-2 text-[14px] tracking-wide hover:opacity-60 transition-opacity">
            <SlidersHorizontal size={16} /> {showFilters ? "Hide Filters" : "Filters"}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted hidden sm:inline">Sort by</span>
            <select value={sort} onChange={(e) => update("sort", e.target.value)} data-testid="sort-select"
              className="bg-paper border border-line rounded-full px-4 py-2 text-[13.5px] outline-none cursor-pointer">
              {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className={`grid gap-10 ${showFilters ? "lg:grid-cols-[240px_1fr]" : "grid-cols-1"}`}>
          {showFilters && (
            <aside className="space-y-8" data-testid="filters-sidebar">
              <div>
                <p className="text-[12px] tracking-[0.18em] uppercase text-muted mb-4">Category</p>
                <div className="space-y-3">
                  {["All", ...cats].map((c) => (
                    <button key={c} onClick={() => update("category", c)} data-testid={`filter-cat-${c.toLowerCase()}`}
                      className="flex items-center gap-3 text-[14.5px] w-full text-left group">
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${category === c ? "bg-plum border-plum" : "border-ink/30 group-hover:border-ink"}`}>
                        {category === c && <span className="w-1.5 h-1.5 rounded-full bg-cream" />}
                      </span>
                      <span className={category === c ? "text-ink" : "text-ink-soft"}>{c}</span>
                    </button>
                  ))}
                  {COMING_SOON.map((c) => (
                    <div key={c} data-testid={`filter-soon-${c.toLowerCase()}`}
                      className="flex items-center justify-between gap-3 text-[14.5px] w-full text-left opacity-55 cursor-not-allowed">
                      <span className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full border border-ink/20" />
                        <span className="text-muted">{c}</span>
                      </span>
                      <span className="text-[10px] tracking-[0.12em] uppercase text-plum bg-sage/60 rounded-full px-2 py-0.5">Soon</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-line pt-6">
                <p className="text-[12px] tracking-[0.18em] uppercase text-muted mb-4">Special Offers</p>
                <button onClick={() => update("on_sale", !onSale)} data-testid="filter-onsale"
                  className="flex items-center gap-3 text-[14.5px] group">
                  <span className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${onSale ? "bg-plum border-plum" : "border-ink/30 group-hover:border-ink"}`}>
                    {onSale && <Check size={12} className="text-cream" />}
                  </span>
                  <span className={onSale ? "text-ink" : "text-ink-soft"}>On Sale</span>
                </button>
              </div>
              {activeCount > 0 && (
                <div className="border-t border-line pt-6 space-y-3">
                  <p className="text-[13px] text-muted">{activeCount} filter{activeCount > 1 ? "s" : ""} selected</p>
                  <button onClick={clearAll} data-testid="clear-filters"
                    className="flex items-center gap-2 text-[13px] tracking-[0.1em] uppercase border border-ink rounded-full px-5 py-2.5 hover:bg-ink hover:text-cream transition-colors">
                    <X size={13} /> Clear All
                  </button>
                </div>
              )}
            </aside>
          )}

          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="font-display text-3xl">{category === "All" ? "All Products" : category}</h3>
              <span className="text-[13px] text-muted" data-testid="result-count">{products.length} products</span>
            </div>
            {loading ? (
              <div className={`grid grid-cols-2 ${showFilters ? "md:grid-cols-3" : "md:grid-cols-4"} gap-x-5 gap-y-12`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse"><div className="aspect-[4/5] bg-cream-deep rounded-[2px]" /><div className="h-4 bg-cream-deep mt-4 w-2/3" /></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-muted py-20 text-center">No products match your filters.</p>
            ) : (
              <div className={`grid grid-cols-2 ${showFilters ? "md:grid-cols-3" : "md:grid-cols-4"} gap-x-5 gap-y-12`} data-testid="product-grid">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container pb-8">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-4xl md:text-5xl leading-none">Shop by Category</h2>
          <p className="text-ink-soft text-[14px] max-w-xs hidden md:block">More collections are on the way. New Oblic rituals launching soon.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATS.map((c) => (
            c.soon ? (
              <div key={c.name} data-testid={`category-soon-${c.name.toLowerCase()}`}
                className="relative aspect-[3/4] overflow-hidden rounded-[3px] group cursor-default select-none">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover grayscale-[0.4] transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-plum/85 group-hover:bg-plum/80 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-cream border border-cream/70 rounded-full px-4 py-1.5">Coming Soon</span>
                  <span className="font-display text-cream text-3xl mt-4">{c.name}</span>
                  <span className="text-cream/90 text-[12px] mt-1.5">Worth the wait ✦</span>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => filterAndScroll("category", c.name)} key={c.name} data-testid={`category-${c.name.toLowerCase()}`}
                className="relative aspect-[3/4] overflow-hidden rounded-[3px] group text-left">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-ink/25 group-hover:bg-ink/40 transition-colors" />
                <span className="absolute bottom-5 left-5 font-display text-cream text-2xl">{c.name}</span>
              </button>
            )
          ))}
        </div>
      </section>

      {/* Editorial split */}
      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center bg-sage rounded-[4px] overflow-hidden">
          <div className="p-10 md:p-16">
            <p className="text-[12px] tracking-[0.22em] uppercase text-ink-soft mb-4">The Ritual</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">Beauty that begins with intention</h2>
            <p className="text-ink-soft mt-5 text-[15px] leading-relaxed max-w-md">Every formula is crafted with clean, biodegradable ingredients and a deep respect for your skin and the planet. Slow beauty, done right.</p>
            <button type="button" onClick={scrollToShop} className="inline-flex items-center gap-2 mt-8 text-[13px] tracking-[0.12em] uppercase border-b border-ink pb-1 hover:gap-3 transition-all">
              Discover the range <ArrowRight size={15} />
            </button>
          </div>
          <img src={LIFESTYLE} alt="Ritual" className="w-full h-full max-h-[520px] object-cover" />
        </div>
      </section>
    </div>
  );
}
