# Requirements Traceability Matrix (RTM)
## TrustVault — Banking Management System
### Standard: Bidirectional Requirements Traceability Specification

---

| Document Attribute | Details |
| :--- | :--- |
| **System Name** | TrustVault Banking Management System |
| **Document Identifier** | TV-RTM-2026-V1.0 |
| **Version** | Version 1.0 |
| **Date** | October 14, 2026 |
| **Academic Department** | Computer Science and Engineering (Data Science) |
| **Academic Level** | 2nd Year B.Tech Software Engineering |
| **Scope** | Complete mapping of Functional Requirements (FR-01 to FR-18) to Use Cases, Diagrams, Source Modules, and Test Cases |

---

## 1. Overview and Purpose
The **Requirements Traceability Matrix (RTM)** guarantees bidirectional traceability across the complete software engineering lifecycle for TrustVault. It establishes verifiable linkages ensuring that:
1. **Forward Traceability:** Every documented user and business requirement is realized in system architecture, captured in UML/DFD models, implemented in code artifacts, and validated by explicit test cases.
2. **Backward Traceability:** Every source code implementation module and automated test case can be directly justified by an authorized functional requirement, preventing scope creep and unverified code paths.

---

## 2. Requirements Traceability Matrix Table

| FR ID | Requirement Description | Use Case | Architectural & Behavioral Diagram(s) | Implementation File(s) | Test Case ID(s) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | User Registration with automated TV account generation | UC-01 | `use-case.puml`<br>`dfd-level-1.puml`<br>`class-diagram.puml`<br>`er-diagram.puml` | `src/routes/auth.js`<br>`src/controllers/authController.js`<br>`src/services/authService.js`<br>`src/repositories/userRepository.js`<br>`src/repositories/accountRepository.js`<br>`public/register.html`<br>`public/js/auth.js` | TC-01<br>TC-02<br>TC-03<br>TC-04<br>TC-05 | Implemented & Verified |
| **FR-02** | User Authentication & Role-Based Access Control | UC-02 | `use-case.puml`<br>`state-session.puml`<br>`class-diagram.puml` | `src/routes/auth.js`<br>`src/controllers/authController.js`<br>`src/services/authService.js`<br>`src/middleware/auth.js`<br>`public/index.html`<br>`public/js/auth.js` | TC-06<br>TC-07<br>TC-08<br>TC-09<br>TC-10 | Implemented & Verified |
| **FR-03** | User Logout & Session Invalidation | UC-03 | `use-case.puml`<br>`state-session.puml` | `src/routes/auth.js`<br>`src/controllers/authController.js`<br>`src/middleware/auth.js`<br>`public/js/auth.js` | TC-11<br>TC-12 | Implemented & Verified |
| **FR-04** | Account Balance Inquiry (in ₹ and integer paise) | UC-04 | `use-case.puml`<br>`dfd-level-1.puml`<br>`architecture.puml` | `src/routes/accounts.js`<br>`src/controllers/accountController.js`<br>`src/services/accountService.js`<br>`src/repositories/accountRepository.js`<br>`public/dashboard.html`<br>`public/js/dashboard.js` | TC-13<br>TC-14 | Implemented & Verified |
| **FR-05** | Account Details Retrieval (Account #, Type, Status) | UC-04 | `use-case.puml`<br>`state-account.puml`<br>`class-diagram.puml` | `src/routes/accounts.js`<br>`src/controllers/accountController.js`<br>`src/repositories/accountRepository.js`<br>`public/dashboard.html`<br>`public/js/dashboard.js` | TC-15<br>TC-16 | Implemented & Verified |
| **FR-06** | Simulated Cash Deposit with Boundary Validation | UC-05 | `use-case.puml`<br>`dfd-level-1.puml`<br>`dfd-level-2.puml`<br>`er-diagram.puml` | `src/routes/transactions.js`<br>`src/controllers/transactionController.js`<br>`src/services/transactionService.js`<br>`src/repositories/transactionRepository.js`<br>`public/deposit.html`<br>`public/js/deposit.js` | TC-17<br>TC-18<br>TC-19<br>TC-20 | Implemented & Verified |
| **FR-07** | Simulated Cash Withdrawal with Anti-Overdraft Checks | UC-07 | `use-case.puml`<br>`dfd-level-1.puml`<br>`dfd-level-2.puml`<br>`er-diagram.puml` | `src/routes/transactions.js`<br>`src/controllers/transactionController.js`<br>`src/services/transactionService.js`<br>`src/repositories/transactionRepository.js`<br>`public/withdraw.html`<br>`public/js/withdraw.js` | TC-21<br>TC-22<br>TC-23<br>TC-24 | Implemented & Verified |
| **FR-08** | Atomic Inter-Account Fund Transfer with Rollback | UC-06 | `use-case.puml`<br>`activity-transfer.puml`<br>`swimlane-transfer.puml`<br>`sequence-transfer.puml`<br>`dfd-level-2.puml` | `src/routes/transactions.js`<br>`src/controllers/transactionController.js`<br>`src/services/transactionService.js`<br>`src/repositories/accountRepository.js`<br>`src/repositories/transactionRepository.js`<br>`public/transfer.html`<br>`public/js/transfer.js` | TC-25<br>TC-26<br>TC-27<br>TC-28<br>TC-29<br>TC-30 | Implemented & Verified |
| **FR-09** | Transaction History Retrieval & Multi-Criteria Filtering | UC-08 | `use-case.puml`<br>`dfd-level-1.puml`<br>`er-diagram.puml` | `src/routes/transactions.js`<br>`src/controllers/transactionController.js`<br>`src/repositories/transactionRepository.js`<br>`public/transactions.html`<br>`public/js/transactions.js` | TC-31<br>TC-32<br>TC-33 | Implemented & Verified |
| **FR-10** | Customer Loan Application Submission | UC-09 | `use-case.puml`<br>`dfd-level-1.puml`<br>`class-diagram.puml`<br>`er-diagram.puml` | `src/routes/loans.js`<br>`src/controllers/loanController.js`<br>`src/services/loanService.js`<br>`src/repositories/loanRepository.js`<br>`public/loans.html`<br>`public/js/loans.js` | TC-34<br>TC-35<br>TC-36 | Implemented & Verified |
| **FR-11** | Customer Loan Application Tracking & State Monitoring | UC-10 | `use-case.puml`<br>`dfd-level-1.puml`<br>`er-diagram.puml` | `src/routes/loans.js`<br>`src/controllers/loanController.js`<br>`src/repositories/loanRepository.js`<br>`public/loan-status.html`<br>`public/js/loans.js` | TC-37<br>TC-38 | Implemented & Verified |
| **FR-12** | Employee Customer Account Directory & Search | UC-11 | `use-case.puml`<br>`class-diagram.puml`<br>`architecture.puml` | `src/routes/admin.js`<br>`src/controllers/adminController.js`<br>`src/repositories/userRepository.js`<br>`src/repositories/accountRepository.js`<br>`public/admin-customers.html`<br>`public/js/admin.js` | TC-39<br>TC-40 | Implemented & Verified |
| **FR-13** | Employee Institution-Wide Transaction Monitoring | UC-08<br>UC-11 | `use-case.puml`<br>`dfd-level-1.puml` | `src/routes/admin.js`<br>`src/controllers/adminController.js`<br>`src/repositories/transactionRepository.js`<br>`public/admin-transactions.html`<br>`public/js/admin.js` | TC-41<br>TC-42 | Implemented & Verified |
| **FR-14** | Employee Loan Application Review & Verification Notes | UC-12 | `use-case.puml`<br>`class-diagram.puml` | `src/routes/admin.js`<br>`src/controllers/adminController.js`<br>`src/services/loanService.js`<br>`src/repositories/loanRepository.js`<br>`public/admin-loans.html`<br>`public/js/admin.js` | TC-43<br>TC-44 | Implemented & Verified |
| **FR-15** | Admin Loan Adjudication (Final Approval / Rejection) | UC-12 | `use-case.puml`<br>`class-diagram.puml`<br>`er-diagram.puml` | `src/routes/admin.js`<br>`src/controllers/adminController.js`<br>`src/services/loanService.js`<br>`src/repositories/loanRepository.js`<br>`src/repositories/auditRepository.js`<br>`public/admin-loans.html`<br>`public/js/admin.js` | TC-45<br>TC-46 | Implemented & Verified |
| **FR-16** | Admin Account Operational Status Modification | UC-11 | `use-case.puml`<br>`state-account.puml`<br>`er-diagram.puml` | `src/routes/admin.js`<br>`src/controllers/adminController.js`<br>`src/repositories/accountRepository.js`<br>`src/repositories/auditRepository.js`<br>`public/admin-customers.html`<br>`public/js/admin.js` | TC-47<br>TC-48 | Implemented & Verified |
| **FR-17** | Admin Dashboard Institutional Analytics & Metrics | UC-13 | `use-case.puml`<br>`dfd-level-1.puml`<br>`architecture.puml` | `src/routes/admin.js`<br>`src/controllers/adminController.js`<br>`src/services/adminService.js`<br>`public/admin.html`<br>`public/js/admin.js` | TC-49<br>TC-50 | Implemented & Verified |
| **FR-18** | Admin Reporting & System Security Audit Logging | UC-13 | `use-case.puml`<br>`dfd-level-1.puml`<br>`er-diagram.puml` | `src/routes/admin.js`<br>`src/controllers/adminController.js`<br>`src/repositories/auditRepository.js`<br>`public/admin-reports.html`<br>`public/js/admin.js` | TC-51<br>TC-52 | Implemented & Verified |

---

## 3. Verification & Traceability Summary Metrics

- **Total Functional Requirements:** 18 (FR-01 to FR-18)
- **Use Case Coverage:** 100% (All 18 FRs mapped to UC-01 through UC-13)
- **Architectural Diagram Coverage:** 100% (All 18 FRs represented across 13 PlantUML diagrams)
- **Implementation File Linkage:** 100% (Every FR tied to backend routes, controllers, services, repositories, and UI views)
- **Test Case Coverage:** 100% (52 discrete test cases directly validating FR-01 through FR-18)

---
*End of TrustVault Requirements Traceability Matrix (TV-RTM-2026-V1.0)*
