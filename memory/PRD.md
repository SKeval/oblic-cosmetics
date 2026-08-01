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
- Rebranded to **Oblic** (logo from client PDF)
- 3 real products (Rosemary Methi Shampoo ₹320, Fenugreek Hair Oil ₹180, Niacinamide Face Serum ₹540) with client photos on neutral studio bg; each product gallery = [product, relevant lifestyle, PDF label detail]
- INR (₹) pricing; FREE shipping across India on all orders (checkout shipping=0)
- Product cards/detail use aspect-[2/3] object-cover (no crop)
- **About page** (/about): story + Address, WhatsApp (+91 7623067169, wa.me/917623067169), Instagram (@oblic_cosmetics)
- Footer: Facebook + Instagram only (both -> Instagram); address + WhatsApp; all column links functional
- **Legal pages**: /terms, /refund-policy, /shipping-policy (text from client HTML, rendered via PolicyLayout)
- Checkout -> Instamojo hosted payment link redirect
- All long dashes (em/en) removed site-wide
- Tested: iteration_1/2/3 all frontend 100%

## Backlog / Next
- Razorpay LIVE: switch backend/.env to live pair (need live Key Secret for rzp_live_TKD8ohWtZjQHqN) to accept real payments
- Add products as Makeup/Fragrances/Bodycare launch
- P2: user accounts, order history, wishlist, search bar, floating WhatsApp button, admin orders view

## Backlog / Next
- Instamojo: currently a hosted payment-LINK redirect to https://www.instamojo.com/@obliccosmetics/ (order created as record, then user pays on Instamojo, quoting order number). Full API integration (auto amount + payment confirmation/webhook) requires Instamojo API keys.
- P1: Add products as new categories launch (Makeup/Fragrances/Bodycare)
- P2: User accounts, order history, wishlist, product search bar
