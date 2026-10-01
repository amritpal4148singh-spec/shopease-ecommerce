# ShopEase

A frontend-only e-commerce demo built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no backend, no build step. Built as a learning project to practice real-world frontend patterns: fetching and rendering data, client-side routing via query strings, LocalStorage-backed state, form validation, and a full (simulated) shopping flow from browsing to order tracking.

**This is a demo, not a real store.** No real payments are processed, no real emails are sent, and "accounts" live entirely in your own browser. See [Known Limitations](#known-limitations) before showing this to anyone as more than a portfolio piece.

## Features

- **Catalog** — homepage with featured/new-arrivals sections, a full product listing page with search, category filtering, price filtering, and sorting (price, rating, name), all synced to the URL so filtered views are bookmarkable/shareable
- **Product details** — full product page with quantity selector, related products, and add-to-cart/wishlist
- **Cart** — quantity controls (1–10), line subtotals, demo shipping rule (free at $100+, otherwise a flat $10), persists in LocalStorage
- **Wishlist** — heart-toggle on every product card, dedicated wishlist page, move-to-cart, independent of the cart
- **Checkout** — customer info, shipping address, and a payment-method choice (Cash on Delivery / UPI / Card, all demo interfaces) with full field validation
- **Order confirmation, history, and tracking** — every order gets a 5-stage demo tracking timeline (Order Placed → Processing → Shipped → Out for Delivery → Delivered), a "My Orders" list scoped to the logged-in account, and demo order cancellation (only before shipping)
- **Authentication** — signup/login/logout, salted+hashed demo passwords (Web Crypto SHA-256, no external library), a profile page, and page protection (checkout, orders, order details, and profile all require login)

## Technologies used

- HTML5, CSS3 (custom properties, Grid, Flexbox — no CSS framework)
- Vanilla JavaScript (ES6+), no build tools, no bundler, no frameworks
- [Fake Store API](https://fakestoreapi.com) for live product data (fetched client-side)
- Browser LocalStorage / SessionStorage for all cart, wishlist, order, and account data
- Web Crypto API (`crypto.subtle`) for demo password hashing
- Google Fonts (Fraunces, Inter) loaded via `<link>`

No npm packages, no build step — every file is served as-is.

## Project structure

```
shopease/
│
├── index.html               Homepage
├── products.html             Product listing (search/filter/sort)
├── product-details.html      Single product + related products
├── cart.html
├── wishlist.html
├── checkout.html
├── order-success.html        Order confirmation
├── orders.html                Order history (protected)
├── order-details.html         Order details + tracking + cancellation (protected)
├── signup.html
├── login.html
├── profile.html                Account details (protected)
│
├── css/
│   ├── style.css              Design tokens + shared header/footer/product-card/button styles
│   ├── forms.css               Shared form-field/password-toggle styles (checkout/signup/login/profile)
│   ├── products.css, product-details.css, cart.css, wishlist.css
│   ├── checkout.css, order-success.css, orders.css, order-details.css
│   └── signup.css, login.css, profile.css
│
├── js/
│   ├── app.js                  Shared: product fetch/cache, product card markup, toast, mobile nav, header search
│   ├── cart-utils.js           Cart storage + totals (shopease_cart)
│   ├── wishlist-utils.js       Wishlist storage (shopease_wishlist)
│   ├── auth-utils.js           Accounts, sessions, page protection (shopease_users, shopease_session)
│   ├── orders-utils.js         Order history + tracking + cancellation (shopease_orders, shopease_last_order)
│   ├── products.js, product-details.js, cart.js, wishlist.js
│   ├── checkout.js, order-success.js, orders.js, order-details.js
│   └── signup.js, login.js, profile.js
│
└── assets/images/              Local images for the homepage hero, category cards, and the 4 footwear
                                 products (Fake Store API has no footwear category)
```

**Script load order matters.** Every page loads shared scripts before its own page script, always in this order: `app.js` → `cart-utils.js` → `wishlist-utils.js` → `auth-utils.js` → `orders-utils.js` (only on pages that need order data) → the page's own script. Each shared file's functions are used by later ones (e.g. `app.js`'s `showToast` is used by every utility file).

## Running it locally

No build step, no dependencies to install. Two ways to run it:

**Option A — just open it.** Double-click `index.html`. This works for browsing, but some browsers restrict two things when a page is opened directly from disk (a `file://` URL): the Fake Store API fetch, and the Web Crypto API that signup/login use for password hashing. If products don't load or signup/login misbehave, use Option B.

**Option B — serve it locally (recommended).** From the project folder:
```
python3 -m http.server 8000
```
then open `http://localhost:8000` in your browser. (Any static server works — VS Code's "Live Server" extension is another easy option.)

## Deployment

This is a static site — any static host works. No configuration, environment variables, or server-side code are needed.

**GitHub Pages:**
1. Push this folder to a GitHub repository.
2. Repository Settings → Pages → set the source branch (e.g. `main`) and folder (`/root`).
3. GitHub publishes it at `https://<username>.github.io/<repo>/`. All internal links in this project use relative paths (`css/style.css`, `products.html`, etc.), so it works whether the site is at a domain root or a project subpath — no path rewriting needed.

**Netlify:**
1. Drag-and-drop the project folder onto Netlify's deploy page, or connect the GitHub repo.
2. Build command: none. Publish directory: the project root (where `index.html` lives).
3. Deploy.

No redirects, headers, or `_redirects`/`netlify.toml` file are required for this project as it stands.

> This README describes how to deploy the project — it hasn't been published anywhere by me. If you deploy it, the live URL is whatever your host gives you.

## Known limitations

**Authentication is not secure and is not meant to be.** There is no backend. "Accounts" are a JSON array in this browser's LocalStorage. Passwords are hashed with SHA-256 (via the browser's native Web Crypto API) with a random per-account salt — so at least a plain password is never stored — but:
- There's no server-side pepper, no rate-limiting, and no protection against someone reading this browser's LocalStorage directly.
- SHA-256 is a *fast* hash; real systems use slow, purpose-built algorithms (bcrypt/argon2) that only a server can run safely.
- A session here proves nothing to any other system, and doesn't work across devices or browsers.

Don't reuse a real password when testing this, and don't adapt this pattern for anything that needs real security.

**Checkout is not a real payment system.** Cash on Delivery, UPI, and Card are all non-functional demo interfaces. Card number/CVV/expiry fields exist visually but are never read into the saved order — only which method was *chosen* is stored.

**Orders placed before account-scoped history was added have no owner.** If you have test orders from before the authentication phase, they won't appear in anyone's Order History (there's no account to attach them to). Clear `shopease_orders` in DevTools → Application → Local Storage if you want a clean slate.

**Order tracking is simulated.** There is no real courier integration. The tracking page includes a clearly-labeled "DEMO CONTROL" that lets you manually advance an order's status to see the timeline update — this is a stand-in for what a real backend would push automatically.

**Product images:** most products' photos come live from the Fake Store API. The homepage hero images, the four category banners, and the four "footwear" products (the API has no footwear category, so this project adds a small local dataset for it) use the local files in `assets/images/`.

## Status

Phases 1–7 (homepage through UI polish/responsive/deployment prep) are implemented and covered by the testing described in this phase's report. This is a completed learning project, not an actively maintained product — treat it as a reference/demo rather than something to extend into production.
