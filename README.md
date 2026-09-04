# 🍲 INTI RUCHI — Admin Management Website

> **Homemade Food Delivery Platform — Management & Operations Portal**
>
> Connected to the **existing customer application** (`Home_food_customer` in `../home_made`) sharing **one unified SQLite database** (`intiruchi.db`) and **one FastAPI backend** (`http://127.0.0.1:8000`).

---

## 🎯 Primary Purpose & Architecture

```
CUSTOMER WEBSITE (Port: 5173)
       │ Customer places order
       ▼
 FASTAPI BACKEND (Port: 8000)
       │ Creates real order
       ▼
 SQLITE DATABASE (intiruchi.db)
       │ Status: PENDING
       ▼
  ADMIN WEBSITE (Port: 5174)
       │ Admin clicks [ACCEPT ORDER]
       ▼
 FASTAPI BACKEND (PATCH /api/admin/orders/{id}/status)
       │ Updates database record
       ▼
CUSTOMER WEBSITE (Port: 5173)
         Customer sees: "Order Accepted ✓"
```

- **Zero Mock Data**: Admin orders are fetched live from `GET /api/admin/orders` directly from the database.
- **Role-Based Security**: Only accounts with `role == "ADMIN"` can access the admin dashboard and APIs. Normal customer tokens receive `403 Forbidden`.
- **Fulfillment Lifecycle**:
  `PENDING` $\rightarrow$ `ACCEPTED` $\rightarrow$ `PREPARING` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED` (or `REJECTED` with rejection reason).

---

## 🔐 Administrator Login Credentials

| Role | Email | Password |
|---|---|---|
| **Nagarjun (Primary Admin)** | `myakalanagarjun09@gmail.com` | `naga@012` |
| **Development Admin** | `admin@intiruchi.com` | `admin123` |
| **Demo Customer** | `customer@intiruchi.com` | `customer123` |

*(On the login screen, a convenient **⚡ Auto-Fill Nagarjun** button is available for 1-click login).*

---

## 🚀 How to Run the Platform

### 1. Start the Backend (Port 8000)
Double-click `run_backend.bat` in `home admin` or run:
```bash
cd ../home_made/backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
```

### 2. Start the Admin Website (Port 5174)
Double-click `run_admin_frontend.bat` in `home admin` or run:
```bash
cd frontend
npm run dev -- --port 5174
```
Open **[http://localhost:5174/admin/login](http://localhost:5174/admin/login)** in your browser.

### 3. (Optional) Start Customer Website (Port 5173)
```bash
cd ../home_made/frontend
npm run dev -- --port 5173
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📦 Admin Portal Pages & Features

1. **Admin Login** (`/admin/login`)
   - Secure role checking (`ADMIN` only). Customers get `403 Forbidden`.
2. **Dashboard** (`/admin/dashboard`)
   - Statistics: Total Orders, Pending, Accepted, Preparing, Out for Delivery, Delivered, Cancelled, Today's Revenue, Total Revenue, Total Customers.
   - Interactive 7-day revenue trend chart and order distribution breakdown.
   - Pending orders attention banner (`🔴 X New Orders Awaiting Admin Action`).
   - Recent orders table with quick Accept / Reject.
3. **Order Management** (`/admin/orders`)
   - Real orders retrieved with server-side pagination (`?page=1&limit=20`).
   - Search by Order #, customer name, phone, or email.
   - Filters: Status, Payment Status, Date range.
   - Sorting: Newest first, Oldest first, Highest amount, Lowest amount.
   - Live Polling every 5–6 seconds with pause toggle.
   - Synthesized Web Audio alert chime when new pending orders arrive.
4. **Order Details** (`/admin/orders/:id`)
   - Full customer information, delivery address, ordered food items, pricing breakdown.
   - Visual 5-step delivery timeline.
   - Status transitions with concurrency protection (`[ACCEPT]`, `[REJECT]`, `[START PREPARING]`, `[MARK READY]`, `[MARK DELIVERED]`).
   - Printable kitchen invoice receipt.
5. **Customer Management** (`/admin/customers` & `/admin/customers/:id`)
   - Searchable customer list with total orders, total spending, active status.
   - One-click Block / Unblock customer account.
   - Customer profile with complete order history.
6. **Home Cook Partner Management** (`/admin/cooks`)
   - Home cook verification and approvals (`[APPROVE]`, `[REJECT]`, `[SUSPEND]`).
   - Kitchen name, specialization, ratings, and total orders.
7. **Foods Menu Catalog** (`/admin/foods`)
   - Oversight of dishes across all kitchens, search, category filters, toggle item availability (`is_available`), and delete listings.
8. **Categories Management** (`/admin/categories`)
   - Overview of all culinary categories with item counts.
9. **Reports & Analytics** (`/admin/reports`)
   - Real DB calculations: Today's, Weekly, Monthly, and Total Revenue.
   - 7-day revenue and order volume trends.
   - Top most popular dishes and category distribution.
10. **Notifications** (`/admin/notifications`)
    - Platform notifications for new orders and cook registrations with jump links.
11. **Settings** (`/admin/settings`)
    - Admin profile, Sound notification toggle & test chime, background polling controls, architecture overview.
