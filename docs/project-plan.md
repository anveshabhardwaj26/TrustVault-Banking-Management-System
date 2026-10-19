# Project Management Plan & Engineering Estimation
## TrustVault — Banking Management System
### Academic Software Engineering Project Plan

---

| Document Attribute | Details |
| :--- | :--- |
| **System Name** | TrustVault Banking Management System |
| **Document Identifier** | TV-PMP-2026-V1.0 |
| **Version** | Version 1.0 |
| **Date** | October 14, 2026 |
| **Academic Focus** | 2nd Year B.Tech Computer Science and Engineering (Data Science) |
| **Project Authors** | Team Member A (Team Lead, UI/UX, QA) & Team Member B (Backend Architect, DB Lead) |
| **Methodology** | Iterative Agile / Hybrid Waterfall-Scrum Model |

---

## 1. Project Scope Statement

### 1.1 Project Vision
The TrustVault Banking Management System delivers a full-stack, transparent, and resilient web-based simulated retail banking platform. The project is created as an academic capstone for second-year undergraduate Computer Science students to apply core Software Engineering principles—including IEEE 830 requirement modeling, multi-layered architecture, strict ACID-compliant database design, and end-to-end verification.

### 1.2 Included Deliverables
- Fully functional 4-layer web application (Node.js, Express.js, SQLite, Vanilla HTML5/CSS3/JS).
- Database schema with automatic initialization, foreign key constraints, and seed data.
- Complete IEEE 830 Software Requirements Specification (`srs.md`).
- Detailed Cockburn-style Use Case Specifications (`use-cases.md`).
- Comprehensive Requirements Traceability Matrix (`traceability-matrix.md`).
- 13 formal PlantUML architectural, behavioral, and structural diagrams (`docs/diagrams/`).
- IEEE 829 Software Test Plan, 52 Detailed Test Cases, and Test Report (`docs/testing/`).
- Comprehensive Final Project Technical Report (`final-report.md`).

### 1.3 Exclusions & Constraints
- Excluded: Integration with real central banking clearance gateways (RBI/NEFT/RTGS), live credit scoring APIs, or physical ATM hardware.
- Constraints: Localized academic execution environment, zero external paid cloud dependencies, strict monetary storage in integer paise.

---

## 2. Work Breakdown Structure (WBS)

The project work is decomposed hierarchically into five primary engineering work packages:

```
1.0 TrustVault Banking Management System
├── 1.1 Requirements Engineering & Analysis
│   ├── 1.1.1 Stakeholder Analysis & Actor Identification
│   ├── 1.1.2 Functional & Non-Functional Requirements Definition (FR-01 to FR-18, NFR-01 to NFR-10)
│   ├── 1.1.3 Business Rules Formulation (BR-01 to BR-20)
│   └── 1.1.4 Requirements Traceability Matrix (RTM) Formulation
├── 1.2 System Architecture & UML Modeling
│   ├── 1.2.1 4-Layer Architectural Design
│   ├── 1.2.2 Behavioral Modeling (Use Case, Activity, Sequence, Swimlane, State)
│   ├── 1.2.3 Structural Modeling (Class Diagram, Deployment Diagram)
│   ├── 1.2.4 Data Flow Modeling (DFD Level 0, Level 1, Level 2)
│   └── 1.2.5 Relational Database Schema & ER Diagram Design
├── 1.3 Full-Stack Implementation
│   ├── 1.3.1 Database Initialization, Migrations & Demo Seeding
│   ├── 1.3.2 Data Access Layer (Repositories: User, Account, Transaction, Loan, Audit)
│   ├── 1.3.3 Business Services (Auth, Account, Transaction Atomicity, Loans)
│   ├── 1.3.4 Security & Routing Middleware (Bcrypt, Session, Role Guards)
│   └── 1.3.5 Frontend UI Development (Customer Views, Admin Views, CSS Design)
├── 1.4 Quality Assurance & Testing
│   ├── 1.4.1 Test Plan (STP) Formulation
│   ├── 1.4.2 Test Case Authoring (52 Test Cases across 8 Categories)
│   ├── 1.4.3 Automated Integration & Unit Test Implementation (Jest, Supertest)
│   ├── 1.4.4 Edge-Case, Boundary & Security Penetration Validation
│   └── 1.4.5 Final Test Execution Reporting & Defect Resolution
└── 1.5 Academic Project Documentation & Reporting
    ├── 1.5.1 Software Requirements Specification (IEEE 830 Compliant)
    ├── 1.5.2 Comprehensive Final Project Report
    └── 1.5.3 Demonstration Scripts & Presentation Setup
```

---

## 3. Team Task Allocation Matrix

The responsibilities are balanced across the two-person engineering team according to their technical specializations:

| Work Package / Task Module | Team Member A (Lead Analyst, UI/UX, QA) | Team Member B (Backend Architect, DB Lead) |
| :--- | :---: | :---: |
| **Requirements Gathering & IEEE 830 SRS** | **Primary Lead** (Authoring & Structuring) | Contributing Reviewer (API & Data constraints) |
| **Use Case Specifications (UC-01 to UC-13)** | **Primary Lead** (Flow analysis & UX paths) | Contributing Reviewer (Rollback & DB logic) |
| **UML Behavioral Diagrams (Use Case, Activity, Sequence)**| **Primary Lead** | Contributing Reviewer |
| **Database Design & ER Modeling** | Contributing Reviewer (Entity rules) | **Primary Lead** (Schema, Keys, Constraints, WAL) |
| **Data Flow Diagrams (DFD Level 0, 1, 2)** | Joint Collaboration | Joint Collaboration |
| **Backend API, Routing & Services** | Contributing Reviewer | **Primary Lead** (Express, Services, Controllers) |
| **Data Access Layer & Atomic Transactions** | Contributing Reviewer | **Primary Lead** (better-sqlite3, Rollback wrappers) |
| **Frontend UI/UX (HTML5, CSS3, JS Client)** | **Primary Lead** (Layouts, responsive cards, forms) | Contributing Reviewer (API integration) |
| **Testing Strategy, Test Plan & Test Cases** | **Primary Lead** (STP, Manual & Acceptance tests) | **Co-Lead** (Automated Jest/Supertest scripts) |
| **Requirements Traceability Matrix (RTM)** | **Primary Lead** | Contributing Reviewer |
| **Final Project Report Authoring** | **Joint Collaboration (50%)** | **Joint Collaboration (50%)** |

---

## 4. Development Milestones & Schedule

The project spans a standard 12-week academic semester schedule:

| Milestone ID | Milestone Description | Target Week | Deliverables Produced | Status |
| :---: | :--- | :---: | :--- | :---: |
| **M-01** | Project Conception & Requirements Baseline | Week 2 | Initial SRS Draft, Actor definitions, BR-01 to BR-20 | Completed |
| **M-02** | System Design & UML Architecture Sign-Off | Week 4 | All 13 PlantUML diagrams, ER diagram, Database schema | Completed |
| **M-03** | Core Persistence & Database Layer Completion | Week 6 | SQLite schema, migration script, seed data generator | Completed |
| **M-04** | Backend Services & REST APIs Functional | Week 8 | Express server, Auth service, Atomic Transfer engine | Completed |
| **M-05** | Frontend Client & UI Dashboards Integrated | Week 9 | Customer Portal, Admin Dashboard, Responsive CSS | Completed |
| **M-06** | Test Case Authoring & Execution Completion | Week 11 | Test plan, 52 test cases executed, bug fixes | Completed |
| **M-07** | Final Project Report & Academic Demonstration | Week 12 | Final Report, RTM, Video Demonstration Package | Completed |

---

## 5. Risk Assessment and Management

| Risk ID | Risk Description | Category | Prob. | Impact | Mitigation Strategy |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **RSK-01** | Floating-point inaccuracies leading to financial ledger discrepancy | Technical | High | Critical | Enforce integer `paise` storage across database and calculations (`1 ₹ = 100 paise`). |
| **RSK-02** | Partial database updates during fund transfer power loss / crash | Technical | Med | Critical | Wrap balance operations inside atomic SQLite transactions (`db.transaction()`) with immediate rollback on error. |
| **RSK-03** | Scope creep expanding into real banking integrations | Scope | Med | Med | Clearly define project boundary in SRS: Simulated academic banking only. |
| **RSK-04** | Git merge conflicts between frontend and backend changes | Process | Med | Low | Strict separation of concerns: Frontend in `public/`, backend logic in `src/`. |
| **RSK-05** | Unauthorized access to admin endpoints | Security | Med | High | Enforce role-based access control middleware (`requireRole('admin')`) on all administrative routes. |
| **RSK-06** | Database file locking during concurrent requests | Technical | Low | High | Enable SQLite Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) for non-blocking concurrent reads. |

---

## 6. Version Control and Collaboration Plan

- **Repository Tooling:** Git with GitHub private repository hosting.
- **Branching Strategy (Git Flow):**
  - `main`: Production-ready, baselined academic releases (v0.5, v1.0).
  - `develop`: Ongoing integration branch where tested features converge.
  - `feature/*`: Short-lived feature branches (e.g., `feature/fund-transfer`, `feature/loan-module`, `feature/ui-dashboard`).
- **Commit Message Convention:** Semantic commit messages adhering to standard format:
  - `feat: implement atomic fund transfer with rollback`
  - `fix: resolve floating point rounding issue in rupee conversion`
  - `docs: add Cockburn use case specifications for UC-06`
  - `test: add 6 test cases for fund transfer category`

---

## 7. Project Completion Criteria

The project is considered complete when the following criteria are satisfied:
1. **Functional Completeness:** All 18 Functional Requirements (FR-01 to FR-18) are fully implemented and demonstrated through working software.
2. **ACID Transaction Compliance:** Fund transfers demonstrate 100% atomicity with zero orphan debits or credits under simulated failures.
3. **Traceability:** The Requirements Traceability Matrix achieves 100% bidirectional coverage linking all requirements to code and test cases.
4. **Testing Rigor:** All 52 test cases are formally documented and pass with a 100% success rate.
5. **Documentation Quality:** Complete IEEE 830 SRS (>2,000 words), 13 valid PlantUML diagrams, and Final Project Report (>3,000 words) are delivered.

---

## 8. Software Cost Estimation (COCOMO Model)

To evaluate the engineering effort and duration required to build the TrustVault Banking Management System, the **Constructive Cost Model (COCOMO - Basic Model)** is applied.

### 8.1 Model Selection & Justification
TrustVault is classified under the **Organic Mode** of the Basic COCOMO model based on the following project characteristics:
- A small, highly collaborative development team (2 developers).
- Familiar problem domain (relational banking operations, REST APIs, web application design).
- Well-understood requirements and a stable, low-complexity operating environment without rigid real-time hardware constraints.

### 8.2 Basic COCOMO Equations (Organic Mode)
$$\text{Effort } (E) = a_b \times (\text{KLOC})^{b_b} \quad [\text{Person-Months}]$$
$$\text{Development Time } (D) = c_b \times (E)^{d_b} \quad [\text{Months}]$$
$$\text{Average Staffing } (S) = \frac{E}{D} \quad [\text{Persons}]$$

Where coefficients for Organic Mode are:
- $a_b = 2.4$
- $b_b = 1.05$
- $c_b = 2.5$
- $d_b = 0.38$

### 8.3 Source Lines of Code (SLOC) Estimation
The estimated Source Lines of Code (excluding blank lines and comments) for the TrustVault codebase:

| Subsystem Module | Component Files | Estimated SLOC |
| :--- | :--- | :---: |
| **Presentation Tier** | HTML5 templates (9 views), CSS styles, Client JS | 1,800 lines |
| **Business Logic Tier** | Express routes, controllers, middleware, business services | 1,600 lines |
| **Data Access Tier** | Repositories (User, Account, Transaction, Loan, Audit) | 600 lines |
| **Database Tier** | Schema DDL, seed data generator, reset scripts | 400 lines |
| **Automated Test Suites**| Jest and Supertest test scripts | 600 lines |
| **Total Codebase Size** | **Full System Source Code** | **5,000 SLOC (5.0 KLOC)** |

### 8.4 Effort and Schedule Calculation

#### 1. Development Effort:
$$E = 2.4 \times (5.0)^{1.05}$$
$$(5.0)^{1.05} \approx 5.405$$
$$E = 2.4 \times 5.405 \approx 12.97 \text{ Person-Months}$$

#### 2. Development Time (Nominal Commercial Schedule):
$$D = 2.5 \times (12.97)^{0.38}$$
$$(12.97)^{0.38} \approx 2.65$$
$$D = 2.5 \times 2.65 \approx 6.63 \text{ Calendar Months}$$

#### 3. Average Staffing:
$$S = \frac{E}{D} = \frac{12.97}{6.63} \approx 1.96 \approx 2 \text{ Developers}$$

### 8.5 Academic Schedule Calibration & Explanation of Assumptions
The nominal COCOMO estimate indicates that an industrial commercial team would expend approximately **13 Person-Months** over **6.6 Calendar Months** to engineer this 5.0 KLOC banking management system from inception to production readiness.

In an academic undergraduate environment (2nd Year B.Tech CSE), the project was successfully condensed into a **12-week semester sprint (approx. 3 months)** with **2 student developers** working part-time (approximately 15–20 hours per week each). 

This acceleration was achieved through:
1. Reusable modern ecosystem libraries (`Express.js`, `better-sqlite3`, `bcrypt`).
2. Focused academic scope (simulated transactions rather than physical payment network clearing).
3. Concurrent, parallel work allocation between Team Member A (Frontend/Docs/QA) and Team Member B (Backend/Database).

---
*End of TrustVault Project Management Plan & Engineering Estimation (TV-PMP-2026-V1.0)*
