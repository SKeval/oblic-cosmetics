import React, { useState } from "react";
import { Link } from "react-router-dom";
import { subscribe } from "../api";
import { Facebook, Instagram, MapPin, MessageCircle } from "lucide-react";
import { ADDRESS, WHATSAPP_DISPLAY, WHATSAPP_LINK, INSTAGRAM_LINK, MAPS_LINK } from "../pages/About";

const COLS = [
  { title: "Category", links: [
    { label: "Skincare", to: "/?category=Skincare#shop" },
    { label: "Haircare", to: "/?category=Haircare#shop" },
    { label: "Makeup", to: "/#shop" },
    { label: "Fragrances", to: "/#shop" },
    { label: "Bodycare", to: "/#shop" },
  ]},
  { title: "Company", links: [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/about" },
    { label: "Terms & Conditions", to: "/terms" },
    { label: "Refund Policy", to: "/refund-policy" },
    { label: "Shipping Policy", to: "/shipping-policy" },
  ]},
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await subscribe(email);
      setMsg(res.message);
      setEmail("");
    } catch {
      setMsg("Please enter a valid email.");
    }
  };

  return (
    <footer className="mt-24" data-testid="footer">
      {/* Newsletter band */}
      <div className="bg-plum text-cream">
        <div className="container py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[12px] tracking-[0.2em] uppercase opacity-70 mb-3">Thoughtfully Curated Gifts</p>
            <h3 className="font-display text-4xl md:text-5xl leading-[1.05]">Enjoy 10% Off<br />Your First Order</h3>
            <p className="mt-4 text-cream/70 max-w-md text-[15px]">
              Sign up and receive an exclusive discount code for your first purchase. Join Oblic and elevate your beauty ritual.
            </p>
          </div>
          <form onSubmit={submit} className="md:justify-self-end w-full max-w-md" data-testid="newsletter-form">
            <div className="flex items-center bg-cream rounded-full p-1.5 pl-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                data-testid="newsletter-input"
                className="flex-1 bg-transparent text-ink outline-none text-[15px] placeholder:text-muted"
              />
              <button type="submit" data-testid="newsletter-submit"
                className="bg-plum text-cream rounded-full px-7 py-3 text-[13px] tracking-[0.1em] uppercase hover:bg-ink transition-colors">
                Shop Now
              </button>
            </div>
            {msg && <p className="mt-3 text-cream/80 text-sm" data-testid="newsletter-msg">{msg}</p>}
          </form>
        </div>
      </div>

      <div className="bg-cream-deep">
        <div className="container py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <img src="/oblic-logo.png" alt="Oblic" className="h-8 w-auto" />
            <p className="text-ink-soft text-[14px] mt-4 max-w-xs">Clean, considered beauty for the everyday ritual, crafted in India.</p>
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 mt-5 text-[13.5px] text-ink-soft hover:text-ink transition-colors max-w-xs" data-testid="footer-address">
              <MapPin size={16} strokeWidth={1.6} className="mt-0.5 shrink-0" /> <span>{ADDRESS}</span>
            </a>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-3 text-[13.5px] text-ink-soft hover:text-ink transition-colors" data-testid="footer-whatsapp">
              <MessageCircle size={16} strokeWidth={1.6} /> {WHATSAPP_DISPLAY}
            </a>
            <div className="flex gap-3 mt-6">
              <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-testid="footer-facebook"
                className="w-9 h-9 rounded-full border border-ink/20 flex items-center justify-center hover:bg-plum hover:text-cream hover:border-plum transition-colors">
                <Facebook size={15} strokeWidth={1.6} />
              </a>
              <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-testid="footer-instagram"
                className="w-9 h-9 rounded-full border border-ink/20 flex items-center justify-center hover:bg-plum hover:text-cream hover:border-plum transition-colors">
                <Instagram size={15} strokeWidth={1.6} />
              </a>
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="text-[12px] tracking-[0.18em] uppercase text-muted mb-4">{c.title}</p>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}><Link to={l.to} className="text-[14.5px] text-ink-soft hover:text-ink transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="container border-t border-line py-6 flex flex-col sm:flex-row justify-between gap-3 text-[13px] text-muted">
          <span>© {new Date().getFullYear()} Oblic. All rights reserved.</span>
          <div className="flex gap-4 flex-wrap">
            <Link to="/terms" className="hover:text-ink transition-colors" data-testid="footer-terms">Terms & Conditions</Link>
            <Link to="/refund-policy" className="hover:text-ink transition-colors" data-testid="footer-refund">Refund Policy</Link>
            <Link to="/shipping-policy" className="hover:text-ink transition-colors" data-testid="footer-shipping">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
