import React from "react";
import PolicyLayout from "../components/PolicyLayout";

const sections = [
  { title: "Shipping Coverage", blocks: [
    "We currently ship across India. We do not offer international shipping at this time.",
    [
      "Pan India: All states and union territories across India",
      "International: Not available. We do not ship outside India currently",
    ],
  ]},
  { title: "Processing & Dispatch Time", blocks: [
    "All orders are processed and dispatched from our facility in Surat, Gujarat.",
    [
      "Order Processing: 1-2 business days after payment confirmation",
      "Dispatch Notification: via WhatsApp, tracking details sent once dispatched",
    ],
    "Orders placed on Sundays or public holidays will be processed on the next working day.",
  ]},
  { title: "Estimated Delivery Time", blocks: [
    [
      "Within Gujarat: 2-4 days after dispatch from Surat",
      "Rest of India: 4-7 days, metro cities may receive sooner",
    ],
    "Delivery timelines are estimates and may vary due to courier delays, remote locations, weather conditions, or public holidays. We are not responsible for delays caused by the courier partner once the order has been dispatched.",
  ]},
  { title: "Shipping Charges", blocks: [
    "We offer FREE shipping across India on all orders, with no minimum order value.",
    [
      "Shipping is completely free for every order, all across India",
      "Shipping charges are non-refundable in the rare event they apply, unless the return is due to our error (wrong or damaged product)",
    ],
  ]},
  { title: "Order Tracking", blocks: [
    "Once your order is dispatched, we will share the tracking number and courier details via WhatsApp or email.",
    "You can use the tracking link provided to monitor your shipment in real-time on the courier partner's website.",
    "If you have not received tracking details within 3 business days of your order confirmation, please reach out to us.",
  ]},
  { title: "Delivery Attempts & Failed Deliveries", blocks: [
    [
      "Our courier partner will attempt delivery up to 2-3 times at the address provided",
      "If the delivery fails due to an incorrect address, customer unavailability, or refusal to accept, the package will be returned to us",
      "In such cases, re-delivery charges may apply, and we will contact you to arrange a second shipment",
      "Please ensure your WhatsApp number and delivery address are accurate when placing an order",
    ],
  ]},
  { title: "Damaged or Lost in Transit", blocks: [
    "If your order arrives damaged or is lost in transit:",
    [
      "Contact us within 48 hours of the expected delivery date with your order details",
      "For damaged items, share photographs of the outer packaging and the damaged product",
      "We will investigate with the courier partner and offer a replacement or refund once the claim is verified",
    ],
    "Please do not accept a delivery if the outer packaging appears visibly damaged or tampered. Photograph the package before opening it.",
  ]},
  { title: "Packaging", blocks: [
    "All Oblic Cosmetic products are carefully packed in secure, tamper-evident packaging to ensure they reach you in perfect condition. We use eco-conscious materials wherever possible as part of our commitment to clean, responsible beauty.",
  ]},
];

export default function ShippingPolicy() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      intro="We take care in packing and dispatching every Oblic Cosmetic order. This policy describes how we ship, the timelines you can expect, and what to do if something goes wrong with your delivery."
      sections={sections}
      contactLabel="Questions about your shipment?"
    />
  );
}
