/* =========================================================
   SHOPEASE — cart.js
   Runs ONLY on cart.html. Depends on functions in app.js
   (formatPrice, escapeHTML, showToast, CATEGORY_LABELS) and
   cart-utils.js (getCart, saveCart, removeFromCart,
   updateCartQuantity, clearCart, calculateSubtotal,
   calculateShipping, calculateTotal) — load both before this file.
   ========================================================= */

const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartBody = document.getElementById("cartBody");
const cartItemCountEl = document.getElementById("cartItemCount");
const summarySubtotalEl = document.getElementById("summarySubtotal");
const summaryShippingEl = document.getElementById("summaryShipping");
const summaryTotalEl = document.getElementById("summaryTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCartBtn");

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderCart();
  wireCartItemActions();
  wireSummaryActions();
}

/** Re-reads the cart from LocalStorage and redraws the whole page. Called after every change. */
function renderCart() {
  const cart = getCart();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  cartItemCountEl.textContent =
    itemCount === 0 ? "" : `${itemCount} item${itemCount === 1 ? "" : "s"} in your cart`;

  if (cart.length === 0) {
    cartBody.classList.add("is-empty");
    cartItemsContainer.innerHTML = buildEmptyStateHTML();
    return;
  }

  cartBody.classList.remove("is-empty");
  cartItemsContainer.innerHTML = cart.map(buildCartItemHTML).join("");
  renderSummary(cart);
}

function buildEmptyStateHTML() {
  return `
    <div class="cart-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
      </svg>
      <p>Your cart is empty.</p>
      <a href="products.html" class="btn btn-primary">Continue Shopping</a>
    </div>
  `;
}

function buildCartItemHTML(item) {
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
  const lineSubtotal = item.price * item.quantity;

  return `
    <article class="cart-item" data-id="${escapeHTML(item.id)}">
      <img
        class="cart-item-image"
        src="${escapeHTML(item.image)}"
        alt="${escapeHTML(item.title)}"
        loading="lazy"
        onerror="this.onerror=null; this.src='https://placehold.co/160x160/EFEBDF/6B7368?text=ShopEase';"
      />
      <div class="cart-item-info">
        <p class="cart-item-category">${categoryLabel}</p>
        <h3 class="cart-item-title">${escapeHTML(item.title)}</h3>
        <p class="cart-item-price">${formatPrice(item.price)} each</p>
      </div>
      <div class="cart-item-quantity">
        <div class="quantity-stepper">
          <button type="button" data-action="decrease" aria-label="Decrease quantity">−</button>
          <input type="number" class="qty-input" data-action="set-quantity" value="${item.quantity}" min="1" max="10" />
          <button type="button" data-action="increase" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-item-subtotal">${formatPrice(lineSubtotal)}</div>
      <button type="button" class="cart-item-remove" data-action="remove" aria-label="Remove ${escapeHTML(item.title)} from cart">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </article>
  `;
}

function renderSummary(cart) {
  const subtotal = calculateSubtotal(cart);
  const shipping = calculateShipping(subtotal);
  const total = calculateTotal(subtotal, shipping);

  summarySubtotalEl.textContent = formatPrice(subtotal);
  summaryShippingEl.textContent = shipping === 0 ? "Free" : formatPrice(shipping);
  summaryTotalEl.textContent = formatPrice(total);
}

/** One delegated listener handles every row's decrease/increase/remove button. */
function wireCartItemActions() {
  cartItemsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const itemEl = button.closest(".cart-item");
    if (!itemEl) return;

    const productId = Number(itemEl.dataset.id);
    const item = getCart().find((entry) => entry.id === productId);
    if (!item) return;

    if (button.dataset.action === "increase") {
      if (item.quantity >= MAX_QUANTITY_PER_ITEM) {
        showToast(`You've reached the maximum of ${MAX_QUANTITY_PER_ITEM} for this item.`);
        return;
      }
      updateCartQuantity(productId, item.quantity + 1);
      renderCart();
    } else if (button.dataset.action === "decrease") {
      if (item.quantity <= 1) {
        // Quantity is already at the minimum — only remove it if the
        // user explicitly confirms, per the cart requirements.
        const confirmed = window.confirm(`Remove "${item.title}" from your cart?`);
        if (!confirmed) return;
        removeFromCart(productId);
        showToast(`Removed "${item.title}" from cart.`);
        renderCart();
        return;
      }
      updateCartQuantity(productId, item.quantity - 1);
      renderCart();
    } else if (button.dataset.action === "remove") {
      removeFromCart(productId);
      showToast(`Removed "${item.title}" from cart.`);
      renderCart();
    }
  });

  // Typing a number directly into the quantity box.
  cartItemsContainer.addEventListener("change", (event) => {
    const input = event.target.closest('[data-action="set-quantity"]');
    if (!input) return;

    const itemEl = input.closest(".cart-item");
    const productId = Number(itemEl.dataset.id);
    const typed = Math.round(Number(input.value));
    const safeQuantity = Number.isNaN(typed) ? 1 : Math.min(MAX_QUANTITY_PER_ITEM, Math.max(1, typed));

    updateCartQuantity(productId, safeQuantity);
    renderCart();
  });
}

function wireSummaryActions() {
  checkoutBtn.addEventListener("click", () => {
    window.location.href = "checkout.html";
  });

  clearCartBtn.addEventListener("click", () => {
    if (getCart().length === 0) return;

    const confirmed = window.confirm("Remove all items from your cart?");
    if (!confirmed) return;

    clearCart();
    showToast("Cart cleared.");
    renderCart();
  });
}
