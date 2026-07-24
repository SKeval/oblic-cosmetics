from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Lumina API")
api_router = APIRouter(prefix="/api")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    author: str
    rating: int
    title: Optional[str] = ""
    body: str
    verified: bool = True
    created_at: str = Field(default_factory=now_iso)


class ReviewCreate(BaseModel):
    author: str
    rating: int
    title: Optional[str] = ""
    body: str


class NewsletterCreate(BaseModel):
    email: EmailStr


class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    size: Optional[str] = None
    image: Optional[str] = None
    qty: int = 1


class OrderCreate(BaseModel):
    items: List[CartItem]
    email: EmailStr
    name: str
    address: Optional[str] = ""


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Lumina API"}


@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    on_sale: Optional[bool] = None,
    tag: Optional[str] = None,
    sort: Optional[str] = "featured",
    search: Optional[str] = None,
):
    query = {}
    if category and category.lower() != "all":
        query["category"] = category
    if on_sale:
        query["on_sale"] = True
    if tag:
        query["badges"] = tag
    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    cursor = db.products.find(query, {"_id": 0})
    products = await cursor.to_list(500)

    if sort == "price_asc":
        products.sort(key=lambda p: p["price"])
    elif sort == "price_desc":
        products.sort(key=lambda p: p["price"], reverse=True)
    elif sort == "rating":
        products.sort(key=lambda p: p.get("rating", 0), reverse=True)
    else:
        products.sort(key=lambda p: p.get("featured_rank", 999))

    return products


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@api_router.get("/categories")
async def get_categories():
    cats = await db.products.distinct("category")
    return sorted(cats)


@api_router.get("/products/{product_id}/reviews")
async def get_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(500)
    reviews.sort(key=lambda r: r["created_at"], reverse=True)
    return reviews


@api_router.post("/products/{product_id}/reviews", response_model=Review)
async def add_review(product_id: str, payload: ReviewCreate):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    review = Review(product_id=product_id, **payload.model_dump())
    await db.reviews.insert_one(review.model_dump())

    all_reviews = await db.reviews.find({"product_id": product_id}).to_list(1000)
    count = len(all_reviews)
    avg = round(sum(r["rating"] for r in all_reviews) / count, 1) if count else 0
    await db.products.update_one({"id": product_id}, {"$set": {"rating": avg, "review_count": count}})
    return review


@api_router.get("/faqs")
async def get_faqs():
    faqs = await db.faqs.find({}, {"_id": 0}).to_list(100)
    faqs.sort(key=lambda f: f.get("order", 0))
    return faqs


@api_router.post("/newsletter")
async def subscribe(payload: NewsletterCreate):
    existing = await db.newsletter.find_one({"email": payload.email})
    if existing:
        return {"message": "You're already subscribed.", "ok": True}
    await db.newsletter.insert_one({"email": payload.email, "created_at": now_iso()})
    return {"message": "Welcome to Lumina. Your 10% code is LUMINA10.", "ok": True}


@api_router.post("/orders")
async def create_order(payload: OrderCreate):
    total = round(sum(i.price * i.qty for i in payload.items), 2)
    order = {
        "id": str(uuid.uuid4()),
        "order_number": "LUM" + str(uuid.uuid4().int)[:8],
        "items": [i.model_dump() for i in payload.items],
        "email": payload.email,
        "name": payload.name,
        "address": payload.address,
        "total": total,
        "status": "confirmed",
        "created_at": now_iso(),
    }
    await db.orders.insert_one({k: v for k, v in order.items()})
    order.pop("_id", None)
    return order


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def seed_data():
    from seed import PRODUCTS, REVIEWS, FAQS
    if await db.products.count_documents({}) == 0:
        await db.products.insert_many([dict(p) for p in PRODUCTS])
        logger.info(f"Seeded {len(PRODUCTS)} products")
    if await db.reviews.count_documents({}) == 0:
        await db.reviews.insert_many([dict(r) for r in REVIEWS])
        logger.info(f"Seeded {len(REVIEWS)} reviews")
    if await db.faqs.count_documents({}) == 0:
        await db.faqs.insert_many([dict(f) for f in FAQS])
        logger.info(f"Seeded {len(FAQS)} faqs")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
