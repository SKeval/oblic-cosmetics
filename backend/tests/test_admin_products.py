"""Backend tests for admin product management (create/update/delete)."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://admiring-beaver-9.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@oblic.com"
ADMIN_PASSWORD = "Oblic@Admin2026"


def _fresh_name():
    return f"TEST Product {uuid.uuid4().hex[:8]}"


def _product_payload(**overrides):
    payload = {
        "name": _fresh_name(),
        "category": "Skincare",
        "price": 199,
        "description": "A test product.",
    }
    payload.update(overrides)
    return payload


@pytest.fixture(scope="module")
def auth_headers():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


class TestCreateProduct:
    def test_requires_auth(self):
        r = requests.post(f"{API}/admin/products", json=_product_payload())
        assert r.status_code == 401

    def test_success_and_defaults(self, auth_headers):
        r = requests.post(f"{API}/admin/products", json=_product_payload(), headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["id"]
        assert data["slug"]
        assert data["on_sale"] is False
        assert data["rating"] == 0
        assert data["review_count"] == 0
        assert data["features"]  # defaulted
        requests.delete(f"{API}/admin/products/{data['id']}", headers=auth_headers)

    def test_appears_in_public_product_list(self, auth_headers):
        name = _fresh_name()
        r = requests.post(f"{API}/admin/products", json=_product_payload(name=name, on_sale=True, compare_at_price=299), headers=auth_headers)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        try:
            listed = requests.get(f"{API}/products").json()
            assert any(p["id"] == pid and p["name"] == name for p in listed)
            on_sale_listed = requests.get(f"{API}/products", params={"on_sale": "true"}).json()
            assert any(p["id"] == pid for p in on_sale_listed)
        finally:
            requests.delete(f"{API}/admin/products/{pid}", headers=auth_headers)

    def test_missing_required_fields(self, auth_headers):
        r = requests.post(f"{API}/admin/products", json={"name": "x"}, headers=auth_headers)
        assert r.status_code == 422

    def test_invalid_price_rejected(self, auth_headers):
        r = requests.post(f"{API}/admin/products", json=_product_payload(price=0), headers=auth_headers)
        assert r.status_code == 422


class TestUpdateProduct:
    @pytest.fixture()
    def product(self, auth_headers):
        r = requests.post(f"{API}/admin/products", json=_product_payload(), headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        yield data
        requests.delete(f"{API}/admin/products/{data['id']}", headers=auth_headers)

    def test_requires_auth(self, product):
        r = requests.patch(f"{API}/admin/products/{product['id']}", json={"price": 250})
        assert r.status_code == 401

    def test_updates_fields(self, product, auth_headers):
        r = requests.patch(f"{API}/admin/products/{product['id']}", json={"price": 250, "on_sale": True, "compare_at_price": 300}, headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["price"] == 250
        assert data["on_sale"] is True
        assert data["compare_at_price"] == 300
        # untouched fields survive a partial update
        assert data["name"] == product["name"]

    def test_not_found(self, auth_headers):
        r = requests.patch(f"{API}/admin/products/does-not-exist", json={"price": 100}, headers=auth_headers)
        assert r.status_code == 404

    def test_empty_update_rejected(self, product, auth_headers):
        r = requests.patch(f"{API}/admin/products/{product['id']}", json={}, headers=auth_headers)
        assert r.status_code == 400


class TestDeleteProduct:
    def test_requires_auth(self, auth_headers):
        r = requests.post(f"{API}/admin/products", json=_product_payload(), headers=auth_headers)
        pid = r.json()["id"]
        try:
            r2 = requests.delete(f"{API}/admin/products/{pid}")
            assert r2.status_code == 401
        finally:
            requests.delete(f"{API}/admin/products/{pid}", headers=auth_headers)

    def test_success_removes_from_listing(self, auth_headers):
        r = requests.post(f"{API}/admin/products", json=_product_payload(), headers=auth_headers)
        pid = r.json()["id"]
        r2 = requests.delete(f"{API}/admin/products/{pid}", headers=auth_headers)
        assert r2.status_code == 200
        assert r2.json()["ok"] is True
        listed = requests.get(f"{API}/products").json()
        assert not any(p["id"] == pid for p in listed)

    def test_not_found(self, auth_headers):
        r = requests.delete(f"{API}/admin/products/does-not-exist", headers=auth_headers)
        assert r.status_code == 404
