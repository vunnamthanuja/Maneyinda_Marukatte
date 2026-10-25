# 🌿 Maneyinda Marukatte (ಮನೆಯಿಂದ ಮಾರುಕಟ್ಟೆ)
> **Empowering Local Women Entrepreneurs**  
> A Connected, Full-Featured Hyperlocal Marketplace for Android (390 × 844 px)

---

## 📌 Project Overview
**Maneyinda Marukatte** is a hyperlocal marketplace built to empower local women entrepreneurs in Karnataka. It connects customers with nearby home-based women entrepreneurs who produce and sell homemade food, bakery items, tailoring services, handicrafts, tiffin services, and authentic local products.

The platform natively supports three distinct, interconnected user roles:
1. **Customer**: Discover local home creators, customize orders, checkout with 1-entrepreneur-per-order rules, track milestones, rate & review verified purchases, and request after-sales support.
2. **Entrepreneur**: Complete verification with Govt ID and kitchen/product proof, list products with AI-assisted title/price/description generation, manage live order status flows, fulfill after-sales requests with AI suggestions, review earnings with dynamic charts, and manage store open/closed schedules.
3. **Admin**: Institutional administrator with dedicated login, verification queue (Approve, Request More Info, Reject), badge assignment, product moderation with soft-delete audit records, category lifecycle management, AI trend analysis scoring, and unified support ticket resolution.

---

## 🎨 Visual Design System (Material Design 3)
Designed strictly for an **Android mobile-first viewport (390 × 844 px)**:
- **Primary Deep Leaf Green**: `#365B1F`
- **Secondary Olive Green**: `#6E8A2F`
- **Golden Yellow Accent**: `#E9B949`
- **Soft Yellow**: `#FFF3A6`
- **Warm Ivory Background**: `#FFFDF5`
- **White Surface Cards**: `#FFFFFF`
- **Primary Text**: `#2F2F2F`
- **Secondary Text**: `#555555`
- **Typography**: Poppins (Bold, SemiBold, Medium, Regular)
- **Icons**: Material Symbols Rounded
- **Corners**: Rounded 12–16 px cards & input fields
- **Grid & Elevation**: 8-point grid with soft Material elevation shadows

---

## 📱 Modules & Complete Feature Breakdown

### 1. Authentication Module (`js/auth.js`)
- **Splash Screen**: Animated logo, Karnataka earthen pot & leaf motifs, soft scaling, tagline, and auto-navigation or "Get Started" tap.
- **Welcome Screen**: "Already have an account? [ Sign In ]" vs "New to Maneyinda Marukatte? [ Create Account ]".
- **Choose Role**: 3 selectable cards — 🛒 Customer, 🏪 Entrepreneur, 🔄 Both (Customer active immediately, Entrepreneur features locked until approval).
- **Email Verification**: Terms & Conditions and Privacy Policy agreements, format validation, OTP dispatch.
- **OTP Verification**: 6-box inputs, auto-advance, 30s resend timer, code validation (demo: `123456`).
- **Basic Information**: Full Name and 10-digit Phone Number. *(No address is collected here — address is strictly collected during checkout or in Address Book)*.
- **Customer Login**: Email Address → OTP Verification → Direct access to Customer Dashboard.
- **Entrepreneur Login**: Username/Email + Password + Show/Hide password toggle + Lockout after 3 incorrect attempts.
- **Forgot Password**: Email → OTP → 3 Security Questions verification → New Password creation.

### 2. Entrepreneur Registration Module (`js/entrepreneur-reg.js`)
- **Step 1: Business Information**: Business Name, Category (from Admin categories), Business Address (Door, Street, Area, City, State, Pincode), Delivery Radius (3, 5, 10, 15, 20 km), Years of Experience, About Business.
- **Step 2: Identity & Business Verification**: Upload Govt ID (Aadhaar, Voter ID, Driving Licence, Passport), Upload Business Proof (Kitchen Photo, Shop Photo, Product Photo, FSSAI, Trade Licence), Profile Photo, and declaration checkbox.
- **Step 3: Review & Submit**: Summary preview, edit shortcuts, submission to Admin Queue.
- **Application Status & Decision Handling**:
  - *Pending Review*: Under review within 24 hours.
  - *Approved*: Congratulations screen → Complete Account Setup (Username, Password) → Security Questions (Select 3 of 5) → Direct to Entrepreneur Dashboard.
  - *Correctable Rejection*: Edit & Resubmit opens the rejected section directly without restarting.
  - *Permanent Rejection*: Final exit / Customer Dashboard.

### 3. Entrepreneur Dashboard & Management (`js/entrepreneur.js`)
- **Dashboard**: Notification icon, personalized greeting, 4 business overview stat cards (*Today's Orders*, *This Month's Earnings*, *Active Products*, *Pending Orders*), store open/closed status badge, recent orders with status tags.
- **Bottom Navigation**: 🏠 Home | 📦 Orders | 🛍 Products | 💰 Earnings | 👤 Profile.
- **Product Management**:
  - My Products listing with 🟢 In Stock / 🔴 Out of Stock status.
  - Add & Edit Product with up to 5 images, AI Title Improvement (`✨ Improve Title`), AI Price Suggestion (`🤖 Suggest Price`), AI Description Generator (`🤖 Generate Description`), dynamic custom fields builder (Size, Spice Level, Sweetness, Cake Message), delivery method configuration (Home Delivery charge/radius/time vs Pickup only), and After-Sales support policy.
  - Quick Update Stock stepper modal.
  - Delete Product with accidental deletion warning.
- **Orders Management**:
  - Status filter chips (*All*, *New*, *Preparing*, *Out for Delivery*, *Delivered*).
  - Order details with customer contact, delivery method, customizations, and **exact single-action progression**:
    - `New` → **Accept Order**
    - `Accepted` → **Preparing Order**
    - `Preparing` → **Out for Delivery** (Home) or **Ready for Pickup** (Pickup)
    - `Out for Delivery` / `Ready for Pickup` → **Mark as Delivered / Picked Up**
    - `Delivered` → **Order Completed**
- **After-Sales Requests**:
  - Dedicated tab displaying customer refund and replacement requests with reasons, photo proof, and AI evaluations.
  - Entrepreneur can Approve or Reject requests.
  - If *Return Required* is Yes: Entrepreneur confirms *Return Received* before refund/replacement is finalized.
- **Earnings & Insights**:
  - Time filters (*Today*, *This Week*, *This Month*), total earnings card, single responsive Material Design Bar Chart, business summary metrics, and observational AI Business Insights.
- **Entrepreneur Profile**:
  - Business Availability schedule and Open/Closed toggle (instantly locks checkout for customers if closed).
  - Payment Settings (Bank Account, IFSC, UPI ID with format validation).
  - Customer Reviews (read-only with AI Sentiment summary: Positive/Neutral, Customers Love, Customers Suggest).
  - Security Settings & Logout.

### 4. Customer Module (`js/customer.js`)
- **Customer Home**:
  - Header: Personalized welcome, Delivery Location selector dropdown/bottom sheet (Use Current Location, Saved Addresses, + Add New), Wishlist icon with count badge, Notifications icon with unread badge.
  - Search bar trigger.
  - 🔥 Popular Products (horizontally scrollable, verified badges, wishlist toggles, add to cart).
  - 🔥 Trending This Week (data-driven AI Trend scoring).
- **Search Screen**:
  - Search field (Products, Stores, Categories), recent searches with individual delete and Clear All, filter modal.
- **Product Details**:
  - Image carousel with dot indicators, rating count, verified seller badge, View Store link, stock stepper, dynamic customization inputs (required before ordering), delivery charge & estimated time, After-Sales support badge (Replacement, Refund, Return Required, Window), verified reviews, and You May Also Like.
  - 🚩 Report Product button (submits to Admin Moderation queue).
- **Public Entrepreneur Store**:
  - Reusable screen showing seller profile, verified badge, store open/closed status, and all listed products.
- **Wishlist**:
  - 2-column grid, remove with snackbar (no dialog), add to cart.
- **Cart (Frozen 1-Entrepreneur Rule)**:
  - Items grouped by entrepreneur/store with verified badge.
  - Individual item selection checkboxes (NO Select All).
  - Single-entrepreneur validation: Attempting to select items from multiple entrepreneurs warns: *"Please place separate orders for products from different entrepreneurs."*
  - Quantity steppers, Move to Wishlist, Remove item.
  - Stock update warnings and store-closed alerts.
  - Sticky bottom summary and Proceed to Checkout button.
- **Checkout & Payment**:
  - Delivery address switcher (Address Book), delivery method selector, order note, Payment Method (Online Payment with simulated gateway modal vs Cash on Delivery), order creation, stock deduction, and success screen.
- **My Orders & Order Details**:
  - Tabs: Active, Completed, Cancelled.
  - Visual status timeline (Order Confirmed → Preparing → Out for Delivery → Delivered).
  - Historical order preservation (prices, customizations, addresses never change if the product is edited later).
  - Customer Cancellation Rule: Allowed **only** while status is New or Accepted; disabled and explained once status is Preparing or later.
  - After-Sales Requests: Request Refund or Request Replacement (within support window). Return execution tracking.
- **Rate & Review**:
  - Accessible only after order is Delivered.
  - Star ratings (1-5), written feedback, photo uploads, edit/delete own review.
- **Notifications**:
  - Chronological grouping (Today, Yesterday, Last Week), unread indicators, tap navigates directly to target screens.
- **Customer Profile & Help & Support**:
  - Address Book management.
  - Role-switching: "Become an Entrepreneur" (if Customer-only) or "Switch to Entrepreneur" (if Both).
  - 🤖 Ask Maneyinda AI: Interactive App Guide chat answering usage questions, non-decision maker, routes disputes to Support Tickets.
  - 📩 Raise Support Ticket & Track Submitted Tickets.

### 5. Admin Module (`js/admin.js`)
- **Admin Login**: Dedicated login for `admin@maneyinda.com` / `admin123`.
- **Dashboard**:
  - Total Entrepreneurs, Customers, Products, Orders.
  - Actionable Platform Status cards: Pending Entrepreneur Approvals, Open Support Tickets, Active Complaints.
- **Entrepreneurs**:
  - Verification Queue: View submitted Aadhaar, PAN, Kitchen/Shop proof, Approve, Request More Info, Reject.
  - Performance: Monitor ratings, orders, complaints. Assign Badges (*Best Entrepreneur*, *Rising Star*, *Top Rated*).
- **Products & Moderation**:
  - All Products listing with soft-remove/hide controls.
  - Product Categories: Add, Rename, Activate, Deactivate (no hard delete).
  - Moderation: Audit flagged products, review reasons, hide/dismiss.
  - 🤖 AI Trend Analysis: Rule-based scoring `(Orders * 0.6) + (Rating * 0.3) + (Recent * 0.1)` feeding customer trending and seller insights.
- **Support Center (Unified)**:
  - General Tickets: View customer details, admin notes, mark resolved.
  - Refund & Replacement Appeals: Customer vs Entrepreneur dispute, AI suggestion, Admin final Approve / Reject decision with automatic notifications to both parties.
- **Analytics & Performance**:
  - Platform metrics, Order Activity bar chart, Category Performance distribution.
- **Admin Profile**:
  - Administrator account info, change password, read-only Activity Logs (audit trail).

---

## 🚀 How to Run and Experience the Application

Because this application is built with standard Web & Mobile standards (HTML5, CSS3, ES6 JavaScript) and zero heavy backend dependencies:
1. Double-click or open `index.html` in **Google Chrome** or **Microsoft Edge**.
2. Alternatively, use PowerShell to launch directly:
   ```powershell
   Start-Process "chrome.exe" "c:\Users\v_a_venkat\Documents\maneinda\index.html"
   ```
   or with Edge:
   ```powershell
   Start-Process "msedge.exe" "c:\Users\v_a_venkat\Documents\maneinda\index.html"
   ```

### 🧪 Live Testing & Demo Shortcuts:
- **Top Demo Bar**: Quickly switch between **Customer**, **Entrepreneur**, and **Admin** views with a single click!
- **Viewport Toggle**: Switch between the authentic **Android 390 × 844 px frame** and **Responsive Fullscreen mode**.
- **Reset Demo**: Click **Reset Demo** anytime to restore all seed data, orders, reviews, and test accounts.
- **Default Accounts**:
  - Customer: `thanuja@example.com` (OTP: `123456`)
  - Entrepreneur: `anitha_bakery` / `password123`
  - Admin: `admin@maneyinda.com` / `admin123`
