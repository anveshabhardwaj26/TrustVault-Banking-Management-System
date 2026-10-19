# Software Quality Assurance & Test Plan
## TrustVault — Banking Management System
### Standard: IEEE Std 829-2008 Compliant Test Plan

---

| Document Attribute | Details |
| :--- | :--- |
| **Document Identifier** | TV-STP-2026-V1.0 |
| **System Name** | TrustVault Banking Management System |
| **Version** | Version 1.0 |
| **Date** | October 14, 2026 |
| **Academic Department** | Computer Science and Engineering (Data Science) |
| **Academic Level** | 2nd Year B.Tech CSE — Software Engineering Project |
| **Author(s)** | Team Member A (QA Lead) & Team Member B (Test Automation Specialist) |
| **Status** | Approved for Execution |

---

## 1. Test Objectives

The primary objective of this Software Test Plan (STP) is to systematically verify and validate the functional correctness, security robustness, numerical precision, and operational resilience of the TrustVault Banking Management System. 

Specific testing goals include:
1. **Functional Verification:** Ensure 100% compliance with Functional Requirements FR-01 through FR-18.
2. **Atomic Integrity Assurance:** Validate that financial transactions (specifically fund transfers) strictly obey ACID properties and never leave accounts in an inconsistent state during failures.
3. **Boundary & Negative Testing:** Validate that the system rejects invalid inputs (negative values, out-of-bound transfers, self-transfers, duplicate registrations) with clear error messaging.
4. **Security & Session Validation:** Guarantee that role-based access controls prevent unauthorized access, password hashing is properly applied, and session cookies are secure.
5. **Numerical Precision Verification:** Confirm that all balances and transactions are calculated and persisted strictly in integer paise, preventing floating-point rounding errors.

---

## 2. Test Scope

### 2.1 In-Scope Capabilities
- **Authentication & Authorization Subsystem:** Registration, login, logout, password hashing with bcrypt, session expiration, and role-based access control (Customer, Employee, Admin).
- **Core Ledger Services:** Account creation, balance inquiries, and profile details retrieval.
- **Monetary Transactions:** Simulated deposits, cash withdrawals, and peer-to-peer fund transfers.
- **Credit & Lending Module:** Loan application submissions, applicant validation, and administrative approval/rejection workflows.
- **Employee & Admin Consoles:** Account search, status modifications (Active/Blocked), global transaction monitoring, and KPI reporting.
- **Database & Data Persistence:** SQLite table constraints, foreign key cascades, WAL journaling, and atomic transaction rollback.

### 2.2 Out-of-Scope Items
- Real-time hardware integration with physical ATM mechanisms or cash dispensers.
- Real-world inter-bank clearance networks (RBI NEFT/RTGS/IMPS/UPI).
- Production SSL/TLS certificate lifecycle management (handled via HTTP on localhost for evaluation).
- Multi-region distributed database replication and failover clustering.

---

## 3. Test Approach & Methodology

TrustVault employs a multi-layered testing strategy combining manual verification and automated test suites:

```
                  +-----------------------------------+
                  |      User Acceptance Testing      |
                  |  (Scenario-based manual testing)  |
                  +-----------------+-----------------+
                                    |
                  +-----------------v-----------------+
                  |        System Integration         |
                  | (Supertest REST API HTTP testing) |
                  +-----------------+-----------------+
                                    |
                  +-----------------v-----------------+
                  |      Unit & Service Testing       |
                  |  (Jest unit tests on algorithms)  |
                  +-----------------------------------+
```

### 3.1 Unit Testing
- Focuses on individual service functions, validation rules, and utility calculations.
- Verifies Rupee-to-paise conversion functions (`rupeesToPaise`, `paiseToRupees`).
- Validates password complexity validation regexes and account number generators.

### 3.2 Integration Testing (API Layer)
- Evaluates complete request-response lifecycles using `Jest` and `Supertest`.
- Uses an isolated SQLite test database to ensure test independence.
- Tests authenticated session flows and transactional state mutations.

### 3.3 Security & Penetration Testing
- Evaluates resistance against SQL injection by passing malicious SQL strings through input forms.
- Tests authorization barriers: Customers attempting to call `/api/admin/*` endpoints without proper role privileges.
- Verifies session destruction upon logout.

### 3.4 Concurrency & Atomic Rollback Testing
- Verifies transaction atomicity by simulating mid-transfer failures.
- Confirms that if a transfer fails halfway, the sender's account is not debited and the recipient is not credited.

---

## 4. Test Environment

| Component | Specification |
| :--- | :--- |
| **Operating System** | Microsoft Windows 11 / Windows 10 (64-bit) |
| **Runtime Environment** | Node.js v18.16.0 LTS or higher, npm v9.x |
| **Web Server Framework** | Express.js v4.18.2 |
| **Database Engine** | SQLite 3.40+ via `better-sqlite3` v9.x |
| **Test Runners & Libraries** | Jest v29.x, Supertest v6.x |
| **Client Browsers** | Google Chrome (Latest), Mozilla Firefox (Latest), Microsoft Edge (Latest) |
| **Database Test Instance** | `data/trustvault.test.db` (clean instance regenerated per run) |

---

## 5. Test Schedule

| Phase | Activity | Duration | Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Test Plan & Test Case Development | 3 Days | Documented STP and Test Cases |
| **Phase 2** | Unit Testing (Services, Repositories, Utils) | 4 Days | Automated Jest test suites |
| **Phase 3** | Integration & REST API Testing | 5 Days | Supertest execution scripts |
| **Phase 4** | UI Functional & Cross-Browser Verification | 3 Days | Manual UI testing logs |
| **Phase 5** | Regression & Edge-Case Validation | 2 Days | Bug remediation logs |
| **Phase 6** | Final Test Reporting & Sign-Off | 1 Day | Signed Test Report |

---

## 6. Test Cases Summary by Category

The test suite contains **52 comprehensive test cases** organized across 8 core operational categories:

| Category ID | Category Name | Target Modules | Number of Test Cases |
| :--- | :--- | :--- | :--- |
| **CAT-01** | User Registration | Registration, Account Generation, Data Validation | 5 Test Cases (TC-01 to TC-05) |
| **CAT-02** | User Authentication & RBAC | Login, Logout, Session Cookie, Role Enforcement | 7 Test Cases (TC-06 to TC-12) |
| **CAT-03** | Account Balance & Profile | Balance Check, Decimal Conversion, Profile Details | 4 Test Cases (TC-13 to TC-16) |
| **CAT-04** | Cash Deposit Operations | Positive Values, Range Boundaries, Balance Updates | 4 Test Cases (TC-17 to TC-20) |
| **CAT-05** | Cash Withdrawal Operations | Balance Checks, Anti-Overdraft, Limits | 4 Test Cases (TC-21 to TC-24) |
| **CAT-06** | Fund Transfer (Peer-to-Peer) | Atomicity, Beneficiary Checks, Rollbacks, Self-Transfers | 6 Test Cases (TC-25 to TC-30) |
| **CAT-07** | Transaction History & Audits | Ledger Retrieval, Date Filtering, Immutability | 3 Test Cases (TC-31 to TC-33) |
| **CAT-08** | Loans & Administrative Services | Loan Workflows, Admin Adjudication, Account Controls | 19 Test Cases (TC-34 to TC-52) |
| **Total** | **All Categories** | **End-to-End System Spectrum** | **52 Test Cases** |

---

## 7. Pass / Fail Criteria

### 7.1 Individual Test Case Pass Criteria
A test case is assigned the status **PASSED** if and only if:
- The actual HTTP response status matches the expected HTTP status code exactly.
- The returned JSON payload matches the expected schema and business attributes.
- Database state reflects the intended state modifications without side-effects.
- In negative tests, the expected validation error code and message are returned.

### 7.2 System-Level Acceptance Criteria
The complete system is considered acceptable for release if:
- **100%** of Critical (P1) test cases pass successfully.
- At least **95%** of Non-Critical (P2/P3) test cases pass.
- Zero high-severity defects remain unresolved.
- Fund transfer atomicity tests demonstrate 100% success with zero partial debits or credits.

---

## 8. Risk Assessment and Mitigation

| Risk Description | Severity | Likelihood | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Database File Lock during Concurrency** | High | Low | Enforce SQLite Write-Ahead Logging (`WAL` mode) and synchronous transactions via `better-sqlite3`. |
| **Floating-Point Rounding in Balance Calc** | High | Low | Strict architectural mandate: All calculations execute as integer paise; convert to ₹ only at presentation layer. |
| **Session Fixation / Cookie Hijacking** | Medium | Low | Generate new session ID upon successful login; enforce `HttpOnly` and `SameSite=Lax` cookie flags. |
| **Test Database Pollution of Demo Data** | Medium | Medium | Automated test scripts run against an independent database file (`data/trustvault.test.db`) initialized and destroyed per run. |

---
*End of TrustVault Software Quality Assurance & Test Plan (TV-STP-2026-V1.0)*
