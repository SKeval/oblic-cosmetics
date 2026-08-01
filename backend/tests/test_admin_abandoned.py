"""Tests for Admin endpoints and abandoned cart capture."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admiring-beaver-9.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---------- Admin: orders list ----------
def test_admin_orders_list(s):
    r = s.get(f"{API}/admin/orders")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if data:
        o = data[0]
        for k in ("id", "order_number", "status", "total", "items", "created_at"):
            assert k in o, f"missing {k}"


# ---------- Admin: order status update ----------
@pytest.fixture(scope="module")
def a_created_order(s):
    payload = {
        "items": [{"product_id": "p1", "name": "TEST Admin Item", "price": 199, "qty": 2}],
        "email": "admintest@example.com",
        "name": "TEST Admin",
        "address": "TEST",
        "contact": "9999999998",
    }
    r = s.post(f"{API}/payments/razorpay/order", json=payload)
    assert r.status_code == 200, r.text
    return r.json()


def test_admin_patch_order_status(s, a_created_order):
    order_id = a_created_order["order_id"]
    r = s.patch(f"{API}/admin/orders/{order_id}", json={"status": "fulfilled"})
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["id"] == order_id
    assert doc["status"] == "fulfilled"

    # Verify persisted via list
    r2 = s.get(f"{API}/admin/orders")
    assert r2.status_code == 200
    found = [o for o in r2.json() if o["id"] == order_id]
    assert found and found[0]["status"] == "fulfilled"


def test_admin_patch_order_status_404(s):
    r = s.patch(f"{API}/admin/orders/{uuid.uuid4()}", json={"status": "fulfilled"})
    assert r.status_code == 404


# ---------- Abandoned cart upsert ----------
def test_abandoned_cart_upsert_and_list(s):
    email = f"test_ac_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": email,
        "name": "TEST Abandon",
        "items": [
            {"product_id": "p1", "name": "TEST AC", "price": 250, "qty": 3},
        ],
    }
    r = s.post(f"{API}/abandoned-cart", json=payload)
    assert r.status_code == 200
    assert r.json() == {"ok": True}

    # Update same email (upsert)
    payload["items"][0]["qty"] = 5
    r = s.post(f"{API}/abandoned-cart", json=payload)
    assert r.status_code == 200 and r.json()["ok"] is True

    # List
    r = s.get(f"{API}/admin/abandoned-carts")
    assert r.status_code == 200
    carts = r.json()
    mine = [c for c in carts if c["email"] == email]
    assert len(mine) == 1, "upsert should keep single row per email"
    c = mine[0]
    assert c["items"][0]["qty"] == 5
    assert c["total"] == round(250 * 5, 2)
    assert c.get("updated_at")


def test_abandoned_cart_empty_items_noop(s):
    r = s.post(f"{API}/abandoned-cart", json={
        "email": "empty_ac@example.com", "name": "x", "items": []
    })
    assert r.status_code == 200
    assert r.json() == {"ok": False}


# ---------- Admin stats ----------
def test_admin_stats(s):
    r = s.get(f"{API}/admin/stats")
    assert r.status_code == 200
    data = r.json()
    for k in ("total_orders", "paid_orders", "revenue", "abandoned_carts"):
        assert k in data
    assert isinstance(data["total_orders"], int)
    assert isinstance(data["paid_orders"], int)
    assert data["paid_orders"] <= data["total_orders"]
    assert isinstance(data["abandoned_carts"], int)
    assert data["revenue"] >= 0
