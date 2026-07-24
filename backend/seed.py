import uuid
from datetime import datetime, timezone, timedelta

# Real Oblic product photos
SHAMPOO = "https://customer-assets-39nsmqrw.emergentagent.net/job_admiring-beaver-9/artifacts/bnx98koa_1.1.webp"
OIL = "https://customer-assets-39nsmqrw.emergentagent.net/job_admiring-beaver-9/artifacts/sigbh016_2.1.webp"
SERUM = "https://customer-assets-39nsmqrw.emergentagent.net/job_admiring-beaver-9/artifacts/367tbx87_3.1.webp"

# Supporting stock imagery
A = "https://images.unsplash.com/photo-1696894756316-c18f512cf783?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
B = "https://images.unsplash.com/photo-1696894756299-345f1c0feb00?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
C = "https://images.unsplash.com/photo-1633171036157-78d53387fdc0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
D = "https://images.pexels.com/photos/8100691/pexels-photo-8100691.jpeg?auto=compress&cs=tinysrgb&w=1000"
E = "https://images.pexels.com/photos/7797735/pexels-photo-7797735.jpeg?auto=compress&cs=tinysrgb&w=1000"
F = "https://images.unsplash.com/photo-1616750819456-5cdee9b85d22?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
G = "https://images.pexels.com/photos/8533212/pexels-photo-8533212.jpeg?auto=compress&cs=tinysrgb&w=1000"
H = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
TEX = "https://images.unsplash.com/photo-1659007747376-3811b34e458f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
L1 = "https://images.unsplash.com/photo-1670201203208-055d6d79db4a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
L2 = "https://images.unsplash.com/photo-1555820585-c5ae44394b79?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
L3 = "https://images.unsplash.com/photo-1586220742613-b731f66f7743?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"

FEATURES = ["Safe & Non-toxic", "Dermatologist Created", "Biodegradable Ingredients", "Vegan & Cruelty-free"]

_DETAIL = ("Thoughtfully formulated for Indian hair and skin. This clean, plant-powered formula is "
           "paraben-free, mineral-oil free and crafted to deliver visible results with every use.")


def _p(name, category, price, compare, images, badges, rank, desc, benefits, howto, ingredients,
       rating=4.8, review_count=214, sizes=None, on_sale=False):
    return {
        "id": str(uuid.uuid4()),
        "slug": name.lower().replace(" ", "-").replace("!", "").replace("'", ""),
        "name": name,
        "brand": "Oblic",
        "category": category,
        "price": price,
        "compare_at_price": compare,
        "on_sale": on_sale,
        "images": images,
        "badges": badges,
        "featured_rank": rank,
        "rating": rating,
        "review_count": review_count,
        "sizes": sizes or ["Standard"],
        "description": desc,
        "benefits": benefits,
        "how_to_use": howto,
        "ingredients": ingredients,
        "detail": _DETAIL,
        "features": FEATURES,
    }


PRODUCTS = [
    _p("Rosemary Methi Shampoo", "Haircare", 499.0, 649.0,
       [SHAMPOO, L3, TEX], ["Best Seller"], 1,
       "A nourishing sulphate-free shampoo powered by rosemary and methi (fenugreek). Cleanses gently while nurturing the scalp, reducing hair fall and leaving hair soft, healthy and manageable.",
       ["Strengthens roots & reduces hair fall", "Soothes and nourishes the scalp", "Sulphate & mineral-oil free"],
       "Apply to wet hair, massage into scalp to build a lather, then rinse thoroughly. Use 3-4 times a week.",
       "Rosemary Extract, Fenugreek (Methi), Plant-derived Cleansers, Panthenol.",
       rating=4.9, review_count=186, sizes=["200ml"], on_sale=True),

    _p("Fenugreek Hair Oil", "Haircare", 399.0, 499.0,
       [OIL, B, L1], ["Best Seller"], 2,
       "A traditional fenugreek hair oil that strengthens hair from root to tip. Paraben-free and enriched with ancient botanicals to nourish the scalp and promote thicker, stronger hair.",
       ["Deeply nourishes scalp & roots", "Reduces breakage & split ends", "Paraben-free formula"],
       "Warm a small amount and massage into the scalp and hair. Leave for at least 30 minutes or overnight, then wash off.",
       "Fenugreek (Methi) Extract, Coconut Oil, Bhringraj, Amla, Vitamin E.",
       rating=4.8, review_count=142, sizes=["100ml"], on_sale=True),

    _p("Niacinamide Face Serum", "Skincare", 599.0, 799.0,
       [SERUM, E, L2], ["New"], 3,
       "Radiant skin, refined by science. This lightweight niacinamide serum with hyaluronic acid and Vitamin B5 minimises pores, brightens tone and hydrates deeply for all skin types.",
       ["Minimises pores & controls oil", "Brightens & evens skin tone", "Hydrates with hyaluronic acid"],
       "Apply 3-4 drops to cleansed skin morning and night, before moisturiser. Follow with SPF in the day.",
       "10% Niacinamide, Hyaluronic Acid, Panthenol (Vitamin B5), Licorice Extract.",
       rating=4.9, review_count=98, sizes=["30ml"], on_sale=True),

    _p("Hydrating Day Moisturiser", "Skincare", 549.0, None,
       [F, TEX, C], ["Best Seller"], 4,
       "A featherlight daily moisturiser that quenches skin and locks in hydration for a healthy, dewy glow.",
       ["24-hour hydration", "Non-greasy finish", "Strengthens skin barrier"],
       "Apply to cleansed face and neck each morning and night.",
       "Ceramides, Squalane, Shea Butter, Glycerin.",
       rating=4.7, review_count=210, sizes=["50ml"]),

    _p("Gentle Foaming Face Wash", "Skincare", 349.0, 449.0,
       [G, TEX, F], ["Limited Offer"], 5,
       "A soap-free foaming cleanser that lifts away dirt, oil and pollution without stripping the skin.",
       ["pH balanced clean", "Removes excess oil", "Fragrance-free"],
       "Massage a small amount onto damp skin, then rinse with water.",
       "Amino-acid Cleansers, Aloe Vera, Chamomile, Glycerin.",
       rating=4.6, review_count=134, sizes=["150ml"], on_sale=True),

    _p("Vitamin C Brightening Serum", "Skincare", 649.0, 899.0,
       [B, E, D], ["20% Off"], 6,
       "A brightening Vitamin C serum that fades dark spots and revives a radiant, even complexion.",
       ["Fades dark spots", "Boosts radiance", "Antioxidant protection"],
       "Apply a few drops to clean skin each morning before SPF.",
       "15% Vitamin C, Ferulic Acid, Vitamin E, Hyaluronic Acid.",
       rating=4.8, review_count=176, sizes=["30ml"], on_sale=True),

    _p("Onion Hair Regrowth Oil", "Haircare", 449.0, None,
       [B, L1, TEX], ["Award Winning"], 7,
       "A red onion hair oil that revitalises follicles, reduces hair fall and supports healthy regrowth.",
       ["Supports hair regrowth", "Reduces hair fall", "Adds shine & softness"],
       "Massage into scalp, leave for 1 hour or overnight, then wash off.",
       "Red Onion Extract, Bhringraj, Castor Oil, Rosemary.",
       rating=4.7, review_count=121, sizes=["100ml", "200ml"]),

    _p("Ubtan Body Lotion", "Bodycare", 399.0, None,
       [A, G, L1], ["Best Seller"], 8,
       "A traditional ubtan-inspired body lotion that softens, brightens and deeply moisturises skin all day.",
       ["All-day moisture", "Brightens skin tone", "Lightweight & fast-absorbing"],
       "Apply generously all over the body after a shower.",
       "Turmeric, Saffron, Sandalwood, Shea Butter.",
       rating=4.6, review_count=204, sizes=["200ml", "300ml"]),

    _p("Matte Liquid Lipstick", "Makeup", 349.0, None,
       [D, B, L2], ["New"], 9,
       "A long-wearing, high-pigment liquid lipstick with a comfortable matte finish that lasts all day.",
       ["Full-coverage colour", "Transfer-resistant", "Hydrating matte"],
       "Apply directly to lips, building to your desired intensity.",
       "Vitamin E, Jojoba Oil, Natural Waxes, Mineral Pigments.",
       rating=4.5, review_count=76, sizes=["One Size"]),

    _p("Rose Water Face Toner", "Skincare", 299.0, 399.0,
       [A, E, L2], ["Best Seller"], 10,
       "A refreshing rose water toner that hydrates, balances and preps skin for the rest of your routine.",
       ["Balances & refreshes", "Refines pores", "Alcohol-free"],
       "Sweep across cleansed skin with a cotton pad, morning and night.",
       "Pure Rose Water, Witch Hazel, Panthenol, Glycerin.",
       rating=4.7, review_count=158, sizes=["100ml", "200ml"], on_sale=True),

    _p("Argan Repair Hair Mask", "Haircare", 499.0, None,
       [C, TEX, F], ["Best Seller"], 11,
       "A deep-conditioning argan hair mask that repairs damage, tames frizz and restores silky shine.",
       ["Repairs damaged hair", "Smooths frizz", "Restores shine"],
       "Apply to washed, towel-dried hair. Leave for 10 minutes, then rinse.",
       "Argan Oil, Keratin, Shea Butter, Vitamin E.",
       rating=4.8, review_count=112, sizes=["200ml"]),

    _p("Aloe Soothing Gel", "Bodycare", 249.0, 349.0,
       [C, TEX, G], ["Limited Offer"], 12,
       "A multi-use aloe vera gel that soothes, hydrates and calms skin, hair and sunburn anywhere.",
       ["Soothes & calms", "Lightweight hydration", "Multi-purpose"],
       "Apply a thin layer to skin or hair as needed.",
       "99% Aloe Vera, Cucumber Extract, Vitamin E, Panthenol.",
       rating=4.6, review_count=189, sizes=["150ml", "300ml"], on_sale=True),
]

_names = ["Ananya S.", "Rahul M.", "Priya K.", "Arjun R.", "Sneha P.", "Vikram T.", "Ishita B.", "Karan D."]
_bodies = [
    "Absolutely love this! It feels lightweight, works beautifully, and I've noticed a real difference within a couple of weeks. Packed with clean ingredients and gentle on my skin.",
    "I've been searching for something that actually works and finally found it. Absorbs quickly, no greasy residue, and the natural ingredients leave me feeling refreshed. Highly recommend!",
    "Can't get enough of this! It's gentle yet effective and doesn't irritate my sensitive skin at all. The results speak for themselves. Will definitely repurchase.",
    "This is a game-changer! Great quality at a fair price and I love that it's paraben-free. My hair/skin has never looked better since I started using it.",
    "Honestly the best I've tried in this range. Noticeable improvement in texture and shine. Great value for money and lovely, clean formulation.",
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
     "answer": "Yes, all Oblic products are 100% vegan and cruelty-free. We're committed to ethical beauty and never test on animals at any stage of production."},
    {"id": str(uuid.uuid4()), "order": 2, "question": "Do your products contain parabens or sulfates?",
     "answer": "No. Our formulas are free from parabens, sulphates, and mineral oil. We use clean, skin-friendly ingredients backed by research."},
    {"id": str(uuid.uuid4()), "order": 3, "question": "Are your products suitable for sensitive skin?",
     "answer": "Most of our range is formulated for sensitive skin and is dermatologist-tested. We recommend a patch test before first use if you have specific concerns."},
    {"id": str(uuid.uuid4()), "order": 4, "question": "How do I know which product is right for me?",
     "answer": "Each product page lists the concerns it addresses. You can also reach our beauty advisors via chat for a personalised recommendation."},
    {"id": str(uuid.uuid4()), "order": 5, "question": "Do you ship across India?",
     "answer": "Yes, we ship pan-India. Enjoy free shipping on all orders over ₹999, with fast and reliable delivery to your doorstep."},
]
