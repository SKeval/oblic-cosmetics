"""Backend tests for Oblic cosmetics - Razorpay integration."""
import os
import hmac
import hashlib
import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admiring-beaver-9.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"
RZP_KEY_ID = "rzp_test_TKDOtXPfFQfaSh"
RZP_KEY_SECRET = "qPHeQQlj0n0PymPDYhABet5B"

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


def _get_order_from_db(razorpay_order_id):
    async def _q():
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        doc = await db.orders.find_one({"razorpay_order_id": razorpay_order_id}, {"_id": 0})
        client.close()
        return doc
    return asyncio.get_event_loop().run_until_complete(_q()) if False else asyncio.run(_q())


# ---------- Basic ----------
def test_products_load(s):
    r = s.get(f"{API}/products")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 3


def test_payments_config(s):
    r = s.get(f"{API}/payments/config")
    assert r.status_code == 200
    data = r.json()
    assert data["enabled"] is True
    assert data["key_id"] == RZP_KEY_ID


# ---------- Razorpay order creation ----------
@pytest.fixture(scope="module")
def created_order(s):
    payload = {
        "items": [{"product_id": "p1", "name": "TEST Item", "price": 320, "qty": 1}],
        "email": "test@example.com",
        "name": "TEST User",
        "address": "TEST Addr",
        "contact": "9999999999",
        "pincode": "400001",
        "state": "Maharashtra",
    }
    r = s.post(f"{API}/payments/razorpay/order", json=payload)
    assert r.status_code == 200, r.text
    return r.json()


def test_razorpay_order_fields(created_order):
    d = created_order
    assert d["razorpay_order_id"].startswith("order_")
    assert d["amount"] == 32000
    assert d["currency"] == "INR"
    assert d["key_id"] == RZP_KEY_ID
    assert d["order_number"].startswith("OBL")
    assert d["total"] == 320
    assert "order_id" in d


def test_razorpay_order_persisted(created_order):
    doc = _get_order_from_db(created_order["razorpay_order_id"])
    assert doc is not None
    assert doc["status"] == "created"
    assert doc["order_number"] == created_order["order_number"]


def test_razorpay_order_empty_cart(s):
    payload = {"items": [], "email": "a@b.com", "name": "x", "contact": "9999999999", "pincode": "400001", "state": "Maharashtra"}
    r = s.post(f"{API}/payments/razorpay/order", json=payload)
    assert r.status_code == 400


# ---------- Verify success ----------
def test_verify_success_and_persist(s, created_order):
    rzp_order_id = created_order["razorpay_order_id"]
    payment_id = "pay_testABCD1234"
    msg = f"{rzp_order_id}|{payment_id}".encode()
    signature = hmac.new(RZP_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()

    r = s.post(f"{API}/payments/razorpay/verify", json={
        "razorpay_order_id": rzp_order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": signature,
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["status"] == "paid"
    assert data["order"]["status"] == "paid"
    assert data["order"]["razorpay_payment_id"] == payment_id
    assert "paid_at" in data["order"]

    doc = _get_order_from_db(rzp_order_id)
    assert doc["status"] == "paid"
    assert doc["razorpay_payment_id"] == payment_id
    assert doc.get("paid_at")


# ---------- Verify failure ----------
def test_verify_invalid_signature(s):
    # Create a new order specifically for this test
    payload = {
        "items": [{"product_id": "p2", "name": "TEST FailItem", "price": 500, "qty": 2}],
        "email": "fail@example.com",
        "name": "TEST Fail",
        "contact": "9999999999",
        "pincode": "400001",
        "state": "Maharashtra",
    }
    r = s.post(f"{API}/payments/razorpay/order", json=payload)
    assert r.status_code == 200
    rzp_order_id = r.json()["razorpay_order_id"]

    r2 = s.post(f"{API}/payments/razorpay/verify", json={
        "razorpay_order_id": rzp_order_id,
        "razorpay_payment_id": "pay_fake",
        "razorpay_signature": "invalidsignature_random_string_xyz",
    })
    assert r2.status_code == 400
    assert "verification failed" in r2.json().get("detail", "").lower()

    doc = _get_order_from_db(rzp_order_id)
    assert doc["status"] == "verification_failed"
