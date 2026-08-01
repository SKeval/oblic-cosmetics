"""Backend tests for customer registration, login, and order history."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admiring-beaver-9.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

CUSTOMER_EMAIL = f"TEST_customer_{uuid.uuid4().hex[:8]}@example.com"
CUSTOMER_PASSWORD = "Test@Customer2026"
CUSTOMER_NAME = "Test Customer"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{API}/auth/customer/register", json={
        "name": CUSTOMER_NAME, "email": CUSTOMER_EMAIL, "password": CUSTOMER_PASSWORD,
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
    assert data["email"].lower() == CUSTOMER_EMAIL.lower()
    assert data["name"] == CUSTOMER_NAME
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Registration ----------
class TestRegister:
    def test_register_success(self, token):
        assert token

    def test_register_duplicate_email(self):
        r = requests.post(f"{API}/auth/customer/register", json={
            "name": "Dup", "email": CUSTOMER_EMAIL, "password": "whatever",
        })
        assert r.status_code == 400
        assert "detail" in r.json()


# ---------- Login ----------
class TestLogin:
    def test_login_success(self, token):
        # depends on `token` (not just the module-level constants) so registration happens in
        # whichever xdist worker this class lands on under --dist loadscope (each worker imports
        # the module separately, generating its own random CUSTOMER_EMAIL).
        r = requests.post(f"{API}/auth/customer/login", json={"email": CUSTOMER_EMAIL, "password": CUSTOMER_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert "token" in d
        assert d["email"].lower() == CUSTOMER_EMAIL.lower()

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/customer/login", json={"email": CUSTOMER_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_unknown_email(self):
        r = requests.post(f"{API}/auth/customer/login", json={"email": "nobody@oblic.com", "password": "x"})
        assert r.status_code == 401


# ---------- Me ----------
class TestMe:
    def test_me_with_token(self, auth_headers):
        r = requests.get(f"{API}/auth/customer/me", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["email"].lower() == CUSTOMER_EMAIL.lower()
        assert "id" in d

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/customer/me")
        assert r.status_code == 401

    def test_me_bad_token(self):
        r = requests.get(f"{API}/auth/customer/me", headers={"Authorization": "Bearer abc.def.ghi"})
        assert r.status_code == 401


# ---------- Order history ----------
class TestCustomerOrders:
    def test_orders_no_token(self):
        assert requests.get(f"{API}/customer/orders").status_code == 401

    def test_orders_linked_to_customer(self, auth_headers):
        payload = {
            "items": [{"product_id": "p1", "name": "Test", "price": 10.0, "qty": 1}],
            "email": CUSTOMER_EMAIL, "name": CUSTOMER_NAME,
        }
        cr = requests.post(f"{API}/orders", json=payload, headers=auth_headers)
        assert cr.status_code == 200

        r = requests.get(f"{API}/customer/orders", headers=auth_headers)
        assert r.status_code == 200
        orders = r.json()
        assert isinstance(orders, list) and len(orders) >= 1
        assert any(o["email"].lower() == CUSTOMER_EMAIL.lower() for o in orders)

    def test_guest_order_same_email_visible_in_history(self, auth_headers):
        payload = {
            "items": [{"product_id": "p2", "name": "Guest Item", "price": 20.0, "qty": 1}],
            "email": CUSTOMER_EMAIL, "name": CUSTOMER_NAME,
        }
        cr = requests.post(f"{API}/orders", json=payload)
        assert cr.status_code == 200

        r = requests.get(f"{API}/customer/orders", headers=auth_headers)
        assert r.status_code == 200
        orders = r.json()
        assert any(o.get("id") == cr.json()["id"] for o in orders)
