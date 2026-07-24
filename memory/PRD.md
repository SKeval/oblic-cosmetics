# Lumina — Cosmetics Store (Redesign)

## Original Problem Statement
User wanted to redesign their cosmetics website to match reference images of "Lumina" — an elegant editorial cosmetics store (cream background, deep plum accents, serif headings). User chose: full site, fully functional store, minimalist palette, sample products (to swap in their own brand/products later).

## Architecture
- **Frontend**: React 19 + React Router + Tailwind + framer-motion + lucide-react. Fonts: Fraunces (display serif) + Hanken Grotesk (body).
- **Backend**: FastAPI + MongoDB (motor). Auto-seeds on startup from seed.py.
- **Cart**: client-side via CartContext (localStorage); orders POST to backend.

## Palette (minimalist)
Cream #F4F1EA base, ink #1E1B18, plum #2E2438 accent, sage #D7DCC4 highlight.

## Implemented (2026-06)
- Rebranded to **Oblic** (logo extracted from client PDF, transparent PNG in navbar/footer/mobile menu)
- **3 real products only** with accurate label details + generated high-res brandless product photos:
  - Rosemary Methi Shampoo (Haircare, 200ml) — ₹320 (MRP ₹400)
  - Fenugreek Hair Oil (Haircare, 100ml) — ₹180 (MRP ₹225)
  - Niacinamide Face Serum (Skincare, 30ml) — ₹540 (MRP ₹675)
- Pricing fully in **INR (₹)** across cards/detail/cart/checkout; free shipping over ₹999; "Made in India" messaging
- Upcoming categories (Makeup, Fragrances, Bodycare) shown as creative **"Coming Soon"** tiles (home) and disabled "SOON" filters (shop)
- Clean brandless hero image (no fake labels)
- Home: hero, marquee, best-sellers (3), category grid w/ coming-soon, editorial, FAQ
- Shop: category filters + coming-soon, on-sale, sort, result count
- Product Detail, Cart drawer, Checkout, Newsletter, Reviews — all functional
- Tested earlier: backend 100%, frontend 100%

## Backlog / Next
- P1: Razorpay integration for real INR payments
- P1: Add products as new categories launch (Makeup/Fragrances/Bodycare)
- P2: User accounts, order history, wishlist, product search bar
