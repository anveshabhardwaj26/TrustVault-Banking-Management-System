# TrustVault — Banking Management System

> **Banking Made Simple. Secure. Transparent.**

A full-stack web-based Banking Management System developed as an academic Software Engineering project.  
Built with **Node.js**, **Express.js**, **SQLite**, **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 🏦 Project Overview

TrustVault is a simulated banking application that demonstrates core banking operations including account management, deposits, withdrawals, fund transfers, loan applications, and administrative management.

**This is an academic demonstration project. It does NOT connect to real bank accounts, real payment gateways, or any external financial services. All balances and transactions are simulated.**

---

## ✨ Features

### Customer Features
- ✅ Register a new account
- ✅ Login / Logout with secure session management
- ✅ View dashboard with account details and balance
- ✅ Deposit money into simulated account
- ✅ Withdraw money (with balance validation)
- ✅ Transfer funds between registered accounts (atomic)
- ✅ View full transaction history with filters
- ✅ Apply for simulated loans
- ✅ View loan application status

### Admin Features
- ✅ Admin dashboard with system statistics
- ✅ View and manage customer accounts
- ✅ View all transactions
- ✅ Review, approve, or reject loan applications
- ✅ Generate basic reports

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Fetch API |
| Backend | Node.js v18+, Express.js v4 |
| Database | SQLite via better-sqlite3 |
| Authentication | bcrypt (password hashing), express-session |
| Session Store | connect-sqlite3 |

---

## 🏗️ Architecture

TrustVault follows a **4-Layer Architecture**:

```
Browser (HTML + CSS + JS)
        │  HTTP REST API
        ▼
┌─────────────────────────────┐
│   PRESENTATION LAYER        │  ← public/ (HTML, CSS, JS)
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│   BUSINESS LOGIC LAYER      │  ← src/routes/ + src/controllers/ + src/services/
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│   DATA ACCESS LAYER         │  ← src/repositories/
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│   DATABASE LAYER            │  ← SQLite (data/trustvault.db)
└─────────────────────────────┘
```

---

## 📁 Project Structure

```
trustvault/
├── package.json
├── .env.example
├── .gitignore
├── README.md
│
├── src/
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   │
│   ├── config/
│   │   ├── database.js           # SQLite connection
│   │   └── session.js            # Session configuration
│   │
│   ├── routes/                   # HTTP route definitions
│   ├── controllers/              # Request/response handling
│   ├── services/                 # Business logic
│   ├── repositories/             # Database queries
│   ├── middleware/               # Auth, error handling
│   ├── utils/                    # Validation, response helpers
│   │
│   └── database/
│       ├── schema.sql            # Database schema
│       ├── initialize.js         # Schema setup script
│       ├── seed.js               # Demo data + admin setup
│       └── reset.js              # Reset for demos
│
├── public/                       # Frontend files served by Express
│   ├── index.html                # Login page
│   ├── register.html             # Registration page
│   ├── dashboard.html            # Customer dashboard
│   ├── deposit.html
│   ├── withdraw.html
│   ├── transfer.html
│   ├── transactions.html
│   ├── loans.html
│   ├── loan-status.html
│   ├── admin.html
│   ├── admin-customers.html
│   ├── admin-transactions.html
│   ├── admin-loans.html
│   ├── admin-reports.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── dashboard.js
│       ├── deposit.js
│       ├── withdraw.js
│       ├── transfer.js
│       ├── transactions.js
│       ├── loans.js
│       └── admin.js
│
├── tests/
│   ├── auth.test.js
│   ├── account.test.js
│   ├── transaction.test.js
│   └── loan.test.js
│
└── docs/
    ├── requirements/
    │   ├── srs.md
    │   ├── use-cases.md
    │   └── traceability-matrix.md
    ├── diagrams/                 # 13 PlantUML diagram files
    ├── testing/
    │   ├── test-plan.md
    │   ├── test-cases.md
    │   └── test-report.md
    ├── project-plan.md
    └── final-report.md
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or higher | https://nodejs.org |
| npm | v8 or higher | (included with Node.js) |
| Git | Any recent version | https://git-scm.com |

To verify your installation:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 8.x.x or higher
```

---

## 🚀 Installation & Setup

### Step 1: Clone or download the project

```bash
git clone <repository-url>
cd trustvault
```

Or if you already have the files, just open a terminal in the `trustvault` folder.

### Step 2: Install dependencies

```bash
npm install
```

This installs all required packages including Express, better-sqlite3, bcrypt, and others.

### Step 3: Configure environment

Create a `.env` file in the root of the `trustvault` folder:

```bash
cp .env.example .env
```

Open `.env` and set a strong session secret:
```
PORT=3000
SESSION_SECRET=your_very_long_random_secret_string_here_change_this
NODE_ENV=development
```

> ⚠️ **Important:** Change `SESSION_SECRET` to a long random string. Never share this value.

### Step 4: Initialize the database

```bash
npm run db:init
```

This creates the SQLite database file at `data/trustvault.db` and sets up all tables. Safe to run multiple times.

### Step 5: Create demo data and admin account

```bash
npm run db:seed
```

This creates:
- Admin account: `admin@trustvault.com` / `Admin@123`
- 3 demo customers with sample transactions
- Sample loan applications

> ⚠️ Only run this once. Running it again will skip existing records.

### Step 6: Start the application

**Development mode** (auto-restarts on code changes):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Step 7: Open in browser

Navigate to: **http://localhost:3000**

---

## 🌐 Deploying on Render

TrustVault can run as a Render Node web service. In Render, create a web service for this GitHub repository and use:

| Setting | Value |
|---------|-------|
| Root directory | Repository root |
| Build command | `npm ci` |
| Start command | `npm start` |

Set these environment variables in the Render service:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | A newly generated, long random secret; do not reuse the example or commit it |
| `DB_PATH` | `/var/data/trustvault.db` |
| `SESSION_DIR` | `/var/data` |

Generate a secret locally with `openssl rand -hex 32`, then enter the result directly in Render's environment settings. Do not commit it. Render sets `PORT` for the service; the application listens on that port and binds to `0.0.0.0`.

### SQLite persistence

The application creates/verifies the SQLite schema each time the server starts. It does not automatically seed users or transactions. The database path defaults to `data/trustvault.db`; the session store defaults to `data/sessions.db`.

Render's service filesystem is ephemeral unless you attach a persistent disk. To preserve accounts, transactions, and sessions across restarts and deployments, attach a disk to the web service mounted at `/var/data`; the two environment variables above then put both SQLite files on that disk. Render persistent disks are available on paid web services. Without a persistent disk, user accounts, transactions, and sessions stored in SQLite may be lost when the service restarts or redeploys.

Do not run `npm run db:seed` on a public deployment as-is. It creates accounts using fixed demo passwords that are documented in this repository, including an administrator login. A new deployment starts with an empty database (schema only); visitors can register simulated customer accounts, but there is no seeded administrator. The project is an academic simulation only and has no real banking or payment integrations.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@trustvault.com | Admin@123 |
| Customer 1 | arjun@example.com | Customer@1 |
| Customer 2 | priya@example.com | Customer@1 |
| Customer 3 | rahul@example.com | Customer@1 |

---

## 🧪 Running Tests

```bash
npm test
```

This runs automated tests using Jest and Supertest covering:
- Authentication (register, login, logout)
- Account operations (view account, balance)
- Financial transactions (deposit, withdraw, transfer atomicity)
- Loan operations

> **Note:** Tests use a separate test database and do not affect your demo data.

---

## 🔄 Reset Demo Data

To completely reset the database and start fresh:

```bash
npm run db:reset
```

> ⚠️ **Warning:** This deletes ALL data including accounts and transactions. Use only for demonstration resets.

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new customer |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/accounts/me | Get my account details |
| GET | /api/accounts/me/balance | Get my balance |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/transactions/deposit | Deposit money |
| POST | /api/transactions/withdraw | Withdraw money |
| POST | /api/transactions/transfer | Transfer funds |
| GET | /api/transactions/me | Get my transaction history |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/loans | Apply for loan |
| GET | /api/loans/me | Get my loan applications |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard statistics |
| GET | /api/admin/customers | List all customers |
| GET | /api/admin/transactions | All transactions |
| GET | /api/admin/loans | All loan applications |
| PATCH | /api/admin/loans/:id/decision | Approve/Reject loan |
| GET | /api/admin/reports | Generate reports |

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (cost factor 12)
- Sessions are server-side in SQLite (only the session ID is stored in the cookie)
- All SQL queries use parameterized statements (no SQL injection)
- Role-based access control on all API endpoints
- Input validation on both frontend and backend
- Monetary values stored as integers (paise) to avoid floating-point errors

---

## ⚠️ Known Limitations

1. **No email verification** — This is an academic project with no email server
2. **No password reset** — Contact admin to reset password in demo environment
3. **SQLite persistence** — On hosts with ephemeral filesystems, attach persistent storage or sessions and application data can be lost on restart or redeploy
4. **No real banking** — All operations are simulated; no real money involved
5. **Single server** — Designed for local academic demonstration only
6. **Public demo credentials** — The optional seed script uses fixed demo passwords; do not seed a publicly accessible deployment with those credentials

---

## 📚 Documentation

All Software Engineering documentation is in the `docs/` folder:

- `docs/requirements/srs.md` — Software Requirements Specification
- `docs/requirements/use-cases.md` — Detailed Use Case Specifications
- `docs/requirements/traceability-matrix.md` — Requirements Traceability Matrix
- `docs/diagrams/` — 13 PlantUML UML and DFD diagrams
- `docs/testing/` — Test plan, test cases, test report
- `docs/project-plan.md` — Project plan with WBS
- `docs/final-report.md` — Final project report

---

## 👥 Team

| Member | Role |
|--------|------|
| Team Member A | Requirements, Documentation, UML Diagrams, Frontend Design |
| Team Member B | Database Design, Backend APIs, Authentication, Transaction Logic |

---

## 📄 License

This is an academic project created for educational purposes only.  
Not intended for production use.

---

*TrustVault — Banking Made Simple. Secure. Transparent.*
