"""Backend tests for the OBLIC20 first-order coupon (20% off)."""
import os
import hmac
import hashlib
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admiring-beaver-9.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"
RZP_KEY_SECRET = "qPHeQQlj0n0PymPDYhABet5B"

VALID_ADDRESS = {"address": "TEST Addr", "contact": "9876543210", "pincode": "400001", "state": "Maharashtra"}


def _fresh_email():
    return f"TEST_coupon_{uuid.uuid4().hex[:8]}@example.com"


def _pay_for_order(email, amount):
    """Creates a razorpay order and completes it with a validly-signed verify call,
    so the email has a real 'paid' order on record for first-order-only checks."""
    r = requests.post(f"{API}/payments/razorpay/order", json={
        "items": [{"product_id": "p1", "name": "TEST Item", "price": amount, "qty": 1}],
        "email": email, "name": "TEST Payer", **VALID_ADDRESS,
    })
    assert r.status_code == 200, r.text
    rzp_order_id = r.json()["razorpay_order_id"]
    payment_id = f"pay_test_{uuid.uuid4().hex[:10]}"
    msg = f"{rzp_order_id}|{payment_id}".encode()
    signature = hmac.new(RZP_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()
    v = requests.post(f"{API}/payments/razorpay/verify", json={
        "razorpay_order_id": rzp_order_id, "razorpay_payment_id": payment_id, "razorpay_signature": signature,
    })
    assert v.status_code == 200, v.text


# ---------- /coupons/apply ----------
def test_apply_valid_coupon_first_order():
    email = _fresh_email()
    r = requests.post(f"{API}/coupons/apply", json={"code": "OBLIC20", "email": email, "subtotal": 500})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["code"] == "OBLIC20"
    assert data["percent"] == 20
    assert data["discount_amount"] == 100.0


def test_apply_coupon_case_insensitive():
    email = _fresh_email()
    r = requests.post(f"{API}/coupons/apply", json={"code": "oblic20", "email": email, "subtotal": 200})
    assert r.status_code == 200, r.text
    assert r.json()["code"] == "OBLIC20"
    assert r.json()["discount_amount"] == 40.0


def test_apply_invalid_coupon_code():
    email = _fresh_email()
    r = requests.post(f"{API}/coupons/apply", json={"code": "NOTAREALCODE", "email": email, "subtotal": 500})
    assert r.status_code == 400
    assert "isn't valid" in r.json()["detail"].lower()


def test_apply_coupon_rejected_after_prior_paid_order():
    email = _fresh_email()
    _pay_for_order(email, 250)
    r = requests.post(f"{API}/coupons/apply", json={"code": "OBLIC20", "email": email, "subtotal": 500})
    assert r.status_code == 400
    assert "first order" in r.json()["detail"].lower()


# ---------- Coupon applied at actual order creation ----------
def test_order_creation_applies_discount():
    email = _fresh_email()
    r = requests.post(f"{API}/payments/razorpay/order", json={
        "items": [{"product_id": "p1", "name": "TEST Item", "price": 100, "qty": 1}],
        "email": email, "name": "TEST Buyer", "coupon_code": "OBLIC20", **VALID_ADDRESS,
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["subtotal"] == 100.0
    assert data["coupon_code"] == "OBLIC20"
    assert data["discount_amount"] == 20.0
    assert data["total"] == 80.0
    assert data["amount"] == 8000  # paise, matches the discounted total, not the subtotal


def test_order_creation_rejects_invalid_coupon():
    email = _fresh_email()
    r = requests.post(f"{API}/payments/razorpay/order", json={
        "items": [{"product_id": "p1", "name": "TEST Item", "price": 100, "qty": 1}],
        "email": email, "name": "TEST Buyer", "coupon_code": "FAKECODE", **VALID_ADDRESS,
    })
    assert r.status_code == 400


def test_order_creation_without_coupon_charges_full_amount():
    email = _fresh_email()
    r = requests.post(f"{API}/payments/razorpay/order", json={
        "items": [{"product_id": "p1", "name": "TEST Item", "price": 100, "qty": 1}],
        "email": email, "name": "TEST Buyer", **VALID_ADDRESS,
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["coupon_code"] is None
    assert data["discount_amount"] == 0.0
    assert data["total"] == 100.0
