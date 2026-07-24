"""Lumina cosmetics store backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: read from frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------- Products ----------
class TestProducts:
    def test_list_products(self, s):
        r = s.get(f"{API}/products", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 12
        p = data[0]
        for k in ("id", "name", "price", "category", "images", "rating"):
            assert k in p
        assert "_id" not in p

    def test_filter_category(self, s):
        r = s.get(f"{API}/products", params={"category": "Skincare"})
        assert r.status_code == 200
        data = r.json()
        assert all(p["category"] == "Skincare" for p in data)
        assert len(data) > 0

    def test_filter_on_sale(self, s):
        r = s.get(f"{API}/products", params={"on_sale": "true"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p.get("on_sale") for p in data)

    def test_sort_price_asc(self, s):
        r = s.get(f"{API}/products", params={"sort": "price_asc"})
        assert r.status_code == 200
        prices = [p["price"] for p in r.json()]
        assert prices == sorted(prices)

    def test_sort_price_desc(self, s):
        r = s.get(f"{API}/products", params={"sort": "price_desc"})
        prices = [p["price"] for p in r.json()]
        assert prices == sorted(prices, reverse=True)

    def test_get_product_by_id(self, s):
        products = s.get(f"{API}/products").json()
        pid = products[0]["id"]
        r = s.get(f"{API}/products/{pid}")
        assert r.status_code == 200
        assert r.json()["id"] == pid

    def test_get_product_not_found(self, s):
        r = s.get(f"{API}/products/nonexistent-id-xyz")
        assert r.status_code == 404


class TestCategories:
    def test_categories(self, s):
        r = s.get(f"{API}/categories")
        assert r.status_code == 200
        cats = r.json()
        assert "Skincare" in cats
        assert isinstance(cats, list)


# ---------- Reviews ----------
class TestReviews:
    def test_list_reviews(self, s):
        products = s.get(f"{API}/products").json()
        pid = products[0]["id"]
        r = s.get(f"{API}/products/{pid}/reviews")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert all(r["product_id"] == pid for r in data)

    def test_create_review_and_persist(self, s):
        products = s.get(f"{API}/products").json()
        pid = products[0]["id"]
        before = s.get(f"{API}/products/{pid}/reviews").json()
        payload = {"author": "TEST_Reviewer", "rating": 5, "body": "TEST review body content."}
        r = s.post(f"{API}/products/{pid}/reviews", json=payload)
        assert r.status_code == 200
        review = r.json()
        assert review["author"] == "TEST_Reviewer"
        assert review["rating"] == 5
        assert review["product_id"] == pid

        after = s.get(f"{API}/products/{pid}/reviews").json()
        assert len(after) == len(before) + 1

        # product aggregates updated
        prod = s.get(f"{API}/products/{pid}").json()
        assert prod["review_count"] == len(after)

    def test_review_on_missing_product(self, s):
        r = s.post(f"{API}/products/no-such-id/reviews",
                   json={"author": "x", "rating": 5, "body": "y"})
        assert r.status_code == 404


# ---------- FAQs ----------
class TestFAQs:
    def test_faqs(self, s):
        r = s.get(f"{API}/faqs")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 5
        assert "question" in data[0] and "answer" in data[0]


# ---------- Newsletter ----------
class TestNewsletter:
    def test_subscribe(self, s):
        r = s.post(f"{API}/newsletter", json={"email": "TEST_new@example.com"})
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True
        assert "message" in d

    def test_subscribe_duplicate(self, s):
        s.post(f"{API}/newsletter", json={"email": "TEST_dup@example.com"})
        r = s.post(f"{API}/newsletter", json={"email": "TEST_dup@example.com"})
        assert r.status_code == 200
        assert "already" in r.json()["message"].lower()

    def test_subscribe_invalid_email(self, s):
        r = s.post(f"{API}/newsletter", json={"email": "not-an-email"})
        assert r.status_code == 422


# ---------- Orders ----------
class TestOrders:
    def test_place_order(self, s):
        products = s.get(f"{API}/products").json()
        p = products[0]
        payload = {
            "items": [{"product_id": p["id"], "name": p["name"],
                       "price": p["price"], "qty": 2, "size": "50ml",
                       "image": p["images"][0]}],
            "email": "TEST_order@example.com",
            "name": "Test Buyer",
            "address": "1 Test St",
        }
        r = s.post(f"{API}/orders", json=payload)
        assert r.status_code == 200
        order = r.json()
        assert order["status"] == "confirmed"
        assert order["order_number"].startswith("LUM")
        assert order["total"] == round(p["price"] * 2, 2)
        assert "_id" not in order

    def test_order_invalid_email(self, s):
        r = s.post(f"{API}/orders", json={"items": [], "email": "bad", "name": "x"})
        assert r.status_code == 422
