# 🛍️ ShopEase

A frontend-only e-commerce demo built with **HTML, CSS, and Vanilla JavaScript** — no frameworks, no backend, and no build step.

ShopEase was built as a learning and portfolio project to practice real-world frontend development patterns such as fetching and rendering data, URL-based filtering, LocalStorage-backed state, form validation, authentication flows, and a complete simulated shopping experience from browsing products to order tracking.

> ⚠️ **This is a demo, not a real store.** No real payments are processed, no real emails are sent, and user accounts exist only inside the browser.

---

## ✨ Features

### 🏠 Homepage

- Featured products
- New arrivals
- Product categories
- Responsive navigation
- Product cards
- Header search
- Responsive layout

### 🛍️ Product Catalog

- Browse all products
- Search products
- Category filtering
- Price filtering
- Sorting by:
  - Price
  - Rating
  - Name
- Filters synchronized with the URL
- Filtered pages can be bookmarked and shared

### 📦 Product Details

- Product information
- Product image
- Price and rating
- Quantity selector
- Related products
- Add to Cart
- Add to Wishlist

### 🛒 Shopping Cart

- Add products to cart
- Remove products
- Increase/decrease quantity
- Quantity limit from 1–10
- Line-item subtotals
- Automatic total calculation
- Demo shipping rule
- Free shipping above $100
- $10 shipping below $100
- Cart persistence using LocalStorage

### ❤️ Wishlist

- Add/remove products
- Dedicated wishlist page
- Move products to cart
- Wishlist works independently from the cart
- Wishlist persistence using LocalStorage

### 💳 Checkout

- Customer information
- Shipping address
- Form validation
- Payment method selection
- Cash on Delivery
- UPI
- Card
- Simulated checkout process

> All payment methods are demo interfaces. No real payment is processed.

### 📦 Orders & Tracking

- Order confirmation
- Order history
- Order details
- Order tracking timeline
- Demo order cancellation before shipping
- Orders associated with the logged-in account

The simulated tracking flow contains five stages:

```text
Order Placed
      ↓
Processing
      ↓
Shipped
      ↓
Out for Delivery
      ↓
Delivered
```

### 👤 Authentication

- User signup
- User login
- Logout
- User profile
- Session management
- Protected pages
- Demo password hashing using the Web Crypto API

Protected pages include:

- Checkout
- Orders
- Order Details
- Profile

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Website structure and semantic markup |
| **CSS3** | Styling, responsive design, Grid and Flexbox |
| **Vanilla JavaScript** | Application logic and interactivity |
| **Fake Store API** | Product data |
| **LocalStorage** | Cart, wishlist, accounts and orders |
| **SessionStorage** | Temporary session/product data |
| **Web Crypto API** | Demo password hashing |
| **Google Fonts** | Fraunces and Inter |

### No Frameworks

This project intentionally uses plain HTML, CSS and JavaScript.

- ❌ React
- ❌ Angular
- ❌ Vue
- ❌ Bootstrap
- ❌ Tailwind
- ❌ jQuery
- ❌ Build tools
- ❌ Bundlers
- ❌ npm dependencies

Everything is built using:

**HTML + CSS + Vanilla JavaScript**

---

## 📂 Project Structure

```text
ShopEase/
│
├── assets/
│   └── images/
│       ├── Homepage images
│       ├── Category images
│       └── Local product images
│
├── css/
│   ├── style.css
│   ├── forms.css
│   ├── products.css
│   ├── product-details.css
│   ├── cart.css
│   ├── wishlist.css
│   ├── checkout.css
│   ├── order-success.css
│   ├── orders.css
│   ├── order-details.css
│   ├── signup.css
│   ├── login.css
│   └── profile.css
│
├── js/
│   ├── app.js
│   ├── cart-utils.js
│   ├── wishlist-utils.js
│   ├── auth-utils.js
│   ├── orders-utils.js
│   ├── products.js
│   ├── product-details.js
│   ├── cart.js
│   ├── wishlist.js
│   ├── checkout.js
│   ├── order-success.js
│   ├── orders.js
│   ├── order-details.js
│   ├── signup.js
│   ├── login.js
│   └── profile.js
│
├── index.html
├── products.html
├── product-details.html
├── cart.html
├── wishlist.html
├── checkout.html
├── order-success.html
├── orders.html
├── order-details.html
├── signup.html
├── login.html
├── profile.html
│
└── README.md
```

---

## 🔄 Application Flow

```text
Homepage
   │
   ▼
Product Catalog
   │
   ▼
Product Details
   │
   ├───────────────┐
   ▼               ▼
Cart           Wishlist
   │
   ▼
Checkout
   │
   ▼
Order Confirmation
   │
   ▼
My Orders
   │
   ▼
Order Details & Tracking
```

---

## 🧩 JavaScript Architecture

The project separates shared functionality from page-specific functionality.

### Shared JavaScript Files

```text
app.js
   │
   ├── Product fetching
   ├── Product rendering
   ├── Search
   ├── Toast notifications
   └── Shared UI functionality
          │
          ▼
cart-utils.js
   │
   └── Cart storage and calculations
          │
          ▼
wishlist-utils.js
   │
   └── Wishlist storage
          │
          ▼
auth-utils.js
   │
   └── Accounts, sessions and page protection
          │
          ▼
orders-utils.js
   │
   └── Order history, tracking and cancellation
```

Page-specific JavaScript files are loaded after the shared utilities they depend on.

---

## 💾 Browser Storage

ShopEase uses browser storage instead of a backend database.

### Cart

```text
shopease_cart
```

Stores cart products and quantities.

### Wishlist

```text
shopease_wishlist
```

Stores wishlist products.

### Users

```text
shopease_users
```

Stores demo user account information.

### Session

```text
shopease_session
```

Stores the current browser session.

### Orders

```text
shopease_orders
```

Stores demo order history.

### Last Order

```text
shopease_last_order
```

Stores the most recently created order.

---

## 🌐 API Integration

Product data is fetched from the **Fake Store API**.

**API Endpoint:**

https://fakestoreapi.com/products

The API provides product information such as:

- Product name
- Price
- Description
- Category
- Rating
- Product image

The project also contains local images/data for selected homepage, category and footwear content.

---

## 🚀 Running the Project Locally

ShopEase does not require npm, dependencies, or a build process.

### Option 1 — VS Code Live Server

1. Open the project in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. The website will open in your browser.

### Option 2 — Python HTTP Server

Open a terminal inside the project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## 🔗 Live Demo

🌐 **[Visit ShopEase Live Demo](https://amritpal4148singh-spec.github.io/shopease-ecommerce/)**

💻 **[View Source Code](https://github.com/amritpal4148singh-spec/shopease-ecommerce/)**

---

## 🌐 Deployment

ShopEase is a static frontend application and can be deployed using static hosting platforms.

### GitHub Pages

1. Push the project to a GitHub repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Select the `main` branch.
5. Select the `/root` folder.
6. Save the settings.
7. GitHub will generate the live website URL.

The URL follows this format:

```text
https://<username>.github.io/<repository-name>/
```

### Other Hosting Options

ShopEase can also be deployed using:

- Netlify
- Vercel
- Other static hosting platforms

No backend configuration or build command is required.

---

## ⚠️ Known Limitations

ShopEase is a **frontend-only learning project** and is not production-ready.

### 🔐 Authentication

Authentication is simulated using browser storage.

Passwords are processed using the browser's Web Crypto API with SHA-256 hashing and a random per-account salt.

However, this is **not suitable for production authentication** because:

- There is no backend authentication.
- There is no server-side session management.
- There is no rate limiting.
- LocalStorage can be accessed from the browser.
- Accounts do not synchronize between devices.
- There is no production database.

> **Do not use real passwords while testing this project.**

### 💳 Payments

Checkout is completely simulated.

The following options are demo interfaces:

- Cash on Delivery
- UPI
- Card

No real payment gateway is connected.

No real money is transferred.

### 📦 Orders

Orders are stored locally in the browser.

There is:

- No backend database
- No real order processing
- No real delivery service
- No email notification system

### 🚚 Order Tracking

Order tracking is simulated.

There is no real courier or delivery API integration.

The tracking timeline demonstrates how a real order-tracking interface could work.

### 🖼️ Product Images

Most product images come from the Fake Store API.

Local images are included for selected homepage, category and footwear content.

---

## 🎯 Learning Objectives

This project helped practice:

- HTML5
- CSS3
- Responsive web design
- CSS Grid
- CSS Flexbox
- JavaScript ES6+
- DOM manipulation
- Event handling
- Fetch API
- API integration
- URL query parameters
- LocalStorage
- SessionStorage
- Form validation
- Client-side authentication concepts
- Shopping cart logic
- Wishlist functionality
- Order management
- Modular JavaScript
- Multi-page website architecture
- Responsive UI development

---

## 📈 Project Status

### ✅ Completed Learning Project

The project was developed through multiple implementation phases covering:

- Homepage
- Product catalog
- Product details
- Shopping cart
- Wishlist
- Authentication
- Checkout
- Order confirmation
- Order history
- Order tracking
- Responsive design
- UI improvements
- Deployment preparation

ShopEase is maintained as a **portfolio and learning project** rather than a production e-commerce application.

---

## 🔮 Future Improvements

Possible improvements for a production-style version include:

- Backend API
- Real database
- Secure authentication
- JWT/session-based authorization
- Real payment gateway
- Server-side order management
- Real-time order tracking
- Product reviews
- Admin dashboard
- Inventory management
- Email notifications
- Cloud image storage

---

## 👨‍💻 Author

### Amritpal Singh

**Computer Science Engineering Student**  
**AI & ML Specialization**

Interested in:

- Web Development
- Artificial Intelligence
- Machine Learning
- Data Structures & Algorithms

---

## ⭐ Support

If you found this project useful or interesting, consider giving the repository a ⭐.

**Built with ❤️ using HTML, CSS & Vanilla JavaScript.**
