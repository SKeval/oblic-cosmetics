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
- Rebranded to **Oblic**; 3 real products with client photos; INR pricing; FREE shipping across India
- About/Terms address = "Surat"; WhatsApp +91 8460067169 (wa.me/918460067169); Instagram @oblic_cosmetics
- New home hero = client banner image (full-width, links to /shop)
- Legal pages: /terms, /refund-policy, /shipping-policy
- **Razorpay** dynamic checkout (TEST mode): order create + signature verify + order marked paid
- **Admin dashboard** (/admin) with **secure JWT login** (bcrypt password, Bearer token); all /api/admin/* routes protected (401 without token)
- Footer: removed Shop column (Category + Company remain)
- **Abandoned cart** capture on checkout email blur; localStorage cart persistence
- All long dashes removed site-wide
- Tested: iterations 1-8 all pass (admin auth 17/17 pytest)

## Backlog / Next
- Razorpay LIVE: need live Key Secret for rzp_live_TKD8ohWtZjQHqN
- Rotate JWT_SECRET before production
- Add products as Makeup/Fragrances/Bodycare launch
- P2: order confirmation emails, abandoned-cart win-back emails, floating WhatsApp button, product search

## Backlog / Next
- Instamojo: currently a hosted payment-LINK redirect to https://www.instamojo.com/@obliccosmetics/ (order created as record, then user pays on Instamojo, quoting order number). Full API integration (auto amount + payment confirmation/webhook) requires Instamojo API keys.
- P1: Add products as new categories launch (Makeup/Fragrances/Bodycare)
- P2: User accounts, order history, wishlist, product search bar
