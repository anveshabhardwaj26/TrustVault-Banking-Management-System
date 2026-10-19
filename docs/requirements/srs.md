# Software Requirements Specification (SRS)
## TrustVault — Banking Management System
### Standard: IEEE Std 830-1998 Compliant Specification

---

| Document Attribute | Details |
| :--- | :--- |
| **Document Title** | Software Requirements Specification for TrustVault Banking Management System |
| **Document Identifier** | TV-SRS-2026-V1.0 |
| **Version** | Version 1.0 (Final Academic Release) |
| **Date of Publication** | October 14, 2026 |
| **System Name** | TrustVault |
| **Tagline** | *Banking Made Simple. Secure. Transparent.* |
| **Academic Department** | Department of Computer Science and Engineering (Data Science) |
| **Academic Level** | 2nd Year B.Tech Computer Science and Engineering |
| **Target Audience** | Academic Evaluators, System Architects, Developers, Quality Assurance Engineers |
| **Author Team** | Team Member A (Requirements Lead, System Analyst) & Team Member B (Backend Architect, Database Specialist) |
| **Status** | Approved & Baselined |

---

## Table of Contents
1. [Section 1: Title Page and Document Control](#1-title-page-and-document-control)
2. [Section 2: Introduction](#2-introduction)
3. [Section 3: Overall Description](#3-overall-description)
4. [Section 4: System Architecture Overview](#4-system-architecture-overview)
5. [Section 5: User Classes and Characteristics](#5-user-classes-and-characteristics)
6. [Section 6: Functional Requirements (FR-01 to FR-18)](#6-functional-requirements-fr-01-to-fr-18)
7. [Section 7: Non-Functional Requirements (NFR-01 to NFR-10)](#7-non-functional-requirements-nfr-01-to-nfr-10)
8. [Section 8: Business Rules (BR-01 to BR-20)](#8-business-rules-br-01-to-br-20)
9. [Section 9: Use Case Model Summary (UC-01 to UC-13)](#9-use-case-model-summary-uc-01-to-uc-13)
10. [Section 10: External Interface Requirements](#10-external-interface-requirements)
11. [Section 11: Database Requirements & Data Model](#11-database-requirements--data-model)
12. [Section 12: API Interface Requirements](#12-api-interface-requirements)
13. [Section 13: Security & Cryptographic Requirements](#13-security--cryptographic-requirements)
14. [Section 14: Transaction Processing & Integrity Requirements](#14-transaction-processing--integrity-requirements)
15. [Section 15: Error Handling & Exception Management](#15-error-handling--exception-management)
16. [Section 16: Software Quality Attributes](#16-software-quality-attributes)
17. [Section 17: Design & Implementation Constraints](#17-design--implementation-constraints)
18. [Section 18: Acceptance Criteria for Functional Features](#18-acceptance-criteria-for-functional-features)
19. [Section 19: Role-Based Access Control (RBAC) Matrix](#19-role-based-access-control-rbac-matrix)
20. [Section 20: Performance & Capacity Requirements](#20-performance--capacity-requirements)
21. [Section 21: Operational Scenarios & Failure Modes](#21-operational-scenarios--failure-modes)
22. [Section 22: Deployment & Environmental Requirements](#22-deployment--environmental-requirements)
23. [Section 23: Appendix A — Glossary & Acronyms](#23-appendix-a--glossary--acronyms)
24. [Section 24: Appendix B — Approvals & Verification Sign-Off](#24-appendix-b--approvals--verification-sign-off)

---

## 1. Title Page and Document Control

### 1.1 Revision History
| Version | Date | Description of Changes | Author(s) |
| :--- | :--- | :--- | :--- |
| v0.1 | September 10, 2026 | Initial draft of vision, user roles, and preliminary requirements | Team Member A |
| v0.5 | September 22, 2026 | Added functional requirements FR-01 through FR-12, business rules BR-01 to BR-15 | Team Member A, B |
| v0.8 | October 02, 2026 | Integrated database schema specifications, paise currency precision, and API endpoints | Team Member B |
| v1.0 | October 14, 2026 | Final baseline release: 24 IEEE 830 sections, NFRs, acceptance criteria, and full matrices | Team Member A, B |

### 1.2 Document Purpose
This Software Requirements Specification (SRS) establishes a formal, verifiable, and comprehensive technical contract for the **TrustVault Banking Management System**. It specifies the functional capabilities, performance expectations, behavioral constraints, external interfaces, and security mechanisms implemented within the system.

---

## 2. Introduction

### 2.1 Purpose of the System
The purpose of the TrustVault Banking Management System is to provide a robust, modern, and transparent simulation of retail banking operations. It empowers retail customers to execute primary banking operations—such as account opening, balance inquiry, simulated cash deposits, withdrawals, fund transfers, and loan applications—through a responsive web portal. Simultaneously, it provides bank employees and bank administrators with administrative interfaces for account supervision, transaction auditing, and loan adjudication.

### 2.2 Scope of the System
TrustVault is an academic full-stack web software solution. 
- **In-Scope Capabilities:**
  - Self-service customer onboarding with automated account generation.
  - Role-based authentication and secure session maintenance.
  - Immediate balance updates reflecting deposits, withdrawals, and peer-to-peer transfers.
  - Strictly atomic fund transfers preventing partial balance updates.
  - End-to-end loan application workflow (submission, inspection, approval/rejection).
  - Administrative oversight dashboards with aggregated financial metrics.
  - Audit logging of critical administrative and monetary state changes.
- **Out-of-Scope Capabilities (Explicit Exclusions):**
  - Connectivity to live banking networks (e.g., RBI NEFT/RTGS, NPCI UPI, SWIFT).
  - Physical ATM hardware integration and cash dispenser signaling.
  - Production-grade SMS/Email gateway dispatch (mock notifications displayed in UI).
  - Real credit bureau API integrations (CIBIL/Experian credit score scraping).

### 2.3 Definitions, Acronyms, and Abbreviations
- **ACID:** Atomicity, Consistency, Isolation, Durability.
- **API:** Application Programming Interface.
- **Bcrypt:** Password-hashing function designed by Niels Provos and David Mazières.
- **CSRF:** Cross-Site Request Forgery.
- **DAO / Repository:** Data Access Object pattern separating business logic from raw SQL.
- **IFSC:** Indian Financial System Code.
- **Paise:** Subunit of the Indian Rupee (1 ₹ = 100 paise).
- **RBAC:** Role-Based Access Control.
- **REST:** Representational State Transfer.
- **RTM:** Requirements Traceability Matrix.
- **SRS:** Software Requirements Specification.
- **WAL:** Write-Ahead Logging (SQLite journaling mode).

### 2.4 References
1. IEEE Std 830-1998, *IEEE Recommended Practice for Software Requirements Specifications*.
2. Pressman, R. S., & Maxim, B. R., *Software Engineering: A Practitioner's Approach*, 9th Edition, McGraw-Hill.
3. Sommerville, I., *Software Engineering*, 10th Edition, Pearson.
4. SQLite Documentation: *Atomic Commit in SQLite*, Hipp, D. R., 2024.
5. OWASP Top 10 Web Application Security Risks, 2021 Edition.

### 2.5 Document Overview
This document is organized strictly according to IEEE Std 830 conventions, partitioned into 24 distinct technical sections to guarantee comprehensive coverage of every architectural, functional, and governance facet of TrustVault.

---

## 3. Overall Description

### 3.1 Product Perspective
TrustVault is an autonomous web application functioning within a multi-tier, client-server paradigm. It replaces fragmented spreadsheet-based accounting or obsolete terminal interfaces with a cohesive, browser-based management portal. While designed as a self-contained local installation for academic validation, its modular separation allows seamless containerization and cloud hosting.

```
+-------------------------------------------------------------------------+
|                              Web Browser                                |
|           (Customer View / Employee Console / Admin Dashboard)          |
+-------------------------------------------------------------------------+
                                    | HTTP / REST API (JSON)
                                    v
+-------------------------------------------------------------------------+
|                        Node.js / Express Server                         |
|     [Auth Middleware] -> [Controllers] -> [Services (Business Rules)]   |
+-------------------------------------------------------------------------+
                                    | Data Access Objects (better-sqlite3)
                                    v
+-------------------------------------------------------------------------+
|                        SQLite Database (WAL Mode)                       |
|           [users] [accounts] [transactions] [loans] [audit_logs]        |
+-------------------------------------------------------------------------+
```

### 3.2 Product Functions (High-Level Summary)
1. **Identity & Access Management:** Registration, credential validation, session issuance, and role enforcement.
2. **Account Services:** Generation of unique TV-prefixed account identifiers, status toggling, and ledger inquiries.
3. **Financial Cash Operations:** Validated deposit and withdrawal operations with anti-overdraft enforcement.
4. **Inter-Account Remittance:** Atomic transfer of funds between accounts with rollback safeguards.
5. **Credit Facilities (Loans):** Multi-tier loan application, eligibility assessment, and administrative decisioning.
6. **Supervisory Analytics:** Centralized administrative analytics displaying real-time system deposits, transaction volumes, and user distribution.

### 3.3 User Characteristics
- **Customer:** Second-year university students, faculty members, and simulated retail clients possessing basic digital literacy, using standard desktop or mobile web browsers.
- **Bank Employee:** Operational staff requiring clear tabular interfaces for customer search, account status verification, and loan document inspection.
- **Bank Admin / Manager:** Privileged systems supervisor possessing deep familiarity with banking governance, authorized to adjudicate loans and inspect audit logs.

### 3.4 General Constraints
1. **Programming Language & Runtime:** Backend executed strictly on Node.js (v18.0.0 or higher) with Express.js framework.
2. **Persistence Engine:** Local disk-bound relational storage via SQLite (v3.x) mediated by `better-sqlite3` for synchronous execution and transaction control.
3. **Monetary Precision:** Absolute prohibition of IEEE 754 floating-point representations for financial calculations. All balances and transaction sums must be stored as 64-bit integer paise.
4. **Network Protocol:** HTTP/1.1 for local academic evaluation, designed for TLS/HTTPS termination in production environments.
5. **Operating System Agnosticism:** Cross-platform functionality across Microsoft Windows 10/11, macOS Unix, and Ubuntu Linux.

### 3.5 Assumptions and Dependencies
- The hosting workstation provides continuous read/write access to the local file path storing `data/trustvault.db`.
- The client browser executes modern ECMAScript 6+ and supports `Fetch API` and cookie-based session headers.
- Single-instance deployment assumptions apply during evaluation; distributed concurrent cluster synchronization is deferred to future enterprise extensions.

---

## 4. System Architecture Overview

TrustVault implements an enterprise **4-Layer Architecture** strictly adhering to the Separation of Concerns (SoC) principle:

```
+-----------------------------------------------------------------------+
|  1. PRESENTATION LAYER (Client Tier)                                  |
|     - Semantic HTML5, Modular CSS3, Vanilla JavaScript (ES6+)         |
|     - Single Page Navigation Components & REST API Client (api.js)   |
+-----------------------------------------------------------------------+
                                  |
                                  v REST / JSON Calls
+-----------------------------------------------------------------------+
|  2. BUSINESS LOGIC LAYER (Application Tier - Express.js)             |
|     - Routing & Dispatchers (src/routes/)                             |
|     - Request Sanitization & Controllers (src/controllers/)           |
|     - Domain Services & Business Rule Engines (src/services/)         |
|     - Security & Session Authentication Middleware (src/middleware/)  |
+-----------------------------------------------------------------------+
                                  |
                                  v Internal Method Invocations
+-----------------------------------------------------------------------+
|  3. DATA ACCESS LAYER (Persistence Abstraction Tier)                  |
|     - Repository Pattern Implementations (src/repositories/)         |
|     - AccountRepository, TransactionRepository, LoanRepository       |
|     - Parameterized SQL Statement Execution Engine                    |
+-----------------------------------------------------------------------+
                                  |
                                  v Synchronous SQLite Driver Calls
+-----------------------------------------------------------------------+
|  4. DATABASE LAYER (Storage Tier - SQLite WAL)                        |
|     - Relational Tables: users, accounts, transactions, loans, audits |
|     - ACID Enforcement, Foreign Keys, Unique Indexes, Integrity Checks|
+-----------------------------------------------------------------------+
```

---

## 5. User Classes and Characteristics

| User Role | Subsystem Privileges | Typical Technical Proficiency | Security Clearance |
| :--- | :--- | :--- | :--- |
| **Customer** | Access to personal account balance, deposits, withdrawals, transfers, loan applications, and personal transaction logs. | Basic web navigation skills. | Low (Restricted to self-owned entities). |
| **Bank Employee** | Read-only inspection of customer profiles, transaction audits across all accounts, preliminary loan review notes. | Moderate operational skills. | Medium (Read access across all customer ledgers). |
| **Bank Admin / Manager** | Complete system access: customer account state toggling, loan approval/rejection, aggregate financial analytics, audit log inspection. | Advanced administrative understanding. | High (Unrestricted administrative authority). |

---

## 6. Functional Requirements (FR-01 to FR-18)

### FR-01: User Registration
- **Description:** The system shall allow a prospective retail customer to register an account by providing their full legal name, a unique email address, a validated 10-digit mobile phone number, residential address, and a secure password.
- **Inputs:** `fullName` (String, 3-100 chars), `email` (RFC 5322 format), `phone` (10 digits), `address` (String, 5-255 chars), `password` (String, min 8 chars).
- **Processing:**
  1. Validate format and uniqueness of email and phone.
  2. Hash password with bcrypt (work factor = 12).
  3. Generate unique User record in `users` table.
  4. Automatically create an associated primary savings account in `accounts` table with a generated 10-digit account number (starting with prefix `TV`) and opening balance ₹0 (0 paise).
- **Outputs:** HTTP 201 Created with JSON payload confirming user registration and created account number.

### FR-02: User Authentication & Role-Based Access Control
- **Description:** The system shall authenticate registered users using their email and password credentials, establish a cryptographically signed HTTP session cookie, and assign appropriate system roles (`customer`, `employee`, `admin`).
- **Inputs:** `email`, `password`.
- **Processing:**
  1. Query user record by email.
  2. Verify password against hashed hash using `bcrypt.compare`.
  3. Upon success, generate session ID, store role and user ID in session store (`connect-sqlite3`), and set HTTP-only cookie.
  4. On failure, increment failed login count and return generic error message.
- **Outputs:** HTTP 200 OK with authenticated user profile and redirected dashboard URL.

### FR-03: User Logout & Session Invalidation
- **Description:** The system shall provide an explicit logout mechanism that terminates the active session on the server and invalidates the client cookie.
- **Inputs:** Session termination trigger from client header/cookie.
- **Processing:** Destroy session record in session store, clear `connect.sid` cookie header.
- **Outputs:** HTTP 200 OK with redirection payload to login interface.

### FR-04: Account Balance Inquiry
- **Description:** The system shall provide authenticated customers with immediate access to their ledger balance and available balance.
- **Inputs:** Authenticated session context (`userId`).
- **Processing:** Query `accounts` table for record belonging to authenticated `userId`, retrieve balance in paise, convert to Indian Rupees (₹), and format with 2 decimal places.
- **Outputs:** Current balance in ₹ and raw integer paise.

### FR-05: Account Details Retrieval
- **Description:** The system shall display comprehensive account metadata to the account holder.
- **Inputs:** Authenticated session context (`userId`).
- **Processing:** Fetch account number, account type (`Savings`), status (`Active`, `Blocked`, `Closed`), branch code (`TVIN000101`), and creation timestamp.
- **Outputs:** JSON object containing complete account profile.

### FR-06: Cash Deposit (Simulated)
- **Description:** The system shall enable an authenticated customer to deposit simulated funds into their personal account.
- **Inputs:** `amount` (Decimal Indian Rupees, e.g., 5000.00).
- **Processing:**
  1. Verify account status is `Active`.
  2. Validate amount >= ₹100.00 and <= ₹5,00,000.00.
  3. Convert amount to paise (`Math.round(amount * 100)`).
  4. Execute atomic database update: increment account balance in `accounts`.
  5. Insert transaction record into `transactions` table with type `DEPOSIT`, counterparty `SELF / CASH DESK`, status `SUCCESS`.
- **Outputs:** HTTP 200 OK with updated balance and generated transaction reference.

### FR-07: Cash Withdrawal (Simulated)
- **Description:** The system shall allow authenticated customers to withdraw simulated funds from their account, strictly validating available balance.
- **Inputs:** `amount` (Decimal Indian Rupees).
- **Processing:**
  1. Verify account status is `Active`.
  2. Validate amount >= ₹100.00 and <= ₹50,000.00.
  3. Convert amount to paise.
  4. Verify `available_balance >= withdrawal_amount_in_paise`.
  5. Atomically decrement account balance and record transaction of type `WITHDRAWAL` with status `SUCCESS`.
- **Outputs:** HTTP 200 OK with remaining balance and transaction receipt.

### FR-08: Internal Fund Transfer (Peer-to-Peer)
- **Description:** The system shall execute an atomic fund transfer from the authenticated sender's account to a designated recipient's TV-prefixed account number.
- **Inputs:** `recipientAccountNumber` (String, e.g., "TV10000002"), `amount` (Decimal ₹), `remark` (String, optional).
- **Processing:**
  1. Verify sender account status is `Active`.
  2. Validate sender and recipient account numbers are not identical.
  3. Query recipient account; verify existence and `Active` status.
  4. Validate amount is between ₹100.00 and ₹2,00,000.00.
  5. Check sender's balance >= transfer amount.
  6. Open SQLite transaction (`BEGIN IMMEDIATE`).
  7. Decrement sender balance by amount in paise.
  8. Increment recipient balance by amount in paise.
  9. Record debit transaction for sender and credit transaction for recipient (or unified transfer record referencing both accounts).
  10. Commit transaction. In case of any query error, issue full rollback.
- **Outputs:** HTTP 200 OK with transfer reference ID, debited amount, timestamp, and new balance.

### FR-09: Transaction History & Filtering
- **Description:** The system shall retrieve historical transactions associated with an account, supporting pagination, date filtering, and transaction type filtering.
- **Inputs:** Query parameters: `type` (ALL, DEPOSIT, WITHDRAWAL, TRANSFER), `startDate`, `endDate`, `page`, `limit`.
- **Processing:** Construct filtered SQL query against `transactions` table where `sender_account_id = account.id OR recipient_account_id = account.id`, sorted by `created_at DESC`.
- **Outputs:** Array of transaction objects with formatted currency, counterparty details, and pagination metadata.

### FR-10: Loan Application Submission
- **Description:** The system shall allow an eligible customer to submit a loan application specifying loan category, principal amount, tenure in months, and stated monthly income.
- **Inputs:** `loanType` (PERSONAL, HOME, EDUCATION), `amount` (₹10,000 to ₹10,00,000), `tenureMonths` (6 to 120), `monthlyIncome` (₹), `purpose` (String).
- **Processing:**
  1. Check customer has an active account.
  2. Verify no active loan application with status `PENDING` exists for this user.
  3. Validate loan parameters against business bounds.
  4. Insert application into `loan_applications` table with status `PENDING`.
- **Outputs:** HTTP 201 Created with loan application reference number.

### FR-11: Loan Application Tracking
- **Description:** The system shall allow a customer to view the lifecycle status, officer notes, and timestamps of all their submitted loan applications.
- **Inputs:** Authenticated session context (`userId`).
- **Processing:** Query `loan_applications` table matching `user_id`, sorted chronologically.
- **Outputs:** Collection of loan applications including ID, principal, tenure, status (`PENDING`, `APPROVED`, `REJECTED`), applied date, and decision date.

### FR-12: Employee Customer Account Management
- **Description:** The system shall permit bank employees and administrators to query, search, and view all registered customer accounts and their associated profiles.
- **Inputs:** Search keyword (name, email, or account number).
- **Processing:** Query joined records from `users` and `accounts`, excluding password hashes.
- **Outputs:** Tabular collection of customer records, balances, creation dates, and account states.

### FR-13: Employee Transaction Monitoring
- **Description:** The system shall allow bank employees to view a comprehensive ledger of all transactions executed across the institution.
- **Inputs:** Filter parameters (account number, date range, transaction type).
- **Processing:** Execute parameterized query across `transactions` joined with `accounts` and `users`.
- **Outputs:** Audit log of institution-wide financial movements.

### FR-14: Employee Loan Application Review
- **Description:** The system shall provide bank employees with a workflow to inspect pending loan applications, compute debt-to-income metrics, and attach preliminary verification notes.
- **Inputs:** `loanId`, `employeeNotes` (String).
- **Processing:** Update loan application record with reviewer notes and flag as verified.
- **Outputs:** HTTP 200 OK confirming preliminary verification.

### FR-15: Admin Loan Approval / Rejection
- **Description:** The system shall restrict final loan approval and rejection decisions strictly to users possessing the `admin` role.
- **Inputs:** `loanId`, `decision` ("APPROVED" or "REJECTED"), `adminRemarks` (String).
- **Processing:**
  1. Verify caller has `admin` role.
  2. Verify target loan application is currently `PENDING`.
  3. Update loan status to `APPROVED` or `REJECTED`, record `decision_date` and `admin_id`.
  4. Write log entry to `audit_logs` table.
- **Outputs:** HTTP 200 OK with updated loan status.

### FR-16: Admin Account Status Modification
- **Description:** The system shall permit administrators to suspend, freeze, or reactivate any customer bank account.
- **Inputs:** `accountId`, `newStatus` ("ACTIVE", "BLOCKED", "CLOSED"), `reason` (String).
- **Processing:** Update `status` in `accounts` table and log event in `audit_logs`.
- **Outputs:** HTTP 200 OK with new account operational status.

### FR-17: Admin Dashboard Statistics & Analytics
- **Description:** The system shall aggregate and display real-time institutional metrics to administrators.
- **Inputs:** Authenticated admin session.
- **Processing:**
  1. `COUNT(*)` of registered customers and open accounts.
  2. `SUM(balance)` of total institutional deposits in paise.
  3. `COUNT(*)` and aggregate volume of transactions processed in current cycle.
  4. `COUNT(*)` of pending, approved, and rejected loan applications.
- **Outputs:** JSON object containing all aggregate management key performance indicators (KPIs).

### FR-18: Admin Reporting & Audit Logging
- **Description:** The system shall generate structured operational reports (transaction summaries, loan portfolio distribution) and maintain an immutable audit log of administrative actions.
- **Inputs:** Report type, date range, audit log filter criteria.
- **Processing:** Extract historical records from `audit_logs` and operational tables.
- **Outputs:** Structured report data ready for on-screen viewing or print extraction.

---

## 7. Non-Functional Requirements (NFR-01 to NFR-10)

### NFR-01: Performance & Response Time
- The system shall respond to standard API inquiries (balance checks, user profile retrieval) within **200 milliseconds** under a baseline load of up to 50 concurrent virtual users.
- Complex atomic operations (fund transfers, database transactions) shall complete within **500 milliseconds**.

### NFR-02: Cryptographic Security & Password Hashing
- User passwords shall never be persisted or logged in plaintext.
- All credentials shall be hashed utilizing the `bcrypt` cryptographic hashing algorithm with a minimum computational work factor (cost) of **12 rounds**.

### NFR-03: Session Management & Access Control
- Server-side session tracking shall be managed using signed session identifiers stored via `connect-sqlite3`.
- Session cookies shall enforce `HttpOnly` flags to eliminate cross-site scripting (XSS) token exfiltration, and `SameSite=Lax` to guard against cross-site request forgery (CSRF).
- Sessions shall automatically expire after **15 minutes** of user inactivity.

### NFR-04: Numerical Integrity & Currency Precision
- Financial balances and transactional values shall be represented strictly as **64-bit signed integers** in denominations of `paise` (1 INR = 100 paise).
- Floating-point arithmetic (`Number` float calculations) is strictly prohibited in persistence and intermediate balance computations to prevent rounding errors.

### NFR-05: ACID Transaction Compliance
- All multi-statement state updates (e.g., fund transfers involving simultaneous debit and credit) shall be encapsulated within explicit SQLite transactions (`BEGIN IMMEDIATE ... COMMIT`).
- In any circumstance of system disruption or constraint violation, the database shall execute an automatic `ROLLBACK`, guaranteeing zero orphan debits.

### NFR-06: Usability & User Experience
- The user interface shall be designed with semantic HTML5 and responsive CSS, accommodating desktop viewports (1920x1080, 1366x768) and tablet displays (768px breakpoint).
- System alerts, validation errors, and confirmation modals shall provide unambiguous, human-readable notifications without exposing internal stack traces.

### NFR-07: Reliability & System Availability
- The application shall provide 99.5% operational availability throughout academic demonstration cycles.
- SQLite Write-Ahead Logging (WAL) mode shall be enforced (`PRAGMA journal_mode = WAL;`) to allow concurrent reads alongside write transactions, eliminating database lock contention.

### NFR-08: Modularity & Code Maintainability
- The codebase shall adhere strictly to a 4-layer architectural hierarchy: Presentation (`public/`), Business Logic (`src/controllers/`, `src/services/`), Data Access (`src/repositories/`), and Database (`src/database/`).
- Code complexity shall remain low, with modular single-responsibility functions thoroughly documented with JSDoc annotations.

### NFR-09: Scalability & Resource Utilization
- The application server shall run efficiently with memory consumption staying below **256 MB** RAM during idle and typical demonstration workloads.
- The repository layer design shall support migration to enterprise database engines (such as PostgreSQL) with minimal refactoring of business service contracts.

### NFR-10: Auditability & Regulatory Traceability
- All administrative overrides, account status alterations, and loan approvals shall generate an immutable record in `audit_logs` storing timestamp, actor ID, action type, target ID, and IP address.

---

## 8. Business Rules (BR-01 to BR-20)

| Rule ID | Rule Name | Description and Enforcement Logic |
| :--- | :--- | :--- |
| **BR-01** | Unique User Identity | Every user account must possess a unique email address and a unique 10-digit phone number across the system. Enforced via database unique constraints. |
| **BR-02** | Account Identifier Format | Bank account numbers must be exactly 10 characters long, prefixed with the uppercase letters `TV` followed by 8 numeric digits (e.g., `TV10000001`). |
| **BR-03** | Account Initialization | Every newly opened savings account defaults to an initial balance of ₹0.00 (0 paise) and an account status of `ACTIVE`. |
| **BR-04** | Monetary Unit Representation | All monetary fields in the database schema (`balance`, `amount`) are stored strictly as integers representing paise (₹1.00 = 100 paise). |
| **BR-05** | Minimum Deposit Limit | The minimum single simulated deposit transaction is ₹100.00 (10,000 paise). Maximum single deposit is ₹5,00,000.00 (50,000,000 paise). |
| **BR-06** | Minimum Withdrawal Limit | The minimum single simulated withdrawal is ₹100.00 (10,000 paise). Maximum single withdrawal is ₹50,000.00 (5,000,000 paise). |
| **BR-07** | Strict Anti-Overdraft Policy | Customer account balances cannot become negative under any circumstance. Available balance must satisfy: `Balance - WithdrawalAmount >= 0`. |
| **BR-08** | Withdrawal Balance Validation | A withdrawal request must be rejected if the requested withdrawal amount exceeds the sender's current confirmed ledger balance. |
| **BR-09** | Self-Transfer Exclusion | A customer is strictly prohibited from transferring funds to their own account number (`senderAccountId != recipientAccountId`). |
| **BR-10** | Recipient Account Eligibility | A fund transfer can only proceed if the destination account number exists in the database and currently maintains an `ACTIVE` state. |
| **BR-11** | Sufficient Transfer Balance | A transfer request must be rejected if `transferAmount > senderCurrentBalance`. No partial deductions are permissible. |
| **BR-12** | Atomic Transfer Coupling | The debit of the sender's account and the credit of the recipient's account must execute within the exact same database transaction boundary. |
| **BR-13** | Fund Transfer Limits | The minimum single transfer is ₹100.00 (10,000 paise); the maximum single transfer limit is capped at ₹2,00,000.00 (20,000,000 paise). |
| **BR-14** | Inactive Account Restriction | Accounts marked as `BLOCKED` or `CLOSED` cannot execute deposits, withdrawals, or outward/inward transfers. |
| **BR-15** | Loan Eligibility Baseline | A customer must hold an `ACTIVE` account in good standing with zero unserviced negative flags to qualify for loan applications. |
| **BR-16** | Loan Principal Limits | Personal, Home, and Education loans must conform to the range: Minimum ₹10,000.00 (1,000,000 paise) and Maximum ₹10,00,000.00 (100,000,000 paise). |
| **BR-17** | Single Active Application Limit | A customer may not submit a new loan application while another application for the same customer remains in the `PENDING` state. |
| **BR-18** | Administrative Separation of Duties | Customers cannot adjudicate loans or modify other accounts. Only users with the `admin` role hold authority to issue `APPROVED` or `REJECTED` loan verdicts. |
| **BR-19** | Password Complexity Policy | Passwords must have a minimum length of 8 characters, containing at least 1 uppercase letter, 1 lowercase letter, 1 numeral, and 1 special character (`[!@#$%^&*]`). |
| **BR-20** | Immutability of Transactions | Once recorded and committed, transaction rows in the `transactions` table cannot be modified, updated, or deleted by any actor or administrator. |

---

## 9. Use Case Model Summary (UC-01 to UC-13)

| UC ID | Use Case Name | Primary Actor | Associated Functional Req | Summary of Intent |
| :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Register Account | Customer | FR-01 | Create user profile and auto-generate linked TV savings account. |
| **UC-02** | User Login | All Users | FR-02 | Authenticate credentials and establish role-based server session. |
| **UC-03** | User Logout | All Users | FR-03 | Terminate session and invalidate client cookie. |
| **UC-04** | Check Balance & Details | Customer | FR-04, FR-05 | Display current balance in ₹ and comprehensive account attributes. |
| **UC-05** | Deposit Funds | Customer | FR-06 | Add simulated funds to active account with boundary validation. |
| **UC-06** | Transfer Funds | Customer | FR-08 | Transfer funds to another TV account atomically with rollback safeguards. |
| **UC-07** | Withdraw Funds | Customer | FR-07 | Withdraw simulated funds from active account subject to balance verification. |
| **UC-08** | View Transaction History | Customer, Employee | FR-09, FR-13 | Inspect, filter, and paginate past financial ledger entries. |
| **UC-09** | Apply for Loan | Customer | FR-10 | Submit formal application for Personal, Home, or Education loan. |
| **UC-10** | View Loan Status | Customer | FR-11 | Track application progress and view administrator remarks. |
| **UC-11** | Manage Customer Accounts | Employee, Admin | FR-12, FR-16 | Search accounts, view customer dossiers, toggle operational status. |
| **UC-12** | Review & Adjudicate Loans | Employee, Admin | FR-14, FR-15 | Review customer income eligibility; Admin grants final Approval/Rejection. |
| **UC-13** | Generate Reports & Analytics | Admin | FR-17, FR-18 | Aggregate institutional KPIs and generate summary audit logs. |

*(For detailed step-by-step main flows, alternative flows, and exception conditions, refer to `docs/requirements/use-cases.md`).*

---

## 10. External Interface Requirements

### 10.1 User Interfaces
- **Visual Design:** Clean modern banking aesthetic utilizing CSS Flexbox and Grid layouts, slate-blue header palette, dark charcoal typography, and distinct operational cards.
- **Form Controls:** Real-time client-side validation feedback displaying green border highlights for valid fields and red alerts for format violations.
- **Currency Display:** Monetary figures dynamically formatted with Indian numbering conventions (`en-IN` locale, e.g., `₹ 1,50,000.00`).
- **Responsive Layouts:** Fluid viewing experience across desktop screens (1080p, 1440p) and tablet displays (down to 768px width).

### 10.2 Hardware Interfaces
- No direct physical peripheral or ATM cash dispenser interface is required for this software simulation. Standard I/O interfaces (keyboard, mouse, touchscreen) are mediated by the client's web browser.

### 10.3 Software Interfaces
- **Operating System:** Platform independent; tested on Windows 10/11, macOS Darwin, Ubuntu Linux 22.04 LTS.
- **Node.js Runtime:** Node.js v18.0.0 or higher.
- **Database Engine:** SQLite 3 via `better-sqlite3` native C-bindings.
- **Session Layer:** `express-session` with SQLite persistent store `connect-sqlite3`.

### 10.4 Communications Interfaces
- **Network Protocol:** HTTP/1.1 (standard TCP port 3000 locally; configurable via environment variable `PORT`).
- **Data Payload Serialization:** All client-server communications use JavaScript Object Notation (JSON) with `Content-Type: application/json`.
- **State Transmission:** Session continuity maintained via standard HTTP `Set-Cookie` header (`connect.sid`).

---

## 11. Database Requirements & Data Model

### 11.1 Persistence Engine Configuration
- Database engine: **SQLite 3**.
- Storage file: `data/trustvault.db`.
- Journaling mode: Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) for enhanced write concurrency and durability.
- Foreign Key enforcement: Enabled explicitly on connection (`PRAGMA foreign_keys = ON;`).

### 11.2 Entity Specifications

#### 1. `users` Table
Stores authentication credentials and core profile metadata.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user internal key |
| `full_name` | TEXT | NOT NULL | User's full legal name |
| `email` | TEXT | NOT NULL UNIQUE | Unique email address (login username) |
| `password_hash` | TEXT | NOT NULL | Bcrypt hash string of password |
| `phone` | TEXT | NOT NULL UNIQUE | 10-digit mobile contact number |
| `address` | TEXT | NOT NULL | Residential address |
| `role` | TEXT | NOT NULL DEFAULT 'customer' | System role: `customer`, `employee`, `admin` |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

#### 2. `accounts` Table
Maintains ledger balances and state for customer accounts.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique account record ID |
| `user_id` | INTEGER | NOT NULL UNIQUE, FK(users.id) | Linked customer identifier |
| `account_number`| TEXT | NOT NULL UNIQUE | 10-digit account string (e.g., `TV10000001`) |
| `account_type` | TEXT | NOT NULL DEFAULT 'SAVINGS'| Account classification (`SAVINGS`, `CURRENT`)|
| `balance` | INTEGER | NOT NULL DEFAULT 0 | Balance in **paise** (1 ₹ = 100 paise) |
| `status` | TEXT | NOT NULL DEFAULT 'ACTIVE' | Account state: `ACTIVE`, `BLOCKED`, `CLOSED`|
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last transaction update timestamp |

#### 3. `transactions` Table
Maintains an immutable historical log of all financial transactions.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Transaction record ID |
| `reference_id` | TEXT | NOT NULL UNIQUE | UUID or alphanumeric unique transaction code |
| `sender_account_id`| INTEGER| NULL, FK(accounts.id) | Debited account ID (null for cash deposit) |
| `recipient_account_id`|INTEGER| NULL, FK(accounts.id) | Credited account ID (null for cash withdrawal)|
| `transaction_type` | TEXT | NOT NULL | `DEPOSIT`, `WITHDRAWAL`, `TRANSFER` |
| `amount` | INTEGER | NOT NULL | Transaction value in **paise** |
| `balance_after` | INTEGER | NOT NULL | Resulting balance of acting account in **paise** |
| `status` | TEXT | NOT NULL DEFAULT 'SUCCESS'| Execution outcome: `SUCCESS`, `FAILED` |
| `description` | TEXT | NULL | User remarks or system narration |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Transaction execution timestamp |

#### 4. `loan_applications` Table
Tracks customer loan submissions and administrative decisions.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Loan application ID |
| `user_id` | INTEGER | NOT NULL, FK(users.id) | Applying customer ID |
| `loan_type` | TEXT | NOT NULL | `PERSONAL`, `HOME`, `EDUCATION` |
| `amount` | INTEGER | NOT NULL | Requested loan principal in **paise** |
| `tenure_months` | INTEGER | NOT NULL | Requested repayment tenure in months |
| `monthly_income` | INTEGER | NOT NULL | Stated monthly applicant income in **paise** |
| `purpose` | TEXT | NOT NULL | Justification / purpose of loan |
| `status` | TEXT | NOT NULL DEFAULT 'PENDING'| State: `PENDING`, `APPROVED`, `REJECTED` |
| `admin_remarks` | TEXT | NULL | Review notes entered by Bank Admin |
| `decision_date` | DATETIME | NULL | Timestamp of approval or rejection |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Application submission timestamp |

#### 5. `audit_logs` Table
Maintains administrative audit trail for governance and security traceability.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Audit log entry ID |
| `user_id` | INTEGER | NOT NULL, FK(users.id) | Actor performing the sensitive action |
| `action` | TEXT | NOT NULL | Action code (e.g., `LOAN_APPROVAL`, `STATUS_CHANGE`)|
| `entity_type` | TEXT | NOT NULL | Target entity type (`accounts`, `loan_applications`)|
| `entity_id` | INTEGER | NOT NULL | Primary key of affected entity |
| `details` | TEXT | NULL | JSON or textual log of changes made |
| `ip_address` | TEXT | NULL | Client IP address of requester |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Log entry timestamp |

---

## 12. API Interface Requirements

All endpoints communicate using JSON payloads. Protected endpoints enforce session validation.

### 12.1 Authentication Endpoints
- `POST /api/auth/register` — Onboard new customer.
  - Body: `{ fullName, email, password, phone, address }`
  - Success: `201 Created` with `{ success: true, message, account: { accountNumber } }`
- `POST /api/auth/login` — Authenticate and establish session.
  - Body: `{ email, password }`
  - Success: `200 OK` with `{ success: true, user: { id, fullName, email, role } }`
- `POST /api/auth/logout` — Invalidate current session.
  - Success: `200 OK` with `{ success: true, message: "Logged out successfully" }`
- `GET /api/auth/me` — Retrieve active user session profile.
  - Success: `200 OK` with `{ success: true, user }`

### 12.2 Account Endpoints
- `GET /api/accounts/me` — Fetch authenticated customer's account details.
  - Success: `200 OK` with `{ success: true, account: { accountNumber, balancePaise, balanceRupees, status, accountType } }`
- `GET /api/accounts/me/balance` — Fetch real-time available balance.
  - Success: `200 OK` with `{ success: true, balanceRupees, balancePaise }`

### 12.3 Transaction Endpoints
- `POST /api/transactions/deposit` — Execute simulated cash deposit.
  - Body: `{ amount }` (Amount in ₹)
  - Success: `200 OK` with `{ success: true, referenceId, newBalance, message }`
- `POST /api/transactions/withdraw` — Execute simulated cash withdrawal.
  - Body: `{ amount }`
  - Success: `200 OK` with `{ success: true, referenceId, newBalance, message }`
- `POST /api/transactions/transfer` — Execute peer-to-peer fund transfer.
  - Body: `{ recipientAccountNumber, amount, remark }`
  - Success: `200 OK` with `{ success: true, referenceId, debitedAmount, newBalance }`
- `GET /api/transactions/me` — Fetch customer's personal transaction history.
  - Query Params: `type`, `limit`, `offset`
  - Success: `200 OK` with `{ success: true, transactions: [...] }`

### 12.4 Loan Endpoints
- `POST /api/loans` — Submit loan application.
  - Body: `{ loanType, amount, tenureMonths, monthlyIncome, purpose }`
  - Success: `201 Created` with `{ success: true, loanId, status: "PENDING" }`
- `GET /api/loans/me` — Fetch customer's loan applications.
  - Success: `200 OK` with `{ success: true, loans: [...] }`

### 12.5 Administrative & Employee Endpoints (Role-Gated)
- `GET /api/admin/dashboard` — Retrieve institutional statistics (Admin only).
  - Success: `200 OK` with `{ totalCustomers, totalAccounts, totalDepositsRupees, totalLoansPending }`
- `GET /api/admin/customers` — List all registered customer accounts (Employee & Admin).
  - Success: `200 OK` with `{ customers: [...] }`
- `GET /api/admin/transactions` — View system-wide transaction ledger (Employee & Admin).
  - Success: `200 OK` with `{ transactions: [...] }`
- `GET /api/admin/loans` — List all submitted loan applications (Employee & Admin).
  - Success: `200 OK` with `{ loans: [...] }`
- `PATCH /api/admin/loans/:id/decision` — Approve or reject loan (Admin only).
  - Body: `{ decision: "APPROVED" | "REJECTED", adminRemarks }`
  - Success: `200 OK` with `{ success: true, message }`
- `PATCH /api/admin/accounts/:id/status` — Modify account operational status (Admin only).
  - Body: `{ status: "ACTIVE" | "BLOCKED" | "CLOSED", reason }`
  - Success: `200 OK` with `{ success: true, message }`
- `GET /api/admin/reports` — Generate summarized institutional reports (Admin only).

---

## 13. Security & Cryptographic Requirements

### 13.1 Password Protection
- All stored passwords shall be transformed using `bcrypt` with a minimum cost factor of 12.
- Neither passwords nor intermediate hash salts shall be visible in logs or returned through any API response payload.

### 13.2 Injection Attack Mitigation
- SQL injection vulnerabilities shall be completely prevented through the exclusive use of parameterized prepared statements (`db.prepare('...').run(?)`). No dynamic string concatenation into SQL commands is permitted.

### 13.3 Session Hardening
- Session cookies shall specify `HttpOnly=true` to block JavaScript access and `SameSite=Lax` to prevent cross-site request attacks.
- Sensitive state modifications shall verify active session identity and user ownership of target resources.

### 13.4 Role-Based Authorization
- Middleware guards (`requireAuth`, `requireRole('admin')`, `requireRole('employee')`) shall be mounted on all administrative routes to prevent privilege escalation.

---

## 14. Transaction Processing & Integrity Requirements

### 14.1 Transaction Atomicity
- The transfer of funds involves multi-record modifications across accounts and transaction ledgers.
- The system shall execute fund transfers within SQLite transaction wrappers:
```javascript
const transferTransaction = db.transaction((senderId, recipientId, amountPaise) => {
    // 1. Decrement sender
    accountRepo.decrementBalance(senderId, amountPaise);
    // 2. Increment recipient
    accountRepo.incrementBalance(recipientId, amountPaise);
    // 3. Record transaction log
    transactionRepo.create({...});
});
```
- If an uncaught exception occurs at any intermediate step, the entire database transaction aborts cleanly, restoring balances to their exact pre-transfer state.

### 14.2 Consistency and Isolation
- SQLite transaction isolation guarantees that parallel readers observe consistent snapshots of account balances, preventing dirty reads or phantom updates during high-frequency balance checks.

---

## 15. Error Handling & Exception Management

### 15.1 Unified Error Response Format
All API error responses shall return a standardized JSON structure with appropriate HTTP status codes:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Your account balance (₹ 1,500.00) is insufficient to complete this transfer of ₹ 2,000.00."
  }
}
```

### 15.2 Standard HTTP Status Code Mapping
- `400 Bad Request`: Validation failures, business rule infractions (e.g., self-transfer, non-positive amounts).
- `401 Unauthorized`: Unauthenticated request or expired session.
- `403 Forbidden`: Authenticated user lacks necessary role permissions (e.g., Customer requesting admin analytics).
- `404 Not Found`: Target entity (account number, loan application) does not exist.
- `409 Conflict`: Duplicate unique entity (email or phone already registered).
- `500 Internal Server Error`: Unhandled server/database exceptions (sanitized for user display).

---

## 16. Software Quality Attributes

### 16.1 Reliability
- TrustVault enforces defensive programming checks across every service layer.
- SQLite WAL mode ensures database integrity is sustained even during sudden process termination or system reboots.

### 16.2 Maintainability
- Layered separation ensures that database queries reside strictly in repositories, domain logic in services, and HTTP request routing in controllers.
- Any change to business rules (e.g., adjusting transfer limits) requires modification in only one centralized service module.

### 16.3 Portability
- Node.js cross-platform runtime combined with zero-configuration file-based SQLite ensures the entire software project runs without modifications across Windows, macOS, and Linux systems.

### 16.4 Testability
- Modular service classes allow isolated unit testing using Jest.
- In-memory SQLite instances (`:memory:`) facilitate lightning-fast, reproducible integration test suites without altering persistent demonstration data.

---

## 17. Design & Implementation Constraints

1. **Academic Demonstration Scope:** Real payment settlement rails (RBI/NEFT/IMPS) and external SMS telco gateways are simulated locally.
2. **Synchronous DB Binding:** The project leverages `better-sqlite3`, which operates synchronously for deterministic execution flow and atomic transaction reliability.
3. **Frontend Framework Independence:** Standard HTML5, CSS3, and modern Vanilla JavaScript are mandated to preserve transparency for second-year undergraduate software engineering evaluation.

---

## 18. Acceptance Criteria for Functional Features

| Feature ID | Functional Requirement | Acceptance Criteria / Verification Test | Pass Criterion |
| :--- | :--- | :--- | :--- |
| **AC-01** | FR-01: User Registration | Register with valid unique credentials. Verify account auto-generated. | Account created with prefix `TV`, balance ₹0.00, status `ACTIVE`. |
| **AC-02** | FR-02: Authentication | Authenticate with registered email/password. | Returns HTTP 200, session cookie set, user role recognized. |
| **AC-03** | FR-06: Deposit Funds | Deposit ₹5,000 into active account. | Balance increases by exactly ₹5,000.00; transaction log recorded. |
| **AC-04** | FR-07: Withdrawal Funds | Attempt withdrawal of ₹6,000 when balance is ₹5,000. | Returns HTTP 400 error: "Insufficient funds"; balance remains ₹5,000.00. |
| **AC-05** | FR-08: Fund Transfer | Transfer ₹2,000 from Sender (TV10000001) to Recipient (TV10000002). | Sender debited by ₹2,000; Recipient credited by ₹2,000; atomic commit verified. |
| **AC-06** | FR-08: Transfer Self-Check | Attempt transfer from TV10000001 to TV10000001. | Returns HTTP 400: "Cannot transfer to own account". |
| **AC-07** | FR-10: Loan Application | Submit Personal Loan for ₹50,000 with tenure 12 months. | Application status recorded as `PENDING`; visible in customer tracker. |
| **AC-08** | FR-15: Loan Decision | Admin logs in and issues `APPROVED` verdict on pending loan. | Loan status transitions to `APPROVED`; decision date and admin ID persisted. |
| **AC-09** | FR-16: Account Status | Admin changes customer account status to `BLOCKED`. | Subsequent withdrawal or transfer attempts by that customer return HTTP 403. |
| **AC-10** | FR-17: Admin Dashboard | Access admin dashboard as administrator. | Accurately renders total system deposit sum and active user counts. |

---

## 19. Role-Based Access Control (RBAC) Matrix

| System Resource / Operation | Customer | Bank Employee | Bank Admin / Manager |
| :--- | :---: | :---: | :---: |
| Self-Registration & Login | Allowed | Allowed | Allowed |
| Check Own Account Balance & Details | Allowed | Allowed | Allowed |
| Deposit Funds into Own Account | Allowed | Denied | Denied |
| Withdraw Funds from Own Account | Allowed | Denied | Denied |
| Transfer Funds to Another Account | Allowed | Denied | Denied |
| View Own Transaction History | Allowed | Allowed | Allowed |
| Apply for Personal / Home / Education Loan | Allowed | Denied | Denied |
| Track Status of Own Loans | Allowed | Denied | Denied |
| Search & View All Customer Profiles | Denied | Allowed | Allowed |
| View Institution-wide Transaction Ledger | Denied | Allowed | Allowed |
| Add Preliminary Loan Review Notes | Denied | Allowed | Allowed |
| Approve or Reject Loan Applications | Denied | Denied | Allowed |
| Block, Freeze, or Close Accounts | Denied | Denied | Allowed |
| View Administrative Dashboard & Analytics | Denied | Denied | Allowed |
| View System Security Audit Logs | Denied | Denied | Allowed |

---

## 20. Performance & Capacity Requirements

1. **Throughput:** Capable of processing up to 30 transactions per second locally on a quad-core workstation without database locking contention.
2. **Storage Capacity:** The local SQLite database file accommodates in excess of 100,000 transaction records with an approximate footprint of under 50 MB disk space.
3. **Client-Side Rendering:** Web application pages load and initialize complete UI states within 1.0 second on standard local broadband and loopback environments.

---

## 21. Operational Scenarios & Failure Modes

### 21.1 Scenario A: Sudden Server Crash During Fund Transfer
- **Condition:** Server power loss occurs precisely after debiting the sender's account but before crediting the recipient's account.
- **System Behavior:** SQLite's Write-Ahead Journaling detects an incomplete transaction boundary on recovery. On restart, the partial debit is automatically rolled back, ensuring absolute ledger balance consistency.

### 21.2 Scenario B: Concurrent Transfers Exceeding Balance
- **Condition:** Two simultaneous transfer requests of ₹1,500 each are initiated when the account balance is ₹2,000.
- **System Behavior:** SQLite's atomic transaction lock serializes the requests. The first transaction successfully completes and decrements the balance to ₹500. The second transaction fails the balance verification check and is rejected with an `INSUFFICIENT_FUNDS` error.

---

## 22. Deployment & Environmental Requirements

- **Runtime Environment:** Single-instance local Node.js daemon running on Windows / macOS / Linux.
- **Network Configuration:** Bound to local network interface `127.0.0.1:3000`.
- **Environment Variables:**
  - `PORT`: Network port for Express HTTP server (Default: `3000`).
  - `SESSION_SECRET`: Cryptographic secret string for signing session cookies.
  - `NODE_ENV`: Runtime environment setting (`development` / `production`).

---

## 23. Appendix A — Glossary & Acronyms

- **Bcrypt:** An adaptive cryptographic hash algorithm engineered specifically for secure credential storage.
- **Decimal-to-Paise Normalization:** The process of converting user-entered Indian Rupee decimal inputs into integer paise (`Paise = Math.round(Rupees * 100)`) to eradicate floating-point imprecision.
- **Overdraft:** An operational condition where an account balance falls below zero; strictly prohibited by TrustVault BR-07.
- **WAL Mode:** Write-Ahead Logging mode in SQLite allowing read transactions to proceed simultaneously with write operations.

---

## 24. Appendix B — Approvals & Verification Sign-Off

This Software Requirements Specification document has been systematically reviewed, audited against academic standards, and formally baselined for development and quality assurance.

| Evaluator / Role | Designation | Status | Date of Sign-Off |
| :--- | :--- | :--- | :--- |
| **Team Member A** | Lead Requirements Engineer & UI Analyst | Approved | October 14, 2026 |
| **Team Member B** | Backend Architect & Database Specialist | Approved | October 14, 2026 |
| **Academic Supervisor** | Faculty Reviewer, Dept of CSE (Data Science) | Reviewed & Baselined | October 14, 2026 |

---
*End of TrustVault Software Requirements Specification (TV-SRS-2026-V1.0)*
