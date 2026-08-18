# [KASUMIO] — Clean Production Foundation

> **Truth-First Talent Intelligence Platform**
>
> Core loop: `REAL DATA` → `EVIDENCE` → `SKILL UNDERSTANDING` → `GAP` → `ACTION` → `OPPORTUNITY` → `REAL OUTCOME` → `NEW EVIDENCE`

---

## 1. Overview & Architecture

KASUMIO is built as a **Modular Monolith** designed around simplicity, demonstrable proof, and unforgeable verification:
- **Zero Fake Data**: The database starts completely empty (except for the 10 foundational development skills and 5 structured evidence templates).
- **Zero Fake AI**: No arbitrary AI match percentages or readiness scores.
- **Single Source of Truth**: Verification status is never stored as duplicate columns on evidence, but is dynamically checked against the `verifications` table.
- **Role-Based Access Control (RBAC)**: Enforced on the backend with JWT authentication and strict student/organization ownership checks.

---

## 2. Tech Stack

- **Backend**: Java 17 / 21, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Flyway Migrations, Maven.
- **Database**: MySQL 8.0 (Relational schema with 8 tables).
- **Frontend**: React 18, Vite, TailwindCSS, Axios, React Router v6, Lucide React.
- **Testing**: JUnit 5, Spring Boot Test, H2 In-Memory (for deterministic test isolation).
- **API Documentation**: Springdoc OpenAPI (Swagger UI).
- **Local Containerization**: Docker Compose for MySQL.

---

## 3. Project Structure

```
KASUMIO/
├── docker-compose.yml              # Local MySQL 8.0 container service
├── README.md                       # Documentation & run instructions
├── backend/
│   ├── pom.xml                     # Maven dependencies & plugins
│   ├── mvnw.cmd                    # Maven wrapper
│   ├── src/main/java/com/kasumio/
│   │   ├── KasumioApplication.java # Spring Boot main class
│   │   ├── auth/                   # JWT generation, filter, SecurityConfig, AuthService, AuthController
│   │   ├── user/                   # User entity, Role (STUDENT, RECRUITER, ADMIN), UserRepository
│   │   ├── student/                # Student entity, profile management, calculated dashboard metrics
│   │   ├── skill/                  # 10 development taxonomy skills, Admin CRUD
│   │   ├── goal/                   # Student career goals CRUD with ownership checks
│   │   ├── evidence/               # Evidence CRUD, Evidence templates, Verification service & controller
│   │   ├── organization/           # Company / College entities for verification attribution
│   │   └── common/                 # GlobalExceptionHandler, SecurityUtils, OpenApiConfig, ErrorResponse
│   ├── src/main/resources/
│   │   ├── application.yml         # MySQL datasource & JWT configuration
│   │   └── db/migration/
│   │       ├── V1__init.sql        # 8 core tables schema
│   │       └── V2__seed_taxonomy_and_templates.sql # Exact 10 taxonomy skills & 5 evidence templates
│   └── src/test/java/com/kasumio/
│       ├── auth/AuthIntegrationTest.java
│       ├── student/StudentProfileTest.java
│       ├── goal/CareerGoalTest.java
│       ├── evidence/EvidenceOwnershipTest.java
│       └── evidence/VerificationSecurityTest.java
└── frontend/
    ├── package.json                # React 18 + Vite dependencies
    ├── vite.config.js              # Dev server with /api proxy
    ├── tailwind.config.js          # Curated calm modern palette & font tokens
    ├── src/
        ├── App.jsx                 # Routing & RBAC layout
        ├── context/AuthContext.jsx # User auth context & session refresh
        ├── api/                    # Axios API client & modular service calls
        ├── components/             # Navbar, ProtectedRoute, Alert, EmptyState, EvidenceCard, Modals
        └── pages/                  # LoginPage, RegisterPage, DashboardPage, ProfilePage, CareerGoalsPage, EvidencePage, VerificationPage
```

---

## 4. Database Schema (8 Tables)

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : "belongs to"
    ORGANIZATIONS ||--o{ VERIFICATIONS : "attests"
    USERS ||--o| STUDENTS : "profile for"
    USERS ||--o{ VERIFICATIONS : "verified by"
    STUDENTS ||--o{ CAREER_GOALS : "defines"
    STUDENTS ||--o{ EVIDENCE : "owns"
    SKILLS ||--o{ EVIDENCE : "categorizes"
    EVIDENCE ||--o| VERIFICATIONS : "verified in"

    ORGANIZATIONS {
        bigint id PK
        varchar name
        varchar type
        varchar website
    }
    USERS {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar role
        bigint organization_id FK
        timestamp created_at
    }
    STUDENTS {
        bigint id PK
        bigint user_id FK_UK
        varchar full_name
        text bio
        varchar university
        int graduation_year
    }
    SKILLS {
        bigint id PK
        varchar name UK
        varchar category
    }
    CAREER_GOALS {
        bigint id PK
        bigint student_id FK
        varchar title
        text description
        varchar target_role
    }
    EVIDENCE {
        bigint id PK
        bigint student_id FK
        bigint skill_id FK
        varchar title
        text description
        varchar evidence_url
        varchar evidence_type
        timestamp created_at
    }
    EVIDENCE_TEMPLATES {
        bigint id PK
        varchar title
        text description
        varchar evidence_type
        json suggested_fields
    }
    VERIFICATIONS {
        bigint id PK
        bigint evidence_id FK_UK
        bigint organization_id FK
        bigint verified_by_user_id FK
        timestamp verified_at
    }
```

---

## 5. Local Setup Instructions

### Prerequisites
- Java 17 or 21
- Node.js 18+ and npm
- Docker / Docker Compose (or local MySQL 8.0)

### Step 1: Start MySQL Database
```bash
docker-compose up -d
```
*(Or point to your local MySQL running on port 3306 with `kasumio_db`, `kasumio_user`, `kasumio_pass`)*

### Step 2: Environment Variables (Optional Defaults)
The backend uses standard environment variables with sensible local defaults:
- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `3306`)
- `DB_NAME` (default: `kasumio_db`)
- `DB_USER` (default: `kasumio_user`)
- `DB_PASSWORD` (default: `kasumio_pass`)
- `JWT_SECRET` (default: 256-bit safe development key)
- `PORT` (default: `8080`)

### Step 3: Run Backend
```bash
cd backend
# Using Maven:
mvn spring-boot:run
```

### Step 4: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Running Tests

Run the complete integration test suite with H2 in-memory isolation (no MySQL dependency required during tests):

```bash
cd backend
mvn test
```

All 9 integration test scenarios test real behavior:
1. Student registration, login, and `/api/me` identity.
2. Invalid credentials and duplicate email rejection (401 / 409).
3. Student profile CRUD and truthful calculated dashboard metrics.
4. Student profile ownership protection (preventing cross-student profile inspection).
5. Evidence submission, retrieval, and student data isolation.
6. Verification authorization security (unauthorized students & unaffiliated recruiters blocked; valid organization recruiters accepted).
7. Single source of truth verification (verified status reflects `verifications` table).
8. Duplicate verification prevention (409 Conflict).
9. Career goals CRUD and ownership protection.

---

## 7. API Documentation

Interactive OpenAPI / Swagger UI is available at:
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- OpenAPI JSON Spec: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

### Core Endpoints Summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new STUDENT or RECRUITER |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| `GET` | `/api/me` | Authenticated | Retrieve current session identity |
| `GET` | `/api/students/profile` | Student | Get authenticated student's profile |
| `PUT` | `/api/students/profile` | Student | Create or update student profile |
| `GET` | `/api/students/dashboard` | Student | Retrieve truthful calculated metrics |
| `GET` | `/api/skills` | Public | List the 10 taxonomy development skills |
| `GET` | `/api/evidence-templates` | Public | List structured evidence templates |
| `GET` | `/api/career-goals` | Student | List authenticated student's goals |
| `POST` | `/api/career-goals` | Student | Create career goal |
| `PUT` | `/api/career-goals/{id}` | Student (Owner) | Update career goal |
| `DELETE` | `/api/career-goals/{id}` | Student (Owner) | Delete career goal |
| `GET` | `/api/evidence` | Student | List authenticated student's evidence |
| `POST` | `/api/evidence` | Student | Create demonstrable evidence record |
| `PUT` | `/api/evidence/{id}` | Student (Owner) | Update evidence record |
| `DELETE` | `/api/evidence/{id}` | Student (Owner) | Delete evidence record |
| `GET` | `/api/evidence/pending-verification` | Recruiter/Admin | List unverified submissions |
| `POST` | `/api/evidence/{id}/verify` | Recruiter/Admin | Verify evidence on behalf of organization |
| `GET` | `/api/organizations` | Public | List organizations for recruiter affiliation |
