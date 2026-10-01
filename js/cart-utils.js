/* =========================================================
   SHOPEASE — cart-utils.js
   Shared cart logic used by EVERY page (homepage, products,
   product details, and cart.html). This is the only place that
   reads or writes the cart in LocalStorage, so cart data always
   stays in one consistent shape no matter which page changed it.

   Load this file AFTER app.js (it uses showToast, which app.js
   defines) and BEFORE any page-specific script that calls these
   functions (products.js, product-details.js, cart.js).
   ========================================================= */

const CART_STORAGE_KEY = "shopease_cart";
const MAX_QUANTITY_PER_ITEM = 10;
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_RATE = 10;

/**
 * Reads the cart out of LocalStorage. Always returns an array —
 * if LocalStorage is empty, corrupted, or holds something that
 * isn't a JSON array, this quietly resets to an empty cart instead
 * of throwing and breaking the page.
 */
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Cart data in LocalStorage was invalid — resetting it:", error);
    return [];
  }
}

/** Writes the cart to LocalStorage and refreshes the header badge. */
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

/**
 * Adds `quantity` of a product to the cart. If it's already in the
 * cart, this increases its quantity instead of creating a second
 * entry — the cart is always looked up and matched by product id.
 * Quantity is always capped at MAX_QUANTITY_PER_ITEM (10).
 *
 * Returns { limited: boolean, quantity: number } so the caller can
 * show the right toast message (a normal confirmation, or a "you
 * hit the limit" message).
 */
function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    const requestedTotal = existingItem.quantity + quantity;
    existingItem.quantity = Math.min(MAX_QUANTITY_PER_ITEM, requestedTotal);
    saveCart(cart);
    return { limited: requestedTotal > MAX_QUANTITY_PER_ITEM, quantity: existingItem.quantity };
  }

  const startingQuantity = Math.min(MAX_QUANTITY_PER_ITEM, quantity);
  cart.push({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
    quantity: startingQuantity,
  });
  saveCart(cart);
  return { limited: quantity > MAX_QUANTITY_PER_ITEM, quantity: startingQuantity };
}

/** Removes one product from the cart entirely, regardless of its quantity. */
function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
}

/** Sets a product's quantity directly, clamped between 1 and 10. */
function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity = Math.min(MAX_QUANTITY_PER_ITEM, Math.max(1, quantity));
  saveCart(cart);
}

/** Empties the cart completely. */
function clearCart() {
  saveCart([]);
}

/** Total number of items in the cart (quantities added together, not line count). */
function getCartCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

/** Sum of (price × quantity) for every item. Accepts a cart array to avoid re-reading LocalStorage. */
function calculateSubtotal(cart = getCart()) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Demo shipping rule: free at $100+ subtotal, a flat $10 below that,
 * and $0 for an empty cart (there's nothing to ship).
 */
function calculateShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
}

function calculateTotal(subtotal, shipping) {
  return subtotal + shipping;
}

/** Updates the little number on the header's cart icon, on whichever page is open. */
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  badge.textContent = getCartCount();
}

// If the cart changes in another browser tab (e.g. two tabs open on
// the site), keep this tab's badge in sync too.
window.addEventListener("storage", (event) => {
  if (event.key === CART_STORAGE_KEY) updateCartBadge();
});

// Show the correct count as soon as any page loads.
document.addEventListener("DOMContentLoaded", updateCartBadge);
