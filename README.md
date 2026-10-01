# 🛍️ ShopEase — E-Commerce Website

A frontend-only e-commerce website built using **HTML5, CSS3, and Vanilla JavaScript**.

ShopEase is a learning and portfolio project created to practice real-world frontend development concepts such as API integration, dynamic product rendering, URL-based filtering, LocalStorage state management, form validation, authentication flows, shopping cart functionality, wishlist management, checkout, and simulated order tracking.

> ⚠️ **ShopEase is a demo project, not a real online store.** No real payments are processed, no real emails are sent, and user accounts are stored only in the browser.

---

## ✨ Features

### 🏠 Homepage
- Responsive navigation
- Featured products
- New arrivals
- Product categories
- Product cards
- Search functionality
- Responsive layout

### 🛍️ Product Catalog
- Browse all products
- Search products
- Category filtering
- Price filtering
- Product sorting
- Sort by:
  - Price
  - Rating
  - Name
- URL-based filter parameters
- Bookmarkable and shareable filtered views

### 📦 Product Details
- Detailed product information
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
- Automatic line-item subtotal
- Automatic total calculation
- Demo shipping calculation
- Free shipping above $100
- $10 shipping below $100
- Cart persistence using LocalStorage

### ❤️ Wishlist
- Add/remove products
- Dedicated wishlist page
- Move product to cart
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
- Order cancellation before shipping
- Orders associated with the logged-in account
- Five-stage simulated order tracking:

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
👤 Authentication
User signup
User login
Logout
User profile
Protected pages
Session management
Demo password hashing using Web Crypto API

Protected pages include:

Checkout
Orders
Order Details
Profile
🛠️ Technologies Used
Technology	Purpose
HTML5	Page structure and semantic markup
CSS3	Styling and responsive design
JavaScript ES6+	Application logic and interactivity
Fake Store API	Product data
LocalStorage	Cart, wishlist, users and orders
SessionStorage	Temporary session/product data
Web Crypto API	Demo password hashing
Google Fonts	Fraunces and Inter fonts
No Frameworks

This project intentionally uses Vanilla JavaScript without frontend frameworks.

❌ React
❌ Angular
❌ Vue
❌ Bootstrap
❌ Tailwind
❌ jQuery
❌ Build tools
❌ Bundlers
❌ npm dependencies

Everything is built using plain:

HTML + CSS + JavaScript

📂 Project Structure
ShopEase/
│
├── assets/
│   └── images/
│       ├── homepage images
│       ├── category images
│       └── local product images
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
🔄 Application Flow
                    ┌─────────────────┐
                    │     Homepage    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Product Catalog │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Product Details │
                    └───────┬─┬───────┘
                            │ │
                ┌───────────┘ └───────────┐
                ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │     Cart     │          │   Wishlist   │
        └──────┬───────┘          └──────────────┘
               │
               ▼
        ┌──────────────┐
        │   Checkout   │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │Order Success │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  My Orders   │
        └──────┬───────┘
               │
               ▼
        ┌────────────────────┐
        │ Order Details &    │
        │     Tracking       │
        └────────────────────┘
🧩 JavaScript Architecture

The project separates shared functionality from page-specific functionality.

Shared JavaScript Files
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
   └── Users, sessions and authentication
          │
          ▼
orders-utils.js
   │
   └── Orders, tracking and cancellation

Page-specific JavaScript files are loaded after the shared utilities they depend on.

💾 Browser Storage

ShopEase uses browser storage instead of a backend database.

Cart
shopease_cart

Stores cart products and quantities.

Wishlist
shopease_wishlist

Stores wishlist products.

Users
shopease_users

Stores demo user account information.

Session
shopease_session

Stores the current browser session.

Orders
shopease_orders

Stores demo order history.

Last Order
shopease_last_order

Stores the most recently created order.

🌐 API Integration

Product data is fetched from the Fake Store API.

https://fakestoreapi.com/products

The API provides product information such as:

Product name
Price
Description
Category
Rating
Product image

The project also contains local images/data for selected homepage, category and footwear content.

🚀 Running the Project Locally

ShopEase does not require npm, dependencies, or a build process.

Option 1 — VS Code Live Server
Open the project in VS Code.
Install the Live Server extension.
Right-click index.html.
Select Open with Live Server.
The website will open in your browser.
Option 2 — Python HTTP Server

Open a terminal inside the project folder:

python -m http.server 8000

Then open:

http://localhost:8000
🌐 Deployment

ShopEase is a static frontend application and can be deployed on static hosting platforms.

Possible platforms include:

GitHub Pages
Netlify
Vercel
Other static hosting services
GitHub Pages

To deploy using GitHub Pages:

Open the repository on GitHub.
Go to Settings.
Open Pages.
Select the main branch.
Select the /root folder.
Save the settings.
GitHub will generate the live website URL.

The URL will follow this format:

https://<username>.github.io/<repository-name>/
---

## 🔗 Live Demo

🌐 **[Visit ShopEase Live Demo](https://amritpal4148singh-spec.github.io/shopease-ecommerce/)**

💻 **[View Source Code](https://github.com/amritpal4148singh-spec/shopease-ecommerce/)**
---
⚠️ Known Limitations

ShopEase is a frontend-only learning project and is not production-ready.

🔐 Authentication

Authentication is simulated using browser storage.

Passwords are processed using the browser's Web Crypto API with SHA-256 hashing and a random per-account salt.

However, this is not suitable for production authentication because:

There is no backend authentication.
There is no server-side session management.
There is no rate limiting.
LocalStorage can be accessed from the browser.
Accounts do not synchronize between devices.
There is no production database.

Do not use real passwords while testing this project.

💳 Payments

Payment functionality is simulated.

The following options are only demo interfaces:

Cash on Delivery
UPI
Card

No real payment gateway is connected.

No real money is transferred.

📦 Orders

Orders are stored locally in the browser.

There is:

No backend database
No real order processing
No real delivery service
No email notification system
🚚 Order Tracking

Order tracking is simulated.

The project does not communicate with a real courier or delivery service.

The tracking timeline is only intended to demonstrate how a real order-tracking interface could work.

🖼️ Product Images

Most product images come from the Fake Store API.

Local images are also included for selected homepage, category and footwear content.

🎯 Learning Objectives

This project helped practice:

HTML5
CSS3
Responsive web design
CSS Grid
CSS Flexbox
JavaScript ES6+
DOM manipulation
Event handling
API integration
Fetch API
URL query parameters
LocalStorage
SessionStorage
Form validation
Client-side authentication concepts
Shopping cart logic
Wishlist functionality
Order management
Modular JavaScript
Multi-page website architecture
Responsive UI development
📈 Project Status
✅ Completed Learning Project

The project was developed through multiple implementation phases covering:

Homepage
Product catalog
Product details
Shopping cart
Wishlist
Authentication
Checkout
Order confirmation
Order history
Order tracking
Responsive design
UI improvements
Deployment preparation

ShopEase is maintained as a portfolio and learning project rather than a production e-commerce application.

🔮 Future Improvements

Possible improvements for a production-style version include:

Backend API
Real database
Secure authentication
JWT/session-based authorization
Real payment gateway
Server-side order management
Real-time order tracking
Product reviews
Admin dashboard
Inventory management
Email notifications
Cloud image storage
👨‍💻 Author
Amritpal Singh

Computer Science Engineering Student
AI & ML Specialization

Interested in:

Web Development
Artificial Intelligence
Machine Learning
Data Structures & Algorithms
⭐ Project

If you found this project useful or interesting, consider giving the repository a ⭐ on GitHub.

Built with ❤️ using HTML, CSS & Vanilla JavaScript.
