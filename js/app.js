/* =========================================================
   SHOPEASE — app.js
   Shared code loaded on EVERY page: mobile nav, product data
   (fetching + caching), the reusable product card, the toast
   notification, and the homepage's dynamic sections.

   products.js and product-details.js reuse the functions in
   this file (getAllProducts, buildProductCardHTML, showToast,
   formatPrice, CATEGORY_LABELS) — load this file BEFORE those.

   This file's "Add to cart" handler calls addToCart() and reads
   MAX_QUANTITY_PER_ITEM, both defined in cart-utils.js, and its
   wishlist heart button calls isInWishlist()/toggleWishlist(),
   defined in wishlist-utils.js. Every page must load, in order:
   app.js -> cart-utils.js -> wishlist-utils.js -> (page script).
   ========================================================= */

// ---------------------------------------------------------
// CONFIG
// ---------------------------------------------------------

const API_URL = "https://fakestoreapi.com/products";

// Our site uses simpler category names than the API does.
// This maps the API's category strings to ours.
const API_CATEGORY_MAP = {
  "men's clothing": "men",
  "women's clothing": "women",
  "jewelery": "accessories",
  "electronics": "electronics",
};

// Friendly labels for our category keys (used in filters, badges, etc.)
const CATEGORY_LABELS = {
  men: "Men",
  women: "Women",
  accessories: "Accessories",
  footwear: "Footwear",
  electronics: "Electronics",
};

// Fake Store API has no "footwear" category, so ShopEase adds a
// small local dataset to fill that category out. Swap the image
// paths below for your own photos any time — see the note in the
// Phase 2 write-up for exactly which files to download and where
// to save them.
const FALLBACK_FOOTWEAR = [
  {
    id: 1001,
    title: "Ridgeline Sneaker",
    price: 95.0,
    category: "footwear",
    description:
      "A lightweight everyday sneaker with a cushioned sole, built for long days on your feet without looking like a running shoe.",
    image: "assets/images/ridgeline-sneaker.jpg",
    rating: { rate: 4.4, count: 87 },
  },
  {
    id: 1002,
    title: "Trail Low Boot",
    price: 118.0,
    category: "footwear",
    description:
      "A water-resistant low boot with a grippy sole, at home on a muddy trail or a city sidewalk in the rain.",
    image: "assets/images/trail-low-boot.jpg",
    rating: { rate: 4.5, count: 63 },
  },
  {
    id: 1003,
    title: "Suede Chelsea Boot",
    price: 134.0,
    category: "footwear",
    description:
      "A classic Chelsea silhouette in soft suede, easy to dress up or down, with an elastic side panel for a quick on and off.",
    image: "assets/images/suede-chelsea-boot.jpg",
    rating: { rate: 4.7, count: 41 },
  },
  {
    id: 1004,
    title: "Canvas Slip-On",
    price: 58.0,
    category: "footwear",
    description:
      "A relaxed canvas slip-on for warm weather, with a padded footbed and a flexible sole that packs easily for travel.",
    image: "assets/images/canvas-slip-on.jpg",
    rating: { rate: 4.2, count: 102 },
  },
];

// ---------------------------------------------------------
// PRODUCT DATA (shared by every page)
// ---------------------------------------------------------

// Keeps the fetched list in memory so a page never has to
// re-fetch after the first successful load.
let productsCache = null;

/**
 * Fetches every product ShopEase shows: the live Fake Store API
 * list, normalized into our own shape, plus the local footwear
 * fallback above. Caches the result in sessionStorage so moving
 * between pages (home -> products -> product details) doesn't
 * re-fetch every time. Throws if the network request fails, so
 * callers should wrap this in try/catch.
 */
// True once getAllProducts() has resolved at least once this page load; false
// if the API call failed and the catalog fell back to local products only.
// Pages can check this after awaiting getAllProducts() to let the person know
// they're seeing a smaller, local-only catalog instead of silently hiding it.
let apiAvailable = true;

async function getAllProducts() {
  if (productsCache) return productsCache;

  const stored = sessionStorage.getItem("shopease_products");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        productsCache = parsed;
        apiAvailable = true;
        return productsCache;
      }
      // Empty or not an array — fall through and re-fetch instead of trusting it.
    } catch (error) {
      console.error("Cached product data was invalid JSON — ignoring it and re-fetching:", error);
    }
    sessionStorage.removeItem("shopease_products");
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Fake Store API responded with status ${response.status}`);
    }

    const apiProducts = await response.json();

    const normalized = apiProducts.map((product) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      category: API_CATEGORY_MAP[product.category] || "accessories",
      description: product.description,
      image: product.image,
      rating: product.rating || { rate: 0, count: 0 },
    }));

    productsCache = [...normalized, ...FALLBACK_FOOTWEAR];
    apiAvailable = true;
    sessionStorage.setItem("shopease_products", JSON.stringify(productsCache));
  } catch (error) {
    // Network error, CORS failure, non-2xx status, or malformed JSON all land
    // here. Rather than leaving every page with zero products, fall back to
    // the local footwear catalog so the site stays usable.
    console.error("Fake Store API is unavailable — showing the local fallback catalog only:", error);
    apiAvailable = false;
    productsCache = [...FALLBACK_FOOTWEAR];
    // Deliberately NOT cached to sessionStorage: caching a degraded result
    // would make a temporary outage "stick" for the rest of the browser tab's
    // session. Leaving the cache empty means the very next call retries the API.
  }

  return productsCache;
}

/** Formats a number as a USD price string, e.g. 95 -> "$95.00". */
function formatPrice(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

/**
 * Builds the HTML for one product card. Used on the homepage,
 * the product listing page, and the "related products" row on
 * the product details page, so the card only has to be designed
 * once. Clicking the card (outside the action buttons) opens
 * product-details.html for that product.
 */
function buildProductCardHTML(product) {
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const rating = product.rating ? product.rating.rate.toFixed(1) : "—";
  const wishlistActiveClass = isInWishlist(product.id) ? "is-active" : "";

  return `
    <article class="product-card" data-id="${escapeHTML(product.id)}">
      <a class="product-card-link" href="product-details.html?id=${encodeURIComponent(product.id)}">
        <img
          class="product-thumb"
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.title)}"
          loading="lazy"
          onerror="this.onerror=null; this.src='https://placehold.co/400x400/EFEBDF/6B7368?text=ShopEase';"
        />
        <div class="product-info">
          <p class="product-category">${categoryLabel}</p>
          <h3 class="product-name">${escapeHTML(product.title)}</h3>
          <div class="product-meta">
            <span class="product-price">${formatPrice(product.price)}</span>
            <span class="product-rating">★ ${rating}</span>
          </div>
        </div>
      </a>
      <div class="product-actions">
        <button type="button" class="btn btn-primary" data-action="add-to-cart" data-id="${escapeHTML(product.id)}">
          Add to cart
        </button>
        <button type="button" class="icon-btn ${wishlistActiveClass}" data-action="add-to-wishlist" data-id="${escapeHTML(product.id)}" aria-label="Add to wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </button>
      </div>
    </article>
  `;
}

/**
 * Escapes any value before it goes into an innerHTML template string —
 * safe for BOTH text content and quoted attribute values (value="...",
 * alt="...", src="..."). Escaping quotes matters: without it, a name like
 *   " onfocus="alert(1)
 * could break out of an attribute. null/undefined become "" instead of
 * printing the word "undefined".
 */
function escapeHTML(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Attaches one click listener to a product grid (event delegation)
 * so every "Add to cart" / "Add to wishlist" button works, without
 * needing a separate listener per card — this is what makes the
 * buttons work identically on the homepage, the listing page, and
 * the "related products" row.
 */
function wireProductActions(gridElement) {
  if (!gridElement) return;
  gridElement.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const productId = Number(button.dataset.id);

    if (button.dataset.action === "add-to-cart") {
      handleAddToCartClick(productId);
    } else if (button.dataset.action === "add-to-wishlist") {
      handleAddToWishlistClick(productId, button);
    }
  });
}

/**
 * Toggles a product in/out of the wishlist from a product-card heart
 * button. Looks the product up the same way handleAddToCartClick
 * does, then hands off to toggleWishlist() from wishlist-utils.js.
 */
async function handleAddToWishlistClick(productId, button) {
  try {
    const products = await getAllProducts();
    const product = products.find((item) => item.id === productId);
    if (!product) {
      showToast("Sorry, that product couldn't be found.");
      return;
    }

    const result = toggleWishlist(product);
    button.classList.toggle("is-active", result.active);
    showToast(result.active ? `Saved "${product.title}" to wishlist.` : `Removed "${product.title}" from wishlist.`);
  } catch (error) {
    console.error("Failed to update wishlist:", error);
    showToast("Couldn't update your wishlist. Please try again.");
  }
}

/**
 * Adds one unit of a product to the cart from a product-card
 * "Add to cart" button. Looks the product up by id (from the same
 * cached list buildProductCardHTML used to draw the card), then
 * hands off to addToCart() from cart-utils.js, which is the one
 * place that actually reads/writes LocalStorage.
 */
async function handleAddToCartClick(productId) {
  try {
    const products = await getAllProducts();
    const product = products.find((item) => item.id === productId);
    if (!product) {
      showToast("Sorry, that product couldn't be found.");
      return;
    }

    const result = addToCart(product, 1);
    if (result.limited) {
      showToast(`You already have the max of ${MAX_QUANTITY_PER_ITEM} "${product.title}" in your cart.`);
    } else {
      showToast(`Added "${product.title}" to cart.`);
    }
  } catch (error) {
    console.error("Failed to add product to cart:", error);
    showToast("Couldn't add that to your cart. Please try again.");
  }
}

// ---------------------------------------------------------
// TOAST NOTIFICATION
// ---------------------------------------------------------

let toastTimeoutId = null;

/** Shows a small message at the bottom of the screen for a couple of seconds. */
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

// ---------------------------------------------------------
// HOMEPAGE: dynamic featured products + new arrivals
// ---------------------------------------------------------

async function loadHomepageProducts() {
  const featuredGrid = document.getElementById("featuredGrid");
  const arrivalsGrid = document.getElementById("arrivalsGrid");
  if (!featuredGrid || !arrivalsGrid) return; // not on the homepage

  try {
    const products = await getAllProducts();

    if (!apiAvailable) {
      showToast("Our full catalog is temporarily unavailable — showing local products only.");
    }

    // "Featured" = the four highest-rated products.
    const featured = [...products]
      .sort((a, b) => b.rating.rate - a.rating.rate)
      .slice(0, 4);

    // "New arrivals" = the four products with the highest id
    // (stands in for "most recently added" until the site has
    // a real created-date field to sort by).
    const arrivals = [...products].sort((a, b) => b.id - a.id).slice(0, 4);

    featuredGrid.innerHTML = featured.map(buildProductCardHTML).join("");
    arrivalsGrid.innerHTML = arrivals.map(buildProductCardHTML).join("");

    wireProductActions(featuredGrid);
    wireProductActions(arrivalsGrid);
  } catch (error) {
    console.error("Failed to load homepage products:", error);
    const errorMessage = `<p class="state-message is-error">Couldn't load products right now. <a href="index.html">Try refreshing the page</a>.</p>`;
    featuredGrid.innerHTML = errorMessage;
    arrivalsGrid.innerHTML = errorMessage;
  }
}

// ---------------------------------------------------------
// HEADER SEARCH: send the query to the product listing page
// ---------------------------------------------------------

function setupHeaderSearch() {
  const form = document.getElementById("siteSearchForm");
  const input = document.getElementById("searchInput");
  if (!form || !input) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const url = query
      ? `products.html?search=${encodeURIComponent(query)}`
      : "products.html";
    window.location.href = url;
  });
}

// ---------------------------------------------------------
// MOBILE NAVIGATION (from Phase 1)
// ---------------------------------------------------------

function setupMobileNav() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  if (!menuToggle || !mainNav) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960 && mainNav.classList.contains("is-open")) {
      mainNav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// ---------------------------------------------------------
// INIT — runs on every page
// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupHeaderSearch();
  loadHomepageProducts(); // does nothing on pages without #featuredGrid
});
