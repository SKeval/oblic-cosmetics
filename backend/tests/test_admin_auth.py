"""Backend tests for admin JWT auth and protected admin endpoints."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admiring-beaver-9.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@oblic.com"
ADMIN_PASSWORD = "Oblic@Admin2026"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
    assert data["email"].lower() == ADMIN_EMAIL
    assert "name" in data
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, token):
        assert token

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401
        assert "detail" in r.json()

    def test_login_unknown_email(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nobody@oblic.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["email"].lower() == ADMIN_EMAIL
        assert "name" in d

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_bad_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer abc.def.ghi"})
        assert r.status_code == 401


# ---------- Protected admin endpoints ----------
class TestAdminProtection:
    def test_orders_no_token(self):
        assert requests.get(f"{API}/admin/orders").status_code == 401

    def test_orders_with_token(self, auth_headers):
        r = requests.get(f"{API}/admin/orders", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_stats_no_token(self):
        assert requests.get(f"{API}/admin/stats").status_code == 401

    def test_stats_with_token(self, auth_headers):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ("total_orders", "paid_orders", "revenue", "abandoned_carts"):
            assert k in d

    def test_abandoned_carts_no_token(self):
        r = requests.get(f"{API}/admin/abandoned-carts")
        assert r.status_code == 401, f"Expected 401 but got {r.status_code}: endpoint is unprotected!"

    def test_abandoned_carts_with_token(self, auth_headers):
        r = requests.get(f"{API}/admin/abandoned-carts", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_patch_order_no_token(self, auth_headers):
        # get an order id
        r = requests.get(f"{API}/admin/orders", headers=auth_headers)
        orders = r.json()
        if not orders:
            pytest.skip("no orders to test patch")
        oid = orders[0]["id"]
        r2 = requests.patch(f"{API}/admin/orders/{oid}", json={"status": "paid"})
        assert r2.status_code == 401

    def test_patch_order_with_token(self, auth_headers):
        # create a public order to have data
        payload = {
            "items": [{"product_id": "p1", "name": "Test", "price": 10.0, "qty": 1}],
            "email": "TEST_admin@example.com",
            "name": "TEST",
        }
        cr = requests.post(f"{API}/orders", json=payload)
        assert cr.status_code == 200
        oid = cr.json()["id"]
        r = requests.patch(f"{API}/admin/orders/{oid}", json={"status": "fulfilled"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["status"] == "fulfilled"


# ---------- Public endpoints regression ----------
class TestPublicRegression:
    def test_products_public(self):
        r = requests.get(f"{API}/products")
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) >= 1

    def test_create_order_public(self):
        payload = {
            "items": [{"product_id": "p1", "name": "T", "price": 5, "qty": 2}],
            "email": "TEST_pub@example.com", "name": "Pub",
        }
        r = requests.post(f"{API}/orders", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["total"] == 10.0
        assert d["status"] == "confirmed"

    def test_categories_public(self):
        r = requests.get(f"{API}/categories")
        assert r.status_code == 200
