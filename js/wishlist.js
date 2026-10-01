/* =========================================================
   SHOPEASE — wishlist.js
   Runs ONLY on wishlist.html. Depends on functions in app.js
   (formatPrice, escapeHTML, showToast, CATEGORY_LABELS),
   cart-utils.js (addToCart, MAX_QUANTITY_PER_ITEM), and
   wishlist-utils.js (getWishlist, removeFromWishlist,
   clearWishlist) — load all three before this file.
   ========================================================= */

const wishlistItemsContainer = document.getElementById("wishlistItemsContainer");
const wishlistItemCountEl = document.getElementById("wishlistItemCount");
const clearWishlistBtn = document.getElementById("clearWishlistBtn");

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderWishlist();
  wireWishlistItemActions();

  clearWishlistBtn.addEventListener("click", () => {
    if (getWishlist().length === 0) return;

    const confirmed = window.confirm("Remove all items from your wishlist?");
    if (!confirmed) return;

    clearWishlist();
    showToast("Wishlist cleared.");
    renderWishlist();
  });
}

/** Re-reads the wishlist from LocalStorage and redraws the page. Called after every change. */
function renderWishlist() {
  const list = getWishlist();

  wishlistItemCountEl.textContent =
    list.length === 0 ? "" : `${list.length} item${list.length === 1 ? "" : "s"} saved`;
  clearWishlistBtn.hidden = list.length === 0;

  if (list.length === 0) {
    wishlistItemsContainer.innerHTML = buildEmptyStateHTML();
    return;
  }

  wishlistItemsContainer.innerHTML = list.map(buildWishlistItemHTML).join("");
}

function buildEmptyStateHTML() {
  return `
    <div class="wishlist-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
      </svg>
      <p>Your wishlist is empty.</p>
      <a href="products.html" class="btn btn-primary">Continue Shopping</a>
    </div>
  `;
}

function buildWishlistItemHTML(item) {
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  return `
    <article class="wishlist-item" data-id="${escapeHTML(item.id)}">
      <a class="wishlist-item-link" href="product-details.html?id=${encodeURIComponent(item.id)}">
        <img
          class="wishlist-item-image"
          src="${escapeHTML(item.image)}"
          alt="${escapeHTML(item.title)}"
          loading="lazy"
          onerror="this.onerror=null; this.src='https://placehold.co/160x160/EFEBDF/6B7368?text=ShopEase';"
        />
      </a>
      <div class="wishlist-item-info">
        <p class="wishlist-item-category">${categoryLabel}</p>
        <h3 class="wishlist-item-title"><a href="product-details.html?id=${encodeURIComponent(item.id)}">${escapeHTML(item.title)}</a></h3>
        <p class="wishlist-item-price">${formatPrice(item.price)}</p>
      </div>
      <div class="wishlist-item-actions">
        <button type="button" class="btn btn-primary" data-action="move-to-cart">Add to cart</button>
        <button type="button" class="wishlist-item-remove" data-action="remove" aria-label="Remove ${escapeHTML(item.title)} from wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </article>
  `;
}

/** One delegated listener handles every row's "Add to cart" and "Remove" buttons. */
function wireWishlistItemActions() {
  wishlistItemsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    event.preventDefault();

    const itemEl = button.closest(".wishlist-item");
    if (!itemEl) return;

    const productId = Number(itemEl.dataset.id);
    const item = getWishlist().find((entry) => entry.id === productId);
    if (!item) return;

    if (button.dataset.action === "remove") {
      removeFromWishlist(productId);
      showToast(`Removed "${item.title}" from wishlist.`);
      renderWishlist();
    } else if (button.dataset.action === "move-to-cart") {
      // The wishlist item already has the same shape addToCart expects
      // (id, title, price, image, category) — no re-fetching needed.
      const result = addToCart(item, 1);
      if (result.limited) {
        showToast(`You already have the max of ${MAX_QUANTITY_PER_ITEM} "${item.title}" in your cart.`);
      } else {
        showToast(`Added "${item.title}" to cart.`);
      }
    }
  });
}
