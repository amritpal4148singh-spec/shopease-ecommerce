/* =========================================================
   SHOPEASE — orders.js
   Runs ONLY on orders.html. Depends on functions in app.js
   (formatPrice, escapeHTML), auth-utils.js (requireAuth,
   getCurrentUser), and orders-utils.js (getOrdersForUser,
   ORDER_STATUS_LABELS) — load all three before this file.
   ========================================================= */

const ordersListContainer = document.getElementById("ordersListContainer");
const ordersCountEl = document.getElementById("ordersCount");

document.addEventListener("DOMContentLoaded", init);

function init() {
  if (!requireAuth()) return; // defined in auth-utils.js — sends to login.html and back if not signed in
  renderOrders();
}

function renderOrders() {
  const user = getCurrentUser(); // defined in auth-utils.js

  // getOrdersForUser() already returns newest-first (since addOrder()
  // in orders-utils.js unshifts each new order), filtered down to just
  // this account's own orders — never another user's.
  const orders = getOrdersForUser(user.email);

  ordersCountEl.textContent =
    orders.length === 0 ? "" : `${orders.length} order${orders.length === 1 ? "" : "s"}`;

  if (orders.length === 0) {
    ordersListContainer.innerHTML = buildEmptyStateHTML();
    return;
  }

  ordersListContainer.innerHTML = orders.map(buildOrderRowHTML).join("");
}

function buildEmptyStateHTML() {
  return `
    <div class="orders-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 7h-3V5a4 4 0 0 0-8 0v2H6a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1z"/>
        <path d="M9 7V5a3 3 0 0 1 6 0v2"/>
      </svg>
      <p>You haven't placed any orders yet.</p>
      <a href="products.html" class="btn btn-primary">Start Shopping</a>
    </div>
  `;
}

function buildOrderRowHTML(order) {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const formattedDate = new Date(order.orderDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const paymentLabel = { cod: "Cash on Delivery", upi: "UPI", card: "Card" }[order.paymentMethod] || order.paymentMethod;
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;

  return `
    <article class="order-row">
      <div class="order-row-id-group">
        <p class="order-row-id">Order #${escapeHTML(order.orderId)}</p>
        <p class="order-row-date">Placed ${formattedDate}</p>
      </div>
      <div class="order-row-items">
        <p class="order-row-label">Items</p>
        <p class="order-row-value">${itemCount}</p>
      </div>
      <div class="order-row-payment">
        <p class="order-row-label">Payment</p>
        <p class="order-row-value">${escapeHTML(paymentLabel)}</p>
      </div>
      <div class="order-row-total">
        <p class="order-row-label">Total</p>
        <p class="order-row-value">${formatPrice(order.total)}</p>
      </div>
      <div class="order-row-status">
        <p class="order-row-label">Status</p>
        <span class="status-badge status-${order.status}">${escapeHTML(statusLabel)}</span>
      </div>
      <div class="order-row-actions">
        <a href="order-details.html?id=${encodeURIComponent(order.orderId)}" class="btn btn-primary">View Details</a>
      </div>
    </article>
  `;
}
