from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from typing import List, Optional
import uuid
import re
from datetime import datetime, timezone, timedelta
import razorpay
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
razorpay_client = (
    razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET else None
)

JWT_SECRET = os.environ.get('JWT_SECRET', 'oblic-dev-secret')
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(email: str) -> str:
    payload = {"sub": email, "type": "access", "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def require_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    admin = await db.admins.find_one({"email": payload.get("sub")})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return {"email": admin["email"], "name": admin.get("name", "Admin")}


async def require_customer(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    customer = await db.customers.find_one({"email": payload.get("sub")})
    if not customer:
        raise HTTPException(status_code=401, detail="Account not found")
    return {"id": customer["id"], "email": customer["email"], "name": customer.get("name", "")}


async def get_current_customer_optional(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        return None
    customer = await db.customers.find_one({"email": payload.get("sub")})
    if not customer:
        return None
    return {"id": customer["id"], "email": customer["email"], "name": customer.get("name", "")}


app = FastAPI(title="Oblic API")
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


INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
]
INDIAN_MOBILE_RE = re.compile(r"^[6-9]\d{9}$")
INDIAN_PINCODE_RE = re.compile(r"^[1-9]\d{5}$")
STATE_ALIASES = {"pondicherry": "puducherry", "orissa": "odisha", "nct of delhi": "delhi"}


def normalize_state(s: str) -> str:
    key = s.strip().lower()
    return STATE_ALIASES.get(key, key)


async def lookup_pincode_state(pincode: str) -> Optional[str]:
    """Best-effort PIN code -> state lookup via India Post's public API. Returns None
    (rather than raising) on any failure so a flaky third party never blocks checkout."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"https://api.postalpincode.in/pincode/{pincode}")
            data = resp.json()
            if data and data[0].get("Status") == "Success":
                offices = data[0].get("PostOffice") or []
                if offices:
                    return offices[0].get("State")
    except Exception:
        pass
    return None


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


class RazorpayOrderCreate(BaseModel):
    items: List[CartItem]
    email: EmailStr
    name: str
    address: Optional[str] = ""
    contact: str
    pincode: str
    state: str

    @field_validator("contact")
    @classmethod
    def validate_contact(cls, v):
        v = v.strip()
        if not INDIAN_MOBILE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return v

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v):
        v = v.strip()
        if not INDIAN_PINCODE_RE.match(v):
            raise ValueError("Enter a valid 6-digit Indian PIN code")
        return v

    @field_validator("state")
    @classmethod
    def validate_state(cls, v):
        if v not in INDIAN_STATES:
            raise ValueError("Select a valid Indian state")
        return v


class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class RazorpayCancel(BaseModel):
    razorpay_order_id: str


class OrderStatusUpdate(BaseModel):
    status: str


class AbandonedCart(BaseModel):
    email: EmailStr
    name: Optional[str] = ""
    items: List[CartItem]


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class CustomerRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class CustomerLogin(BaseModel):
    email: EmailStr
    password: str


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Oblic API"}


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


@api_router.post("/newsletter")
async def subscribe(payload: NewsletterCreate):
    existing = await db.newsletter.find_one({"email": payload.email})
    if existing:
        return {"message": "You're already subscribed.", "ok": True}
    await db.newsletter.insert_one({"email": payload.email, "created_at": now_iso()})
    return {"message": "Welcome to Oblic. Your 10% code is OBLIC10.", "ok": True}


@api_router.post("/orders")
async def create_order(payload: OrderCreate, customer: Optional[dict] = Depends(get_current_customer_optional)):
    total = round(sum(i.price * i.qty for i in payload.items), 2)
    order = {
        "id": str(uuid.uuid4()),
        "order_number": "OBL" + str(uuid.uuid4().int)[:8],
        "items": [i.model_dump() for i in payload.items],
        "email": payload.email,
        "name": payload.name,
        "address": payload.address,
        "total": total,
        "status": "confirmed",
        "customer_id": customer["id"] if customer else None,
        "created_at": now_iso(),
    }
    await db.orders.insert_one({k: v for k, v in order.items()})
    order.pop("_id", None)
    return order


# ---------- Pincode lookup ----------
@api_router.get("/pincode/{pincode}")
async def get_pincode_state(pincode: str):
    if not INDIAN_PINCODE_RE.match(pincode):
        raise HTTPException(status_code=400, detail="Invalid PIN code format")
    state = await lookup_pincode_state(pincode)
    return {"pincode": pincode, "state": state}


# ---------- Razorpay Payments ----------
@api_router.get("/payments/config")
async def payments_config():
    return {"enabled": razorpay_client is not None, "key_id": RAZORPAY_KEY_ID}


@api_router.post("/payments/razorpay/order")
async def create_razorpay_order(payload: RazorpayOrderCreate, customer: Optional[dict] = Depends(get_current_customer_optional)):
    if razorpay_client is None:
        raise HTTPException(status_code=503, detail="Payment gateway not configured. Please add Razorpay API keys.")
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    resolved_state = await lookup_pincode_state(payload.pincode)
    if resolved_state and normalize_state(resolved_state) != normalize_state(payload.state):
        raise HTTPException(
            status_code=400,
            detail=f"This PIN code belongs to {resolved_state}, not {payload.state}. Please check your address.",
        )

    total = round(sum(i.price * i.qty for i in payload.items), 2)
    amount_paise = int(round(total * 100))
    order_number = "OBL" + str(uuid.uuid4().int)[:8]

    try:
        rzp_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": order_number,
            "payment_capture": 1,
            "notes": {"customer": payload.name, "email": payload.email},
        })
    except Exception as e:
        logger.error(f"Razorpay order create failed: {e}")
        raise HTTPException(status_code=502, detail="Could not create payment order. Check Razorpay keys.")

    order = {
        "id": str(uuid.uuid4()),
        "order_number": order_number,
        "razorpay_order_id": rzp_order["id"],
        "items": [i.model_dump() for i in payload.items],
        "email": payload.email,
        "name": payload.name,
        "address": payload.address,
        "contact": payload.contact,
        "pincode": payload.pincode,
        "state": payload.state,
        "total": total,
        "status": "created",
        "customer_id": customer["id"] if customer else None,
        "created_at": now_iso(),
    }
    await db.orders.insert_one({k: v for k, v in order.items()})

    return {
        "razorpay_order_id": rzp_order["id"],
        "amount": amount_paise,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID,
        "order_number": order_number,
        "order_id": order["id"],
        "name": payload.name,
        "email": payload.email,
        "contact": payload.contact,
        "total": total,
    }


@api_router.post("/payments/razorpay/verify")
async def verify_razorpay(payload: RazorpayVerify):
    if razorpay_client is None:
        raise HTTPException(status_code=503, detail="Payment gateway not configured.")
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        })
    except Exception:
        await db.orders.update_one(
            {"razorpay_order_id": payload.razorpay_order_id},
            {"$set": {"status": "verification_failed"}},
        )
        raise HTTPException(status_code=400, detail="Payment verification failed")

    await db.orders.update_one(
        {"razorpay_order_id": payload.razorpay_order_id},
        {"$set": {
            "status": "paid",
            "razorpay_payment_id": payload.razorpay_payment_id,
            "paid_at": now_iso(),
        }},
    )
    order = await db.orders.find_one({"razorpay_order_id": payload.razorpay_order_id}, {"_id": 0})
    if order and order.get("email"):
        await db.abandoned_carts.delete_many({"email": order["email"]})
    return {"status": "paid", "order": order}


@api_router.post("/payments/razorpay/cancel")
async def cancel_razorpay_order(payload: RazorpayCancel):
    # Only flips orders still in "created" (never-completed checkout) so this can never
    # clobber a status that already progressed via a real payment/verification.
    result = await db.orders.update_one(
        {"razorpay_order_id": payload.razorpay_order_id, "status": "created"},
        {"$set": {"status": "cancelled"}},
    )
    return {"ok": True, "cancelled": result.modified_count > 0}


# ---------- Abandoned Cart ----------
@api_router.post("/abandoned-cart")
async def save_abandoned_cart(payload: AbandonedCart):
    if not payload.items:
        return {"ok": False}
    total = round(sum(i.price * i.qty for i in payload.items), 2)
    await db.abandoned_carts.update_one(
        {"email": payload.email},
        {"$set": {
            "email": payload.email,
            "name": payload.name,
            "items": [i.model_dump() for i in payload.items],
            "total": total,
            "updated_at": now_iso(),
        }},
        upsert=True,
    )
    return {"ok": True}


# ---------- Admin Auth ----------
@api_router.post("/auth/login")
async def admin_login(payload: LoginInput):
    admin = await db.admins.find_one({"email": payload.email.lower()})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(admin["email"])
    return {"token": token, "email": admin["email"], "name": admin.get("name", "Admin")}


@api_router.get("/auth/me")
async def admin_me(admin=Depends(require_admin)):
    return admin


# ---------- Customer Auth ----------
@api_router.post("/auth/customer/register")
async def customer_register(payload: CustomerRegister):
    email = payload.email.lower()
    existing = await db.customers.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    customer = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": email,
        "password_hash": hash_password(payload.password),
        "created_at": now_iso(),
    }
    await db.customers.insert_one(customer)
    token = create_access_token(customer["email"])
    return {"token": token, "email": customer["email"], "name": customer["name"]}


@api_router.post("/auth/customer/login")
async def customer_login(payload: CustomerLogin):
    customer = await db.customers.find_one({"email": payload.email.lower()})
    if not customer or not verify_password(payload.password, customer["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(customer["email"])
    return {"token": token, "email": customer["email"], "name": customer.get("name", "")}


@api_router.get("/auth/customer/me")
async def customer_me(customer=Depends(require_customer)):
    return customer


# ---------- Admin ----------
@api_router.get("/admin/orders")
async def admin_orders(admin=Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    orders.sort(key=lambda o: o.get("created_at", ""), reverse=True)
    return orders


@api_router.patch("/admin/orders/{order_id}")
async def admin_update_order(order_id: str, payload: OrderStatusUpdate, admin=Depends(require_admin)):
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": payload.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return order


@api_router.get("/admin/abandoned-carts")
async def admin_abandoned_carts(admin=Depends(require_admin)):
    carts = await db.abandoned_carts.find({}, {"_id": 0}).to_list(1000)
    carts.sort(key=lambda c: c.get("updated_at", ""), reverse=True)
    return carts


@api_router.get("/admin/stats")
async def admin_stats(admin=Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(2000)
    paid = [o for o in orders if o.get("status") == "paid"]
    revenue = round(sum(o.get("total", 0) for o in paid), 2)
    abandoned = await db.abandoned_carts.count_documents({})
    return {
        "total_orders": len(orders),
        "paid_orders": len(paid),
        "revenue": revenue,
        "abandoned_carts": abandoned,
    }


# ---------- Customer ----------
@api_router.get("/customer/orders")
async def customer_orders(customer=Depends(require_customer)):
    orders = await db.orders.find(
        {"$or": [
            {"customer_id": customer["id"]},
            {"email": {"$regex": f"^{re.escape(customer['email'])}$", "$options": "i"}},
        ]},
        {"_id": 0},
    ).to_list(1000)
    orders.sort(key=lambda o: o.get("created_at", ""), reverse=True)
    return orders


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
    from seed import PRODUCTS, REVIEWS
    if await db.products.count_documents({}) == 0:
        await db.products.insert_many([dict(p) for p in PRODUCTS])
        logger.info(f"Seeded {len(PRODUCTS)} products")
    if await db.reviews.count_documents({}) == 0:
        await db.reviews.insert_many([dict(r) for r in REVIEWS])
        logger.info(f"Seeded {len(REVIEWS)} reviews")

    # Seed / update admin account
    if ADMIN_EMAIL and ADMIN_PASSWORD:
        existing = await db.admins.find_one({"email": ADMIN_EMAIL.lower()})
        if existing is None:
            await db.admins.insert_one({
                "email": ADMIN_EMAIL.lower(),
                "password_hash": hash_password(ADMIN_PASSWORD),
                "name": "Admin",
                "created_at": now_iso(),
            })
            logger.info("Seeded admin account")
        elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.admins.update_one(
                {"email": ADMIN_EMAIL.lower()},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info("Updated admin password")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
