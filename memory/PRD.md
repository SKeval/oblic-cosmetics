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
- Home: hero, marquee, best-seller grid (8), category tiles, editorial split, FAQ
- Shop: category radio filters, On Sale checkbox, sort dropdown, result count
- Product Detail: gallery + thumbnails, size selector, qty, add-to-cart, feature icons, accordions (Detail/Benefits/How to Use/Ingredients), reviews (with submit form + rating distribution), You May Also Like
- Cart drawer (qty update/remove) + Checkout page (order confirmation)
- Newsletter subscribe (footer)
- Backend: /api/products, /api/products/{id}, /api/categories, /api/products/{id}/reviews (GET/POST), /api/faqs, /api/newsletter, /api/orders
- Seed: 12 products across Skincare/Makeup/Haircare/Fragrances/Bodycare, ~72 reviews, 5 FAQs
- Tested: backend 100% (17 pytest), frontend 100% (all flows)

## Backlog / Next
- P1: Swap in user's real brand name, logo, and product catalog/images (user to provide)
- P1: Wishlist persistence, product search bar
- P2: Real payment integration (Stripe), user accounts, order history
- P2: Blog/journal, brand pages, product variants beyond size
