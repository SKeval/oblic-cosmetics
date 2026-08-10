import "@/index.css";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import About from "@/pages/About";
import Terms from "@/pages/Terms";
import RefundPolicy from "@/pages/RefundPolicy";
import ShippingPolicy from "@/pages/ShippingPolicy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import Account from "@/pages/Account";
import ResetPassword from "@/pages/ResetPassword";

// The Shop page was merged into Home's "Shop All" section (#shop) — keep old /shop
// links (bookmarks, search results) working by redirecting to it, search params intact.
function ShopRedirect() {
  const location = useLocation();
  return <Navigate to={`/${location.search}#shop`} replace />;
}

// Resets scroll to the top on every route change, so navigating to a new page never
// keeps the previous page's scroll position. Skipped when a hash is present (e.g. "/#shop")
// so in-page anchor navigation can scroll to that section instead.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <CustomerProvider>
        <WishlistProvider>
          <CartProvider>
            <ScrollToTop />
            <Navbar />
            <CartDrawer />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<ShopRedirect />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<Account />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </CartProvider>
        </WishlistProvider>
      </CustomerProvider>
    </BrowserRouter>
  );
}

export default App;
