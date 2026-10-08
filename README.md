# Fitness Appointment Booking 🏋️‍♂️

A minimal, full-stack appointment booking application built for a **45-minute workshop**. 

Designed to demonstrate rapid end-to-end development with a clean React frontend, lightweight Node.js/SQLite backend, and passwordless phone authentication powered by the **Minimoth OTP API** (WhatsApp & SMS).

---

## ⚡ Workshop Constraints Adherence

- **Frontend Pages:** Strictly 3 pages (Auth / Login, Browse & Book Sessions, My Appointments)
- **Backend APIs:** Strictly 5 endpoints (Send OTP, Verify OTP, List Trainers, Create/Cancel Booking, User Bookings)
- **Database Models:** Strictly 3 entities (`User`, `Trainer`, `Booking`)
- **Zero Extra Bloat:** No heavy component libraries, no Docker, no complicated microservices, clean and readable code.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite) + Plain Modern CSS (athletic dark neon aesthetic, fully responsive)
- **Backend:** Node.js + Express
- **Database:** SQLite (using Node.js built-in `node:sqlite` — zero external C++ build dependencies!)
- **Authentication:** [Minimoth API](https://minimoth.dev) (WhatsApp-first OTP with SMS fallback) + Sandbox test mode

---

## 📂 Project Structure

```text
Bid-toBuild/
├── backend/
│   ├── .env                 # Backend environment variables
│   ├── .env.example         # Example backend environment variables
│   ├── db.js                # SQLite setup (3 models: users, trainers, bookings)
│   ├── minimoth.js          # Minimoth API integration + Sandbox mock mode
│   ├── package.json
│   ├── seed.js              # Database reset & seed script
│   └── server.js            # Express API (strictly 5 endpoints)
├── frontend/
│   ├── .env                 # Frontend environment variables
│   ├── .env.example         # Example frontend environment variables
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx          # Root view orchestrator
│       ├── index.css        # Clean, modern athletic styling
│       └── pages/
│           ├── AuthPage.jsx         # Page 1: Phone registration & Minimoth OTP login
│           ├── BookingPage.jsx      # Page 2: Browse coaches & book time slot
│           └── MyBookingsPage.jsx   # Page 3: View & cancel scheduled sessions
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v22+ recommended for built-in `node:sqlite`)
- Git

---

### 1. Backend Setup

```bash
cd backend

# 1. Install dependencies (express, cors, dotenv)
npm install

# 2. Configure environment variables
# Copy .env.example to .env
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000

# Get an API key from https://minimoth.dev
# Or keep 'mock_dev_key' for offline/testing mode (Mock OTP: 123456)
MINIMOTH_API_KEY=mock_dev_key
```

Start the backend server:
```bash
npm start
```
The backend will run on `http://localhost:5000` and automatically initialize the SQLite database with 4 starter fitness coaches.

*(Optional)* To reset and re-seed the database at any time:
```bash
npm run seed
```

---

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment variables
# Copy .env.example to .env
cp .env.example .env
```

Ensure `frontend/.env` points to your backend:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Authentication with Minimoth

This application uses the **Minimoth OTP API** for phone number authentication.

- **Production Mode:** Add your live Minimoth API key in `backend/.env`:
  ```env
  MINIMOTH_API_KEY=mm_live_xxxxxxxxxxxxxxxx
  ```
  Users will receive an instant 6-digit OTP code directly on WhatsApp (with automatic SMS fallback).
- **Workshop / Sandbox Mode:** If `MINIMOTH_API_KEY=mock_dev_key` or left unconfigured, you can test immediately with mock code:
  ```text
  OTP: 123456
  ```

---

## 📡 Backend API Endpoints (Strictly 5)

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | `POST` | `/api/auth/send-otp` | Sends OTP to phone via Minimoth API |
| 2 | `POST` | `/api/auth/verify-otp` | Verifies OTP and logs in / registers user in SQLite |
| 3 | `GET` | `/api/trainers` | Returns list of fitness coaches with specialties & rates |
| 4 | `POST` | `/api/bookings` | Creates a new booking or cancels an existing booking |
| 5 | `GET` | `/api/bookings?userId=:id` | Returns all appointments for the specified user |

---

## 📊 Database Models (Strictly 3)

1. **`users`**: `id`, `name`, `phone`, `created_at`
2. **`trainers`**: `id`, `name`, `specialty`, `experience_years`, `hourly_rate`, `image_url`
3. **`bookings`**: `id`, `user_id`, `trainer_id`, `booking_date`, `time_slot`, `status`, `created_at`

---

## 🧪 Testing the Workflow

1. Open `http://localhost:5173`.
2. Enter your name and phone number (e.g. `+919876543210`).
3. Click **"Send OTP"**.
4. Enter the received OTP (or `123456` in mock mode) and click **"Verify & Continue"**.
5. Browse coaches and click **"Book Session"**.
6. Select a date and time slot, then click **"Confirm Booking"**.
7. Navigate to **"My Bookings"** to see your scheduled workout and optionally cancel if needed.

