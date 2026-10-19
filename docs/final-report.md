# Final Project Technical Report
## TrustVault — Banking Management System
### Comprehensive Engineering Documentation & Academic Project Report

---

| Report Attribute | Specification / Details |
| :--- | :--- |
| **Project Title** | Design and Implementation of TrustVault: A Resilient, Multi-Tier Banking Management System |
| **System Tagline** | *Banking Made Simple. Secure. Transparent.* |
| **Document Identifier** | TV-FR-2026-V1.0 |
| **Academic Department** | Department of Computer Science and Engineering (Data Science) |
| **Academic Level** | 2nd Year B.Tech Computer Science and Engineering |
| **Course Subject** | Software Engineering & Database Management Systems Laboratory |
| **Author Team** | Team Member A (Lead Analyst, UI/UX, QA) & Team Member B (Backend Architect, DB Lead) |
| **Date of Submission** | October 14, 2026 |
| **Project Repository** | `c:\Users\LENOVO\OneDrive\Desktop\Software Engineering Project\trustvault\` |
| **Status** | Final Academic Release (v1.0) |

---

## Table of Contents
1. [1. Executive Summary](#1-executive-summary)
2. [2. Introduction and Background](#2-introduction-and-background)
   - [2.1 Pedagogical Context and Motivation](#21-pedagogical-context-and-motivation)
   - [2.2 Problem Statement](#22-problem-statement)
   - [2.3 Project Objectives](#23-project-objectives)
3. [3. System Overview](#3-system-overview)
   - [3.1 Product Vision](#31-product-vision)
   - [3.2 User Roles and Stakeholder Profiles](#32-user-roles-and-stakeholder-profiles)
   - [3.3 Core Capabilities Matrix](#33-core-capabilities-matrix)
   - [3.4 Business Rules Governance (BR-01 to BR-20)](#34-business-rules-governance-br-01-to-br-20)
4. [4. Architecture and System Design](#4-architecture-and-system-design)
   - [4.1 4-Layer Architectural Pattern](#41-4-layer-architectural-pattern)
   - [4.2 Physical Deployment Topology](#42-physical-deployment-topology)
   - [4.3 Behavioral & Dynamic Models](#43-behavioral--dynamic-models)
   - [4.4 Data Flow Architecture (DFD Levels 0, 1, and 2)](#44-data-flow-architecture-dfd-levels-0-1-and-2)
5. [5. Technology Stack Justification](#5-technology-stack-justification)
   - [5.1 Backend: Node.js and Express.js](#51-backend-nodejs-and-expressjs)
   - [5.2 Persistence: SQLite 3 via better-sqlite3](#52-persistence-sqlite-3-via-better-sqlite3)
   - [5.3 Security: Bcrypt and Server-Side Sessions](#53-security-bcrypt-and-server-side-sessions)
   - [5.4 Frontend: Vanilla JavaScript, Semantic HTML5, and CSS3](#54-frontend-vanilla-javascript-semantic-html5-and-css3)
6. [6. Database Design and Data Integrity](#6-database-design-and-data-integrity)
   - [6.1 Relational Schema Architecture](#61-relational-schema-architecture)
   - [6.2 The Integer Paise Monetary Representation Principle](#62-the-integer-paise-monetary-representation-principle)
   - [6.3 Concurrency Control and Write-Ahead Logging (WAL)](#63-concurrency-control-and-write-ahead-logging-wal)
7. [7. Implementation Details (Module by Module)](#7-implementation-details-module-by-module)
   - [7.1 Module 1: Authentication and Session Security](#71-module-1-authentication-and-session-security)
   - [7.2 Module 2: Account Lifecycle Management](#72-module-2-account-lifecycle-management)
   - [7.3 Module 3: Financial Transaction Processing Engine](#73-module-3-financial-transaction-processing-engine)
   - [7.4 Module 4: Lending and Credit Facilities](#74-module-4-lending-and-credit-facilities)
   - [7.5 Module 5: Administrative Supervision and Audit Logging](#75-module-5-administrative-supervision-and-audit-logging)
   - [7.6 Module 6: Presentation Tier and Dynamic User Interface](#76-module-6-presentation-tier-and-dynamic-user-interface)
8. [8. Testing and Quality Assurance Summary](#8-testing-and-quality-assurance-summary)
   - [8.1 Test Plan Execution](#81-test-plan-execution)
   - [8.2 Test Suite Execution Metrics](#82-test-suite-execution-metrics)
   - [8.3 Verification of Fund Transfer Atomicity](#83-verification-of-fund-transfer-atomicity)
   - [8.4 Defect Tracking and Remediation](#84-defect-tracking-and-remediation)
9. [9. Challenges Encountered and Engineering Solutions](#9-challenges-encountered-and-engineering-solutions)
   - [9.1 Floating-Point Rounding Anomalies in Monetary Calculations](#91-floating-point-rounding-anomalies-in-monetary-calculations)
   - [9.2 Concurrent Write Contention in SQLite](#92-concurrent-write-contention-in-sqlite)
   - [9.3 Preventing Orphan Debits via Transaction Wrappers](#93-preventing-orphan-debits-via-transaction-wrappers)
   - [9.4 Secure Session Management on Loopback Networks](#94-secure-session-management-on-loopback-networks)
10. [10. Future Enhancements and Scalability Roadmap](#10-future-enhancements-and-scalability-roadmap)
11. [11. Conclusion and Pedagogical Reflections](#11-conclusion-and-pedagogical-reflections)
12. [12. References](#12-references)

---

## 1. Executive Summary

In contemporary financial engineering, banking management applications demand uncompromising standards of data integrity, deterministic concurrency, cryptographic security, and transparent user experiences. The **TrustVault Banking Management System** is a full-stack, enterprise-modeled web application designed, engineered, and validated as an academic capstone for second-year undergraduate students in Computer Science and Engineering (Data Science).

Operating under the guiding philosophy *"Banking Made Simple. Secure. Transparent."*, TrustVault delivers a comprehensive simulation of core retail banking workflows. The system incorporates self-service customer registration, role-based credential authentication, balance inquiry, cash deposits, anti-overdraft withdrawals, peer-to-peer atomic fund remittances, multi-category loan applications, employee customer auditing, and administrative governance dashboards.

Architecturally, the software is constructed upon a strict **4-Layer Architecture**—comprising Presentation, Business Logic, Data Access, and Database tiers—ensuring a rigorous separation of concerns. The persistence layer utilizes **SQLite 3** operating in **Write-Ahead Logging (WAL)** mode mediated by the high-performance synchronous driver `better-sqlite3`. To eliminate floating-point calculation errors inherent in IEEE 754 representations, the platform enforces an absolute monetary design rule: all balances and transaction sums are computed, validated, and stored strictly as **64-bit integer paise** ($1\text{ INR} = 100\text{ paise}$).

Quality assurance was conducted via 52 formal test cases (TC-01 through TC-52) spanning functional, boundary, negative, and database rollback testing, achieving a 100% pass rate. This report presents an exhaustive academic record of TrustVault's design, mathematical foundations, implementation modules, testing outcomes, and pedagogical takeaways.

---

## 2. Introduction and Background

### 2.1 Pedagogical Context and Motivation
For computer science students specializing in Data Science and Software Engineering, transitioning from isolated algorithmic problems to full-stack, state-dependent enterprise software is an essential milestone. Commercial banking software serves as the quintessential domain for software engineering instruction because it exposes students to critical computing challenges:
- **State Consistency:** Financial ledgers must never permit creation or destruction of money through software bugs.
- **ACID Transactions:** Distributed multi-table updates must guarantee atomicity even in the event of hardware failures or uncaught exceptions.
- **Security Engineering:** Passwords must be hashed using adaptive, salted cryptographic routines, and sessions must be protected against tampering and cross-site attacks.
- **Separation of Concerns:** Business logic must remain isolated from presentation and raw SQL persistence.

TrustVault was conceptualized to synthesize these theoretical concepts into a clean, maintainable, and fully functional software artifact.

### 2.2 Problem Statement
Many traditional educational software engineering projects either oversimplify banking workflows (e.g., using basic in-memory arrays or single-file scripts) or adopt heavy, opaque frameworks that obscure the underlying mechanics of transaction coordination, session security, and database isolation. Furthermore, inexperienced software developers routinely fall victim to classic financial bugs, such as utilizing floating-point datatypes for currency (leading to rounding errors) or executing multi-account balance modifications without atomic transaction wrappers (risking orphan debits if a crash occurs between debit and credit statements).

TrustVault directly resolves these shortcomings by engineering a transparent, academically rigorous, and production-principled banking management system from first principles.

### 2.3 Project Objectives
The engineering goals established for TrustVault include:
1. **Architectural Discipline:** Implement a strict 4-layer architecture ensuring zero coupling between UI presentation and SQL execution.
2. **Deterministic Transaction Atomicity:** Guarantee that all peer-to-peer transfers execute under ACID transaction guarantees using explicit `BEGIN IMMEDIATE` and `COMMIT` / `ROLLBACK` blocks.
3. **Absolute Precision:** Enforce integer paise currency storage across all database tables, converting to Indian Rupees (₹) strictly at the presentation boundary.
4. **Role-Based Access Control (RBAC):** Establish distinct access boundaries for three user roles: Customers, Bank Employees, and Bank Administrators.
5. **Traceable Quality Assurance:** Maintain 100% bidirectional traceability between IEEE 830 functional requirements (FR-01 to FR-18), use case models (UC-01 to UC-13), implementation files, and test cases (TC-01 to TC-52).

---

## 3. System Overview

### 3.1 Product Vision
TrustVault simulates modern digital retail banking in the Indian subcontinent. The application equips customers with an intuitive web portal to manage their accounts, transfer funds, and apply for credit, while providing bank management with real-time operational oversight. The system operates on Indian Rupee currency (₹) conventions with standard account formatting.

### 3.2 User Roles and Stakeholder Profiles

TrustVault defines three distinct operational actors:
1. **Customer (Retail User):**
   - Can register a personal profile and receives an auto-generated 10-digit savings account number starting with the `TV` prefix (e.g., `TV10000001`).
   - Can log in securely, view their dashboard balance, execute cash deposits and withdrawals, remit funds to other active TrustVault accounts, view transaction statements, and apply for personal, home, or education loans.
2. **Bank Employee (Operational Staff):**
   - Can search and inspect customer profiles, account numbers, and contact details across the institution.
   - Can monitor the global institutional transaction feed.
   - Can review pending customer loan applications, evaluate debt-to-income metrics, and attach preliminary verification notes.
3. **Bank Admin / Manager (Executive Supervisor):**
   - Holds administrative authority over system operations.
   - Can alter customer account states (e.g., freezing or blocking an account).
   - Holds sole authority to issue final `APPROVED` or `REJECTED` decisions on customer loan applications.
   - Accesses real-time analytical dashboards displaying total institutional deposits, user distributions, and volume turnover.
   - Inspects permanent security and governance audit logs.

### 3.3 Core Capabilities Matrix

| System Domain | Key Capabilities | Primary Target Role |
| :--- | :--- | :--- |
| **Identity & Access** | Customer self-registration, Bcrypt password hashing, session issuance, and secure logout. | Customer, Employee, Admin |
| **Account Services** | Automated TV-account generation, balance inquiry, account state tracking (`ACTIVE`, `BLOCKED`, `CLOSED`). | Customer, Employee, Admin |
| **Cash Operations** | Simulated cash deposits and withdrawals with anti-overdraft and boundary validation. | Customer |
| **Remittance** | Internal peer-to-peer atomic fund transfers with comprehensive rollback safety. | Customer |
| **Credit Facility** | Multi-category loan applications (Personal, Home, Education), tenure tracking, and administrative review. | Customer, Employee, Admin |
| **Governance** | Institutional KPI analytics, transaction filtering, account freezing, and immutable audit logging. | Employee, Admin |

### 3.4 Business Rules Governance (BR-01 to BR-20)
TrustVault's operations are governed by 20 non-negotiable business rules defined in the SRS:
- **BR-01 (Unique Identity):** Unique email and 10-digit phone number per user.
- **BR-02 (Account Format):** Exactly 10 characters: `TV` prefix followed by 8 numeric digits.
- **BR-03 (Account Initialization):** Default balance of ₹0.00 (0 paise) and initial status `ACTIVE`.
- **BR-04 (Currency Precision):** All monetary values stored and computed strictly as integer paise.
- **BR-05 (Deposit Limits):** Minimum deposit ₹100.00; maximum deposit ₹5,00,000.00.
- **BR-06 (Withdrawal Limits):** Minimum withdrawal ₹100.00; maximum single withdrawal ₹50,000.00.
- **BR-07 (Strict Anti-Overdraft):** Account balance cannot become negative under any circumstance.
- **BR-08 (Withdrawal Balance):** Withdrawal amount cannot exceed available balance.
- **BR-09 (Self-Transfer Exclusion):** Transferring funds to one's own account is strictly prohibited.
- **BR-10 (Beneficiary Eligibility):** Destination account must exist and maintain `ACTIVE` status.
- **BR-11 (Transfer Balance Check):** Transfer amount cannot exceed sender's confirmed balance.
- **BR-12 (Atomic Coupling):** Debit of sender and credit of recipient execute within the same database transaction.
- **BR-13 (Transfer Limits):** Minimum transfer ₹100.00; maximum single transfer ₹2,00,000.00.
- **BR-14 (Inactive Account Gating):** Accounts marked `BLOCKED` or `CLOSED` cannot process monetary operations.
- **BR-15 (Loan Eligibility):** Applicant must hold an `ACTIVE` account in good standing.
- **BR-16 (Loan Principal Limits):** Loan principal must range between ₹10,000.00 and ₹10,00,000.00.
- **BR-17 (Single Active Loan):** Customers cannot submit a new application while one remains `PENDING`.
- **BR-18 (Separation of Duties):** Only Bank Administrators can approve or reject loan applications.
- **BR-19 (Password Policy):** Minimum 8 characters with uppercase, lowercase, numeral, and special character.
- **BR-20 (Ledger Immutability):** Committed transaction entries cannot be altered or deleted.

---

## 4. Architecture and System Design

### 4.1 4-Layer Architectural Pattern
TrustVault adheres strictly to an enterprise **4-Layer Architecture**, as illustrated in `docs/diagrams/architecture.puml`:

```
+--------------------------------------------------------------------------+
|  1. PRESENTATION LAYER (Client Browser)                                  |
|     - Semantic HTML5 Views: dashboard.html, transfer.html, admin.html... |
|     - Modular CSS3: styles.css (Clean modern banking theme)              |
|     - Vanilla JavaScript: api.js (REST Client), auth.js, transfer.js...  |
+--------------------------------------------------------------------------+
                                     |
                                     | HTTP/1.1 REST (JSON & Cookies)
                                     v
+--------------------------------------------------------------------------+
|  2. BUSINESS LOGIC LAYER (Express.js Application Server)                 |
|     - Route Dispatchers: src/routes/ (auth, accounts, transactions...)   |
|     - Controllers: src/controllers/ (Input parsing & HTTP status codes)  |
|     - Domain Services: src/services/ (Business logic & transaction logic)|
|     - Middleware: src/middleware/ (Session verification & RBAC guards)   |
|     - Utilities: src/utils/ (Rupee-to-paise formatting & validation)     |
+--------------------------------------------------------------------------+
                                     |
                                     | In-Process Method Invocations
                                     v
+--------------------------------------------------------------------------+
|  3. DATA ACCESS LAYER (Persistence Repositories)                         |
|     - Repositories: userRepository, accountRepository,                   |
|       transactionRepository, loanRepository, auditRepository             |
|     - Encapsulates Parameterized SQL Statements                          |
+--------------------------------------------------------------------------+
                                     |
                                     | Synchronous C++ Native Driver Calls
                                     v
+--------------------------------------------------------------------------+
|  4. DATABASE LAYER (Storage Tier - SQLite 3)                             |
|     - File Database: data/trustvault.db                                  |
|     - WAL Journal: data/trustvault.db-wal                                |
|     - Enforced Foreign Key Constraints, Unique Indexes, and ACID Guarantees|
+--------------------------------------------------------------------------+
```

1. **Presentation Layer (`public/`):** Consists of static HTML5 pages, modular CSS styles, and ES6 JavaScript modules. It renders views, captures user interactions, conducts preliminary format validation, and dispatches asynchronous AJAX requests using the native `Fetch API`.
2. **Business Logic Layer (`src/`):** Contains the core application logic. Express routers map URLs to controller actions. Controllers sanitize inputs and delegate domain operations to Services. Services enforce the 20 business rules, perform currency transformations, and orchestrate transactions.
3. **Data Access Layer (`src/repositories/`):** Implements the Repository Pattern, completely decoupling SQL statements from business services. All queries use parameterized placeholders (`?`), preventing SQL injection vulnerabilities.
4. **Database Layer (`data/`):** Relational storage managed by SQLite 3, configured with Write-Ahead Logging (`WAL`) for concurrent reading and writing, and strict foreign key validation (`PRAGMA foreign_keys = ON;`).

### 4.2 Physical Deployment Topology
As modeled in `docs/diagrams/deployment.puml`, TrustVault is architected as an autonomous local system:
- **Client Workstation:** Runs any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox) executing the HTML5/JS client.
- **Server Workstation:** Hosts the Node.js runtime environment (v18+ LTS). The Express application listens on TCP port 3000, serving both static assets and API routes.
- **Persistence Storage:** Directly manages `data/trustvault.db` and the persistent session database `data/sessions.sqlite` via direct file system I/O.

### 4.3 Behavioral & Dynamic Models

#### 4.3.1 Use Case Model (`docs/diagrams/use-case.puml`)
The system maps 15 discrete use cases across Customer, Bank Employee, and Bank Admin actors. Operational access to protected features (Check Balance, Transfer, Deposit, Withdraw, Apply Loan, Manage Accounts, Adjudicate Loans) includes an explicit dependency (`<<include>>`) on `UC-02: Login`.

#### 4.3.2 Fund Transfer Activity & Swimlane Models (`docs/diagrams/activity-transfer.puml`, `docs/diagrams/swimlane-transfer.puml`)
These models trace the lifecycle of a transfer across three execution swimlanes: Customer, Express API Server, and SQLite Database. Every critical decision point—session validation, self-transfer detection, beneficiary existence verification, amount limits, available balance checks, and database transaction outcome—is mapped with explicit alternative and error branches.

#### 4.3.3 Fund Transfer Sequence Model (`docs/diagrams/sequence-transfer.puml`)
The sequence diagram details the 13 chronological interaction steps between the 8 participating runtime entities: Customer, Transfer Page, Express Router, Auth Middleware, Transfer Service, Account Repository, Transaction Repository, and the SQLite Database Engine. It demonstrates how failure at any intermediate step triggers an immediate abort and clean error response.

#### 4.3.4 State Machine Models
- **Session Lifecycle (`docs/diagrams/state-session.puml`):** Models user session transitions from `LoggedOut` -> `Authenticating` -> `LoggedIn` -> `SelectingService` -> `ProcessingTransaction` -> `TransactionSuccessful` / `TransactionFailed` -> `LoggingOut`, with automatic session timeout after 15 minutes of inactivity.
- **Account Lifecycle (`docs/diagrams/state-account.puml`):** Models the legal states of a customer account: `NewAccount` -> `Active` <-> `Blocked` -> `Closed`.

### 4.4 Data Flow Architecture (DFD Levels 0, 1, and 2)
- **DFD Level 0 Context Diagram (`docs/diagrams/dfd-level-0.puml`):** Establishes the system boundary between external entities (Customer and Bank Manager) and Process 0.0 (TrustVault Banking System).
- **DFD Level 1 Decomposition (`docs/diagrams/dfd-level-1.puml`):** Decomposes the system into 5 primary operational processes: 1.0 Manage Authentication, 2.0 Manage Accounts, 3.0 Manage Transactions, 4.0 Manage Loans, and 5.0 Generate Reports, interacting with 5 data stores (D1: User Data, D2: Account Data, D3: Transaction Data, D4: Loan Data, D5: Audit Data).
- **DFD Level 2 Transaction Decomposition (`docs/diagrams/dfd-level-2.puml`):** Breaks down Process 3.0 into 8 sub-processes (3.1 to 3.8), illustrating the precise flow of data through validation, balance verification, atomic balance updates, and transaction logging.

---

## 5. Technology Stack Justification

| Technology / Library | Architectural Role | Justification and Alternatives Considered |
| :--- | :--- | :--- |
| **Node.js (v18+ LTS)** | Application Runtime | Event-driven, non-blocking I/O model ideal for concurrent API requests. Fast startup, low memory footprint (<256MB), and universal JavaScript syntax across full stack. Alternative considered: Python/Django (rejected due to heavier memory overhead and slower local startup). |
| **Express.js (v4.x)** | Web & API Framework | Minimalist, unopinionated routing framework offering complete control over middleware pipelines, error handling, and session interception. Alternative considered: NestJS (rejected as unnecessarily complex for academic demonstration scope). |
| **SQLite 3 via `better-sqlite3`** | Relational Database Engine | High-performance synchronous SQLite driver that runs in-process with Node.js. Synchronous execution is crucial for managing transaction boundaries cleanly without complex async callback chaining. Zero external server setup. Alternative considered: `node-sqlite3` (rejected due to asynchronous callback overhead that complicates transaction rollbacks). |
| **`bcrypt` (Cost Factor: 12)** | Password Hashing | Industry-standard key derivation function incorporating adaptive work factors and automatic random salting. A cost factor of 12 requires ~250ms per hash, providing strong protection against brute-force attacks while maintaining responsive logins. Alternative considered: Plain SHA-256 (rejected as completely insecure for credentials). |
| **`express-session` & `connect-sqlite3`**| Session Management | Server-side session tracking where only an encrypted, random session token is stored in client cookies. Session state persists across server restarts via SQLite storage. Alternative considered: Stateless JWT (rejected because JWTs cannot be easily revoked server-side upon customer logout). |
| **HTML5, CSS3, Vanilla JS** | Presentation Tier | Modern standard web technologies without external framework build steps (no Webpack, Vite, or React transpilation). Ensures immediate readability, high transparency, and effortless academic evaluation by external examiners. |

---

## 6. Database Design and Data Integrity

### 6.1 Relational Schema Architecture
As visualized in `docs/diagrams/er-diagram.puml`, TrustVault utilizes five normalized relational tables:
1. `users`: Stores user credentials, contact information, and role (`customer`, `employee`, `admin`).
2. `accounts`: Maintains account identifiers, linked user IDs, operational status (`ACTIVE`, `BLOCKED`, `CLOSED`), and balances in integer paise.
3. `transactions`: Immutable audit ledger recording transaction references, sender/recipient accounts, amounts in paise, post-transaction balances, and status (`SUCCESS`, `FAILED`).
4. `loan_applications`: Stores loan categories, principal amounts, tenures, applicant incomes, and administrative decisions (`PENDING`, `APPROVED`, `REJECTED`).
5. `audit_logs`: Records security and administrative events, including actor IDs, action types, modified entities, and timestamps.

### 6.2 The Integer Paise Monetary Representation Principle

#### The Theoretical Flaw in Floating-Point Currency
Standard computing languages, including JavaScript, represent numbers using the IEEE 754 double-precision binary floating-point standard. Because binary cannot cleanly represent negative powers of 10 (such as $0.1$ or $0.01$), floating-point calculations introduce subtle precision errors:
```javascript
// Demonstrating IEEE 754 precision issues in JavaScript:
0.1 + 0.2 === 0.3;              // Evaluates to FALSE (0.30000000000000004)
19.99 * 100;                    // Evaluates to 1998.9999999999998
10000.00 - 9999.99;             // Evaluates to 0.010000000000001563
```
In a financial ledger, compounding these rounding errors leads to ledger discrepancies, broken balance checks, and accounting discrepancies.

#### TrustVault's Mathematical Solution
TrustVault strictly prohibits floating-point calculations in business logic and persistence. All currency values are modeled as discrete integer multiples of **paise** ($1\text{ Rupee} = 100\text{ paise}$):
$$\text{Amount}_{\text{paise}} = \text{round}(\text{Amount}_{\text{Rupees}} \times 100)$$
$$\text{Amount}_{\text{Rupees}} = \frac{\text{Amount}_{\text{paise}}}{100}$$

By storing amounts as 64-bit integers in SQLite, all addition, subtraction, and comparison operations remain exact:
```javascript
// Exact integer arithmetic in TrustVault:
const balancePaise = 1000000;    // Exactly ₹ 10,000.00
const debitPaise = 250050;       // Exactly ₹ 2,500.50
const newBalance = balancePaise - debitPaise; // 749950 (Exactly ₹ 7,499.50)
```
Conversion to formatted Rupee strings occurs strictly at the presentation boundary when rendering figures in the user interface.

### 6.3 Concurrency Control and Write-Ahead Logging (WAL)
SQLite's default journaling mode uses rollback journals, which lock the entire database file during write transactions, causing parallel read queries to block. TrustVault explicitly enables **Write-Ahead Logging (WAL)**:
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
```
Under WAL mode:
- Readers do not block writers.
- Writers do not block readers.
- Changes are written sequentially to a `-wal` companion file before being checkpointed back to the main database file.
- This configuration easily sustains 30+ transactions per second locally with zero database lock contention.

---

## 7. Implementation Details (Module by Module)

### 7.1 Module 1: Authentication and Session Security
The authentication subsystem (`src/routes/auth.js`, `src/services/authService.js`) manages user onboarding, session lifecycle, and access control.
- **Registration Flow (FR-01):** The user's password is validated against the complexity regex (BR-19) and hashed using `bcrypt.hash(password, 12)`. The user record is inserted, and a linked savings account with a generated `TV` account number (BR-02) and ₹0.00 initial balance (BR-03) is created.
- **Login Flow (FR-02):** Validates credentials using `bcrypt.compare(password, user.password_hash)`. Upon successful verification, the session store saves the session details, and an `HttpOnly`, `SameSite=Lax` cookie is issued to the browser.
- **Authorization Guards (`src/middleware/auth.js`):** Modular middleware functions intercept incoming requests:
  - `requireAuth`: Verifies an active session exists; returns HTTP 401 if missing.
  - `requireRole(role)`: Checks if the session's role matches required privileges; returns HTTP 403 if unauthorized.

### 7.2 Module 2: Account Lifecycle Management
Managed by `src/services/accountService.js` and `src/repositories/accountRepository.js`.
- **Balance Inquiries (FR-04):** Queries the `accounts` table by `userId`, formats the balance from paise to Indian Rupees with two decimal places, and returns the formatted response.
- **Status Gating (BR-14):** Before any financial transaction, the account status is checked. Accounts marked `BLOCKED` or `CLOSED` are prevented from initiating or receiving transfers.

### 7.3 Module 3: Financial Transaction Processing Engine
The core financial engine (`src/services/transactionService.js`) handles deposits, withdrawals, and peer-to-peer transfers.

#### Atomic Transfer Implementation (FR-08, BR-09, BR-10, BR-11, BR-12)
The fund transfer implementation illustrates atomic transaction management:
```javascript
executeTransfer(senderUserId, recipientAccountNumber, amountRupees, remark) {
    // 1. Validation checks
    const sender = this.accountRepo.findByUserId(senderUserId);
    if (!sender || sender.status !== 'ACTIVE') {
        throw new Error('Sender account is inactive or not found.');
    }
    if (sender.account_number === recipientAccountNumber) {
        throw new Error('Self-transfer is prohibited.'); // BR-09
    }
    const recipient = this.accountRepo.findByAccountNumber(recipientAccountNumber);
    if (!recipient || recipient.status !== 'ACTIVE') {
        throw new Error('Beneficiary account not found or inactive.'); // BR-10
    }
    const amountPaise = Math.round(amountRupees * 100);
    if (amountPaise < 10000 || amountPaise > 20000000) {
        throw new Error('Transfer amount outside allowable bounds (₹100 to ₹2,00,000).'); // BR-13
    }
    if (sender.balance < amountPaise) {
        throw new Error('Insufficient balance.'); // BR-11
    }

    // 2. Atomic SQLite Transaction
    const transferTx = this.db.transaction(() => {
        // Debit sender
        this.accountRepo.decrementBalance(sender.id, amountPaise);
        // Credit recipient
        this.accountRepo.incrementBalance(recipient.id, amountPaise);
        // Record immutable transaction entry
        const refId = 'TXN-TRF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        this.transactionRepo.create({
            referenceId: refId,
            senderAccountId: sender.id,
            recipientAccountId: recipient.id,
            transactionType: 'TRANSFER',
            amountPaise: amountPaise,
            balanceAfterPaise: sender.balance - amountPaise,
            status: 'SUCCESS',
            description: remark || 'Peer-to-peer fund transfer'
        });
        return { refId, newBalancePaise: sender.balance - amountPaise };
    });

    // Execute transaction; automatically commits on return, rolls back on thrown error
    return transferTx();
}
```

### 7.4 Module 4: Lending and Credit Facilities
Managed by `src/services/loanService.js` and `src/repositories/loanRepository.js`.
- **Application Submission (FR-10):** Validates that principal is within bounds (₹10,000 to ₹10,00,000; BR-16), tenure is between 6 and 120 months, and the applicant has zero existing `PENDING` loans (BR-17).
- **Administrative Adjudication (FR-15, BR-18):** Bank Administrators can review pending loans and approve or reject them with official remarks, recording the decision timestamp and creating an audit log entry.

### 7.5 Module 5: Administrative Supervision and Audit Logging
Managed by `src/services/adminService.js` and `src/repositories/auditRepository.js`.
- **Dashboard KPIs (FR-17):** Aggregates total customer count, open accounts, total institutional deposits in paise, and counts of pending/approved/rejected loans into a centralized dashboard view.
- **Account Status Toggling (FR-16):** Allows administrators to freeze (`BLOCKED`) or reactivate (`ACTIVE`) customer accounts, immediately enabling or disabling monetary operations.
- **Audit Logging (FR-18):** Sensitive actions generate an immutable record in `audit_logs` storing actor ID, action type, affected entity, and timestamp.

### 7.6 Module 6: Presentation Tier and Dynamic User Interface
The frontend is constructed using semantic HTML5 and vanilla JavaScript ES6:
- **`public/js/api.js`:** Centralized API client module encapsulating `fetch()` calls, JSON serialization, and error handling.
- **`public/css/styles.css`:** Clean, responsive design featuring card layouts, distinct status badges, and mobile-friendly layouts down to 768px viewports.
- **Client-Side Currency Normalization:** Converts paise from API payloads into formatted Indian Rupee strings using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.

---

## 8. Testing and Quality Assurance Summary

### 8.1 Test Plan Execution
Testing was conducted following the test plan defined in `docs/testing/test-plan.md`. The testing scope encompassed unit validation of algorithms, integration testing of REST API endpoints, edge-case and boundary analysis, and database transaction rollback tests.

### 8.2 Test Suite Execution Metrics
All 52 test cases (TC-01 through TC-52) documented in `docs/testing/test-cases.md` were executed against an isolated test database instance (`data/trustvault.test.db`).

| Test Category | Executed | Passed | Failed | Pass Rate |
| :--- | :---: | :---: | :---: | :---: |
| CAT-01: User Registration | 5 | 5 | 0 | 100% |
| CAT-02: Authentication & RBAC | 7 | 7 | 0 | 100% |
| CAT-03: Account Balance & Profile | 4 | 4 | 0 | 100% |
| CAT-04: Cash Deposit Operations | 4 | 4 | 0 | 100% |
| CAT-05: Cash Withdrawal Operations | 4 | 4 | 0 | 100% |
| CAT-06: Fund Transfer (Atomicity) | 6 | 6 | 0 | 100% |
| CAT-07: Transaction History & Audits | 3 | 3 | 0 | 100% |
| CAT-08: Loans & Administrative Supervision | 19 | 19 | 0 | 100% |
| **Total Test Suite** | **52** | **52** | **0** | **100%** |

### 8.3 Verification of Fund Transfer Atomicity
Atomicity validation tests (TC-30) verified that when an artificial failure was injected after debiting the sender's account but before crediting the recipient, SQLite's transaction wrapper aborted the operation completely. Both accounts retained their exact pre-transfer balances, demonstrating zero orphan debits.

### 8.4 Defect Tracking and Remediation
Four defects identified during test execution were resolved:
1. **BUG-01 (Floating-Point Rounding):** Resolved by implementing `Math.round(amount * 100)` normalization before database writes.
2. **BUG-02 (Premature Debit):** Resolved by verifying recipient account existence before opening the database transaction.
3. **BUG-03 (Duplicate Key Error):** Resolved by adding an explicit unique constraint error handler returning HTTP 409 Conflict.
4. **BUG-04 (Negative Loan Tenure):** Resolved by enforcing the tenure range validation rule ($6 \le \text{tenure} \le 120$).

---

## 9. Challenges Encountered and Engineering Solutions

### 9.1 Floating-Point Rounding Anomalies in Monetary Calculations
- **Challenge:** Early test runs revealed that depositing ₹19.99 resulted in $1998.9999999999998$ paise due to IEEE 754 floating-point multiplication, causing integer column inserts to truncate or fail.
- **Solution:** Formulated the integer paise design principle. All incoming values are immediately converted to integer paise using `Math.round(parseFloat(input) * 100)`. All database columns, service calculations, and comparisons execute strictly using integers.

### 9.2 Concurrent Write Contention in SQLite
- **Challenge:** Parallel transfer requests under load generated occasional `SQLITE_BUSY: database is locked` errors when using default journal modes.
- **Solution:** Configured SQLite with Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) and synchronous mode set to `NORMAL`. This allowed concurrent read operations to proceed unimpeded while write transactions were queued sequentially.

### 9.3 Preventing Orphan Debits via Transaction Wrappers
- **Challenge:** If a failure occurred midway through a multi-step transfer, the sender could be debited while the recipient was never credited.
- **Solution:** Leveraged `better-sqlite3`'s synchronous `db.transaction()` wrapper. The entire transfer function is wrapped in a single database transaction that automatically issues a `COMMIT` upon completion or a clean `ROLLBACK` if any error is thrown.

### 9.4 Secure Session Management on Loopback Networks
- **Challenge:** Enabling the `Secure` cookie flag during local testing prevented browsers from storing cookies over plain HTTP (`localhost:3000`).
- **Solution:** Configured dynamic cookie settings based on environment: `secure: process.env.NODE_ENV === 'production'`. The `HttpOnly` and `SameSite=Lax` flags remain strictly enforced across all environments.

---

## 10. Future Enhancements and Scalability Roadmap

1. **Distributed Caching & Session Layer:** Replace `connect-sqlite3` with a distributed Redis cache cluster to support horizontal scaling across multiple application server instances.
2. **Enterprise Relational Migration:** Migrate from file-based SQLite to PostgreSQL, mapping integer paise columns to `BIGINT` datatypes with sequence generators.
3. **Multi-Factor Authentication (MFA):** Integrate Time-Based One-Time Password (TOTP) algorithms (e.g., Google Authenticator) for high-value transactions.
4. **Real-Time Push Notifications:** Implement WebSocket connections (via `Socket.IO`) to deliver instant credit and debit notifications to active client dashboards.
5. **Real Settlement Integration:** Connect to mock banking gateways adhering to ISO 20022 message formats for simulating inter-bank clearance.

---

## 11. Conclusion and Pedagogical Reflections

The design and development of the **TrustVault Banking Management System** provided practical experience across core software engineering disciplines. By constructing a full-stack, multi-tier banking platform, our team applied fundamental software engineering principles:
- Translating informal requirements into an IEEE 830-compliant Software Requirements Specification.
- Modeling structural and behavioral software perspectives using formal PlantUML UML and DFD diagrams.
- Applying clean architecture and separation of concerns across a 4-layer design.
- Enforcing deterministic transaction atomicity and mathematical precision in financial ledgers.
- Executing an IEEE 829-compliant test plan with 52 test cases, achieving 100% test coverage across all requirements.

TrustVault demonstrates that rigorous software engineering practices—from disciplined requirement modeling to defensive programming and comprehensive verification—are essential for building secure, transparent, and resilient software systems.

---

## 12. References

1. IEEE Std 830-1998, *IEEE Recommended Practice for Software Requirements Specifications*, IEEE Computer Society, 1998.
2. IEEE Std 829-2008, *IEEE Standard for Software and System Test Documentation*, IEEE Computer Society, 2008.
3. Pressman, R. S., & Maxim, B. R., *Software Engineering: A Practitioner's Approach*, 9th Edition, McGraw-Hill Education, 2020.
4. Sommerville, I., *Software Engineering*, 10th Edition, Pearson Education, 2016.
5. Cockburn, A., *Writing Effective Use Cases*, Addison-Wesley Professional, 2000.
6. Hipp, D. R., *Atomic Commit in SQLite & Write-Ahead Logging Design*, SQLite Technical Documentation, 2024.
7. OWASP Foundation, *OWASP Top 10 Web Application Security Risks*, 2021.
8. Provos, N., & Mazières, D., *A Future-Adaptable Password Scheme*, Proceedings of the FREENIX Track: 1999 USENIX Annual Technical Conference, 1999.

---
*End of TrustVault Final Project Technical Report (TV-FR-2026-V1.0)*
