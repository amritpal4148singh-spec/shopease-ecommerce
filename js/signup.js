/* =========================================================
   SHOPEASE — signup.js
   Runs ONLY on signup.html. Depends on functions in app.js
   (showToast) and auth-utils.js (signup, isCryptoAvailable) —
   load both before this file.
   ========================================================= */

const signupForm = document.getElementById("signupForm");
const signupSubmitBtn = document.getElementById("signupSubmitBtn");

document.addEventListener("DOMContentLoaded", init);

function init() {
  wirePasswordToggles();
  signupForm.addEventListener("submit", handleSubmit);
}

/** Lets each password field's eye icon toggle between hidden and visible text. */
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

  const values = getFormValues();
  const errors = validateForm(values);

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return;
  }

  signupSubmitBtn.disabled = true;
  signupSubmitBtn.textContent = "Creating account…";

  try {
    const result = await signup(values); // defined in auth-utils.js

    if (!result.success) {
      showErrors({ email: result.error });
      showToast(result.error);
      return;
    }

    showToast("Account created! Redirecting to log in…");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
  } finally {
    signupSubmitBtn.disabled = false;
    signupSubmitBtn.textContent = "Create Account";
  }
}

function getFormValues() {
  return {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    password: document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value,
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

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.password && values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords don't match.";
  }

  return errors;
}

function showErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorEl = document.getElementById(`${field}Error`);
    if (errorEl) errorEl.textContent = message;

    const inputEl = document.getElementById(field);
    if (inputEl) inputEl.classList.add("has-error");
  });

  const firstFieldName = Object.keys(errors)[0];
  const firstFieldEl = document.getElementById(firstFieldName);
  if (firstFieldEl) firstFieldEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearAllErrors() {
  signupForm.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  signupForm.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
}
