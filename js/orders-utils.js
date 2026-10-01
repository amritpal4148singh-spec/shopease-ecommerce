/* =========================================================
   SHOPEASE — orders-utils.js
   Shared order-history logic, the same pattern as cart-utils.js
   and wishlist-utils.js. Orders are stored as an array (newest
   first) under shopease_orders. checkout.js still also writes
   shopease_last_order (unchanged from Phase 4) so the existing
   order-success.html flow keeps working without changes there.

   Load this file AFTER app.js and BEFORE any page script that
   calls these functions (checkout.js, orders.js, order-details.js,
   order-success.js).
   ========================================================= */

const ORDERS_STORAGE_KEY = "shopease_orders";
const LAST_ORDER_STORAGE_KEY = "shopease_last_order"; // unchanged key from Phase 4

// The 5-stage delivery timeline, in order. "cancelled" is a
// separate terminal state and isn't part of this progression.
const ORDER_STAGES = ["placed", "processing", "shipped", "out_for_delivery", "delivered"];

const ORDER_STATUS_LABELS = {
  placed: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// An order can only be cancelled before it ships — once it's on
// its way, cancelling from here would be misleading for a demo.
const CANCELLABLE_STATUSES = ["placed", "processing"];

/** Reads every saved order (newest first). Always returns an array, even if LocalStorage is empty or corrupted. */
function getOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Order history in LocalStorage was invalid — using an empty list instead:", error);
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

/**
 * Adds a newly-placed order to the history (newest first) and also
 * refreshes shopease_last_order, which order-success.html already
 * reads. This is the ONLY place a new order record is created, so
 * calling it once per checkout never creates duplicates.
 */
function addOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
}

/** Finds one order by its id, or undefined if it doesn't exist. */
function getOrderById(orderId) {
  return getOrders().find((order) => order.orderId === orderId);
}

/** Returns only the orders placed by one account (matched by ownerEmail), newest first. */
function getOrdersForUser(email) {
  const normalized = email.trim().toLowerCase();
  return getOrders().filter((order) => (order.ownerEmail || "").toLowerCase() === normalized);
}

/** Updates an order's status in place (used by cancellation and the demo status control). */
function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find((entry) => entry.orderId === orderId);
  if (!order) return null;

  order.status = newStatus;
  saveOrders(orders);

  // Keep shopease_last_order in sync too, in case it's the same order.
  const lastOrder = readLastOrder();
  if (lastOrder && lastOrder.orderId === orderId) {
    lastOrder.status = newStatus;
    localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(lastOrder));
  }

  return order;
}

/** True if an order is still early enough in the demo timeline to be cancelled. */
function isOrderCancellable(status) {
  return CANCELLABLE_STATUSES.includes(status);
}

function cancelOrder(orderId) {
  return updateOrderStatus(orderId, "cancelled");
}

/** Reads the most recently placed order (used by order-success.html). Returns null if missing/corrupted. */
function readLastOrder() {
  try {
    const raw = localStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.error("Saved order data was invalid:", error);
    return null;
  }
}
