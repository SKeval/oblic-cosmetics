import React from "react";
import PolicyLayout from "../components/PolicyLayout";

const sections = [
  { title: "Information We Collect", blocks: [
    "When you browse our website, create an account, or place an order, we collect:",
    [
      "Contact details you provide: name, email address, phone number, and shipping address",
      "Order information: items purchased, order value, and payment status",
      "Account information: your password (stored securely as a one-way hash, never in plain text)",
      "Basic usage data such as pages visited, to help us understand how the site is used",
    ],
  ]},
  { title: "How We Use Your Information", blocks: [
    "We use the information we collect to:",
    [
      "Process and deliver your orders, including sharing your name, address, and phone number with our courier partners",
      "Send order confirmations and updates about your purchase",
      "Respond to your questions and support requests",
      "Improve our website and product offering",
      "Send marketing emails if you've subscribed to our newsletter — you can unsubscribe at any time",
    ],
  ]},
  { title: "Payment Information", blocks: [
    "All payments are processed securely by Razorpay, our payment gateway partner. We do not store your card, UPI, or net-banking details on our servers at any point — that information is handled entirely by Razorpay in accordance with their own security standards.",
  ]},
  { title: "How We Protect Your Information", blocks: [
    "Your account password is stored using industry-standard one-way hashing and is never visible to us in plain text. Our website is served entirely over HTTPS. We limit access to customer and order data to what's needed to run the business.",
  ]},
  { title: "Sharing Your Information", blocks: [
    "We do not sell your personal information. We share it only with the service providers needed to run our store — our payment gateway (Razorpay), our courier/delivery partners, and our hosting and analytics providers — solely for the purpose of fulfilling your order and operating the website.",
  ]},
  { title: "Your Rights", blocks: [
    "You can request access to, correction of, or deletion of your personal data at any time by contacting us using the details below. You can also unsubscribe from marketing emails using the link in any newsletter, or by asking us directly.",
  ]},
  { title: "Cookies & Analytics", blocks: [
    "We use cookies and similar technologies to keep you signed in and to understand how visitors use our website, so we can improve it. This data is aggregated and does not identify you individually to third parties beyond our analytics provider.",
  ]},
  { title: "Changes to This Policy", blocks: [
    "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of our website after changes constitutes acceptance of the revised policy.",
  ]},
];

export default function PrivacyPolicy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      intro="Your privacy matters to us. This policy explains what information we collect when you use Oblic Cosmetic, how we use it, and the choices you have."
      sections={sections}
      contactLabel="Questions about how we handle your data?"
    />
  );
}
