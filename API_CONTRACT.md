# 🌿 Maneyinda Marukatte - Backend REST API Specification & Contract
> **Version**: 1.0.0  
> **Base URL**: `http://localhost:5000/api`  
> **Content-Type**: `application/json` (except multipart file uploads)

This API specification serves as the formal contract between **Developer 1 (Backend)** and **Developer 2 (Frontend)**. All request bodies, parameters, and JSON response formats documented here are strictly adhered to by the backend server.

---

## 📑 Table of Contents
1. [General Design & Response Format](#1-general-design--response-format)
2. [Authentication Module (`/api/auth`)](#2-authentication-module-apiauth)
3. [Products Module (`/api/products`)](#3-products-module-apiproducts)
4. [Orders Module (`/api/orders`)](#4-orders-module-apiorders)
5. [Entrepreneurs Module (`/api/entrepreneurs`)](#5-entrepreneurs-module-apientrepreneurs)
6. [Reviews Module (`/api/reviews`)](#6-reviews-module-apireviews)
7. [Support Center Module (`/api/support`)](#7-support-center-module-apisupport)
8. [Admin Module (`/api/admin`)](#8-admin-module-apiadmin)
9. [Media Upload Module (`/api/upload`)](#9-media-upload-module-apiupload)

---

## 1. General Design & Response Format

### Success Response Envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive message"
}
```

### Error Response Envelope:
```json
{
  "success": false,
  "error": "Short error code or description",
  "message": "Human readable explanation for UI toast/banner"
}
```

### Common HTTP Status Codes:
* `200 OK`: Request succeeded.
* `201 Created`: Resource successfully created.
* `400 Bad Request`: Validation failure (e.g. missing required field, multiple entrepreneurs in one order).
* `401 Unauthorized`: Invalid credentials or missing session.
* `403 Forbidden`: Role not authorized for this operation.
* `404 Not Found`: Target resource does not exist.
* `429 Too Many Requests`: Rate limit or login lockout exceeded (e.g., >3 failed login attempts).
* `500 Internal Server Error`: Unexpected server issue.

---

## 2. Authentication Module (`/api/auth`)

### 2.1 Send Email OTP
* **Endpoint**: `POST /api/auth/send-otp`
* **Request Body**:
  ```json
  {
    "email": "thanuja@example.com",
    "purpose": "registration" // "registration" | "login" | "forgot_password"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "6-digit OTP code sent successfully",
    "expiresInSeconds": 30
  }
  ```

### 2.2 Verify Email OTP
* **Endpoint**: `POST /api/auth/verify-otp`
* **Request Body**:
  ```json
  {
    "email": "thanuja@example.com",
    "otp": "123456"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "verified": true,
    "message": "OTP verified successfully"
  }
  ```

### 2.3 Customer Sign In
* **Endpoint**: `POST /api/auth/login-customer`
* **Request Body**:
  ```json
  {
    "email": "thanuja@example.com",
    "otp": "123456"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "user": {
      "id": "cust_01",
      "name": "Thanuja Gowda",
      "email": "thanuja@example.com",
      "phone": "9845123456",
      "role": "both",
      "entrepreneurId": "ent_01"
    },
    "token": "jwt_token_sample_string"
  }
  ```

### 2.4 Entrepreneur Sign In
* **Endpoint**: `POST /api/auth/login-entrepreneur`
* **Request Body**:
  ```json
  {
    "username": "anitha_bakery",
    "password": "password123"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "entrepreneur": {
      "id": "ent_01",
      "name": "Anitha Ramesh",
      "businessName": "Anita's Bakery",
      "status": "approved",
      "badge": "Rising Star"
    },
    "token": "jwt_token_sample_string"
  }
  ```
* **Response `429 Too Many Requests` (Lockout after 3 attempts)**:
  ```json
  {
    "success": false,
    "error": "MAX_ATTEMPTS_EXCEEDED",
    "message": "Maximum attempts exceeded. Try again after 24 hours or create a new account."
  }
  ```

### 2.5 Security Questions & Password Reset
* **Endpoint**: `POST /api/auth/reset-password`
* **Request Body**:
  ```json
  {
    "email": "anitha@bakery.com",
    "answers": [
      { "question": "What is your school name?", "answer": "Malleshwaram High" },
      { "question": "What is your village name?", "answer": "Mandya" },
      { "question": "What is your favourite food?", "answer": "Mysore Pak" }
    ],
    "newPassword": "newpassword123"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Password reset successfully. Please log in."
  }
  ```

---

## 3. Products Module (`/api/products`)

### 3.1 List Products
* **Endpoint**: `GET /api/products`
* **Query Parameters**:
  * `category` (optional, string)
  * `entrepreneurId` (optional, string)
  * `status` (optional, `active` | `all`, default: `active`)
  * `search` (optional, string)
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "id": "prod_01",
        "entrepreneurId": "ent_01",
        "storeName": "Anita's Bakery",
        "name": "Homemade Dutch Chocolate Cake (Eggless)",
        "category": "Bakery & Sweets",
        "price": 450,
        "stock": 8,
        "description": "Fresh homemade chocolate cake prepared with premium cocoa...",
        "images": ["/uploads/cake.jpg"],
        "attributes": ["Eggless", "Freshly Baked"],
        "specifications": { "Weight": "1 Kg", "Egg": "100% Eggless" },
        "customizationFields": [
          { "name": "Cake Message", "type": "text", "required": false },
          { "name": "Sweetness Level", "type": "select", "options": ["Low", "Regular", "Extra"], "required": true }
        ],
        "deliveryMethod": {
          "homeDelivery": true,
          "pickup": true,
          "deliveryRadius": 10,
          "deliveryCharge": 30,
          "estimatedDelivery": "Today before 5:30 PM"
        },
        "afterSales": {
          "type": "Return & Replacement",
          "supportWindow": "3 Days",
          "returnRequired": true
        },
        "status": "active",
        "rating": 4.8,
        "reviewCount": 235
      }
    ]
  }
  ```

### 3.2 Create Product (Entrepreneur)
* **Endpoint**: `POST /api/products`
* **Request Body**: Product object matching schema above.
* **Response `201 Created`**: Returns newly created product object with generated `id`.

### 3.3 Quick Update Stock
* **Endpoint**: `PATCH /api/products/:id/stock`
* **Request Body**:
  ```json
  {
    "stock": 12
  }
  ```
* **Response `200 OK`**: Updated product with new stock and auto-updated `status` (`active` or `out_of_stock`).

---

## 4. Orders Module (`/api/orders`)

### 4.1 Create Order (Customer)
* **Endpoint**: `POST /api/orders`
* **Business Rule**: Enforces that **all items must belong to the exact same `entrepreneurId`**.
* **Request Body**:
  ```json
  {
    "customerId": "cust_01",
    "customerName": "Thanuja Gowda",
    "customerPhone": "9845123456",
    "entrepreneurId": "ent_01",
    "items": [
      {
        "productId": "prod_01",
        "name": "Homemade Dutch Chocolate Cake (Eggless)",
        "price": 450,
        "qty": 2,
        "customization": { "Cake Message": "Happy Birthday!" }
      }
    ],
    "deliveryMethod": "Home Delivery",
    "deliveryAddress": {
      "door": "#12, MG Road",
      "street": "Malleshwaram",
      "city": "Bangalore",
      "pincode": "560003"
    },
    "orderNote": "Please call before delivery",
    "paymentMethod": "Online Payment",
    "paymentStatus": "Paid"
  }
  ```
* **Error Response `400 Bad Request` (Multi-Entrepreneur Violation)**:
  ```json
  {
    "success": false,
    "error": "MULTI_ENTREPRENEUR_ORDER_NOT_ALLOWED",
    "message": "Please place separate orders for products from different entrepreneurs."
  }
  ```

### 4.2 Transition Order Status (Entrepreneur)
* **Endpoint**: `PATCH /api/orders/:id/status`
* **Single-Action Workflow**:
  * `New` → `Accepted`
  * `Accepted` → `Preparing`
  * `Preparing` → `Out for Delivery` (Home) OR `Ready for Pickup` (Pickup)
  * `Out for Delivery` / `Ready for Pickup` → `Delivered`
* **Request Body**:
  ```json
  {
    "status": "Preparing"
  }
  ```

### 4.3 Customer Cancellation
* **Endpoint**: `POST /api/orders/:id/cancel`
* **Rule**: Permitted **only** while order status is `New` or `Accepted`.
* **Error Response `400 Bad Request`**:
  ```json
  {
    "success": false,
    "error": "CANCELLATION_NOT_ALLOWED",
    "message": "This order cannot be cancelled because preparation has already started."
  }
  ```

### 4.4 Submit After-Sales Request (Refund / Replacement)
* **Endpoint**: `POST /api/orders/:id/after-sales`
* **Request Body**:
  ```json
  {
    "type": "refund", // "refund" | "replacement"
    "reason": "Product damaged in transit",
    "description": "Container seal was broken upon arrival",
    "photos": ["/uploads/proof.jpg"]
  }
  ```

---

## 5. Entrepreneurs Module (`/api/entrepreneurs`)

### 5.1 Registration Application
* **Endpoint**: `POST /api/entrepreneurs/register`
* **Request Body**:
  ```json
  {
    "name": "Savitha Gowda",
    "businessName": "Savitha Designer Tailors",
    "businessCategory": "Tailoring & Alterations",
    "email": "savitha@tailors.com",
    "phone": "9845044556",
    "address": { "door": "#92", "street": "Pipeline Road", "city": "Bangalore", "pincode": "560040" },
    "deliveryRadius": 10,
    "yearsExp": 8,
    "documents": {
      "idType": "Aadhaar Card",
      "idFile": "/uploads/aadhaar.pdf",
      "businessProof": "/uploads/kitchen.jpg"
    }
  }
  ```

### 5.2 Business Availability (Store Schedule & Controls)
* **Endpoint**: `PATCH /api/entrepreneurs/:id/availability`
* **Request Body**:
  ```json
  {
    "isStoreOpen": true,
    "openingSchedule": "Opens Daily at 9:00 AM - Closes 8:00 PM"
  }
  ```

---

## 6. Reviews Module (`/api/reviews`)

* `GET /api/reviews?productId=prod_01` (List verified reviews)
* `POST /api/reviews` (Submit review for a `Delivered` order)
* `DELETE /api/reviews/:id` (Customer deletes own review)

---

## 7. Support Center Module (`/api/support`)

* `GET /api/support/tickets?customerId=cust_01`
* `POST /api/support/tickets` (Raise ticket: Account, Payment, Order, Appeal)
* `PATCH /api/support/tickets/:id/resolve` (Admin updates status & notes)

---

## 8. Admin Module (`/api/admin`)

* `GET /api/admin/verification-queue` (List pending entrepreneur applicants)
* `POST /api/admin/verify/:id` (`{ "decision": "approve" | "reject" | "request_info", "reason": "..." }`)
* `POST /api/admin/assign-badge/:id` (`{ "badge": "Best Entrepreneur" | "Rising Star" | "Top Rated" }`)
* `GET /api/admin/ai-trends` (Calculates trend score: `Orders*0.6 + Rating*0.3 + Recent*0.1`)
* `POST /api/admin/categories` (`{ "name": "Organic Groceries" }`)
* `PATCH /api/admin/categories/:id/toggle` (Activate / Deactivate)

---

## 9. Media Upload Module (`/api/upload`)

* **Endpoint**: `POST /api/upload`
* **Content-Type**: `multipart/form-data`
* **Form Field**: `file` (Supports `.jpg`, `.jpeg`, `.png`, `.pdf`, max 5MB)
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "url": "/uploads/file_179291583921.jpg",
    "filename": "file_179291583921.jpg"
  }
  ```
