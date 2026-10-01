/* =========================================================
   SHOPEASE — order-details.js
   Runs ONLY on order-details.html. Depends on functions in
   app.js (formatPrice, escapeHTML, showToast), auth-utils.js
   (requireAuth, getCurrentUser), and orders-utils.js (getOrderById,
   updateOrderStatus, cancelOrder, isOrderCancellable, ORDER_STAGES,
   ORDER_STATUS_LABELS) — load all three before this file.

   Phase 6: an order that exists but belongs to someone else is
   treated exactly like an order that doesn't exist at all — this
   page never reveals that a given order id is real if the current
   account isn't its owner.
   ========================================================= */

const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Credit / Debit Card",
};

const orderDetailsContent = document.getElementById("orderDetailsContent");

let currentOrderId = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
  if (!requireAuth()) return; // defined in auth-utils.js — sends to login.html and back if not signed in

  currentOrderId = getOrderIdFromURL();

  if (!currentOrderId) {
    renderNotFound("No order was specified.");
    return;
  }

  loadAndRenderOrder();
}

function getOrderIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/** Re-reads the order from LocalStorage and redraws the page. Called after every change (status update, cancel). */
function loadAndRenderOrder() {
  const order = getOrderById(currentOrderId);
  const user = getCurrentUser(); // defined in auth-utils.js — requireAuth() already guaranteed this isn't null

  // Treat someone else's order the same as a missing one — never
  // confirm that an id belongs to another account.
  if (!order || (order.ownerEmail || "").toLowerCase() !== user.email.toLowerCase()) {
    renderNotFound(`We couldn't find an order with id "${currentOrderId}".`);
    return;
  }

  renderOrder(order);
}

function renderNotFound(message) {
  orderDetailsContent.innerHTML = `
    <div class="order-not-found">
      <p>${escapeHTML(message)}</p>
      <a href="orders.html" class="btn btn-primary">Back to Orders</a>
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

  const address = order.shippingAddress || {};
  const paymentLabel = PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod;

  orderDetailsContent.innerHTML = `
    <div class="order-details-card">

      <div class="order-details-header">
        <div>
          <h1>Order #${escapeHTML(order.orderId)}</h1>
          <p>Placed on ${formattedDate}</p>
        </div>
        <span class="status-badge status-${order.status}">${escapeHTML(ORDER_STATUS_LABELS[order.status] || order.status)}</span>
      </div>

      <div class="order-details-section">
        <h2>Order Tracking</h2>
        ${buildTrackingHTML(order)}
      </div>

      <div class="order-details-section">
        <h2>Order Details</h2>
        <dl class="order-detail-grid">
          <div>
            <dt>Customer</dt>
            <dd>${escapeHTML(order.customer.fullName)}</dd>
          </div>
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
          <div class="form-field-wide">
            <dt>Shipping Address</dt>
            <dd>
              ${escapeHTML(address.houseNumber)}, ${escapeHTML(address.streetAddress)},
              ${escapeHTML(address.city)}, ${escapeHTML(address.state)}
              ${escapeHTML(address.pinCode)}, ${escapeHTML(address.country)}
            </dd>
          </div>
        </dl>
      </div>

      <div class="order-details-section">
        <h2>Items Ordered</h2>
        <div class="order-details-items">
          ${order.items.map(buildOrderItemHTML).join("")}
        </div>

        <div class="order-details-totals">
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

      <div class="order-details-section">
        ${buildDemoAndCancelHTML(order)}
      </div>

    </div>
  `;

  wireStatusDemoControls(order);
  wireCancelButton(order);
}

function buildOrderItemHTML(item) {
  const lineTotal = item.price * item.quantity;
  return `
    <div class="order-details-item">
      <img
        src="${escapeHTML(item.image)}"
        alt="${escapeHTML(item.title)}"
        loading="lazy"
        onerror="this.onerror=null; this.src='https://placehold.co/80x80/EFEBDF/6B7368?text=ShopEase';"
      />
      <div>
        <p class="order-details-item-title">${escapeHTML(item.title)}</p>
        <p class="order-details-item-meta">Qty ${item.quantity} × ${formatPrice(item.price)}</p>
      </div>
      <span class="order-details-item-total">${formatPrice(lineTotal)}</span>
    </div>
  `;
}

/** Builds the 5-stage timeline, or a "cancelled" banner if the order was cancelled instead of progressing. */
function buildTrackingHTML(order) {
  if (order.status === "cancelled") {
    return `
      <div class="tracking-cancelled">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        This order was cancelled and is no longer being processed.
      </div>
    `;
  }

  const currentIndex = ORDER_STAGES.indexOf(order.status);

  const steps = ORDER_STAGES.map((stage, index) => {
    let stepClass = "";
    let icon = "";

    if (index < currentIndex) {
      stepClass = "is-complete";
      icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (index === currentIndex) {
      stepClass = "is-current";
      icon = "";
    }

    return `
      <div class="tracking-step ${stepClass}">
        <span class="tracking-step-circle">${icon}</span>
        <span class="tracking-step-label">${ORDER_STATUS_LABELS[stage]}</span>
      </div>
    `;
  }).join("");

  const estimatedDelivery = new Date(order.orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const formattedDelivery = estimatedDelivery.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const deliveryNote =
    order.status === "delivered"
      ? `Delivered — thanks for shopping with ShopEase!`
      : `Estimated delivery: <strong>${formattedDelivery}</strong> (demo estimate — no real shipment is dispatched).`;

  return `
    <div class="tracking-timeline">${steps}</div>
    <p class="delivery-estimate">${deliveryNote}</p>
  `;
}

/** Builds the "Demo: Update Order Status" control and the Cancel Order button/note. */
function buildDemoAndCancelHTML(order) {
  const cancellable = isOrderCancellable(order.status);

  const demoOptions = ORDER_STAGES.map(
    (stage) => `<option value="${stage}" ${order.status === stage ? "selected" : ""}>${ORDER_STATUS_LABELS[stage]}</option>`
  ).join("");

  const demoSection =
    order.status === "cancelled"
      ? ""
      : `
        <div class="demo-panel">
          <p class="demo-panel-label">DEMO CONTROL</p>
          <p class="demo-panel-note">There's no real courier here — this simulates the status update a real store would receive automatically.</p>
          <div class="demo-panel-controls">
            <select id="demoStatusSelect">${demoOptions}</select>
            <button type="button" id="updateStatusBtn" class="btn btn-primary">Update Status (Demo)</button>
          </div>
        </div>
      `;

  const cancelSection = `
    <div class="cancel-order-row">
      <p class="cancel-order-note">
        ${
          cancellable
            ? "You can cancel this order before it ships."
            : order.status === "cancelled"
              ? "This order has already been cancelled."
              : "This order has already shipped and can no longer be cancelled."
        }
      </p>
      ${cancellable ? `<button type="button" id="cancelOrderBtn" class="btn-cancel-order">Cancel Order (Demo)</button>` : ""}
    </div>
  `;

  return demoSection + cancelSection;
}

function wireStatusDemoControls(order) {
  const updateBtn = document.getElementById("updateStatusBtn");
  const select = document.getElementById("demoStatusSelect");
  if (!updateBtn || !select) return; // not shown for a cancelled order

  updateBtn.addEventListener("click", () => {
    updateOrderStatus(order.orderId, select.value); // defined in orders-utils.js
    showToast(`Status updated to "${ORDER_STATUS_LABELS[select.value]}" (demo only).`);
    loadAndRenderOrder();
  });
}

function wireCancelButton(order) {
  const cancelBtn = document.getElementById("cancelOrderBtn");
  if (!cancelBtn) return; // not shown once the order isn't cancellable

  cancelBtn.addEventListener("click", () => {
    const confirmed = window.confirm(
      `Cancel order #${order.orderId}? This is a demo cancellation and can't be undone here.`
    );
    if (!confirmed) return;

    cancelOrder(order.orderId); // defined in orders-utils.js
    showToast("Order cancelled.");
    loadAndRenderOrder();
  });
}
