import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Minus, Heart, ChevronDown, FlaskConical, Stethoscope, Leaf, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { getProduct, getProducts, getReviews, addReview } from "../api";
import StarRating from "../components/StarRating";
import ProductCard from "../components/ProductCard";
import FAQ from "../components/FAQ";
import { useCart } from "../context/CartContext";

const FEATURE_ICONS = [FlaskConical, Stethoscope, Leaf, CheckCircle2];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState("detail");
  const [form, setForm] = useState({ author: "", rating: 5, body: "" });

  useEffect(() => {
    window.scrollTo(0, 0);
    getProduct(id).then((p) => {
      setProduct(p);
      setSize(p.sizes?.[p.sizes.length - 1] || null);
      setActiveImg(0);
      getProducts({ category: p.category }).then((r) => setRelated(r.filter((x) => x.id !== p.id).slice(0, 4)));
    }).catch(() => navigate("/shop"));
    getReviews(id).then(setReviews).catch(() => {});
  }, [id, navigate]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.author || !form.body) return;
    await addReview(id, form);
    const r = await getReviews(id);
    setReviews(r);
    const p = await getProduct(id);
    setProduct(p);
    setForm({ author: "", rating: 5, body: "" });
  };

  if (!product) return <div className="container py-40 text-center text-muted">Loading…</div>;

  const avg = product.rating;
  const dist = [5, 4, 3, 2, 1].map((s) => reviews.filter((r) => r.rating === s).length);

  return (
    <div>
      <div className="container pt-8 pb-16">
        <Link to="/shop" className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-3 w-[76px] shrink-0">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} data-testid={`thumb-${i}`}
                  className={`aspect-square overflow-hidden rounded-[2px] border transition-colors ${activeImg === i ? "border-ink" : "border-transparent hover:border-line"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 relative bg-cream-deep rounded-[3px] overflow-hidden">
              {product.badges?.[0] && (
                <span className="absolute top-4 left-4 z-10 bg-cream text-ink text-[11px] tracking-[0.08em] px-3 py-1 rounded-full">{product.badges[0]}</span>
              )}
              <motion.img key={activeImg} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                src={product.images[activeImg]} alt={product.name} className="w-full aspect-[2/3] object-cover" data-testid="main-image" />
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-[12px] tracking-[0.2em] uppercase text-muted mb-3">{product.brand}</p>
            <h1 className="font-display text-4xl md:text-5xl leading-[1.05]" data-testid="product-title">{product.name}</h1>
            <div className="flex items-center gap-3 mt-4">
              <StarRating value={avg} size={15} />
              <span className="text-[13px] text-muted">{product.review_count} reviews</span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-2xl" data-testid="product-price">₹{product.price.toFixed(0)}</span>
              {product.compare_at_price && (
                <>
                  <span className="text-muted line-through text-[15px]">₹{product.compare_at_price.toFixed(0)}</span>
                  <span className="bg-sage text-ink text-[12px] px-2.5 py-1 rounded-full">{Math.round((1 - product.price / product.compare_at_price) * 100)}% Off</span>
                </>
              )}
            </div>
            <p className="text-ink-soft mt-5 leading-relaxed text-[15px]">{product.description}</p>

            {/* Size */}
            <div className="mt-8">
              <p className="text-[13px] mb-3">Size:</p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} data-testid={`size-${s}`}
                    className={`py-3.5 rounded-full text-[14px] border transition-colors ${size === s ? "bg-sage border-sage-deep text-ink" : "bg-transparent border-line hover:border-ink text-ink-soft"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to cart */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center border border-line rounded-full px-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3" data-testid="qty-minus" aria-label="Decrease"><Minus size={15} /></button>
                <span className="w-8 text-center" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-3" data-testid="qty-plus" aria-label="Increase"><Plus size={15} /></button>
              </div>
              <button onClick={() => addItem(product, size, qty)} data-testid="add-to-cart-btn"
                className="flex-1 bg-plum text-cream py-4 rounded-full text-[13px] tracking-[0.14em] uppercase hover:bg-ink transition-colors">
                Add to Cart
              </button>
              <button className="w-[52px] h-[52px] rounded-full border border-line flex items-center justify-center hover:border-ink transition-colors" aria-label="Wishlist" data-testid="wishlist-btn">
                <Heart size={18} strokeWidth={1.5} />
              </button>
            </div>
            <p className="text-[13px] text-muted mt-4">Ships free the week of your order.</p>

            {/* Features */}
            <div className="grid grid-cols-4 gap-2 mt-8 bg-cream-deep/50 rounded-[3px] p-5">
              {product.features.map((f, i) => {
                const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                return (
                  <div key={f} className="flex flex-col items-center text-center gap-2">
                    <Icon size={22} strokeWidth={1.3} />
                    <span className="text-[11px] text-ink-soft leading-tight">{f}</span>
                  </div>
                );
              })}
            </div>

            {/* Accordions */}
            <div className="mt-8 border-t border-line">
              {[
                { k: "detail", label: "Detail", body: product.detail },
                { k: "benefits", label: "Benefits", body: product.benefits.join(" · ") },
                { k: "howto", label: "How to Use", body: product.how_to_use },
                { k: "ingredients", label: "Ingredients", body: product.ingredients },
              ].map((a) => (
                <div key={a.k} className="border-b border-line">
                  <button onClick={() => setOpenAcc(openAcc === a.k ? "" : a.k)}
                    className="w-full flex items-center justify-between py-5 text-left" data-testid={`acc-${a.k}`}>
                    <span className="text-[15px] tracking-wide">{a.label}</span>
                    <ChevronDown size={18} className={`transition-transform ${openAcc === a.k ? "rotate-180" : ""}`} />
                  </button>
                  {openAcc === a.k && <p className="text-ink-soft text-[14.5px] leading-relaxed pb-5">{a.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="bg-cream-deep/40 py-20" data-testid="reviews-section">
        <div className="container">
          <h2 className="font-display text-4xl md:text-5xl mb-10">Customer Reviews</h2>
          <div className="grid md:grid-cols-[280px_1fr] gap-12">
            <div>
              <div className="flex items-end gap-3">
                <span className="font-display text-6xl leading-none">{avg}</span>
                <span className="text-muted mb-2">/ 5</span>
              </div>
              <StarRating value={avg} size={18} className="mt-2" />
              <p className="text-[13px] text-muted mt-2">Based on {reviews.length} reviews</p>
              <div className="mt-6 space-y-2">
                {dist.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 text-[13px]">
                    <span className="w-3 text-muted">{5 - i}</span>
                    <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                      <div className="h-full bg-sage-deep" style={{ width: reviews.length ? `${(c / reviews.length) * 100}%` : "0%" }} />
                    </div>
                    <span className="w-6 text-right text-muted">{c}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={submitReview} className="mt-8 space-y-3" data-testid="review-form">
                <p className="text-[13px] tracking-[0.14em] uppercase text-muted">Write a review</p>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Your name"
                  data-testid="review-name" className="w-full bg-paper border border-line rounded-full px-4 py-2.5 text-[14px] outline-none focus:border-ink" />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setForm({ ...form, rating: n })} data-testid={`review-star-${n}`}>
                      <StarRating value={n <= form.rating ? 5 : 0} size={18} className="!gap-0" />
                    </button>
                  ))}
                </div>
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Share your thoughts…" rows={3}
                  data-testid="review-body" className="w-full bg-paper border border-line rounded-[16px] px-4 py-3 text-[14px] outline-none focus:border-ink resize-none" />
                <button type="submit" data-testid="review-submit"
                  className="bg-ink text-cream px-6 py-2.5 rounded-full text-[12px] tracking-[0.12em] uppercase hover:bg-plum transition-colors">Submit Review</button>
              </form>
            </div>

            <div className="space-y-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-paper rounded-[3px] p-6 border border-line/60" data-testid={`review-${r.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[15px]">{r.author}</span>
                      {r.verified && <span className="text-[11px] text-sage-deep flex items-center gap-1"><CheckCircle2 size={12} /> Verified Buyer</span>}
                    </div>
                    <span className="text-[12px] text-muted">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <StarRating value={r.rating} size={13} className="mt-2" />
                  <p className="text-ink-soft text-[14.5px] leading-relaxed mt-3">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="container py-20" data-testid="related-section">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-4xl md:text-5xl">You May Also Like</h2>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-[13px] tracking-[0.12em] uppercase hover:opacity-60">View All <ArrowRight size={15} /></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      <FAQ />
    </div>
  );
}
