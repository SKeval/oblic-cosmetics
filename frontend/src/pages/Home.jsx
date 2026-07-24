import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import FAQ from "../components/FAQ";

const HERO = "https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/7d90171b8012048ab26a3f5efd17148d8b2805030ffc55cb0b204808f9edde18.jpeg";
const LIFESTYLE = "https://images.unsplash.com/photo-1555820585-c5ae44394b79?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

const CATS = [
  { name: "Skincare", to: "/shop?category=Skincare", soon: false, img: "https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/ea440177fda1ce339730408c4835940fb25ebeb5c4907431406699e0fbe315e5.jpeg" },
  { name: "Haircare", to: "/shop?category=Haircare", soon: false, img: "https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/aa4daf1a289a885e3ff7e33822d2663887859cb841d434cdebbc36e450beecc3.jpeg" },
  { name: "Makeup", soon: true, img: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?crop=entropy&cs=srgb&fm=jpg&q=85&w=700" },
  { name: "Fragrances", soon: true, img: "https://images.unsplash.com/photo-1696894756299-345f1c0feb00?crop=entropy&cs=srgb&fm=jpg&q=85&w=700" },
];

const MARQUEE = ["Vegan & Cruelty-Free", "Dermatologist Created", "Paraben & Sulphate Free", "Made in India", "Free Shipping Across India"];

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => { getProducts({ sort: "featured" }).then(setProducts).catch(() => {}); }, []);

  return (
    <div>
      {/* Hero */}
      <section className="container pt-6">
        <div className="relative rounded-[4px] overflow-hidden">
          <img src={HERO} alt="Curated collections" className="w-full h-[460px] md:h-[560px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-cream/80 text-[12px] tracking-[0.25em] uppercase mb-4">Shop All</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-cream text-5xl md:text-7xl leading-[0.95]">Explore Our<br />Curated Collections</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="text-cream/90 mt-5 max-w-md text-[15px]">From skincare essentials to beauty must-haves, discover everything you need to elevate your routine.</motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.45 }}>
              <Link to="/shop" data-testid="hero-cta"
                className="inline-flex items-center gap-2 mt-8 bg-cream text-ink px-8 py-4 rounded-full text-[13px] tracking-[0.12em] uppercase hover:bg-paper transition-colors group w-fit">
                Shop Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
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

      {/* Best sellers */}
      <section className="container py-20" data-testid="bestsellers-section">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-5xl md:text-6xl leading-none">Best Seller</h2>
            <p className="text-ink-soft mt-3 max-w-md text-[15px]">Our most-loved products, handpicked by beauty enthusiasts like you.</p>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-[13px] tracking-[0.12em] uppercase hover:opacity-60 transition-opacity">
            View All <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
          {products.slice(0, 6).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
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
              <Link to={c.to} key={c.name} data-testid={`category-${c.name.toLowerCase()}`}
                className="relative aspect-[3/4] overflow-hidden rounded-[3px] group">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-ink/25 group-hover:bg-ink/40 transition-colors" />
                <span className="absolute bottom-5 left-5 font-display text-cream text-2xl">{c.name}</span>
              </Link>
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
            <Link to="/shop" className="inline-flex items-center gap-2 mt-8 text-[13px] tracking-[0.12em] uppercase border-b border-ink pb-1 hover:gap-3 transition-all">
              Discover the range <ArrowRight size={15} />
            </Link>
          </div>
          <img src={LIFESTYLE} alt="Ritual" className="w-full h-full max-h-[520px] object-cover" />
        </div>
      </section>

      <FAQ />
    </div>
  );
}
