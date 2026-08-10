import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-32 text-center" data-testid="not-found-page">
      <p className="text-[12px] tracking-[0.25em] uppercase text-muted mb-4">404</p>
      <h1 className="font-display text-5xl md:text-6xl mb-6">Page Not Found</h1>
      <p className="text-ink-soft text-[15px] max-w-md mx-auto mb-10">
        The page you're looking for doesn't exist or may have moved. Let's get you back to shopping.
      </p>
      <Link to="/" className="inline-block bg-plum text-cream px-8 py-3.5 rounded-full text-[13px] tracking-[0.12em] uppercase hover:bg-ink transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
