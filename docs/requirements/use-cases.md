# Detailed Use Case Specifications
## TrustVault — Banking Management System
### Standard: Cockburn Style Comprehensive Use Case Documentation

---

| Document Attribute | Details |
| :--- | :--- |
| **System Name** | TrustVault Banking Management System |
| **Document Identifier** | TV-UCS-2026-V1.0 |
| **Version** | Version 1.0 |
| **Date** | October 14, 2026 |
| **Academic Focus** | 2nd Year B.Tech CSE (Data Science) — Software Engineering Project |
| **Covered Specifications** | UC-01 through UC-13 (Complete Operational Spectrum) |

---

## Table of Use Cases

1. [UC-01: Register Customer Account](#uc-01-register-customer-account)
2. [UC-02: User Login](#uc-02-user-login)
3. [UC-03: User Logout](#uc-03-user-logout)
4. [UC-04: Check Account Balance & Details](#uc-04-check-account-balance--details)
5. [UC-05: Deposit Funds](#uc-05-deposit-funds)
6. [UC-06: Transfer Funds (Comprehensive Multi-Path Analysis)](#uc-06-transfer-funds)
7. [UC-07: Withdraw Funds](#uc-07-withdraw-funds)
8. [UC-08: View Transaction History](#uc-08-view-transaction-history)
9. [UC-09: Apply for Loan](#uc-09-apply-for-loan)
10. [UC-10: Track Loan Status](#uc-10-track-loan-status)
11. [UC-11: Manage Customer Accounts](#uc-11-manage-customer-accounts)
12. [UC-12: Review and Adjudicate Loans](#uc-12-review-and-adjudicate-loans)
13. [UC-13: Generate Reports and View Analytics](#uc-13-generate-reports-and-view-analytics)

---

### UC-01: Register Customer Account

- **Use Case ID:** UC-01
- **Use Case Name:** Register Customer Account
- **Primary Actor:** Prospective Customer
- **Secondary Actors:** Database Engine (SQLite), Session Manager
- **Preconditions:**
  1. The user has access to a modern web browser connected to the TrustVault application URL.
  2. The user is not currently logged into any active TrustVault session.
- **Trigger:** The user clicks the "Register" or "Open Account" button on the portal navigation bar.
- **Main Success Scenario:**
  1. The user navigates to the registration page (`/register.html`).
  2. The system renders the registration form requesting: Full Legal Name, Email Address, 10-Digit Mobile Phone Number, Residential Address, Password, and Password Confirmation.
  3. The user fills out all required fields with valid data conforming to format policies and submits the form.
  4. The system validates all inputs on the client side and transmits a JSON payload to `POST /api/auth/register`.
  5. The backend validates email format, phone uniqueness, and verifies password strength (minimum 8 characters, uppercase, lowercase, digit, special character).
  6. The backend checks the database to ensure the email address and phone number are not already registered.
  7. The backend hashes the password using bcrypt with a salt cost factor of 12.
  8. The backend creates a new record in the `users` table with the role `customer`.
  9. The backend automatically generates a unique 10-digit account identifier starting with `TV` (e.g., `TV10000001`).
  10. The backend creates a linked primary savings account in the `accounts` table with initial balance of ₹0.00 (0 paise) and status `ACTIVE`.
  11. The system creates an initial audit log entry recording the registration event.
  12. The backend responds with HTTP 201 Created containing the user profile and generated account number.
  13. The browser displays a success notification with the assigned account number and automatically redirects the user to the login page.
- **Alternative Flows:**
  - **3a. Client-Side Validation Failure:**
    - If the user enters an invalid email syntax or non-matching passwords, the UI highlights the erroneous fields in red and prevents form submission.
- **Exception Flows:**
  - **6a. Duplicate Email or Phone (HTTP 409 Conflict):**
    - The database lookup detects that the provided email address or phone number already exists in the system.
    - The backend rejects the registration with an appropriate conflict message.
    - The client renders: *"An account with this email address or phone number already exists. Please log in or use alternative credentials."*
  - **7a. Database Persistence Failure (HTTP 500):**
    - If a database write lock error or unexpected failure occurs during user/account creation, the system rolls back the transaction.
    - The client displays: *"Registration service temporarily unavailable. Please try again shortly."*
- **Postconditions:**
  - A new customer record exists in the `users` table.
  - A linked `ACTIVE` account with balance ₹0 exists in the `accounts` table.
- **Related Functional Requirements:** FR-01, FR-02.

---

### UC-02: User Login

- **Use Case ID:** UC-02
- **Use Case Name:** User Login
- **Primary Actor:** Customer, Bank Employee, Bank Admin / Manager
- **Secondary Actors:** Session Store (`connect-sqlite3`)
- **Preconditions:**
  1. The user has an existing registered account in the TrustVault database.
  2. The user's account is in an operable state.
- **Trigger:** The user enters credentials on the login screen (`/index.html`) and clicks "Sign In".
- **Main Success Scenario:**
  1. The user navigates to the login page.
  2. The system displays email and password input fields along with role guidance.
  3. The user inputs their registered email address and password, then submits the credentials.
  4. The client dispatches a POST request to `/api/auth/login`.
  5. The backend looks up the user record by email in the `users` table.
  6. The backend verifies the submitted plaintext password against the stored bcrypt hash using `bcrypt.compare`.
  7. The backend initializes a cryptographically signed server-side session, storing `userId`, `role`, and `fullName`.
  8. The backend sets an `HttpOnly`, `SameSite=Lax` session cookie (`connect.sid`) in the HTTP response header.
  9. The backend returns HTTP 200 OK with the authenticated user profile and assigned role.
  10. The frontend checks the user's role and redirects them to the appropriate portal:
      - `customer` -> `/dashboard.html`
      - `employee` -> `/admin-customers.html`
      - `admin` -> `/admin.html`
- **Alternative Flows:**
  - **10a. Session already active:** If the user already possesses a valid session, the system automatically redirects them directly to their corresponding dashboard without prompting for credentials.
- **Exception Flows:**
  - **5a. User Email Not Found (HTTP 401 Unauthorized):**
    - The backend detects that no account corresponds to the submitted email.
    - The system returns a generic error: *"Invalid email or password."* (Preventing username enumeration).
  - **6a. Password Mismatch (HTTP 401 Unauthorized):**
    - The bcrypt comparison evaluates to false.
    - The system returns: *"Invalid email or password."*
  - **6b. Account Blocked / Inactive (HTTP 403 Forbidden):**
    - The user exists, but their linked bank account or profile is marked `BLOCKED`.
    - The system informs the user: *"Your account has been suspended. Please contact bank administration."*
- **Postconditions:**
  - An active session record is persisted in the session database.
  - The user browser stores the secure session cookie.
- **Related Functional Requirements:** FR-02.

---

### UC-03: User Logout

- **Use Case ID:** UC-03
- **Use Case Name:** User Logout
- **Primary Actor:** Customer, Bank Employee, Bank Admin
- **Secondary Actors:** Session Store
- **Preconditions:**
  1. The user is currently authenticated with an active session.
- **Trigger:** The user clicks the "Sign Out" or "Logout" button on the navigation bar.
- **Main Success Scenario:**
  1. The user clicks "Logout".
  2. The client sends a POST request to `/api/auth/logout`.
  3. The backend invokes `req.session.destroy()` to remove the session entry from the SQLite session store.
  4. The backend clears the client session cookie (`connect.sid`).
  5. The backend returns HTTP 200 OK with a confirmation message.
  6. The client purges any locally cached user metadata and redirects the browser to `/index.html` with a message *"You have been logged out securely."*
- **Alternative Flows:** None.
- **Exception Flows:**
  - **3a. Session Already Expired / Missing:**
    - If the session had already expired, the backend returns HTTP 200 and the client cleanly redirects to the login screen.
- **Postconditions:**
  - The session record is completely eradicated from server persistence.
  - The client cookie is invalidated.
- **Related Functional Requirements:** FR-03.

---

### UC-04: Check Account Balance & Details

- **Use Case ID:** UC-04
- **Use Case Name:** Check Account Balance & Details
- **Primary Actor:** Customer
- **Secondary Actors:** Database Engine
- **Preconditions:**
  1. The customer is authenticated and holds an active session.
- **Trigger:** The customer navigates to the Dashboard or Balance page.
- **Main Success Scenario:**
  1. The customer loads the dashboard page (`/dashboard.html`).
  2. The page script issues an authorized GET request to `/api/accounts/me`.
  3. The authentication middleware validates the session cookie and extracts the customer's `userId`.
  4. The backend queries the `accounts` table for the record belonging to `userId`.
  5. The backend converts the stored balance (in integer paise) into Indian Rupees (₹) with 2 decimal places (`balanceRupees = (balancePaise / 100).toFixed(2)`).
  6. The backend returns HTTP 200 OK containing: Account Number (e.g., `TV10000001`), Account Holder Name, Account Type (`SAVINGS`), Available Balance in ₹, Account Status (`ACTIVE`), and Branch IFSC (`TVIN000101`).
  7. The client renders the metrics in high-visibility summary cards formatted according to Indian numbering standards (e.g., `₹ 2,45,500.00`).
- **Alternative Flows:** None.
- **Exception Flows:**
  - **3a. Session Invalid / Expired (HTTP 401):**
    - The system intercepts the call, redirects to `/index.html`, and displays *"Session expired. Please log in again."*
  - **4a. Account Not Found for User (HTTP 404):**
    - The backend returns an error if no linked account exists for the user ID.
- **Postconditions:**
  - The customer has viewed their current financial standing without altering any database state.
- **Related Functional Requirements:** FR-04, FR-05.

---

### UC-05: Deposit Funds

- **Use Case ID:** UC-05
- **Use Case Name:** Deposit Funds
- **Primary Actor:** Customer
- **Secondary Actors:** Database Engine (SQLite)
- **Preconditions:**
  1. The customer is authenticated and holds an active session.
  2. The customer's linked bank account is in `ACTIVE` status.
- **Trigger:** The customer navigates to the Deposit page (`/deposit.html`), inputs an amount, and clicks "Confirm Deposit".
- **Main Success Scenario:**
  1. The customer enters the deposit amount in Indian Rupees (e.g., `₹ 10,000.00`) and optional notes.
  2. The client-side script validates that the entered amount is a positive number between ₹100.00 and ₹5,00,000.00.
  3. The customer clicks "Proceed with Deposit".
  4. The client dispatches a POST request to `/api/transactions/deposit` with `{ amount: 10000.00 }`.
  5. The backend authentication middleware validates the session.
  6. The backend retrieves the customer's account and verifies its status is `ACTIVE`.
  7. The backend converts the deposit amount to integer paise: `10000 * 100 = 1,000,000 paise`.
  8. The backend generates a unique transaction reference ID (e.g., `TXN-DEP-20261014-98412`).
  9. The backend opens a database transaction and executes:
     - Updates `accounts` table: `balance = balance + 1000000`, `updated_at = CURRENT_TIMESTAMP`.
     - Inserts a record in `transactions`: `sender_account_id = NULL`, `recipient_account_id = account.id`, `type = 'DEPOSIT'`, `amount = 1000000`, `balance_after = new_balance`, `status = 'SUCCESS'`.
  10. The backend commits the database transaction.
  11. The backend returns HTTP 200 OK with the reference ID, new balance in ₹, and timestamp.
  12. The client renders an electronic receipt with green success badges and updates the displayed balance.
- **Alternative Flows:** None.
- **Exception Flows:**
  - **2a. Invalid Amount Format / Boundary Breach (HTTP 400):**
    - The user inputs an amount less than ₹100, greater than ₹5,00,000, or negative/non-numeric.
    - The backend rejects the request: *"Deposit amount must be between ₹100.00 and ₹5,00,000.00."*
  - **6a. Account Suspended / Inactive (HTTP 403):**
    - The customer account is `BLOCKED` or `CLOSED`.
    - The system returns: *"Deposit rejected: Account is inactive or frozen."*
  - **9a. Database Failure During Deposit (HTTP 500):**
    - SQLite encounters a write contention error. The transaction rolls back automatically.
    - The system returns: *"Deposit could not be processed. Your balance was not altered."*
- **Postconditions:**
  - The customer's account balance in `accounts` is incremented by the deposit amount.
  - An immutable `DEPOSIT` record exists in `transactions`.
- **Related Functional Requirements:** FR-06, FR-09.

---

### UC-06: Transfer Funds (Comprehensive Multi-Path Analysis)

- **Use Case ID:** UC-06
- **Use Case Name:** Transfer Funds
- **Primary Actor:** Customer (Sender)
- **Secondary Actors:** Recipient Customer, Database Engine (SQLite Transaction Manager)
- **Preconditions:**
  1. The sender is authenticated with an active session.
  2. The sender's account status is `ACTIVE`.
  3. The sender has sufficient available funds in their account.
- **Trigger:** The customer fills the transfer form on `/transfer.html` and clicks "Authorize Transfer".
- **Main Success Scenario:**
  1. The sender navigates to the fund transfer page.
  2. The system displays the sender's account number and current available balance in ₹.
  3. The sender inputs the Recipient Account Number (e.g., `TV10000002`), the Transfer Amount in ₹ (e.g., `₹ 2,500.00`), and an optional Remark (e.g., "Project Equipment Reimbursement").
  4. The sender clicks "Authorize Transfer".
  5. The client submits a POST request to `/api/transactions/transfer`.
  6. The backend authentication middleware validates the sender's session and retrieves `senderUserId`.
  7. The backend queries the `accounts` table for the sender's account. It confirms:
     - The sender account exists.
     - The sender account status is `ACTIVE`.
  8. The backend verifies that the recipient account number is NOT identical to the sender's account number (`senderAccount.account_number !== recipientAccountNumber`).
  9. The backend queries the `accounts` table for the recipient account using `recipientAccountNumber`. It confirms:
     - The recipient account exists.
     - The recipient account status is `ACTIVE`.
  10. The backend validates that the transfer amount is within allowed institutional limits (between ₹100.00 and ₹2,00,000.00).
  11. The backend converts the amount to integer paise: `2500 * 100 = 250,000 paise`.
  12. The backend evaluates whether the sender's available balance in paise satisfies: `sender.balance >= amountPaise`.
  13. The backend generates a unique transaction reference ID (`TXN-TRF-20261014-XXXXX`).
  14. The backend initiates an atomic database transaction (`db.transaction(...)` with `BEGIN IMMEDIATE`):
      a. Decrements the sender's balance by `250,000 paise` in `accounts`.
      b. Increments the recipient's balance by `250,000 paise` in `accounts`.
      c. Inserts an immutable audit record in `transactions` capturing `reference_id`, `sender_account_id`, `recipient_account_id`, `transaction_type = 'TRANSFER'`, `amount = 250000`, `balance_after = sender_new_balance`, `status = 'SUCCESS'`, and `description`.
  15. The database transaction commits successfully.
  16. The backend returns HTTP 200 OK with the transaction reference, debited amount, new sender balance, recipient account number, and timestamp.
  17. The frontend renders an electronic debit advice / transfer confirmation receipt, and prompts the user to download or return to dashboard.

- **Alternative Flows:**
  - **4a. User Cancels on Confirmation Modal:**
    - If a confirmation modal is presented, the user clicks "Cancel". The form remains populated, and no network request is dispatched.

- **Exception Flows:**
  - **8a. Same Account Transfer Attempt (BR-09 Violation - HTTP 400 Bad Request):**
    - The backend detects that `recipientAccountNumber === senderAccount.account_number`.
    - The system aborts execution prior to opening any database transaction.
    - The backend returns HTTP 400 Bad Request:
      `{ "success": false, "error": { "code": "SELF_TRANSFER_PROHIBITED", "message": "You cannot transfer funds to your own account. Please specify a different recipient account." } }`
    - The frontend highlights the recipient account field in red and renders an alert banner.
  
  - **9a. Invalid Beneficiary Account (Account Does Not Exist - HTTP 404 Not Found):**
    - The recipient account number query returns zero matching records.
    - The backend halts the workflow.
    - The backend returns HTTP 404 Not Found:
      `{ "success": false, "error": { "code": "BENEFICIARY_NOT_FOUND", "message": "The beneficiary account number 'TV99999999' does not exist in TrustVault records. Please verify the account number." } }`
    - The frontend displays an error modal: *"Recipient account not found. Please verify the 10-digit TV account number."*
  
  - **9b. Inactive or Frozen Beneficiary Account (BR-10 / BR-14 Violation - HTTP 400 Bad Request):**
    - The recipient account exists, but its status is `BLOCKED` or `CLOSED`.
    - The backend halts processing.
    - The backend returns HTTP 400 Bad Request:
      `{ "success": false, "error": { "code": "BENEFICIARY_INACTIVE", "message": "The beneficiary account is currently suspended or closed and cannot receive inward remittances." } }`

  - **10a. Amount Exceeds Maximum or Minimum Limits (BR-13 Violation - HTTP 400 Bad Request):**
    - The transfer amount is less than ₹100.00 or exceeds the single transaction ceiling of ₹2,00,000.00.
    - The backend returns HTTP 400 Bad Request:
      `{ "success": false, "error": { "code": "LIMIT_EXCEEDED", "message": "Transfer amount must be between ₹ 100.00 and ₹ 2,00,000.00 per transaction." } }`

  - **12a. Insufficient Sender Balance (BR-11 Violation - HTTP 400 Bad Request):**
    - The sender's current balance is less than the requested transfer amount (e.g., sender has ₹1,200.00, attempts to transfer ₹2,500.00).
    - The backend prevents transaction initiation.
    - The backend returns HTTP 400 Bad Request:
      `{ "success": false, "error": { "code": "INSUFFICIENT_FUNDS", "message": "Transfer failed: Insufficient balance. Your available balance is ₹ 1,200.00, which cannot cover the requested transfer of ₹ 2,500.00." } }`
    - The frontend displays an insufficient funds alert and maintains the existing balance display unchanged.

  - **14a. Database Transaction Failure & Rollback Flow (HTTP 500 Internal Server Error):**
    - An unexpected error occurs midway through database execution (e.g., disk I/O lock, SQLite constraint violation during recipient credit, or process interrupt).
    - The `db.transaction()` block catches the error and executes an automatic and complete `ROLLBACK`.
    - Neither the sender nor the recipient accounts suffer any debit or credit.
    - The backend logs the detailed internal database stack trace to server error logs for engineering audit.
    - The backend returns HTTP 500 Internal Server Error:
      `{ "success": false, "error": { "code": "TRANSACTION_ROLLBACK", "message": "An unexpected error occurred while processing your transfer. The transaction was aborted and no funds were deducted from your account. Please try again." } }`
    - The frontend displays a high-visibility warning: *"Transfer Aborted. Your balance was completely preserved. Please retry shortly."*

- **Postconditions:**
  - Upon success: The sender's balance is debited by the exact amount in paise.
  - Upon success: The recipient's balance is credited by the exact amount in paise.
  - Upon success: A new transaction log entry with status `SUCCESS` is recorded.
  - Upon failure: Zero balances are modified; total institutional funds remain exactly unchanged.
- **Related Functional Requirements:** FR-08, FR-09, NFR-04, NFR-05.

---

### UC-07: Withdraw Funds

- **Use Case ID:** UC-07
- **Use Case Name:** Withdraw Funds
- **Primary Actor:** Customer
- **Secondary Actors:** Database Engine
- **Preconditions:**
  1. The customer is authenticated.
  2. The customer's account status is `ACTIVE`.
  3. The customer has a positive balance equal to or greater than the withdrawal request.
- **Trigger:** The customer enters an amount on `/withdraw.html` and clicks "Submit Withdrawal".
- **Main Success Scenario:**
  1. The customer loads the withdrawal page.
  2. The customer enters the requested withdrawal amount in ₹ (e.g., `₹ 3,000.00`).
  3. The client verifies that the input is between ₹100.00 and ₹50,000.00.
  4. The client issues a POST request to `/api/transactions/withdraw`.
  5. The backend checks that the customer's account is `ACTIVE`.
  6. The backend converts the amount to integer paise (`3000 * 100 = 300,000 paise`).
  7. The backend verifies that `account.balance >= 300000 paise`.
  8. The backend executes an atomic balance deduction and records a `WITHDRAWAL` transaction entry with status `SUCCESS`.
  9. The backend returns HTTP 200 OK with remaining balance and transaction receipt.
  10. The UI renders the cash withdrawal confirmation voucher.
- **Alternative Flows:** None.
- **Exception Flows:**
  - **7a. Insufficient Balance (HTTP 400 Bad Request):**
    - The requested withdrawal exceeds current balance.
    - The backend returns: *"Insufficient funds for withdrawal. Available balance: ₹ [Balance]."*
  - **3a. Limit Exceeded (HTTP 400):**
    - The requested amount exceeds the per-transaction cap of ₹50,000.00.
    - System rejects with: *"Maximum single withdrawal limit is ₹ 50,000.00."*
- **Postconditions:**
  - The customer's balance is decremented by the requested amount.
  - A `WITHDRAWAL` transaction is recorded.
- **Related Functional Requirements:** FR-07, FR-09.

---

### UC-08: View Transaction History

- **Use Case ID:** UC-08
- **Use Case Name:** View Transaction History
- **Primary Actor:** Customer, Bank Employee
- **Secondary Actors:** Database Engine
- **Preconditions:**
  1. The user is authenticated.
  2. If Customer: Can only view transactions associated with their own account.
  3. If Employee: Can query transactions across all customer accounts.
- **Trigger:** The user selects the "Transactions" or "Statement" menu option.
- **Main Success Scenario:**
  1. The user opens the transaction history view (`/transactions.html`).
  2. The frontend sends a GET request to `/api/transactions/me` (or `/api/admin/transactions` if Employee).
  3. The backend extracts query parameters for filtering (`type`, `startDate`, `endDate`, `limit`, `offset`).
  4. The backend queries the `transactions` table with corresponding filter clauses and orders results by `created_at DESC`.
  5. The backend formats every monetary amount from paise to Indian Rupees with Indian comma separators.
  6. The backend returns HTTP 200 OK with the array of transactions and pagination totals.
  7. The frontend renders an interactive data table with color-coded badges (Green for Inward/Deposit/Credit, Red for Outward/Withdrawal/Debit).
- **Alternative Flows:**
  - **4a. Filter by Transaction Type:** The user filters by "DEPOSIT", "WITHDRAWAL", or "TRANSFER". The UI updates dynamically without full page reload.
- **Exception Flows:**
  - **4b. No Matching Records:** If zero records match, the table displays a friendly empty state: *"No transactions found for the selected period."*
- **Postconditions:**
  - Historical ledger displayed without modifying database state.
- **Related Functional Requirements:** FR-09, FR-13.

---

### UC-09: Apply for Loan

- **Use Case ID:** UC-09
- **Use Case Name:** Apply for Loan
- **Primary Actor:** Customer
- **Secondary Actors:** Database Engine
- **Preconditions:**
  1. The customer is authenticated.
  2. The customer has an active savings account in good standing.
  3. The customer does not already have an active loan application in `PENDING` status.
- **Trigger:** The customer fills out the loan application form on `/loans.html` and clicks "Submit Application".
- **Main Success Scenario:**
  1. The customer opens the loan application screen.
  2. The customer selects the Loan Category (`PERSONAL`, `HOME`, or `EDUCATION`).
  3. The customer specifies the Loan Principal Amount in ₹ (e.g., `₹ 2,00,000.00`), Repayment Tenure (e.g., `24 months`), Stated Monthly Net Income (e.g., `₹ 45,000.00`), and Purpose of Loan.
  4. The client validates that the principal amount is between ₹10,000 and ₹10,00,000, and tenure is between 6 and 120 months.
  5. The customer submits the application.
  6. The client sends a POST request to `/api/loans`.
  7. The backend checks that the customer has zero concurrent applications with status `PENDING`.
  8. The backend converts monetary values to paise.
  9. The backend inserts a new record into `loan_applications` with initial status `PENDING`.
  10. The backend returns HTTP 201 Created with the generated loan ID and submission confirmation.
  11. The frontend notifies the customer that their application is under administrative review and redirects to `/loan-status.html`.
- **Alternative Flows:** None.
- **Exception Flows:**
  - **7a. Existing Pending Application (BR-17 Violation - HTTP 400 Bad Request):**
    - The customer already has an unadjudicated loan application.
    - System returns: *"You already have a loan application under review. Please await administrative adjudication before applying again."*
  - **4a. Amount Boundary Violation (BR-16 Violation - HTTP 400):**
    - Principal is below ₹10,000 or above ₹10,00,000. System rejects with boundary error.
- **Postconditions:**
  - A new loan application record in `PENDING` state is stored in `loan_applications`.
- **Related Functional Requirements:** FR-10.

---

### UC-10: Track Loan Status

- **Use Case ID:** UC-10
- **Use Case Name:** Track Loan Status
- **Primary Actor:** Customer
- **Secondary Actors:** Database Engine
- **Preconditions:**
  1. The customer is authenticated.
- **Trigger:** The customer navigates to `/loan-status.html`.
- **Main Success Scenario:**
  1. The customer opens the loan status tracking view.
  2. The client sends an authorized GET request to `/api/loans/me`.
  3. The backend queries `loan_applications` where `user_id = req.session.user.id`, ordered by `created_at DESC`.
  4. The backend returns HTTP 200 OK with all customer loan applications.
  5. The client renders each application with status badges:
     - `PENDING`: Yellow badge (*"Under Administrative Review"*)
     - `APPROVED`: Green badge (*"Approved by Bank Administration"*)
     - `REJECTED`: Red badge (*"Declined"* along with administrator remarks)
- **Alternative Flows:** None.
- **Exception Flows:** None (Empty state rendered if no applications exist).
- **Postconditions:**
  - The customer has inspected their loan status.
- **Related Functional Requirements:** FR-11.

---

### UC-11: Manage Customer Accounts

- **Use Case ID:** UC-11
- **Use Case Name:** Manage Customer Accounts
- **Primary Actor:** Bank Employee, Bank Admin / Manager
- **Secondary Actors:** Database Engine
- **Preconditions:**
  1. The user is authenticated with `employee` or `admin` role.
- **Trigger:** The staff member opens the customer management interface (`/admin-customers.html`).
- **Main Success Scenario:**
  1. The staff member navigates to the customer management screen.
  2. The client sends a GET request to `/api/admin/customers`.
  3. The backend RBAC middleware verifies that the user role is `employee` or `admin`.
  4. The backend queries `users` joined with `accounts`, retrieving customer names, emails, phone numbers, account numbers, balances, and operational statuses.
  5. The backend returns HTTP 200 OK with the customer catalog.
  6. The staff member searches for a customer by account number or email using the search filter.
  7. The client dynamically filters the view.
  8. *(Admin Only Flow)*: If the user is an Admin, status toggle controls are rendered allowing the Admin to switch status between `ACTIVE`, `BLOCKED`, and `CLOSED`.
- **Alternative Flows:**
  - **8a. Admin Blocks an Account:**
    - The Admin selects "Block Account" for a customer.
    - Admin provides a justification reason.
    - Client sends PATCH to `/api/admin/accounts/:id/status` with `{ status: "BLOCKED", reason }`.
    - Backend updates the status in `accounts` and records an entry in `audit_logs`.
    - Account is immediately prevented from performing monetary operations.
- **Exception Flows:**
  - **3a. Unauthorized Access (HTTP 403 Forbidden):**
    - A standard customer attempts to query `/api/admin/customers`.
    - Backend blocks request with HTTP 403 Forbidden.
- **Postconditions:**
  - Staff has viewed customer ledgers, and any administrative status change is committed to the database and audit trail.
- **Related Functional Requirements:** FR-12, FR-16.

---

### UC-12: Review and Adjudicate Loans

- **Use Case ID:** UC-12
- **Use Case Name:** Review and Adjudicate Loans
- **Primary Actor:** Bank Employee (Reviewer), Bank Admin / Manager (Adjudicator)
- **Secondary Actors:** Database Engine, Audit Logger
- **Preconditions:**
  1. The staff member is authenticated with `employee` or `admin` role.
  2. One or more loan applications exist in `PENDING` status.
- **Trigger:** Staff member navigates to `/admin-loans.html`.
- **Main Success Scenario:**
  1. Staff member opens the loan management console.
  2. The client fetches loan applications via `GET /api/admin/loans`.
  3. The backend returns all pending and past loan applications joined with applicant names and accounts.
  4. The staff member selects a pending loan to review applicant's monthly income, loan amount, and proposed tenure.
  5. The system displays the applicant's Debt-to-Income and repayment ratio for evaluation.
  6. *(Adjudication Step - Admin Only)*:
     - The Bank Admin decides to approve or reject the loan.
     - The Admin clicks "Approve" or "Reject" and enters official remarks (e.g., "Income criteria satisfied; documentation verified").
     - The client sends a PATCH request to `/api/admin/loans/:id/decision` with `{ decision: "APPROVED", adminRemarks: "..." }`.
  7. The backend validates the admin role.
  8. The backend updates the loan record: `status = 'APPROVED'`, `admin_remarks = remarks`, `decision_date = CURRENT_TIMESTAMP`.
  9. The backend logs the decision event into `audit_logs`.
  10. The backend returns HTTP 200 OK.
  11. The frontend updates the loan row status to Approved.
- **Alternative Flows:**
  - **6a. Admin Rejects the Application:**
    - Admin enters rejection rationale (e.g., "Monthly income insufficient for requested principal") and confirms rejection.
    - Backend sets status to `REJECTED`.
- **Exception Flows:**
  - **6b. Non-Admin Attempts Final Decision (HTTP 403 Forbidden):**
    - A Bank Employee attempts to invoke the decision endpoint.
    - System rejects the action with: *"Access denied: Only bank administrators may approve or reject loan applications."*
- **Postconditions:**
  - The loan application state transitions definitively from `PENDING` to `APPROVED` or `REJECTED`.
  - An audit log entry is permanently recorded.
- **Related Functional Requirements:** FR-14, FR-15.

---

### UC-13: Generate Reports and View Analytics

- **Use Case ID:** UC-13
- **Use Case Name:** Generate Reports and View Analytics
- **Primary Actor:** Bank Admin / Manager
- **Secondary Actors:** Database Engine
- **Preconditions:**
  1. The user is authenticated with `admin` role.
- **Trigger:** The Admin accesses the Management Dashboard (`/admin.html`) or Reports view (`/admin-reports.html`).
- **Main Success Scenario:**
  1. The Admin opens the administrative analytics console.
  2. The client sends a GET request to `/api/admin/dashboard` and `/api/admin/reports`.
  3. The backend queries aggregate database metrics:
     - Total registered customers.
     - Total open savings accounts.
     - Aggregate deposit volume across all accounts in paise (converted to ₹).
     - Breakdown of loans (Pending, Approved, Rejected).
     - 24-hour transaction volume and transaction count.
  4. The backend returns HTTP 200 OK with the analytical data payload.
  5. The client renders visual KPI cards, summary charts, and tabular transaction breakdowns.
  6. The Admin selects a reporting period and clicks "Generate Statement Summary".
  7. The system formats and displays the institution-level statement for review.
- **Alternative Flows:** None.
- **Exception Flows:**
  - **3a. Access Control Breach (HTTP 403):** Non-admin users are prevented from executing analytical queries.
- **Postconditions:**
  - Institutional performance reports and KPIs rendered cleanly.
- **Related Functional Requirements:** FR-17, FR-18.

---
*End of TrustVault Detailed Use Case Specifications (TV-UCS-2026-V1.0)*
