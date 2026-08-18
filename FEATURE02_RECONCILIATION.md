# FEATURE 02: RECONCILIATION & AUDIT REPORT

**Project**: KASUMIO
**Module**: Feature 02 — Trusted Connection
**Audit Date**: August 2026

---

## 1. Traceability & Flow Audit

```mermaid
graph TD
    subgraph Feature 01: Anonymous Evidence Matching
        A[Student Evidence Portfolio] --> B[Matching Engine]
        C[Recruiter Opportunity] --> B
        B --> D[Anonymous Candidate Match (KSM-CAND-xxx)]
        A --> E[Student Expresses Interest (opportunity_interests)]
    end

    subgraph Feature 02: Trusted Connection
        D --> F[Recruiter Expresses Interest]
        E --> G{Mutual Interest Detected}
        F --> G
        G --> H[Trusted Connection Created (PENDING, 14-day expiry)]
        H --> I{Student Decision}
        I -->|Accept| J[Granular Consent Modal]
        I -->|Decline| K[Status DECLINED (0 penalty)]
        J --> L[Consented Profile Minimization]
        L --> M[Status ACCEPTED (Active Connection)]
        M --> N[Recruiter Views Consented Information Only]
        M -->|Revoke/Disconnect| O[Status CANCELLED (Disclosure Terminated)]
    end
```

---

## 2. Component Categorization

### KEEP
- **Database Schema**:
  - `V3__feature01_opportunities.sql`: `opportunity_interests` (Single source of truth for student opportunity interest).
  - `V5__feature02_trusted_connection.sql`: `trusted_connections` (Single source of truth for recruiter interest, mutual connection state, and granular disclosure flags).
- **Backend Entities & Repositories**:
  - `OpportunityInterest.java` & `OpportunityInterestRepository.java`: Feature 01 student interest.
  - `TrustedConnection.java` & `TrustedConnectionRepository.java`: Feature 02 mutual connection entity.
- **Backend Services & Controllers**:
  - `StudentOpportunityService.java` & `StudentOpportunityController.java`: Student opportunity interest handling (`/api/opportunities/{id}/interest`).
  - `TrustedConnectionService.java` & `TrustedConnectionController.java`: Connection lifecycle, mutual interest detection, granular consent enforcement, and unconsented data minimization.
  - `CandidateAliasService.java`: Deterministic alias generation (`KSM-CAND-xxx`).
- **Frontend Modals & Components**:
  - `ConnectionConsentModal.jsx`: Granular disclosure selection with live recruiter preview.
  - `RequestConnectionModal.jsx`: Recruiter interest request modal.
  - `DisclosedProfileModal.jsx`: Consented candidate profile viewer.
- **Frontend Pages & Routes**:
  - `/student/opportunities` (`StudentOpportunitiesPage.jsx`): Student explores opportunities & expresses interest.
  - `/student/connections` (`StudentConnectionsPage.jsx`): Student reviews incoming connection requests, accepts with granular consent, declines, or cancels.
  - `/recruiter/opportunities/:id` (`OpportunityDetailPage.jsx`): Recruiter views anonymous matches, mutual interest tags, and triggers connection requests.
  - `/recruiter/connections` (`RecruiterConnectionsPage.jsx`): Recruiter manages connection requests and views consented candidate details.

---

### MERGE
- **MatchingEngineService.java & TrustedConnectionService.java**:
  - Ensure `hasExpressedInterest` is sourced strictly from `OpportunityInterestRepository` (Feature 01).
  - Ensure `connectionStatus` and `connectionId` attached to `CandidateMatchResponse` reflect the single unified `TrustedConnection` state.
- **OpportunityDetailPage.jsx**:
  - Display explicit **"Mutual Interest"** indicator when both Student Interest (`hasExpressedInterest: true`) and Recruiter Interest exist.

---

### REMOVE
- Any leftover unreferenced styling tokens, duplicate buttons, or ad-hoc test routines.
- Any parallel/redundant candidate contact state variables.

---

### UNUSED
- No orphaned database tables or dead migrations exist (clean V1 to V5 Flyway sequence).

---

### CONFLICT (Identified & Reconciled)
1. **Single Source of Truth for Student Interest**:
   - *Audit*: Feature 01 previously defined `opportunity_interests` (`OpportunityInterestRepository`), while Feature 02 has `trusted_connections`.
   - *Resolution*: Sourced student opportunity interest exclusively from `opportunity_interests` and recruiter connection requests from `trusted_connections`. When both occur, the system treats it as mutual connection with student granular consent gating.
2. **Auth Lifecycle Race Condition**:
   - *Audit*: Components fetched data before JWT session validation completed.
   - *Resolution*: Added `useAuth` auth guards (`!authLoading && user && isAllowedRole`) and robust fallback handlers across all pages.
