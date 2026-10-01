/* =========================================================
   SHOPEASE — wishlist-utils.js
   Shared wishlist logic used by EVERY page, the same way
   cart-utils.js is. The wishlist is stored completely
   separately from the cart, under its own LocalStorage key.

   Load this file AFTER app.js (uses showToast indirectly via
   pages that call these functions) and BEFORE any page script
   that calls these functions.
   ========================================================= */

const WISHLIST_STORAGE_KEY = "shopease_wishlist";

/** Reads the wishlist out of LocalStorage. Always returns an array, even if the stored value is missing or corrupted. */
function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Wishlist data in LocalStorage was invalid — resetting it:", error);
    return [];
  }
}

/** Writes the wishlist to LocalStorage and refreshes the header badge. */
function saveWishlist(list) {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
  updateWishlistBadge();
}

/** True if a product id is already saved. */
function isInWishlist(productId) {
  return getWishlist().some((item) => item.id === productId);
}

/** Adds a product to the wishlist. Does nothing if it's already there (no duplicates). */
function addToWishlist(product) {
  const list = getWishlist();
  if (list.some((item) => item.id === product.id)) {
    return { added: false };
  }

  list.push({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
  });
  saveWishlist(list);
  return { added: true };
}

function removeFromWishlist(productId) {
  const list = getWishlist().filter((item) => item.id !== productId);
  saveWishlist(list);
}

/**
 * Adds the product if it isn't saved yet, or removes it if it is —
 * this is what a heart button click does. Returns { active: boolean }
 * so the caller knows whether to show the button as "saved" or not.
 */
function toggleWishlist(product) {
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id);
    return { active: false };
  }
  addToWishlist(product);
  return { active: true };
}

function clearWishlist() {
  saveWishlist([]);
}

function getWishlistCount() {
  return getWishlist().length;
}

/** Updates the little number on the header's wishlist icon, on whichever page is open. */
function updateWishlistBadge() {
  const badge = document.getElementById("wishlistCount");
  if (!badge) return;
  badge.textContent = getWishlistCount();
}

// Keep the badge in sync if the wishlist changes in another browser tab.
window.addEventListener("storage", (event) => {
  if (event.key === WISHLIST_STORAGE_KEY) updateWishlistBadge();
});

document.addEventListener("DOMContentLoaded", updateWishlistBadge);
