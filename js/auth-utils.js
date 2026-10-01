/* =========================================================
   SHOPEASE — auth-utils.js

   ⚠️  READ THIS BEFORE TRUSTING ANYTHING IN THIS FILE  ⚠️
   This is a FRONTEND-ONLY demo of what a login system looks
   like. There is no server, no database, and no real identity
   verification. Every "account" lives entirely in this one
   browser's LocalStorage. That means:

     - Anyone using this browser can open DevTools, read the
       shopease_users entry, and see every account's data.
     - Passwords are hashed (SHA-256 + a random per-user salt)
       using the browser's built-in Web Crypto API, so at least
       a plain password never sits in storage — but there's no
       server-side pepper, no rate-limiting, and SHA-256 alone
       is not what real systems use for password storage (they
       use slow, purpose-built algorithms like bcrypt/argon2,
       which only a server can run safely).
     - "Logging in" just checks a hash match in this browser.
       It proves nothing to anyone else and doesn't work across
       devices or browsers.

   A real login system needs a backend server, a real database,
   HTTPS, and a proper password-hashing library. Don't reuse a
   real password here, and don't ship this pattern to production.

   Load this file AFTER app.js (uses escapeHTML) and BEFORE any
   page script that calls these functions.
   ========================================================= */

const USERS_STORAGE_KEY = "shopease_users";
const SESSION_STORAGE_KEY = "shopease_session";
const AUTH_REDIRECT_KEY = "shopease_redirect_after_login"; // sessionStorage, not localStorage — only needed for the current visit

// ---------------------------------------------------------
// LOW-LEVEL STORAGE (users + session)
// ---------------------------------------------------------

/** Reads every demo account. Always returns an array, even if LocalStorage is empty or corrupted. */
function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("User account data in LocalStorage was invalid — using an empty list instead:", error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((user) => user.email.toLowerCase() === normalized);
}

/** Strips the password hash/salt before handing user data to a page — nothing sensitive should ever reach the DOM. */
function publicUserView(user) {
  return { fullName: user.fullName, email: user.email, phone: user.phone };
}

// ---------------------------------------------------------
// PASSWORD HASHING (Web Crypto API — no external library needed)
// ---------------------------------------------------------

/** True if this browser/context supports the Web Crypto API this demo relies on. */
function isCryptoAvailable() {
  return typeof crypto !== "undefined" && !!crypto.subtle && typeof crypto.subtle.digest === "function";
}

function generateSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Hashes salt+password with SHA-256 and returns it as a hex string. */
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------
// SIGNUP / LOGIN / LOGOUT
// ---------------------------------------------------------

/**
 * Creates a demo account. Returns { success: true } or
 * { success: false, error: "..." } (e.g. duplicate email).
 * Never stores the plain password — only a salted hash.
 */
async function signup({ fullName, email, phone, password }) {
  if (findUserByEmail(email)) {
    return { success: false, error: "An account with this email already exists." };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const users = getUsers();
  users.push({ fullName, email, phone, passwordHash, salt });
  saveUsers(users);

  return { success: true };
}

/**
 * Checks email + password against the stored accounts. Returns
 * { success: true, user } or { success: false, error }. The error
 * message is intentionally the same whether the email doesn't
 * exist or the password is wrong — real login forms don't reveal
 * which one it was.
 */
async function login(email, password) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: "Incorrect email or password." };
  }

  const attemptedHash = await hashPassword(password, user.salt);
  if (attemptedHash !== user.passwordHash) {
    return { success: false, error: "Incorrect email or password." };
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ email: user.email }));
  return { success: true, user: publicUserView(user) };
}

function logout() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  updateAuthNav();
}

/** Reads the current session, returning null if there isn't one or it's corrupted. */
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.email === "string" ? parsed : null;
  } catch (error) {
    console.error("Session data in LocalStorage was invalid — treating as logged out:", error);
    return null;
  }
}

/** Returns the logged-in user's public info, or null if no one is logged in (or the account no longer exists). */
function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  const user = findUserByEmail(session.email);
  return user ? publicUserView(user) : null;
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Updates the logged-in user's name/phone. Email is intentionally
 * not editable in this demo (changing it would also mean re-checking
 * uniqueness and updating every order's ownerEmail — out of scope
 * for a frontend demo). Returns the updated public user, or null if
 * no one is logged in.
 */
function updateProfile({ fullName, phone }) {
  const session = getSession();
  if (!session) return null;

  const users = getUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === session.email.toLowerCase());
  if (!user) return null;

  user.fullName = fullName;
  user.phone = phone;
  saveUsers(users);

  return publicUserView(user);
}

// ---------------------------------------------------------
// PAGE PROTECTION
// ---------------------------------------------------------

/**
 * Call this at the very top of a protected page's init(). If no
 * one is logged in, remembers where the visitor was headed and
 * sends them to login.html; returns false so the caller can stop
 * immediately. Returns true if it's safe to continue rendering.
 */
function requireAuth() {
  if (isLoggedIn()) return true;

  const destination = window.location.pathname.split("/").pop() + window.location.search;
  sessionStorage.setItem(AUTH_REDIRECT_KEY, destination || "index.html");
  window.location.href = "login.html";
  return false;
}

/** Reads (and clears) the page a visitor was trying to reach before login.html redirected them there. */
function consumeRedirectDestination() {
  const destination = sessionStorage.getItem(AUTH_REDIRECT_KEY);
  sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  return destination || "index.html";
}

// ---------------------------------------------------------
// NAV: logged-out vs logged-in state, on every page
// ---------------------------------------------------------

/** Fills in #authNavSection with Login/Sign Up, or the user's name + My Orders/My Profile/Logout. */
function updateAuthNav() {
  const container = document.getElementById("authNavSection");
  if (!container) return;

  const user = getCurrentUser();

  if (!user) {
    container.innerHTML = `
      <a href="login.html">Log In</a>
      <a href="signup.html">Sign Up</a>
    `;
    return;
  }

  const firstName = user.fullName.trim().split(" ")[0] || user.fullName;

  container.innerHTML = `
    <a href="orders.html">My Orders</a>
    <a href="profile.html">My Profile</a>
    <span class="nav-user-greeting">Hi, ${escapeHTML(firstName)}</span>
    <button type="button" class="nav-logout-btn" id="navLogoutBtn">Logout</button>
  `;

  document.getElementById("navLogoutBtn").addEventListener("click", () => {
    logout();
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", updateAuthNav);
