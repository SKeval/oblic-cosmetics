import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

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
