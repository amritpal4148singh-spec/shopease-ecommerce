/* =========================================================
   SHOPEASE — product-details.js
   Runs ONLY on product-details.html. Depends on functions in
   app.js (getAllProducts, buildProductCardHTML, formatPrice,
   escapeHTML, showToast, CATEGORY_LABELS), cart-utils.js
   (addToCart, MAX_QUANTITY_PER_ITEM), and wishlist-utils.js
   (isInWishlist, toggleWishlist) — load all three before this file.
   ========================================================= */

const detailsContent = document.getElementById("detailsContent");
const relatedSection = document.getElementById("relatedSection");
const relatedGrid = document.getElementById("relatedGrid");

let currentProduct = null;
let currentQuantity = 1;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const productId = getProductIdFromURL();

  if (productId === null) {
    showNotFound("No product was specified.");
    return;
  }

  try {
    const products = await getAllProducts();
    const product = products.find((item) => item.id === productId);

    if (!product) {
      const reason = apiAvailable
        ? `We couldn't find a product with id "${productId}".`
        : `We couldn't find a product with id "${productId}" — our full catalog is temporarily unavailable, so only local products can be shown right now.`;
      showNotFound(reason);
      return;
    }

    currentProduct = product;
    renderProductDetails(product);
    renderRelatedProducts(product, products);
  } catch (error) {
    console.error("Failed to load product:", error);
    detailsContent.innerHTML = `<p class="state-message is-error">Couldn't load this product right now. Please check your connection and refresh the page.</p>`;
  }
}

/** Reads ?id=123 from the URL and returns it as a number, or null if missing/invalid. */
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get("id");
  if (!rawId) return null;

  const id = Number(rawId);
  return Number.isNaN(id) ? null : id;
}

function showNotFound(message) {
  detailsContent.innerHTML = `
    <p class="state-message is-error">
      ${escapeHTML(message)}
      <br />
      <a href="products.html">Browse all products instead</a>.
    </p>
  `;
}

function renderProductDetails(product) {
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const rating = product.rating ? product.rating.rate.toFixed(1) : "—";
  const reviewCount = product.rating ? product.rating.count : 0;
  const wishlistActiveClass = isInWishlist(product.id) ? "is-active" : "";

  detailsContent.innerHTML = `
    <div class="details-grid">
      <div class="details-image">
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.title)}"
          onerror="this.onerror=null; this.src='https://placehold.co/500x500/EFEBDF/6B7368?text=ShopEase';"
        />
      </div>
      <div class="details-info">
        <p class="product-category">${categoryLabel}</p>
        <h1>${escapeHTML(product.title)}</h1>
        <div class="details-meta">
          <span class="details-rating">★ ${rating} <span class="rating-count">(${reviewCount} reviews)</span></span>
        </div>
        <p class="details-price">${formatPrice(product.price)}</p>
        <p class="details-description">${escapeHTML(product.description)}</p>

        <div class="quantity-row">
          <span class="quantity-label">Quantity</span>
          <div class="quantity-stepper">
            <button type="button" id="qtyMinus" aria-label="Decrease quantity">−</button>
            <input type="number" id="qtyInput" value="1" min="1" max="10" />
            <button type="button" id="qtyPlus" aria-label="Increase quantity">+</button>
          </div>
        </div>

        <div class="details-actions">
          <button type="button" id="addToCartBtn" class="btn btn-primary">Add to cart</button>
          <button type="button" id="addToWishlistBtn" class="icon-btn ${wishlistActiveClass}" aria-label="Add to wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  wireQuantityStepper();
  wireActionButtons(product);
}

function wireQuantityStepper() {
  const qtyInput = document.getElementById("qtyInput");
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");

  currentQuantity = 1;

  qtyMinus.addEventListener("click", () => {
    currentQuantity = clampQuantity(currentQuantity - 1);
    qtyInput.value = currentQuantity;
  });

  qtyPlus.addEventListener("click", () => {
    currentQuantity = clampQuantity(currentQuantity + 1);
    qtyInput.value = currentQuantity;
  });

  // Also handle someone typing a number directly into the box,
  // and clean up anything invalid (blank, letters, decimals).
  qtyInput.addEventListener("change", () => {
    const typed = Math.round(Number(qtyInput.value));
    currentQuantity = clampQuantity(Number.isNaN(typed) ? 1 : typed);
    qtyInput.value = currentQuantity;
  });
}

/** Keeps quantity a whole number between 1 and 10. */
function clampQuantity(value) {
  return Math.min(10, Math.max(1, value));
}

function wireActionButtons(product) {
  const addToCartBtn = document.getElementById("addToCartBtn");
  const addToWishlistBtn = document.getElementById("addToWishlistBtn");

  addToCartBtn.addEventListener("click", () => {
    const result = addToCart(product, currentQuantity); // addToCart is defined in cart-utils.js

    if (result.limited) {
      showToast(`Only up to ${MAX_QUANTITY_PER_ITEM} of "${product.title}" can be in your cart.`);
      return;
    }

    const quantityLabel = currentQuantity === 1 ? "1 item" : `${currentQuantity} items`;
    showToast(`Added ${quantityLabel} to cart.`);
  });

  addToWishlistBtn.addEventListener("click", () => {
    const result = toggleWishlist(product); // toggleWishlist is defined in wishlist-utils.js
    addToWishlistBtn.classList.toggle("is-active", result.active);
    showToast(result.active ? `Saved "${product.title}" to wishlist.` : `Removed "${product.title}" from wishlist.`);
  });
}

/** Shows up to 4 other products from the same category, if there are any. */
function renderRelatedProducts(product, allProducts) {
  const related = allProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  if (related.length === 0) {
    relatedSection.hidden = true;
    return;
  }

  relatedGrid.innerHTML = related.map(buildProductCardHTML).join("");
  wireProductActions(relatedGrid); // event delegation, defined in app.js
  relatedSection.hidden = false;
}
