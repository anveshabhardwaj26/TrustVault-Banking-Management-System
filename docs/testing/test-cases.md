# System Test Cases Specification
## TrustVault — Banking Management System
### Verification & Validation Test Suite (52 Systematic Test Cases)

---

| Document Attribute | Details |
| :--- | :--- |
| **Document Identifier** | TV-TCS-2026-V1.0 |
| **System Name** | TrustVault Banking Management System |
| **Version** | Version 1.0 |
| **Date** | October 14, 2026 |
| **Academic Department** | Computer Science and Engineering (Data Science) |
| **Scope** | Complete functional, boundary, negative, and database test cases (TC-01 through TC-52) |
| **Status** | Prepared for Test Execution Run |

---

## 1. Category 1: User Registration Test Cases

| TC ID | FR ID | Scenario | Preconditions | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | FR-01 | Successful customer registration with valid details | System is running; email and phone not previously registered | `fullName`: "Aditya Sharma", `email`: "aditya@example.com", `phone`: "9876543210", `address`: "123 MG Road, Bengaluru", `password`: "Secure@123" | HTTP 201 Created; User registered; Linked account auto-generated with `TV` prefix, balance ₹0.00, status `ACTIVE` | To be filled after execution | Pending |
| **TC-02** | FR-01 | Registration attempt with already registered email | User with email "aditya@example.com" already exists in system | `fullName`: "Aditya S", `email`: "aditya@example.com", `phone`: "9876543219", `address`: "Plot 4, Delhi", `password`: "Secure@123" | HTTP 409 Conflict; Error returned: "Email already registered"; No duplicate account created | To be filled after execution | Pending |
| **TC-03** | FR-01 | Registration with weak password (fails complexity policy) | None | `fullName`: "Neha Patel", `email`: "neha@example.com", `phone`: "9876500001", `address`: "Ahmedabad", `password`: "simple" | HTTP 400 Bad Request; Error returned: "Password must be at least 8 characters with uppercase, lowercase, digit, and special character" | To be filled after execution | Pending |
| **TC-04** | FR-01 | Registration with invalid 9-digit mobile phone number | None | `fullName`: "Kiran Rao", `email`: "kiran@example.com", `phone`: "987654321", `address`: "Hyderabad", `password`: "Pass@1234" | HTTP 400 Bad Request; Error: "Phone number must be exactly 10 numeric digits"; No user created | To be filled after execution | Pending |
| **TC-05** | FR-01 | Registration with missing required address field | None | `fullName`: "Rohan Verma", `email`: "rohan@example.com", `phone`: "9876500002", `address`: "", `password`: "Pass@1234" | HTTP 400 Bad Request; Error: "Address field is mandatory"; Registration rejected | To be filled after execution | Pending |

---

## 2. Category 2: Authentication & RBAC Test Cases

| TC ID | FR ID | Scenario | Preconditions | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-06** | FR-02 | Successful login as Customer with valid credentials | Customer "arjun@example.com" registered with password "Customer@1" | `email`: "arjun@example.com", `password`: "Customer@1" | HTTP 200 OK; Session cookie `connect.sid` issued with `HttpOnly`; Redirects to `/dashboard.html` | To be filled after execution | Pending |
| **TC-07** | FR-02 | Successful login as Bank Admin | Admin "admin@trustvault.com" exists with password "Admin@123" | `email`: "admin@trustvault.com", `password`: "Admin@123" | HTTP 200 OK; Session role identified as `admin`; Redirects to `/admin.html` | To be filled after execution | Pending |
| **TC-08** | FR-02 | Login failure with incorrect password | User exists in system | `email`: "arjun@example.com", `password`: "WrongPassword" | HTTP 401 Unauthorized; Generic error message: "Invalid email or password"; No session cookie created | To be filled after execution | Pending |
| **TC-09** | FR-02 | Login failure with non-existent email | Email "ghost@example.com" does not exist in database | `email`: "ghost@example.com", `password`: "SomePassword1" | HTTP 401 Unauthorized; Generic error: "Invalid email or password"; Username enumeration prevented | To be filled after execution | Pending |
| **TC-10** | FR-02 | Customer attempting unauthorized access to Admin endpoint | User logged in with `customer` role | Accessing `GET /api/admin/dashboard` | HTTP 403 Forbidden; Error: "Access denied: Administrator privileges required" | To be filled after execution | Pending |
| **TC-11** | FR-03 | Successful user logout and session invalidation | User is currently logged in with active session | Click "Logout" / `POST /api/auth/logout` | HTTP 200 OK; Session destroyed in SQLite session store; `connect.sid` cookie cleared | To be filled after execution | Pending |
| **TC-12** | FR-03 | Requesting protected route after session logout | User previously logged out | Accessing `GET /api/accounts/me` without session cookie | HTTP 401 Unauthorized; Redirects to login page `/index.html` | To be filled after execution | Pending |

---

## 3. Category 3: Account Balance & Profile Test Cases

| TC ID | FR ID | Scenario | Preconditions | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-13** | FR-04 | Inquire account balance for active customer | Customer logged in; Account balance is 150000 paise (₹ 1,500.00) | `GET /api/accounts/me/balance` | HTTP 200 OK; JSON payload returns `balanceRupees: "1500.00"` and `balancePaise: 150000` | To be filled after execution | Pending |
| **TC-14** | FR-04 | Verify zero balance presentation for brand new customer | Newly registered customer with 0 paise | `GET /api/accounts/me/balance` | HTTP 200 OK; Returns `balanceRupees: "0.00"` and `balancePaise: 0` | To be filled after execution | Pending |
| **TC-15** | FR-05 | Retrieve complete customer account profile | Customer logged in with account "TV10000001" | `GET /api/accounts/me` | HTTP 200 OK; Returns JSON with account number `TV10000001`, type `SAVINGS`, status `ACTIVE`, and branch `TVIN000101` | To be filled after execution | Pending |
| **TC-16** | FR-05 | Query account details without authentication | No active session | `GET /api/accounts/me` | HTTP 401 Unauthorized; Error: "Authentication required" | To be filled after execution | Pending |

---

## 4. Category 4: Cash Deposit Test Cases

| TC ID | FR ID | Scenario | Preconditions | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-17** | FR-06 | Successful simulated cash deposit of valid amount | Customer logged in; Account is `ACTIVE`; Initial balance ₹1,000.00 | `POST /api/transactions/deposit`, `{ "amount": 5000.00 }` | HTTP 200 OK; Balance updated to ₹6,000.00 (600000 paise); `DEPOSIT` record created in `transactions` with status `SUCCESS` | To be filled after execution | Pending |
| **TC-18** | FR-06 | Deposit rejected for amount below minimum limit (₹100) | Customer logged in; Account is `ACTIVE` | `POST /api/transactions/deposit`, `{ "amount": 50.00 }` | HTTP 400 Bad Request; Error: "Deposit amount must be between ₹ 100.00 and ₹ 5,00,000.00"; Balance unchanged | To be filled after execution | Pending |
| **TC-19** | FR-06 | Deposit rejected for amount exceeding maximum limit (₹5,00,000) | Customer logged in; Account is `ACTIVE` | `POST /api/transactions/deposit`, `{ "amount": 600000.00 }` | HTTP 400 Bad Request; Error: "Deposit amount must be between ₹ 100.00 and ₹ 5,00,000.00"; Balance unchanged | To be filled after execution | Pending |
| **TC-20** | FR-06 | Deposit rejected for negative or non-numeric amount | Customer logged in; Account is `ACTIVE` | `POST /api/transactions/deposit`, `{ "amount": -500.00 }` | HTTP 400 Bad Request; Error: "Amount must be a positive number"; No ledger modification | To be filled after execution | Pending |

---

## 5. Category 5: Cash Withdrawal Test Cases

| TC ID | FR ID | Scenario | Preconditions | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-21** | FR-07 | Successful simulated cash withdrawal with sufficient balance | Customer logged in; Initial balance is ₹10,000.00 | `POST /api/transactions/withdraw`, `{ "amount": 2500.00 }` | HTTP 200 OK; Balance updated to ₹7,500.00 (750000 paise); `WITHDRAWAL` transaction logged with status `SUCCESS` | To be filled after execution | Pending |
| **TC-22** | FR-07 | Withdrawal rejected due to insufficient account balance | Customer logged in; Balance is ₹1,000.00 | `POST /api/transactions/withdraw`, `{ "amount": 2000.00 }` | HTTP 400 Bad Request; Error: "Insufficient funds for withdrawal"; Balance remains strictly ₹1,000.00 | To be filled after execution | Pending |
| **TC-23** | FR-07 | Withdrawal rejected for amount exceeding single limit (₹50,000) | Customer logged in; Balance is ₹1,00,000.00 | `POST /api/transactions/withdraw`, `{ "amount": 75000.00 }` | HTTP 400 Bad Request; Error: "Maximum single withdrawal limit is ₹ 50,000.00"; Balance unchanged | To be filled after execution | Pending |
| **TC-24** | FR-07 | Withdrawal attempt on a BLOCKED customer account | Customer account is marked `BLOCKED`; Balance is ₹5,000.00 | `POST /api/transactions/withdraw`, `{ "amount": 500.00 }` | HTTP 403 Forbidden; Error: "Account is blocked or inactive; transactions prohibited"; Balance unchanged | To be filled after execution | Pending |

---

## 6. Category 6: Fund Transfer (Peer-to-Peer) Test Cases

| TC ID | FR ID | Scenario | Preconditions | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-25** | FR-08 | Successful fund transfer between two valid active accounts | Sender (TV10000001) has ₹15,000.00; Recipient (TV10000002) has ₹2,000.00 | `POST /api/transactions/transfer`, `{ "recipientAccountNumber": "TV10000002", "amount": 3000.00, "remark": "Tuition fees" }` | HTTP 200 OK; Sender balance becomes ₹12,000.00; Recipient balance becomes ₹5,000.00; Transfer transaction recorded | To be filled after execution | Pending |
| **TC-26** | FR-08 | Transfer rejected for non-existent beneficiary account | Sender (TV10000001) has ₹10,000.00; Account TV99999999 does not exist | `POST /api/transactions/transfer`, `{ "recipientAccountNumber": "TV99999999", "amount": 1000.00 }` | HTTP 404 Not Found; Error: "Beneficiary account 'TV99999999' not found"; Zero balance changes | To be filled after execution | Pending |
| **TC-27** | FR-08 | Self-transfer rejection (Sender transfers to own account) | Sender has account TV10000001 with balance ₹10,000.00 | `POST /api/transactions/transfer`, `{ "recipientAccountNumber": "TV10000001", "amount": 1000.00 }` | HTTP 400 Bad Request; Error: "Cannot transfer funds to your own account" (BR-09); No balance modification | To be filled after execution | Pending |
| **TC-28** | FR-08 | Transfer rejected due to insufficient sender balance | Sender has ₹800.00; Beneficiary TV10000002 exists | `POST /api/transactions/transfer`, `{ "recipientAccountNumber": "TV10000002", "amount": 1500.00 }` | HTTP 400 Bad Request; Error: "Insufficient balance to complete transfer"; Sender balance remains ₹800.00 | To be filled after execution | Pending |
| **TC-29** | FR-08 | Transfer rejected because beneficiary account is BLOCKED | Sender is active; Recipient TV10000003 is `BLOCKED` | `POST /api/transactions/transfer`, `{ "recipientAccountNumber": "TV10000003", "amount": 500.00 }` | HTTP 400 Bad Request; Error: "Beneficiary account is currently suspended and cannot receive funds"; Sender not debited | To be filled after execution | Pending |
| **TC-30** | FR-08 | Atomic rollback validation when database error occurs | Sender has ₹5,000; DB error simulated during recipient credit | `POST /api/transactions/transfer`, `{ "recipientAccountNumber": "TV10000002", "amount": 2000.00 }` | HTTP 500 Internal Server Error; SQLite rollback executed; Sender balance remains exactly ₹5,000.00; Recipient balance unchanged | To be filled after execution | Pending |

---

## 7. Category 7: Transaction History & Audits Test Cases

| TC ID | FR ID | Scenario | Preconditions | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-31** | FR-09 | Customer retrieves chronological transaction history | Customer has 4 prior transactions (1 deposit, 1 withdrawal, 2 transfers) | `GET /api/transactions/me` | HTTP 200 OK; Returns array of 4 transactions ordered by `created_at DESC`; Amounts correctly converted to ₹ | To be filled after execution | Pending |
| **TC-32** | FR-09 | Filter transaction history by type 'DEPOSIT' | Customer has deposits and transfers | `GET /api/transactions/me?type=DEPOSIT` | HTTP 200 OK; Returns only transactions where `transaction_type = 'DEPOSIT'`; Other types omitted | To be filled after execution | Pending |
| **TC-33** | FR-09 | Verify transaction record immutability | Transaction #1 exists in `transactions` table | Attempt `PUT /api/transactions/1` or direct modification | HTTP 404/405 Method Not Allowed; No update route exists; Historical transaction cannot be altered | To be filled after execution | Pending |

---

## 8. Category 8: Loans & Database/Admin Operations Test Cases

| TC ID | FR ID | Scenario | Preconditions | Input | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-34** | FR-10 | Successful loan application submission | Customer logged in; Has active account; Zero pending loans | `POST /api/loans`, `{ "loanType": "PERSONAL", "amount": 50000.00, "tenureMonths": 12, "monthlyIncome": 35000.00, "purpose": "Home renovation" }` | HTTP 201 Created; Loan record stored with status `PENDING`; Reference ID returned | To be filled after execution | Pending |
| **TC-35** | FR-10 | Loan submission rejected when customer has an existing pending loan | Customer already has an application with status `PENDING` | `POST /api/loans`, `{ "loanType": "EDUCATION", "amount": 100000.00, "tenureMonths": 24, "monthlyIncome": 35000.00, "purpose": "Higher Studies" }` | HTTP 400 Bad Request; Error: "You already have a loan application under review" (BR-17); Second application rejected | To be filled after execution | Pending |
| **TC-36** | FR-10 | Loan submission rejected for principal below ₹10,000 | Customer logged in | `POST /api/loans`, `{ "loanType": "PERSONAL", "amount": 5000.00, "tenureMonths": 6, "monthlyIncome": 30000.00, "purpose": "Gadget" }` | HTTP 400 Bad Request; Error: "Loan principal must be between ₹ 10,000.00 and ₹ 10,00,000.00" (BR-16) | To be filled after execution | Pending |
| **TC-37** | FR-11 | Customer views status of submitted loan applications | Customer has 1 pending loan and 1 approved loan | `GET /api/loans/me` | HTTP 200 OK; Returns list of 2 loan applications with attributes: principal, tenure, status, and remarks | To be filled after execution | Pending |
| **TC-38** | FR-11 | Loan status tracking when customer has zero applications | Customer has never submitted a loan | `GET /api/loans/me` | HTTP 200 OK; Returns empty array `[]`; UI renders "No loan applications found" | To be filled after execution | Pending |
| **TC-39** | FR-12 | Employee searches customer catalog by email | Bank Employee logged in | `GET /api/admin/customers?search=arjun@example.com` | HTTP 200 OK; Returns customer profile for Arjun; Password hash omitted from payload | To be filled after execution | Pending |
| **TC-40** | FR-12 | Employee views customer list (read-only verification) | Bank Employee logged in | `GET /api/admin/customers` | HTTP 200 OK; Returns all registered customer accounts with balances and statuses | To be filled after execution | Pending |
| **TC-41** | FR-13 | Employee views institution-wide transaction feed | Bank Employee logged in | `GET /api/admin/transactions` | HTTP 200 OK; Returns all institutional transactions across all customer accounts | To be filled after execution | Pending |
| **TC-42** | FR-13 | Employee filters institution transactions by date range | Bank Employee logged in | `GET /api/admin/transactions?startDate=2026-10-01&endDate=2026-10-14` | HTTP 200 OK; Returns only transactions falling within the specified date boundaries | To be filled after execution | Pending |
| **TC-43** | FR-14 | Employee inspects pending loan and adds review notes | Bank Employee logged in; Loan #1 is `PENDING` | `PATCH /api/admin/loans/1/review`, `{ "notes": "Income documents verified against payslips" }` | HTTP 200 OK; Verification notes stored in record; Status remains `PENDING` | To be filled after execution | Pending |
| **TC-44** | FR-14 | Employee attempts final loan approval (Separation of duties) | Bank Employee logged in (Role: `employee`) | `PATCH /api/admin/loans/1/decision`, `{ "decision": "APPROVED" }` | HTTP 403 Forbidden; Error: "Only bank administrators may issue final loan decisions" (BR-18) | To be filled after execution | Pending |
| **TC-45** | FR-15 | Bank Admin approves a pending loan application | Bank Admin logged in; Loan #1 is `PENDING` | `PATCH /api/admin/loans/1/decision`, `{ "decision": "APPROVED", "adminRemarks": "Eligibility criteria satisfied" }` | HTTP 200 OK; Status transitions to `APPROVED`; `decision_date` recorded; Audit entry created | To be filled after execution | Pending |
| **TC-46** | FR-15 | Bank Admin rejects a pending loan application | Bank Admin logged in; Loan #2 is `PENDING` | `PATCH /api/admin/loans/2/decision`, `{ "decision": "REJECTED", "adminRemarks": "Debt-to-income ratio exceeds 60%" }` | HTTP 200 OK; Status transitions to `REJECTED`; Rationale persisted; Audit entry recorded | To be filled after execution | Pending |
| **TC-47** | FR-16 | Bank Admin blocks an active customer account | Bank Admin logged in; Account TV10000001 is `ACTIVE` | `PATCH /api/admin/accounts/1/status`, `{ "status": "BLOCKED", "reason": "Suspected identity dispute" }` | HTTP 200 OK; Status updated to `BLOCKED` in `accounts`; Audit row written to `audit_logs` | To be filled after execution | Pending |
| **TC-48** | FR-16 | Bank Admin reactivates a blocked account | Bank Admin logged in; Account TV10000001 is `BLOCKED` | `PATCH /api/admin/accounts/1/status`, `{ "status": "ACTIVE", "reason": "Identity verification completed" }` | HTTP 200 OK; Status updated to `ACTIVE`; Account re-enabled for debit/credit operations | To be filled after execution | Pending |
| **TC-49** | FR-17 | Bank Admin accesses dashboard KPI analytics | Bank Admin logged in | `GET /api/admin/dashboard` | HTTP 200 OK; Returns total customers, total accounts, total system deposits (₹), and loan counts | To be filled after execution | Pending |
| **TC-50** | FR-17 | Non-admin user attempts to query dashboard analytics | Customer logged in | `GET /api/admin/dashboard` | HTTP 403 Forbidden; Access denied; Sensitive institutional metrics protected | To be filled after execution | Pending |
| **TC-51** | FR-18 | Bank Admin generates institutional transaction summary report | Bank Admin logged in | `GET /api/admin/reports?type=TRANSACTIONS_SUMMARY` | HTTP 200 OK; Returns aggregated metrics (volume, counts by type, total turnover in ₹) | To be filled after execution | Pending |
| **TC-52** | FR-18 | System audit log generation upon sensitive administrative action | Admin modified account status | Direct verification of `audit_logs` table | Record exists with `user_id`, `action = 'STATUS_CHANGE'`, `entity_type = 'accounts'`, and timestamp | To be filled after execution | Pending |

---
*End of TrustVault System Test Cases Specification (TV-TCS-2026-V1.0)*
