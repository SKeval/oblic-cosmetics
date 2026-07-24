import uuid
from datetime import datetime, timezone, timedelta

# Generated high-res Oblic product photos (no visible branding)
SHAMPOO = "https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/aa4daf1a289a885e3ff7e33822d2663887859cb841d434cdebbc36e450beecc3.jpeg"
OIL = "https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/8b4aed20ca4530a78f80f8e3429d6fbfcb394327080d72a8804da694aba44f15.jpeg"
SERUM = "https://static.prod-images.emergentagent.com/jobs/9cbde7ef-f666-41b7-bd92-6df367c19404/images/ea440177fda1ce339730408c4835940fb25ebeb5c4907431406699e0fbe315e5.jpeg"

# Relevant lifestyle imagery
HAIR1 = "https://images.unsplash.com/photo-1564141696939-9eb6e957ccfc?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
HAIR2 = "https://images.pexels.com/photos/8484212/pexels-photo-8484212.jpeg?auto=compress&cs=tinysrgb&w=1000"
SERUMLIFE = "https://images.pexels.com/photos/33794143/pexels-photo-33794143.jpeg?auto=compress&cs=tinysrgb&w=1000"

# PDF label detail crops (served from frontend /public)
SHAMPOO_DETAIL = "/shampoo-detail.jpg"
OIL_DETAIL = "/oil-detail.jpg"
SERUM_DETAIL = "/serum-detail.jpg"


def _p(**kw):
    kw.setdefault("brand", "Oblic")
    kw.setdefault("id", str(uuid.uuid4()))
    kw.setdefault("features", ["For All Hair Types", "Paraben Free", "Not Tested on Animals", "100% Made in India"])
    return kw


PRODUCTS = [
    _p(
        slug="rosemary-methi-shampoo",
        name="Rosemary Methi Shampoo",
        category="Haircare",
        price=320.0,
        compare_at_price=400.0,
        on_sale=True,
        images=[SHAMPOO, HAIR1, SHAMPOO_DETAIL],
        badges=["Best Seller"],
        featured_rank=1,
        rating=4.9,
        review_count=186,
        sizes=["200ml"],
        description="A gentle, soap-free shampoo powered by rosemary and methi (fenugreek). It cleanses hair while nourishing the scalp, leaving hair soft, smooth and easy to manage — for all hair types.",
        benefits=["Scalp nourishment & soft hair feel", "Plant-extract nourishment blend", "Smoothness & easy manageability"],
        how_to_use="Apply to wet hair, massage into the scalp to build a lather, then rinse thoroughly. Use 3-4 times a week for best results.",
        ingredients="Almond Oil, Olive Oil, Refined Coconut Oil, Amla Oil, Fenugreek Seed Oil, Fragrance, Butylated Hydroxytoluene.",
        detail="Soap-free, paraben-free and mineral-oil free. 200ml / 6.76 fl. oz. For external use only. Keep in a cool, dry, dark place. Best before 24 months from manufacture. Luxury in Every Touch.",
        features=["Soap Free", "Paraben Free", "Mineral Oil Free", "100% Made in India"],
    ),
    _p(
        slug="fenugreek-hair-oil",
        name="Fenugreek Hair Oil",
        category="Haircare",
        price=180.0,
        compare_at_price=225.0,
        on_sale=True,
        images=[OIL, HAIR2, OIL_DETAIL],
        badges=["Best Seller"],
        featured_rank=2,
        rating=4.8,
        review_count=142,
        sizes=["100ml"],
        description="A traditional fenugreek hair oil that nourishes roots and strengthens hair. Enriched with almond, olive, coconut and amla oils to condition the scalp, reduce hair fall and add natural shine.",
        benefits=["Nourishes roots & strengthens hair", "Conditions the scalp & reduces hair fall", "Adds natural shine"],
        how_to_use="Warm a small amount and gently massage into the scalp. Let it sit for 30-60 minutes (or overnight) before shampooing. Use twice weekly as a pre-shampoo treatment.",
        ingredients="Almond Oil, Olive Oil, Refined Coconut Oil, Amla Oil, Fenugreek Seed Oil, Fragrance, Butylated Hydroxytoluene.",
        detail="Paraben-free and sulphate-free. 100ml / 3.38 fl. oz. For external use only. Store in a cool, dry, dark place, away from sunlight. Best before 24 months from manufacture. Luxury in Every Touch.",
        features=["Paraben Free", "Sulphate Free", "Not Tested on Animals", "100% Made in India"],
    ),
    _p(
        slug="niacinamide-face-serum",
        name="Niacinamide Face Serum",
        category="Skincare",
        price=540.0,
        compare_at_price=675.0,
        on_sale=True,
        images=[SERUM, SERUMLIFE, SERUM_DETAIL],
        badges=["New"],
        featured_rank=3,
        rating=4.9,
        review_count=98,
        sizes=["30ml"],
        description="Radiant skin, refined by science. A lightweight niacinamide serum with hyaluronic acid and licorice extract that deeply hydrates, brightens the complexion, soothes irritation and refines skin texture — for all skin types.",
        benefits=["Deep hydration for soft, supple skin", "Brightens complexion & reduces dark spots", "Soothes irritation & refines texture"],
        how_to_use="Apply 2-3 drops to cleansed face after toning. Gently pat or press into the skin until absorbed, then follow with moisturiser. Apply sunscreen in the morning.",
        ingredients="Niacinamide, Hyaluronic Acid, Licorice Extract, Glycerin, Betaine, Propylene Glycol, Citric Acid, Aqua.",
        detail="Radiant Skin. Refined by Science. 30ml / 1.01 fl. oz. For external use only. Store in a cool, dry, dark place, away from sunlight. Discontinue if irritation occurs.",
        features=["Deeply Hydrating", "Brightening", "Dermatologist Tested", "100% Made in India"],
    ),
]


_names = ["Ananya S.", "Rahul M.", "Priya K.", "Arjun R.", "Sneha P.", "Vikram T.", "Ishita B.", "Karan D."]
_bodies = [
    "Absolutely love this! It feels lightweight, works beautifully, and I've noticed a real difference within a couple of weeks. Gentle and clean, exactly what I wanted.",
    "I've been searching for something that actually works and finally found it. Absorbs quickly with no greasy residue, and the natural ingredients leave me feeling refreshed. Highly recommend!",
    "Can't get enough of this! It's gentle yet effective and doesn't irritate my sensitive skin at all. The results speak for themselves. Will definitely repurchase.",
    "This is a game-changer! Great quality at a fair price and I love that it's paraben-free. My hair has never looked better since I started using it.",
    "Honestly the best I've tried in this range. Noticeable improvement in texture and shine. Great value for money and a lovely clean formulation.",
    "Really impressed with the quality. Feels premium, smells subtle, and does exactly what it promises. A staple in my daily routine now.",
]


def _reviews_for(pid, base):
    out = []
    for k in range(6):
        out.append({
            "id": str(uuid.uuid4()),
            "product_id": pid,
            "author": _names[k % len(_names)],
            "rating": 5 if k % 4 else 4,
            "title": "",
            "body": _bodies[k % len(_bodies)],
            "verified": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=k * 3 + base)).isoformat(),
        })
    return out


REVIEWS = []
for idx, prod in enumerate(PRODUCTS):
    REVIEWS.extend(_reviews_for(prod["id"], idx))


FAQS = [
    {"id": str(uuid.uuid4()), "order": 1, "question": "Are your products vegan and cruelty-free?",
     "answer": "Yes, all Oblic products are cruelty-free and never tested on animals at any stage of production. We're committed to ethical, clean beauty."},
    {"id": str(uuid.uuid4()), "order": 2, "question": "Do your products contain parabens or sulphates?",
     "answer": "No. Our formulas are free from parabens, sulphates and mineral oil. We use clean, skin-friendly ingredients — 100% made in India."},
    {"id": str(uuid.uuid4()), "order": 3, "question": "Are your products suitable for sensitive skin?",
     "answer": "Yes. Our range is gentle and suitable for all skin and hair types. We still recommend a patch test before first use if you have specific concerns."},
    {"id": str(uuid.uuid4()), "order": 4, "question": "How do I know which product is right for me?",
     "answer": "Each product page lists the concerns it addresses and how to use it. You can also reach our team via chat for a personalised recommendation."},
    {"id": str(uuid.uuid4()), "order": 5, "question": "Do you ship across India?",
     "answer": "Yes, we ship pan-India. Enjoy free shipping on all orders over ₹999, with fast and reliable delivery to your doorstep."},
]
