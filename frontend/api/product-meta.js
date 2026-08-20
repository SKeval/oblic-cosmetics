// Vercel Serverless Function that serves proper per-product Open Graph / Twitter Card /
// JSON-LD tags to link-preview crawlers (Instagram, Facebook, WhatsApp, Twitter, etc.),
// which don't execute JavaScript and otherwise see the same generic static index.html on
// every route since this is a client-rendered SPA with no server-side rendering. Real
// browsers get passed through to the normal app, completely unaffected.
const SITE_URL = "https://www.obliccosmetic.com";
const API_URL = "https://api.obliccosmetic.com/api";

const BOT_UA = /facebookexternalhit|Facebot|Instagram|WhatsApp|Twitterbot|Slackbot|LinkedInBot|Pinterest|TelegramBot|Googlebot|bingbot|Discordbot/i;

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function absoluteImage(img) {
  if (!img) return `${SITE_URL}/oblic-logo.png`;
  return img.startsWith("http") ? img : `${SITE_URL}${img}`;
}

module.exports = async (req, res) => {
  const id = req.query.id;
  const userAgent = req.headers["user-agent"] || "";
  const pageUrl = `${SITE_URL}/product/${id}`;

  if (!BOT_UA.test(userAgent)) {
    // Real visitor - serve the normal app shell exactly as index.html would, so the SPA
    // and React Router take over client-side same as for any other route.
    try {
      const appHtml = await fetch(`${SITE_URL}/index.html`).then((r) => r.text());
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(appHtml);
    } catch {
      res.redirect(307, pageUrl);
    }
    return;
  }

  try {
    const product = await fetch(`${API_URL}/products/${id}`).then((r) => (r.ok ? r.json() : null));
    if (!product) {
      res.status(404).send("Product not found");
      return;
    }
    const title = escapeHtml(`${product.name} | Oblic Cosmetics`);
    const description = escapeHtml((product.description || "").slice(0, 200));
    const image = absoluteImage(product.images && product.images[0]);
    const price = Number(product.price || 0).toFixed(2);

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:type" content="product" />
<meta property="og:site_name" content="Oblic Cosmetics" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="product:price:amount" content="${price}" />
<meta property="product:price:currency" content="INR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<link rel="canonical" href="${pageUrl}" />
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description || "",
  image,
  brand: { "@type": "Brand", name: "Oblic" },
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
    price,
    availability: product.in_stock !== false
      ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url: pageUrl,
  },
})}</script>
</head>
<body></body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
    res.status(200).send(html);
  } catch (e) {
    res.status(502).send("Could not load product");
  }
};
