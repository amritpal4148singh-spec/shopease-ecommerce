/* =========================================================
   SHOPEASE — order-success.js
   Runs ONLY on order-success.html. Depends on functions in
   app.js (formatPrice, escapeHTML) and orders-utils.js
   (readLastOrder) — load both before this file.
   ========================================================= */

const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Credit / Debit Card",
};

const orderSuccessContent = document.getElementById("orderSuccessContent");

document.addEventListener("DOMContentLoaded", init);

function init() {
  const order = readLastOrder();

  if (!order) {
    renderNotFound();
    return;
  }

  renderOrder(order);
}

function renderNotFound() {
  orderSuccessContent.innerHTML = `
    <div class="order-not-found">
      <p>We couldn't find a recent order to show you.</p>
      <a href="products.html" class="btn btn-primary">Continue Shopping</a>
    </div>
  `;
}

function renderOrder(order) {
  const orderDate = new Date(order.orderDate);
  const formattedDate = orderDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const formattedDelivery = estimatedDelivery.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const paymentLabel = PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod;
  const address = order.shippingAddress || {};

  orderSuccessContent.innerHTML = `
    <div class="order-success-card">
      <div class="order-success-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>

      <h1>Thanks, ${escapeHTML(order.customer.fullName)}! Your order is confirmed.</h1>
      <p class="order-success-sub">Placed on ${formattedDate}</p>
      <p class="order-success-id">Order #${escapeHTML(order.orderId)} · ${escapeHTML(ORDER_STATUS_LABELS[order.status] || order.status)}</p>

      <div class="order-success-section">
        <h2>Order Details</h2>
        <dl class="order-detail-grid">
          <div>
            <dt>Email</dt>
            <dd>${escapeHTML(order.customer.email)}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>${escapeHTML(order.customer.phone)}</dd>
          </div>
          <div>
            <dt>Payment Method</dt>
            <dd>${escapeHTML(paymentLabel)}</dd>
          </div>
          <div>
            <dt>Shipping Address</dt>
            <dd>
              ${escapeHTML(address.houseNumber)}, ${escapeHTML(address.streetAddress)},
              ${escapeHTML(address.city)}, ${escapeHTML(address.state)}
              ${escapeHTML(address.pinCode)}, ${escapeHTML(address.country)}
            </dd>
          </div>
        </dl>
      </div>

      <div class="order-success-section">
        <h2>Items Ordered</h2>
        <div class="order-success-items">
          ${order.items.map(buildOrderItemHTML).join("")}
        </div>

        <div class="order-success-totals">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${formatPrice(order.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>${order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
          </div>
          <div class="summary-row summary-total">
            <span>Total</span>
            <span>${formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <p class="delivery-estimate">
        Estimated delivery: <strong>${formattedDelivery}</strong> (demo estimate — no real shipment is dispatched).
      </p>

      <div class="order-success-actions">
        <a href="order-details.html?id=${encodeURIComponent(order.orderId)}" class="btn btn-primary">View Order</a>
        <a href="products.html" class="btn btn-ghost">Continue Shopping</a>
      </div>
    </div>
  `;
}

function buildOrderItemHTML(item) {
  const lineTotal = item.price * item.quantity;
  return `
    <div class="order-success-item">
      <img
        src="${escapeHTML(item.image)}"
        alt="${escapeHTML(item.title)}"
        loading="lazy"
        onerror="this.onerror=null; this.src='https://placehold.co/80x80/EFEBDF/6B7368?text=ShopEase';"
      />
      <div>
        <p class="order-success-item-title">${escapeHTML(item.title)}</p>
        <p class="order-success-item-meta">Qty ${item.quantity} × ${formatPrice(item.price)}</p>
      </div>
      <span class="order-success-item-total">${formatPrice(lineTotal)}</span>
    </div>
  `;
}
