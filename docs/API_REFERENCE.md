# HAFROSE — REST API Reference Guide

## Base URL
- Production: `https://hafrose.com/api`
- Local: `http://localhost:8000/api`

---

## Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
```

---

## Core Endpoints

### 1. Catalog & Products
- `GET /api/products` — List catalog products (query params: `category`, `search`, `sort`, `page`)
- `GET /api/products/{slug}` — Single product details with related products & gallery
- `GET /api/categories` — List active categories

### 2. Customer Authentication
- `POST /api/customer/register` — Register new customer account
- `POST /api/customer/login` — Authenticate customer and issue Sanctum token
- `POST /api/customer/logout` — Revoke active token
- `GET /api/customer/profile` — Get authenticated customer profile

### 3. Orders & Checkout
- `POST /api/orders` — Create customer order
- `GET /api/orders` — List customer orders
- `GET /api/orders/{id}` — Order details

### 4. Customer Wishlist
- `GET /api/wishlist` — Get customer wishlist items
- `POST /api/wishlist` — Add item to wishlist
- `DELETE /api/wishlist/{productId}` — Remove item from wishlist
