# FEATURE 04: AUDIT & ARCHITECTURE EXTENSION REPORT

**Project**: KASUMIO  
**Module**: Feature 04 — Personal Career Action & Adaptive Growth Engine  
**Audit Date**: August 2026  
**Architecture Style**: Modular Monolith (`/backend`, `/frontend`)  

---

## 1. Flow Traceability

```mermaid
graph TD
    subgraph SOT [Single Source of Truth]
        U[User & Student Profile]
        CG[Career Goals & Preferences]
        EV[Factual Evidence & Verifications]
        SK[Technology Taxonomy & Relationship Graph]
        OP[Target Opportunities & Requirements]
    end

    subgraph Feature04_Engine [Adaptive Career Action Engine]
        ECA[Evidence Capability Analyzer]
        TRG[Technology Relationship Graph Service]
        GAP[Gap & Leverage Analyzer]
        PAS[Personalized Action Scorer]
        ROI[Evidence ROI & Effort Calculator]
        AHS[Action History & Recalculation Service]
    end

    subgraph Feature04_API [Springdoc OpenAPI REST Endpoints]
        API_NEXT[/api/student/career/next-action]
        API_DET[/api/student/career/actions/:id]
        API_START[/api/student/career/actions/:id/start]
        API_COMP[/api/student/career/actions/:id/complete]
        API_FB[/api/student/career/feedback]
    end

    subgraph Feature04_UI [React 18 Visual Interface]
        UI_CARD["Your Next Move Card (Integrated in Dashboard & Opportunity Detail)"]
        UI_MODAL["Action Details & Evidence Link Modal"]
    end

    U --> ECA
    CG --> PAS
    EV --> ECA & PAS
    SK --> TRG
    OP --> GAP

    ECA & TRG & GAP --> PAS
    PAS --> ROI
    ROI --> AHS

    AHS --> API_NEXT & API_DET & API_START & API_COMP & API_FB

    API_NEXT --> UI_CARD
    API_DET & API_START & API_COMP & API_FB --> UI_MODAL
```

---

## 2. Component Categorization

### KEEP
- **User & Auth System**: `User`, `Role`, `UserRepository`, `AuthService`, `SecurityConfig`, JWT authentication.
- **Student Profile System**: `Student`, `StudentRepository`, `StudentService`, `StudentProfileController`.
- **Career Goals System**: `CareerGoal`, `CareerGoalRepository`, `CareerGoalService`, `CareerGoalController`.
- **Evidence & Verification System (Feature 01/02 Foundation)**: `Evidence`, `EvidenceRepository`, `EvidenceTemplate`, `EvidenceTemplateRepository`, `Verification`, `VerificationRepository`, `EvidenceService`, `EvidenceController`, `VerificationService`, `VerificationController`.
- **Opportunity & Recruiter Management (Feature 01)**: `Opportunity`, `OpportunityRepository`, `OpportunitySkill`, `OpportunitySkillRepository`, `OpportunityService`.
- **Trusted Connection & Consent System (Feature 02)**: `TrustedConnection`, `TrustedConnectionRepository`, `TrustedConnectionService`, `CandidateAlias`.
- **Technology Taxonomy & Intelligence (Feature 03)**: `Skill`, `SkillAlias`, `SkillRelationship`, `TechnologyNormalizationService`, `TechnologyRelationshipService`, `OpportunityDiscoveryService`, `DeterministicMatchScorer`, `FeedbackIntelligenceService`.

### REUSE
- `EvidenceCapabilityAnalyzer`: To extract verified and unverified capability levels directly from actual student evidence without fabricating scores.
- `GapAnalysisService` & `DeterministicMatchScorer`: To calculate skill gaps against selected target opportunities and career goals.
- `TechnologyRelationshipService`: To traverse parent/child/prerequisite/successor technology graphs (e.g. Java → Spring Boot → REST API → Docker → Cloud).
- `EvidenceTemplate` system: To map completed actions directly to structured submission templates (`PROJECT`, `CERTIFICATE`, `PUBLICATION`, `OTHER`).
- `UserPreference` repository: To store student-specific negative and positive action feedback without mutating global intelligence.

### EXTEND
- `NextBestActionService` / `CareerActionService`: Expand the basic static action builder into a comprehensive, adaptive, goal-driven career action engine.
- Database Schema (`V9__feature04_career_actions.sql`):
  - `career_action_history`: Tracks student action lifecycle (`RECOMMENDED`, `STARTED`, `COMPLETED`, `DISMISSED`).
  - `career_action_feedback`: Tracks student feedback on specific recommendations (`HELPFUL`, `NOT_HELPFUL`, `ALREADY_KNOW`, `TOO_DIFFICULT`, `WRONG_GOAL`, `NOT_INTERESTED`).
- REST Controller (`CareerActionController`):
  - `GET /api/student/career/next-action`
  - `GET /api/student/career/actions/{id}`
  - `POST /api/student/career/actions/{id}/start`
  - `POST /api/student/career/actions/{id}/complete`
  - `POST /api/student/career/feedback`
- Frontend UI Components:
  - `NextMoveCard.jsx`: Clean, high-impact "Your Next Move" component integrated directly into student Dashboard and Opportunity Detail views.
  - `ActionDetailModal.jsx`: Modal displaying what to do, why, existing project reuse, capability strengthened, target opportunities, evidence ROI, and direct link to submit evidence.

### MERGE
- Integrate `NextBestActionService` with `CareerActionService` to ensure a single, consistent action generation pipeline across Feature 03 gap reports and Feature 04 action recommendations.

### REMOVE
- None. All existing features (01, 02, 03) and evidence templates remain 100% intact.

### MISSING
- Action lifecycle tracking (`STARTED`, `COMPLETED`, `DISMISSED`).
- Deterministic Evidence ROI calculator (`HIGH`, `MEDIUM`, `LOW` based on opportunity coverage and existing project leverage).
- Project reuse reasoning ("Containerize your existing Spring Boot project" vs "Build a minimal Docker project").
- Instant action recalculation when new evidence is uploaded or career goals change.

### RISKS & MITIGATIONS
- **Risk 1**: UI Overload with too many action options.
  - *Mitigation*: Strictly present **ONE** primary "Your Next Move" action, with up to 2 secondary alternative moves.
- **Risk 2**: Arbitrary or fabricated recommendations.
  - *Mitigation*: Recommendations are strictly derived from real gaps in target opportunities, existing evidence, and official technology relationship graphs.
- **Risk 3**: Single-user feedback altering global system intelligence.
  - *Mitigation*: Student feedback is stored per-user in `user_preferences` and `career_action_feedback`, ensuring personal customization without polluting global rules.
