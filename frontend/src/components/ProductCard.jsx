import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import StarRating from "./StarRating";
import { useCart } from "../context/CartContext";

const BADGE_STYLE = {
  "Best Seller": "bg-cream text-ink",
  "New": "bg-cream text-ink",
  "Limited Offer": "bg-cream text-ink",
  "Award Winning": "bg-cream text-ink",
  "20% Off": "bg-plum text-cream",
};

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      className="group"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] bg-cream-deep overflow-hidden rounded-[2px]">
          {product.badges?.[0] && (
            <span className={`absolute top-3 left-3 z-10 text-[11px] tracking-[0.08em] px-3 py-1 rounded-full ${BADGE_STYLE[product.badges[0]] || "bg-cream text-ink"}`} data-testid="product-badge">
              {product.badges[0]}
            </span>
          )}
          <img
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <button
            onClick={(e) => { e.preventDefault(); addItem(product, product.sizes?.[0]); }}
            data-testid={`quick-add-${product.id}`}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-plum text-cream text-[12px] tracking-[0.12em] uppercase px-6 py-3 rounded-full flex items-center gap-2 hover:bg-ink whitespace-nowrap"
          >
            <ShoppingBag size={14} /> Add to Cart
          </button>
        </div>
      </Link>
      <div className="pt-4">
        <p className="text-[11px] tracking-[0.15em] uppercase text-muted mb-1">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-[19px] leading-snug hover:opacity-70 transition-opacity">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px]">${product.price.toFixed(0)}</span>
            {product.compare_at_price && (
              <span className="text-[13px] text-muted line-through">${product.compare_at_price.toFixed(0)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <StarRating value={product.rating} size={12} />
            <span className="text-[12px] text-muted">({product.review_count})</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
