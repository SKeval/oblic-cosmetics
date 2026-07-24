import React from "react";
import { MapPin, MessageCircle, Instagram, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ADDRESS = "314 The Gellery Business Hub 2, near Mahaveer Chowk, Yogichowk, Surat, Gujarat 395011.";
export const WHATSAPP_DISPLAY = "+91 17623 067169";
export const WHATSAPP_LINK = "https://wa.me/9117623067169";
export const INSTAGRAM_LINK = "https://www.instagram.com/oblic_cosmetics";
export const MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(ADDRESS);

const HERO = "https://images.unsplash.com/photo-1555820585-c5ae44394b79?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400";

export default function About() {
  return (
    <div data-testid="about-page">
      {/* Intro */}
      <section className="container pt-14 pb-8">
        <p className="text-[12px] tracking-[0.25em] uppercase text-muted mb-4">Our Story</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] max-w-3xl">Luxury in Every Touch</h1>
        <p className="text-ink-soft mt-6 max-w-2xl text-[16px] leading-relaxed">
          Oblic is a homegrown Indian beauty brand crafting clean, plant-powered rituals for hair and skin.
          Every formula is paraben-free, sulphate-free and mineral-oil free — thoughtfully made in India,
          never tested on animals, and designed to feel like a small daily luxury.
        </p>
      </section>

      <section className="container pb-16">
        <div className="rounded-[4px] overflow-hidden">
          <img src={HERO} alt="Oblic ritual" className="w-full h-[320px] md:h-[440px] object-cover" />
        </div>
      </section>

      {/* Contact */}
      <section className="bg-cream-deep/50 py-20" data-testid="contact-section">
        <div className="container">
          <h2 className="font-display text-4xl md:text-5xl mb-12">Visit & Connect</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Address */}
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" data-testid="about-address"
              className="bg-paper rounded-[3px] p-8 border border-line/60 group hover:border-ink/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-plum text-cream flex items-center justify-center mb-6">
                <MapPin size={20} strokeWidth={1.6} />
              </div>
              <p className="text-[12px] tracking-[0.16em] uppercase text-muted mb-3">Our Address</p>
              <p className="text-ink-soft text-[15px] leading-relaxed">{ADDRESS}</p>
              <span className="inline-flex items-center gap-1.5 mt-5 text-[13px] tracking-wide group-hover:gap-2.5 transition-all">
                Get directions <ArrowRight size={14} />
              </span>
            </a>

            {/* WhatsApp */}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" data-testid="about-whatsapp"
              className="bg-paper rounded-[3px] p-8 border border-line/60 group hover:border-ink/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-plum text-cream flex items-center justify-center mb-6">
                <MessageCircle size={20} strokeWidth={1.6} />
              </div>
              <p className="text-[12px] tracking-[0.16em] uppercase text-muted mb-3">WhatsApp Us</p>
              <p className="text-ink text-[18px] font-medium">{WHATSAPP_DISPLAY}</p>
              <p className="text-muted text-[14px] mt-1">Mon–Sat, 10am – 7pm</p>
              <span className="inline-flex items-center gap-1.5 mt-5 text-[13px] tracking-wide group-hover:gap-2.5 transition-all">
                Chat with us <ArrowRight size={14} />
              </span>
            </a>

            {/* Instagram */}
            <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" data-testid="about-instagram"
              className="bg-paper rounded-[3px] p-8 border border-line/60 group hover:border-ink/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-plum text-cream flex items-center justify-center mb-6">
                <Instagram size={20} strokeWidth={1.6} />
              </div>
              <p className="text-[12px] tracking-[0.16em] uppercase text-muted mb-3">Follow Us</p>
              <p className="text-ink text-[18px] font-medium">@oblic_cosmetics</p>
              <p className="text-muted text-[14px] mt-1">Tips, launches & behind the scenes</p>
              <span className="inline-flex items-center gap-1.5 mt-5 text-[13px] tracking-wide group-hover:gap-2.5 transition-all">
                Follow on Instagram <ArrowRight size={14} />
              </span>
            </a>
          </div>

          <div className="mt-12 text-center">
            <Link to="/shop" data-testid="about-shop-cta"
              className="inline-flex items-center gap-2 bg-plum text-cream px-8 py-4 rounded-full text-[13px] tracking-[0.12em] uppercase hover:bg-ink transition-colors">
              Shop the Collection <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
