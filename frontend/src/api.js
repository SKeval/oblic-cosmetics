import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

const savedToken = typeof localStorage !== "undefined" ? localStorage.getItem("oblic_admin_token") : null;
if (savedToken) api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

export function setAdminToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("oblic_admin_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("oblic_admin_token");
  }
}

export const adminLogin = (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data);
export const adminMe = () => api.get("/auth/me").then((r) => r.data);

export const getProducts = (params) => api.get("/products", { params }).then((r) => r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then((r) => r.data);
export const getCategories = () => api.get("/categories").then((r) => r.data);
export const getReviews = (id) => api.get(`/products/${id}/reviews`).then((r) => r.data);
export const addReview = (id, data) => api.post(`/products/${id}/reviews`, data).then((r) => r.data);
export const getFaqs = () => api.get("/faqs").then((r) => r.data);
export const subscribe = (email) => api.post("/newsletter", { email }).then((r) => r.data);
export const createOrder = (data) => api.post("/orders", data).then((r) => r.data);
export const getPaymentConfig = () => api.get("/payments/config").then((r) => r.data);
export const createRazorpayOrder = (data) => api.post("/payments/razorpay/order", data).then((r) => r.data);
export const verifyRazorpayPayment = (data) => api.post("/payments/razorpay/verify", data).then((r) => r.data);
export const saveAbandonedCart = (data) => api.post("/abandoned-cart", data).then((r) => r.data);
export const getAdminOrders = () => api.get("/admin/orders").then((r) => r.data);
export const updateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}`, { status }).then((r) => r.data);
export const getAbandonedCarts = () => api.get("/admin/abandoned-carts").then((r) => r.data);
export const getAdminStats = () => api.get("/admin/stats").then((r) => r.data);

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default api;
