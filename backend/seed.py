import uuid
from datetime import datetime, timezone, timedelta

A = "https://images.unsplash.com/photo-1696894756316-c18f512cf783?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
B = "https://images.unsplash.com/photo-1696894756299-345f1c0feb00?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
C = "https://images.unsplash.com/photo-1633171036157-78d53387fdc0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
D = "https://images.pexels.com/photos/8100691/pexels-photo-8100691.jpeg?auto=compress&cs=tinysrgb&w=1000"
E = "https://images.pexels.com/photos/7797735/pexels-photo-7797735.jpeg?auto=compress&cs=tinysrgb&w=1000"
F = "https://images.unsplash.com/photo-1616750819456-5cdee9b85d22?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
G = "https://images.pexels.com/photos/8533212/pexels-photo-8533212.jpeg?auto=compress&cs=tinysrgb&w=1000"
H = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
I = "https://images.unsplash.com/photo-1613803745799-ba6c10aace85?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
J = "https://images.unsplash.com/photo-1631730486572-226d1f595b68?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
TEX = "https://images.unsplash.com/photo-1659007747376-3811b34e458f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
L1 = "https://images.unsplash.com/photo-1670201203208-055d6d79db4a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
L2 = "https://images.unsplash.com/photo-1555820585-c5ae44394b79?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
L3 = "https://images.unsplash.com/photo-1586220742613-b731f66f7743?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"

FEATURES = ["Safe & Non-toxic", "Dermatologist Created", "Biodegradable Ingredients", "Vegan & Cruelty-free"]

_DETAIL = ("A reliable bodyguard for your skin, with secret uses. This lightweight, long lasting "
           "formula will save you from the harshest conditions, while also protecting dry skin, "
           "discoloured tattoos, darker scars and more.")


def _p(name, brand, category, price, compare, images, badges, rank, desc, benefits, howto, ingredients,
       rating=4.8, review_count=214, sizes=None, on_sale=False):
    return {
        "id": str(uuid.uuid4()),
        "slug": name.lower().replace(" ", "-").replace("!", "").replace("'", ""),
        "name": name,
        "brand": brand,
        "category": category,
        "price": price,
        "compare_at_price": compare,
        "on_sale": on_sale,
        "images": images,
        "badges": badges,
        "featured_rank": rank,
        "rating": rating,
        "review_count": review_count,
        "sizes": sizes or ["50ml", "100ml"],
        "description": desc,
        "benefits": benefits,
        "how_to_use": howto,
        "ingredients": ingredients,
        "detail": _DETAIL,
        "features": FEATURES,
    }


PRODUCTS = [
    _p("Oh My Bod! Sunscreen Lotion", "Everyday Humans", "Skincare", 16.0, 20.0,
       [C, A, TEX, D, L1, L2], ["Best Seller"], 1,
       "A reliable bodyguard for your skin, with secret uses. This lightweight, long lasting SPF50 sunscreen lotion will save you from the harshest midday sun, while also protecting dry skin, discoloured tattoos, darker scars, gel manicure UV exposures and more.",
       ["Broad spectrum SPF50 protection", "Weightless, non-greasy finish", "Infused with cucumber & green tea"],
       "Apply generously 15 minutes before sun exposure. Reapply every 2 hours.",
       "Cucumber extract, Green Tea, Hyaluronic Acid, Zinc Oxide.",
       rating=4.9, review_count=214, sizes=["50ml", "100ml"], on_sale=True),

    _p("Turmeric Clarifying Face Wash", "Vita Naturals", "Skincare", 34.0, None,
       [F, TEX, E, L3], ["New"], 2,
       "A gentle daily cleanser that lifts away impurities and excess oil without stripping your skin's natural barrier.",
       ["Brightens dull skin", "Balances oil production", "Soothes with turmeric"],
       "Massage a small amount onto damp skin, then rinse with warm water.",
       "Turmeric, Niacinamide, Glycerin, Aloe Vera.",
       rating=4.7, review_count=134),

    _p("Hyaluronic Acid Toner Plus", "Estelle", "Skincare", 30.0, 40.0,
       [A, B, E, L2], ["Limited Offer"], 3,
       "An ultra-hydrating toner that plumps and preps your skin for the rest of your routine.",
       ["Deep hydration", "Refines pores", "Alcohol-free formula"],
       "Sweep across cleansed skin with a cotton pad, morning and night.",
       "Hyaluronic Acid, Panthenol, Witch Hazel, Rose Water.",
       rating=4.6, review_count=167, on_sale=True),

    _p("Foamy Soap-Free Cream", "Newborne Basics", "Skincare", 24.0, None,
       [G, TEX, F], ["Best Seller"], 4,
       "A soap-free cleansing cream that gently melts away makeup and grime, leaving skin soft.",
       ["Zero-residue clean", "pH balanced", "Fragrance-free"],
       "Work into a foam with water and massage over face, then rinse.",
       "Coconut-derived surfactants, Chamomile, Glycerin.",
       rating=4.5, review_count=1244),

    _p("Squalane Cleanser", "The Ordinary", "Skincare", 36.0, None,
       [H, TEX, I], ["Best Seller"], 5,
       "A silky squalane-based cleanser that dissolves impurities while nourishing the skin barrier.",
       ["Melts makeup & SPF", "Nourishing squalane", "Non-comedogenic"],
       "Apply to dry skin, massage, add water to emulsify, then rinse.",
       "Squalane, Ceramides, Vitamin E.",
       rating=4.8, review_count=98),

    _p("Original Musk Oil", "Kiehl's", "Fragrances", 32.0, 40.0,
       [B, J, D], ["Award Winning"], 6,
       "A timeless, warm musk oil with soft floral undertones for an intimate signature scent.",
       ["Long-lasting warmth", "Skin-safe oil base", "Layerable scent"],
       "Dab onto pulse points. Layer as desired.",
       "Musk accord, Sandalwood, Vanilla, Jojoba Oil.",
       rating=4.9, review_count=41, sizes=["15ml", "30ml"], on_sale=True),

    _p("Protect Body Mist", "FRE", "Bodycare", 18.0, 30.0,
       [A, G, L1], ["Best Seller"], 7,
       "A refreshing protective body mist that hydrates and shields skin throughout the day.",
       ["Instant refresh", "All-day hydration", "Antioxidant boost"],
       "Mist generously over body after showering or anytime.",
       "Aloe, Vitamin C, Green Tea, Cucumber.",
       rating=4.7, review_count=214, on_sale=True),

    _p("Holy Moisturizing Cream", "Belif", "Skincare", 40.0, None,
       [F, TEX, C], ["Best Seller"], 8,
       "A rich yet breathable moisturizer that quenches thirsty skin and locks in hydration overnight.",
       ["24-hour moisture", "Strengthens barrier", "Non-sticky finish"],
       "Apply to face and neck as the last step of your routine.",
       "Lady's Mantle, Ceramides, Shea Butter, Squalane.",
       rating=4.8, review_count=352),

    _p("Glow Me Vitamin C Serum", "Estelle", "Skincare", 39.0, 49.0,
       [B, E, J], ["20% Off"], 9,
       "A brightening vitamin C serum that fades dark spots and revives a radiant, even complexion.",
       ["Fades dark spots", "Boosts radiance", "Antioxidant defence"],
       "Apply 3-4 drops to clean skin each morning before SPF.",
       "15% Vitamin C, Ferulic Acid, Vitamin E, Hyaluronic Acid.",
       rating=4.9, review_count=289, sizes=["30ml", "50ml"], on_sale=True),

    _p("Velvet Matte Lipstick", "Lumina", "Makeup", 26.0, None,
       [I, J, L2], ["New"], 10,
       "A creamy, high-pigment matte lipstick that glides on smoothly and lasts for hours.",
       ["Full coverage colour", "Comfortable matte", "Hydrating formula"],
       "Apply directly to lips, building to desired intensity.",
       "Shea Butter, Vitamin E, Natural Waxes, Mineral Pigments.",
       rating=4.6, review_count=76, sizes=["One Size"]),

    _p("Nourish Repair Hair Oil", "Kiehl's", "Haircare", 28.0, 34.0,
       [B, J, L3], ["Best Seller"], 11,
       "A lightweight hair oil that tames frizz, adds shine, and repairs damaged ends.",
       ["Smooths frizz", "Adds glossy shine", "Heat protection"],
       "Warm a few drops between palms and smooth through damp or dry hair.",
       "Argan Oil, Camellia Oil, Vitamin E, Rosemary Extract.",
       rating=4.7, review_count=118, sizes=["50ml", "100ml"], on_sale=True),

    _p("Calm Skin Rescue Balm", "Belif", "Bodycare", 22.0, None,
       [C, TEX, F], ["New"], 12,
       "A multi-use rescue balm that soothes dry patches, cuticles, and irritated skin anywhere.",
       ["Soothes irritation", "Deeply nourishing", "Travel-friendly"],
       "Apply a thin layer to dry or irritated areas as needed.",
       "Centella Asiatica, Beeswax, Shea Butter, Panthenol.",
       rating=4.8, review_count=64, sizes=["30ml", "60ml"]),
]

_names = ["Isabella P.", "Liam S.", "Olivia M.", "Ethan R.", "Sophia L.", "Noah B.", "Ava T.", "Mia K."]
_bodies = [
    "Absolutely love this! It feels lightweight, blends seamlessly into my skin without any white cast, and leaves a soft, dewy finish. Packed with nourishing ingredients — a must-have in my daily routine.",
    "I've been searching for the perfect product and finally found it. So hydrating, absorbs quickly, and doesn't leave a greasy residue. The natural ingredients make my skin feel revitalized and refreshed.",
    "Can't get enough of this! It's gentle yet effective at doing its job without stripping my skin's natural oils. The calming scent is a bonus and I've never looked better since incorporating it into my routine.",
    "This is a game-changer! It's lightweight, absorbs beautifully, and has visibly improved the texture of my skin. I appreciate the sustainable packaging and the clean ingredients used.",
    "Honestly the best I've tried. My skin looks noticeably brighter and healthier after just two weeks of consistent use. Highly recommend to anyone on the fence.",
    "Great product with clean ingredients. The texture is lovely and it feels luxurious without the luxury price tag. Will be repurchasing.",
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
     "answer": "Yes, all Lumina products are 100% vegan and cruelty-free. We're committed to ethical beauty and never test on animals at any stage of production."},
    {"id": str(uuid.uuid4()), "order": 2, "question": "Do your products contain parabens or sulfates?",
     "answer": "No. Our formulas are free from parabens, sulfates, and phthalates. We use clean, skin-friendly ingredients backed by dermatological research."},
    {"id": str(uuid.uuid4()), "order": 3, "question": "Are your products suitable for sensitive skin?",
     "answer": "Most of our range is formulated for sensitive skin and is dermatologist-tested. We recommend a patch test before first use if you have specific concerns."},
    {"id": str(uuid.uuid4()), "order": 4, "question": "How do I know which product is right for my skin type?",
     "answer": "Each product page lists the skin types and concerns it addresses. You can also reach our beauty advisors via chat for a personalised recommendation."},
    {"id": str(uuid.uuid4()), "order": 5, "question": "Where are your products made?",
     "answer": "Our products are thoughtfully formulated and manufactured in facilities that meet strict quality and sustainability standards."},
]
