// Vercel Serverless Function for /product/:id.
//
// This is a client-rendered SPA with no server-side rendering, so every route used to serve
// byte-identical static HTML with only generic homepage meta tags - no og:type=product, no
// product-specific title/image/price. Any link-preview crawler that doesn't execute
// JavaScript (Instagram, Facebook, WhatsApp, etc.) could never tell a product page apart
// from the homepage, which is why Instagram's "Link a Product" rejected valid product URLs.
//
// Rather than trying to detect which requests are bots (fragile - Instagram's own product
// checker doesn't necessarily send a recognizable crawler User-Agent), every request to this
// route gets the real index.html with its meta tags swapped for this product's real data.
// The actual script/css bundle tags and <div id="root"> are left untouched, so the React app
// mounts and behaves identically for real visitors - this only changes what's in <head>.
const SITE_URL = "https://www.obliccosmetic.com";
const API_URL = "https://api.obliccosmetic.com/api";

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

function absoluteImage(img) {
  if (!img) return `${SITE_URL}/oblic-logo.png`;
  return img.startsWith("http") ? img : `${SITE_URL}${img}`;
}

module.exports = async (req, res) => {
  const id = req.query.id;
  const pageUrl = `${SITE_URL}/product/${id}`;

  let baseHtml;
  try {
    baseHtml = await fetch(`${SITE_URL}/index.html`).then((r) => r.text());
  } catch {
    res.redirect(307, pageUrl);
    return;
  }

  let product = null;
  try {
    product = await fetch(`${API_URL}/products/${id}`).then((r) => (r.ok ? r.json() : null));
  } catch {
    // fall through - if the product can't be fetched, just serve the normal app shell
  }

  if (!product) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(baseHtml);
    return;
  }

  const title = escapeAttr(`${product.name} | Oblic Cosmetics`);
  const description = escapeAttr((product.description || "").slice(0, 200));
  const image = escapeAttr(absoluteImage(product.images && product.images[0]));
  const price = Number(product.price || 0).toFixed(2);

  let html = baseHtml
    .replace(/<meta name="description" content="[^"]*"\/>/, `<meta name="description" content="${description}"/>`)
    .replace(/<meta property="og:type" content="[^"]*"\/>/, `<meta property="og:type" content="product"/>`)
    .replace(/<meta property="og:title" content="[^"]*"\/>/, `<meta property="og:title" content="${title}"/>`)
    .replace(/<meta property="og:description" content="[^"]*"\/>/, `<meta property="og:description" content="${description}"/>`)
    .replace(/<meta property="og:image" content="[^"]*"\/>/, `<meta property="og:image" content="${image}"/>`)
    .replace(/<meta property="og:url" content="[^"]*"\/>/, `<meta property="og:url" content="${pageUrl}"/>`)
    .replace(/<meta name="twitter:title" content="[^"]*"\/>/, `<meta name="twitter:title" content="${title}"/>`)
    .replace(/<meta name="twitter:description" content="[^"]*"\/>/, `<meta name="twitter:description" content="${description}"/>`)
    .replace(/<meta name="twitter:image" content="[^"]*"\/>/, `<meta name="twitter:image" content="${image}"/>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(`${product.name} | Oblic Cosmetics`)}</title>`);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: absoluteImage(product.images && product.images[0]),
    brand: { "@type": "Brand", name: "Oblic" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price,
      availability: product.in_stock !== false
        ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: pageUrl,
    },
  });

  const extraTags = `<meta property="product:price:amount" content="${price}"/>` +
    `<meta property="product:price:currency" content="INR"/>` +
    `<link rel="canonical" href="${pageUrl}"/>` +
    `<script type="application/ld+json">${jsonLd}</script></head>`;

  html = html.replace("</head>", extraTags);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=600");
  res.status(200).send(html);
};
