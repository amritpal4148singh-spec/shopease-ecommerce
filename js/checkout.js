/* =========================================================
   SHOPEASE — checkout.js
   Runs ONLY on checkout.html. Depends on functions in app.js
   (formatPrice, escapeHTML, showToast), cart-utils.js (getCart,
   clearCart, calculateSubtotal, calculateShipping, calculateTotal),
   auth-utils.js (requireAuth, getCurrentUser), and orders-utils.js
   (addOrder) — load all of these before this file.

   Phase 6 note: checkout now requires being logged in. This
   wasn't asked for directly, but "users can only view their own
   orders" (Phase 6) only works if every order has a known owner,
   and login is the only point where we know who that is.

   Card/UPI demo fields (cardNumber, cardCvv, cardExpiry, upiId)
   are intentionally never read into the saved order — only
   which payment METHOD was chosen ("cod" / "upi" / "card") is
   stored, never any card or UPI details.
   ========================================================= */

const checkoutEmptyState = document.getElementById("checkoutEmptyState");
const checkoutBody = document.getElementById("checkoutBody");
const checkoutForm = document.getElementById("checkoutForm");

const checkoutSummaryItemsEl = document.getElementById("checkoutSummaryItems");
const checkoutSubtotalEl = document.getElementById("checkoutSubtotal");
const checkoutShippingEl = document.getElementById("checkoutShipping");
const checkoutTotalEl = document.getElementById("checkoutTotal");

const paymentOptionsEl = document.getElementById("paymentOptions");
const upiDemoEl = document.getElementById("upiDemo");
const cardDemoEl = document.getElementById("cardDemo");

document.addEventListener("DOMContentLoaded", init);

function init() {
  if (!requireAuth()) return; // defined in auth-utils.js — sends to login.html and back if not signed in

  const cart = getCart();

  if (cart.length === 0) {
    checkoutEmptyState.hidden = false;
    checkoutBody.hidden = true;
    return;
  }

  checkoutEmptyState.hidden = true;
  checkoutBody.hidden = false;

  renderOrderSummary(cart);
  wirePaymentMethodToggle();
  checkoutForm.addEventListener("submit", handleSubmit);
}

function renderOrderSummary(cart) {
  checkoutSummaryItemsEl.innerHTML = cart.map(buildSummaryItemHTML).join("");

  const subtotal = calculateSubtotal(cart);
  const shipping = calculateShipping(subtotal);
  const total = calculateTotal(subtotal, shipping);

  checkoutSubtotalEl.textContent = formatPrice(subtotal);
  checkoutShippingEl.textContent = shipping === 0 ? "Free" : formatPrice(shipping);
  checkoutTotalEl.textContent = formatPrice(total);
}

function buildSummaryItemHTML(item) {
  const lineTotal = item.price * item.quantity;
  return `
    <div class="checkout-summary-item">
      <img
        src="${escapeHTML(item.image)}"
        alt="${escapeHTML(item.title)}"
        loading="lazy"
        onerror="this.onerror=null; this.src='https://placehold.co/80x80/EFEBDF/6B7368?text=ShopEase';"
      />
      <div class="checkout-summary-item-info">
        <p class="checkout-summary-item-title">${escapeHTML(item.title)}</p>
        <p class="checkout-summary-item-meta">Qty ${item.quantity} × ${formatPrice(item.price)}</p>
      </div>
      <span class="checkout-summary-item-total">${formatPrice(lineTotal)}</span>
    </div>
  `;
}

/** Shows the UPI or card demo panel based on the selected radio, and highlights the chosen option. */
function wirePaymentMethodToggle() {
  paymentOptionsEl.addEventListener("change", updatePaymentMethodUI);
  updatePaymentMethodUI(); // reflect the default ("cod") on first load
}

function updatePaymentMethodUI() {
  const method = getSelectedPaymentMethod();

  upiDemoEl.hidden = method !== "upi";
  cardDemoEl.hidden = method !== "card";

  paymentOptionsEl.querySelectorAll(".payment-option").forEach((label) => {
    const radio = label.querySelector("input[type='radio']");
    label.classList.toggle("is-selected", radio.checked);
  });
}

function getSelectedPaymentMethod() {
  const checked = checkoutForm.querySelector('input[name="paymentMethod"]:checked');
  return checked ? checked.value : null;
}

// ---------------------------------------------------------
// VALIDATION + SUBMISSION
// ---------------------------------------------------------

function handleSubmit(event) {
  event.preventDefault();
  clearAllErrors();

  const cart = getCart();
  if (cart.length === 0) {
    // The cart could have emptied in another tab while this page was open.
    showToast("Your cart is empty.");
    init();
    return;
  }

  const values = getFormValues();
  const errors = validateForm(values);

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    showToast("Please fix the highlighted fields.");
    return;
  }

  placeOrder(values, cart);
}

function getFormValues() {
  return {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    houseNumber: document.getElementById("houseNumber").value.trim(),
    streetAddress: document.getElementById("streetAddress").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim(),
    pinCode: document.getElementById("pinCode").value.trim(),
    country: document.getElementById("country").value.trim(),
    paymentMethod: getSelectedPaymentMethod(),
  };
}

function validateForm(values) {
  const errors = {};

  if (!values.fullName) errors.fullName = "Full name is required.";

  if (!values.email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone) {
    errors.phone = "Phone number is required.";
  } else if (!/^[0-9+\-\s()]{7,15}$/.test(values.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.houseNumber) errors.houseNumber = "House/flat number is required.";
  if (!values.streetAddress) errors.streetAddress = "Street address is required.";
  if (!values.city) errors.city = "City is required.";
  if (!values.state) errors.state = "State is required.";

  if (!values.pinCode) {
    errors.pinCode = "PIN code is required.";
  } else if (!/^[0-9]{4,10}$/.test(values.pinCode)) {
    errors.pinCode = "Enter a valid PIN code.";
  }

  if (!values.country) errors.country = "Country is required.";
  if (!values.paymentMethod) errors.paymentMethod = "Choose a payment method.";

  return errors;
}

function showErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorEl = document.getElementById(`${field}Error`);
    if (errorEl) errorEl.textContent = message;

    const inputEl = document.getElementById(field);
    if (inputEl) inputEl.classList.add("has-error");
  });

  if (errors.paymentMethod) {
    paymentOptionsEl.classList.add("has-error");
  }

  // Scroll the first problem field into view so long forms don't hide it.
  const firstFieldName = Object.keys(errors)[0];
  const firstFieldEl = document.getElementById(firstFieldName) || paymentOptionsEl;
  firstFieldEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearAllErrors() {
  checkoutForm.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  checkoutForm.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
  paymentOptionsEl.classList.remove("has-error");
}

/** Builds the order record, saves it, clears the cart, and redirects to the confirmation page. */
function placeOrder(values, cart) {
  const subtotal = calculateSubtotal(cart);
  const shipping = calculateShipping(subtotal);
  const total = calculateTotal(subtotal, shipping);

  const order = {
    orderId: generateOrderId(),
    orderDate: new Date().toISOString(),
    status: "placed", // start of the 5-stage demo tracking timeline
    ownerEmail: getCurrentUser().email, // defined in auth-utils.js — safe here since requireAuth() already ran
    customer: {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
    },
    shippingAddress: {
      houseNumber: values.houseNumber,
      streetAddress: values.streetAddress,
      city: values.city,
      state: values.state,
      pinCode: values.pinCode,
      country: values.country,
    },
    paymentMethod: values.paymentMethod, // "cod" | "upi" | "card" — never any card/UPI details
    items: cart,
    subtotal,
    shipping,
    total,
  };

  addOrder(order); // defined in orders-utils.js — saves to history AND shopease_last_order
  clearCart(); // defined in cart-utils.js — also refreshes the cart badge

  window.location.href = "order-success.html";
}

/** A short, readable, reasonably-unique order id — good enough for a frontend-only demo. */
function generateOrderId() {
  const timePart = Date.now().toString().slice(-6);
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SE-${timePart}${randomPart}`;
}
