/* =========================================================
   SHOPEASE — login.js
   Runs ONLY on login.html. Depends on functions in app.js
   (showToast) and auth-utils.js (login, isCryptoAvailable,
   consumeRedirectDestination) — load both before this file.
   ========================================================= */

const loginForm = document.getElementById("loginForm");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const loginFormError = document.getElementById("loginFormError");

document.addEventListener("DOMContentLoaded", init);

function init() {
  wirePasswordToggles();
  loginForm.addEventListener("submit", handleSubmit);
}

function wirePasswordToggles() {
  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);
      const willShow = input.type === "password";

      input.type = willShow ? "text" : "password";
      button.classList.toggle("is-active", willShow);
      button.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
    });
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  clearAllErrors();

  if (!isCryptoAvailable()) {
    showToast("Your browser doesn't support the password hashing this demo needs. Try a recent version of Chrome, Firefox, or Edge.");
    return;
  }

  const values = {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
  };

  const errors = {};
  if (!values.email) errors.email = "Email address is required.";
  if (!values.password) errors.password = "Password is required.";

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return;
  }

  loginSubmitBtn.disabled = true;
  loginSubmitBtn.textContent = "Logging in…";

  try {
    const result = await login(values.email, values.password); // defined in auth-utils.js

    if (!result.success) {
      loginFormError.textContent = result.error;
      return;
    }

    const destination = consumeRedirectDestination(); // defined in auth-utils.js
    window.location.href = destination;
  } finally {
    loginSubmitBtn.disabled = false;
    loginSubmitBtn.textContent = "Log In";
  }
}

function showErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorEl = document.getElementById(`${field}Error`);
    if (errorEl) errorEl.textContent = message;

    const inputEl = document.getElementById(field);
    if (inputEl) inputEl.classList.add("has-error");
  });
}

function clearAllErrors() {
  loginFormError.textContent = "";
  loginForm.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  loginForm.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
}
