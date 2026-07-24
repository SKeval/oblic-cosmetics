import React from "react";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, size = 14, className = "" }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? "fill-sage-deep text-sage-deep" : "text-line"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
