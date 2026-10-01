/* =========================================================
   SHOPEASE — profile.js
   Runs ONLY on profile.html. Depends on functions in app.js
   (escapeHTML, showToast) and auth-utils.js (requireAuth,
   getCurrentUser, updateProfile, logout, updateAuthNav) —
   load both before this file.
   ========================================================= */

const profileContent = document.getElementById("profileContent");

document.addEventListener("DOMContentLoaded", init);

function init() {
  if (!requireAuth()) return; // defined in auth-utils.js — bounces to login.html if not signed in
  renderProfile();
}

function renderProfile() {
  const user = getCurrentUser();
  if (!user) {
    // Shouldn't happen since requireAuth() already checked, but stay safe.
    window.location.href = "login.html";
    return;
  }

  profileContent.innerHTML = `
    <div class="profile-card">
      <h1>My Profile</h1>

      <div class="profile-field-static">
        <p class="profile-field-label">Email Address</p>
        <p class="profile-field-value">${escapeHTML(user.email)}</p>
        <p class="profile-field-note">Email can't be changed in this demo.</p>
      </div>

      <form id="profileForm" novalidate>
        <div class="form-field">
          <label for="fullName">Full Name</label>
          <input type="text" id="fullName" name="fullName" value="${escapeHTML(user.fullName)}" />
          <p class="field-error" id="fullNameError"></p>
        </div>

        <div class="form-field">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" value="${escapeHTML(user.phone)}" />
          <p class="field-error" id="phoneError"></p>
        </div>

        <button type="submit" class="btn btn-primary">Save Changes</button>
      </form>

      <div class="profile-logout-row">
        <button type="button" id="profileLogoutBtn" class="btn btn-ghost">Logout</button>
      </div>
    </div>
  `;

  wireProfileForm();
  wireLogoutButton();
}

function wireProfileForm() {
  const form = document.getElementById("profileForm");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const values = {
      fullName: document.getElementById("fullName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
    };

    const errors = {};
    if (!values.fullName) errors.fullName = "Full name is required.";
    if (!values.phone) {
      errors.phone = "Phone number is required.";
    } else if (!/^[0-9+\-\s()]{7,15}$/.test(values.phone)) {
      errors.phone = "Enter a valid phone number.";
    }

    if (Object.keys(errors).length > 0) {
      showErrors(errors);
      return;
    }

    updateProfile(values); // defined in auth-utils.js
    showToast("Profile updated.");
    updateAuthNav(); // refresh the "Hi, Name" greeting in the header, in case the name changed
  });
}

function showErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorEl = document.getElementById(`${field}Error`);
    if (errorEl) errorEl.textContent = message;

    const inputEl = document.getElementById(field);
    if (inputEl) inputEl.classList.add("has-error");
  });
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
}

function wireLogoutButton() {
  document.getElementById("profileLogoutBtn").addEventListener("click", () => {
    logout(); // defined in auth-utils.js
    window.location.href = "index.html";
  });
}
