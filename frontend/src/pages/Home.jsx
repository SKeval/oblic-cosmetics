import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getProducts } from "../api";
import ProductCard from "../components/ProductCard";
import FAQ from "../components/FAQ";

const HERO = "https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/6a663a877846ac520feaace68ffa2487bc34c8cd7545d22ba9d868a3d9ee5632.jpeg";
const LIFESTYLE = "https://images.unsplash.com/photo-1555820585-c5ae44394b79?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

const CATS = [
  { name: "Skincare", img: "https://images.unsplash.com/photo-1616750819456-5cdee9b85d22?crop=entropy&cs=srgb&fm=jpg&q=85&w=700" },
  { name: "Fragrances", img: "https://images.unsplash.com/photo-1696894756299-345f1c0feb00?crop=entropy&cs=srgb&fm=jpg&q=85&w=700" },
  { name: "Bodycare", img: "https://images.pexels.com/photos/8533212/pexels-photo-8533212.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "Makeup", img: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?crop=entropy&cs=srgb&fm=jpg&q=85&w=700" },
];

const MARQUEE = ["Vegan & Cruelty-Free", "Dermatologist Created", "Biodegradable Ingredients", "Clean Formulas", "Free Shipping Over $100"];

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {products.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Categories */}
      <section className="container pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATS.map((c, i) => (
            <Link to="/shop" key={c.name} data-testid={`category-${c.name.toLowerCase()}`}
              className="relative aspect-[3/4] overflow-hidden rounded-[3px] group">
              <img src={c.img} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-ink/20 group-hover:bg-ink/35 transition-colors" />
              <span className="absolute bottom-5 left-5 font-display text-cream text-2xl">{c.name}</span>
            </Link>
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
