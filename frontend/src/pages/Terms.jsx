import React from "react";
import PolicyLayout from "../components/PolicyLayout";

const sections = [
  { title: "About Us", blocks: [
    "Oblic Cosmetic is a luxury cosmetic brand based in Surat, Gujarat, India. We manufacture and sell skincare, makeup, and haircare products. Our registered address is:",
    "314, The Gellery Business Hub 2, Near Mahaveer Chowk, Yogichowk, Surat, Gujarat - 395011",
    "Email: Obliccosmetics@gmail.com",
  ]},
  { title: "Acceptance of Terms", blocks: [
    "By using our website, placing an order via WhatsApp or our online payment portal, or engaging with our services, you confirm that you:",
    [
      "Are at least 18 years of age or are accessing the site under the supervision of a parent or guardian",
      "Have read, understood, and agree to these Terms and Conditions",
      "Agree to our Privacy Policy, Refund Policy, and Shipping Policy",
    ],
  ]},
  { title: "Products & Pricing", blocks: [
    "All prices listed on our website are in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time without prior notice.",
    "Product images are for illustrative purposes. Actual product appearance, shade, or texture may vary slightly due to screen calibration and batch variations.",
    "We make every effort to display accurate product descriptions. In the event of an error, we reserve the right to cancel orders placed for incorrectly priced or described products and will notify you promptly.",
  ]},
  { title: "Orders & Payments", blocks: [
    "Orders can be placed through:",
    [
      "WhatsApp ordering, via our direct WhatsApp link with order details pre-filled",
      "Online payment, via Instamojo, our authorised payment gateway",
    ],
    "An order is considered confirmed only upon receipt of full payment or explicit order confirmation from our team via WhatsApp.",
    "We reserve the right to refuse or cancel any order at our discretion, including in cases of suspected fraud, incorrect pricing, or unavailability of stock.",
  ]},
  { title: "Intellectual Property", blocks: [
    "All content on this website, including the Oblic Cosmetic name, logo, wordmark, product designs, text, photographs, and graphics, is the exclusive property of Oblic Cosmetic and is protected under applicable intellectual property laws.",
    "You may not reproduce, distribute, modify, or use any of our content for commercial purposes without our prior written consent.",
  ]},
  { title: "Use of Website", blocks: [
    "You agree to use this website only for lawful purposes. You must not:",
    [
      "Use the site in any way that violates applicable local, national, or international laws",
      "Transmit any unsolicited or unauthorised advertising material",
      "Attempt to gain unauthorised access to any part of our website or systems",
      "Use automated tools to scrape, crawl, or collect data from our website",
    ],
  ]},
  { title: "Limitation of Liability", blocks: [
    "Oblic Cosmetic shall not be liable for any indirect, incidental, or consequential damages arising from your use of our products or website.",
    "Our total liability for any claim arising from a purchase shall not exceed the amount paid for the product(s) in question.",
    "We do not guarantee uninterrupted or error-free operation of our website.",
  ]},
  { title: "Governing Law", blocks: [
    "These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Surat, Gujarat.",
  ]},
  { title: "Changes to Terms", blocks: [
    "We reserve the right to update these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Continued use of our website or services following any changes constitutes your acceptance of the revised terms.",
  ]},
];

export default function Terms() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      intro="Welcome to Oblic Cosmetic. By accessing our website or placing an order with us, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase."
      sections={sections}
      contactLabel="Questions about these terms?"
    />
  );
}
