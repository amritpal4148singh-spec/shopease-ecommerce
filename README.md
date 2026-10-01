# 🛍️ ShopEase — E-Commerce Website

A frontend-only e-commerce website built with **HTML, CSS, and Vanilla JavaScript**.

ShopEase is a learning and portfolio project designed to practice real-world frontend development concepts such as API integration, dynamic product rendering, URL-based filtering, LocalStorage state management, form validation, authentication flows, and a complete simulated shopping experience.

> **Note:** ShopEase is a demo project, not a real online store. No real payments, emails, or backend accounts are used.

---

## ✨ Features

### 🏠 Homepage
- Featured products
- New arrivals
- Category sections
- Responsive navigation
- Product cards with quick actions

### 🛍️ Product Catalog
- Product listing
- Search products
- Category filtering
- Price filtering
- Sorting by:
  - Price
  - Rating
  - Name
- URL-synchronized filters for shareable/bookmarkable views

### 📦 Product Details
- Detailed product information
- Quantity selector
- Related products
- Add to Cart
- Add to Wishlist

### 🛒 Shopping Cart
- Add/remove products
- Increase/decrease quantity
- Quantity limit from 1–10
- Line-item subtotals
- Automatic total calculation
- Demo shipping rule
  - Free shipping above $100
  - $10 shipping otherwise
- Cart persistence using LocalStorage

### ❤️ Wishlist
- Add/remove products
- Dedicated wishlist page
- Move products to cart
- Wishlist stored independently from cart

### 💳 Checkout
- Customer information
- Shipping address
- Payment method selection
  - Cash on Delivery
  - UPI
  - Card
- Client-side form validation
- Simulated checkout flow

### 📦 Orders & Tracking
- Order confirmation
- Order history
- Order details
- 5-stage demo tracking timeline:
  - Order Placed
  - Processing
  - Shipped
  - Out for Delivery
  - Delivered
- Demo order cancellation before shipping
- Order history associated with the logged-in account

### 👤 Authentication
- User signup
- Login
- Logout
- Profile page
- Protected pages
- Demo password hashing using Web Crypto API

---

## 🛠️ Technologies Used

| Technology | Usage |
|------------|-------|
| **HTML5** | Website structure |
| **CSS3** | Styling, responsive layout, Grid & Flexbox |
| **JavaScript (ES6+)** | Application logic and interactivity |
| **Fake Store API** | Product data |
| **LocalStorage** | Cart, wishlist, accounts & orders |
| **SessionStorage** | Temporary product/session data |
| **Web Crypto API** | Demo password hashing |
| **Google Fonts** | Fraunces & Inter |

### No Frameworks

This project intentionally uses:

- ❌ React
- ❌ Angular
- ❌ Vue
- ❌ Bootstrap
- ❌ Tailwind
- ❌ npm packages
- ❌ Build tools

Everything is written using **plain HTML, CSS and Vanilla JavaScript**.

---

## 📂 Project Structure

```text
ShopEase/
│
├── assets/
│   └── images/
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
