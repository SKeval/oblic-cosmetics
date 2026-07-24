import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { getProducts, getCategories } from "../api";
import ProductCard from "../components/ProductCard";

const SORTS = [
  { v: "featured", label: "Featured" },
  { v: "price_asc", label: "Price: Low to High" },
  { v: "price_desc", label: "Price: High to Low" },
  { v: "rating", label: "Top Rated" },
];

const COMING_SOON = ["Makeup", "Fragrances", "Bodycare"];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  const category = params.get("category") || "All";
  const onSale = params.get("on_sale") === "true";
  const sort = params.get("sort") || "featured";

  useEffect(() => { getCategories().then(setCats).catch(() => {}); }, []);

  const load = useCallback(() => {
    setLoading(true);
    getProducts({ category, on_sale: onSale || undefined, sort })
      .then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [category, onSale, sort]);

  useEffect(() => { load(); }, [load]);

  const update = (key, val) => {
    const next = new URLSearchParams(params);
    if (val === null || val === "All" || val === false) next.delete(key);
    else next.set(key, val);
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());
  const activeCount = (category !== "All" ? 1 : 0) + (onSale ? 1 : 0);

  return (
    <div>
      {/* Hero band */}
      <section className="container pt-6">
        <div className="relative rounded-[4px] overflow-hidden bg-plum">
          <img src="https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/7d90171b8012048ab26a3f5efd17148d8b2805030ffc55cb0b204808f9edde18.jpeg"
            alt="Collections" className="w-full h-[300px] md:h-[360px] object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-transparent flex flex-col justify-center px-8 md:px-14">
            <p className="text-cream/70 text-[12px] tracking-[0.22em] uppercase mb-3">Shop All</p>
            <h1 className="font-display text-cream text-4xl md:text-6xl leading-none">Explore Our<br />Curated Collections</h1>
          </div>
        </div>
      </section>

      <div className="container py-10">
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
              <h2 className="font-display text-3xl">{category === "All" ? "All Products" : category}</h2>
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
      </div>
    </div>
  );
}
