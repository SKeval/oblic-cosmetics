import React from "react";
import PolicyLayout from "../components/PolicyLayout";

const sections = [
  { title: "Return Eligibility", blocks: [
    "We accept returns only under the following conditions:",
    [
      "The product received is damaged, defective, or broken on arrival",
      "The wrong product was delivered (different from what was ordered)",
      "The product is past its expiry date at the time of delivery",
    ],
    "Return requests must be raised within 48 hours of delivery by contacting us via WhatsApp or email with clear photographs of the issue.",
    "We do not accept returns for:",
    [
      "Change of mind or incorrect product selection by the customer",
      "Products that have been opened, used, or tampered with",
      "Products without original packaging",
      "Requests raised after 48 hours of delivery",
    ],
  ]},
  { title: "Cancellation Policy", blocks: [
    "Orders can be cancelled under the following conditions:",
    [
      "Cancellation requests placed within 12 hours of order confirmation will be accepted without any charges",
      "Cancellations requested after 12 hours but before dispatch may be accepted at our discretion",
      "Orders that have already been dispatched cannot be cancelled",
    ],
    "To cancel an order, contact us immediately via WhatsApp or at Obliccosmetics@gmail.com with your order details.",
  ]},
  { title: "How to Raise a Return or Refund Request", blocks: [
    [
      "Contact Us: Reach out within 48 hours of delivery via WhatsApp or email. Share your order details (name, product, order date).",
      "Share Evidence: Send clear photographs or a short video showing the damaged, defective, or incorrect item received.",
      "Review: Our team will review your request within 2 business days and respond with the next steps.",
      "Resolution: Once approved, we will arrange a replacement or process a refund to your original payment method within 5-7 business days.",
    ],
  ]},
  { title: "Refund Process", blocks: [
    "Approved refunds will be processed as follows:",
    [
      "Payments made via Instamojo will be refunded to the original payment method (UPI, card, or net banking)",
      "WhatsApp or manual orders paid via bank transfer will be refunded to the provided bank account",
      "Refunds typically reflect within 5-7 business days after approval, depending on your bank or payment provider",
    ],
    "We will notify you via WhatsApp or email once the refund has been initiated.",
  ]},
  { title: "Non-Refundable Items", blocks: [
    "The following are not eligible for refund under any circumstances:",
    [
      "Products purchased during sale, special offers, or discount events",
      "Products returned without prior approval from our team",
      "Shipping and handling charges (unless the return is due to our error)",
      "Gift cards or promotional credits",
    ],
  ]},
  { title: "Exchanges", blocks: [
    "We currently do not offer direct product exchanges. If you received a defective or wrong item, we will send a replacement once the original item is returned and verified. Alternatively, we can issue a full refund for the affected product.",
  ]},
];

export default function RefundPolicy() {
  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      intro="At Oblic Cosmetic, we stand by the quality of every product we create. This policy outlines the conditions under which we accept returns and process refunds. Please read it carefully before placing an order."
      sections={sections}
      contactLabel="Need help with a return or refund?"
    />
  );
}
