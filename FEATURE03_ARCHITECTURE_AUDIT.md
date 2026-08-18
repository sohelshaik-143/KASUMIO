# FEATURE 03: ARCHITECTURE AUDIT & EXTENSION REPORT

**Project**: KASUMIO  
**Module**: Feature 03 — Opportunity Discovery & Technology Intelligence Engine  
**Audit Date**: August 2026  
**Architecture Style**: Modular Monolith (`/backend`, `/frontend`)  

---

## 1. Executive Summary & Flow Traceability

Feature 03 transforms KASUMIO from a listing platform into a deterministic, evidence-based career intelligence platform. It operates strictly on factual data from real user evidence (Feature 04), user profiles, career goals, and published opportunities (Feature 01), and respects granular consent and trusted connection states (Feature 02).

```mermaid
graph TD
    subgraph SOT [Single Source of Truth]
        U[User & Student Profile]
        CG[Career Goals]
        EV[Factual Evidence & Verifications]
        SK[Technology Taxonomy & Knowledge Base]
        OP[Published Opportunities]
    end

    subgraph Feature03_Engine [Java Business Intelligence Core]
        TN[Technology Normalization & Alias Engine]
        TR[Technology Relationship & Version Graph]
        RE[Requirement Extractor]
        ECA[Evidence Capability Analyzer]
        DMS[Deterministic Match Scorer]
        ORE[Readiness & Opportunity Distance Engine]
        GAS[Skill Gap & Leverage Intelligence]
        CWI[Career What-If / Counterfactual Simulator]
        ROI[Evidence ROI & Project Recommendations]
        DTC[Dynamic Technology Discovery & Candidate Lifecycle]
    end

    subgraph Feature03_API [Springdoc OpenAPI REST Endpoints]
        API_REC[/api/discovery/opportunities]
        API_DET[/api/discovery/opportunities/:id]
        API_GAP[/api/discovery/gaps]
        API_INTEL[/api/discovery/career-intelligence]
        API_WHATIF[/api/discovery/career-what-if]
        API_GRAPH[/api/discovery/technology-graph]
        API_CAND[/api/discovery/candidates]
    end

    subgraph Feature03_UI [React 18 Visual Interface]
        UI_DISC[Opportunity Discovery Feed & NL Search]
        UI_DET[Opportunity Detail & Readiness Inspection]
        UI_GAP[Technology Gap Roadmap]
        UI_INTEL[Career Intelligence Hub & 9 Real Visual Graphs]
    end

    U --> ECA
    CG --> DMS
    EV --> ECA
    SK --> TN & TR
    OP --> RE

    TN & TR & RE & ECA --> DMS
    DMS --> ORE & GAS
    GAS --> CWI & ROI
    RE --> DTC

    ORE & DMS --> API_REC & API_DET
    GAS --> API_GAP
    CWI & ROI --> API_INTEL & API_WHATIF
    TR --> API_GRAPH
    DTC --> API_CAND

    API_REC --> UI_DISC
    API_DET --> UI_DET
    API_GAP --> UI_GAP
    API_INTEL & API_WHATIF & API_GRAPH --> UI_INTEL
```

---

## 2. Component Categorization

### KEEP (Authoritative Existing Foundations)
- **User & Auth Domain**: `User`, `Role`, `UserRepository`, `AuthService`, `AuthController`, JWT authentication and Spring Security configuration.
- **Student Profile Domain**: `Student`, `StudentRepository`, `StudentService`, `StudentProfileController`.
- **Career Goals Domain**: `CareerGoal`, `CareerGoalRepository`, `CareerGoalService`, `CareerGoalController`.
- **Evidence & Verification Domain (Feature 04)**: `Evidence`, `EvidenceRepository`, `EvidenceTemplate`, `EvidenceTemplateRepository`, `Verification`, `VerificationRepository`, `EvidenceService`, `EvidenceController`, `VerificationService`, `VerificationController`.
- **Opportunity Creation & Recruiter Management (Feature 01)**: `Opportunity`, `OpportunityRepository`, `OpportunitySkill`, `OpportunitySkillRepository`, `OpportunityService`, `OpportunityController`, `StudentOpportunityController`, `StudentOpportunityService`.
- **Trusted Connection & Consent Domain (Feature 02)**: `TrustedConnection`, `TrustedConnectionRepository`, `TrustedConnectionService`, `TrustedConnectionController`, `CandidateAlias`, `CandidateAliasService`.
- **Flyway Migrations**: `V1__init.sql` through `V5__feature02_trusted_connection.sql`.

---

### REUSE (Authoritative Entities Consumed by Feature 03)
- `Skill` entity and `SkillRepository` as the core technology taxonomy.
- `Opportunity` entity for all discovery feeds, requirement matching, and readiness calculations.
- `OpportunityInterest` (Feature 01) and `TrustedConnection` (Feature 02) to reflect student interest and mutual connection badges on discovery cards.
- `Evidence` and `Verification` records for computing candidate capability confidence without fabricating skills.
- `CareerGoal` records to measure career alignment during deterministic matching.
- `EvidenceTemplate` for linking recommended gap actions directly to valid Feature 04 submission templates.

---

### EXTEND (Enhancements for Feature 03 Intelligence)
- **`Skill`**: Extended with `subcategory`, `ecosystem`, `canonicalName`, `versionInfo`, `technologyStatus`.
- **`Opportunity`**: Extended with `deadline`, `source`, `sourceUrl`, `postedAt`, `lastVerifiedAt`, `verificationStatus`, `compensation`, `duration`, `eligibility`, `educationRequirements`, `experienceRequirements`, `tags`.
- **`DeterministicMatchScorer`**: Extended to compute explicit `readinessScore` (0-100), `evidenceStrengthScore` (0-100), `opportunityDistance` (gap count + step-by-step reason), and explainable evidence breakdown.
- **`OpportunityDiscoveryService`**: Extended with portfolio intelligence, technology detail lookups, dynamic candidate management, and career what-if integration.
- **`GapAnalysisService`**: Extended with multi-factor leverage calculations (opportunity unblocking counts) and evidence ROI project clustering.
- **Frontend Pages**:
  - `OpportunityDiscoveryPage.jsx`: Enhanced with natural language query chips, deadline alerts, and seamless integration with Career Intelligence.
  - `OpportunityDetailPage.jsx`: Enhanced with visual Readiness breakdown (Graph 2), Skill Coverage matrix (Graph 3), Opportunity Distance stepper (Graph 6), and Evidence Coverage (Graph 9).
  - `GapAnalysisPage.jsx`: Enhanced with Gap Priority visualization (Graph 5) and one-click Feature 04 evidence submission links.

---

### CREATE (Genuinely New Feature 03 Components)
- **Database Schema**:
  - `V6__feature03_opportunity_discovery.sql`: 400+ modern technology skills, `skill_aliases`, `skill_relationships`, and `opportunity_saved` bookmarks.
  - `V7__feature03_dynamic_technology_candidates.sql`: `technology_candidates` table for unknown technology detection and the 14-step verification lifecycle.
- **Backend Entities & Repositories**:
  - `SkillAlias` & `SkillAliasRepository`: Fast alias-to-canonical technology resolution.
  - `SkillRelationship` & `SkillRelationshipRepository`: Multi-directional tech links (`PARENT`, `CHILD`, `PREREQUISITE`, `RELATED`, `SUCCESSOR`).
  - `OpportunitySaved` & `OpportunitySavedRepository`: Student opportunity bookmarking and tracking.
  - `TechnologyCandidate` & `TechnologyCandidateRepository`: Dynamic unknown technology candidate tracking (`DISCOVERED`, `UNVERIFIED`, `VERIFIED`, `REJECTED`).
- **Backend Intelligence Services**:
  - `TechnologyCandidateService`: Dynamic unknown technology discovery, metadata extraction, and promotion/rejection lifecycle.
  - `CareerIntelligenceService`: Generation of graph payloads (Career Capability Map, Opportunity Readiness, Skill Coverage, Technology Demand, Gap Priority, Opportunity Distance, Opportunity Clusters, Career What-If Simulator, Evidence Coverage, Evidence ROI).
- **Backend DTOs**:
  - `CareerIntelligenceDto`, `CareerWhatIfRequest`, `CareerWhatIfResponse`, `TechnologyGraphDto`, `OpportunityReadinessDto`, `EvidenceRoiDto`, `TechnologyCandidateDto`.
- **Frontend Pages & Components**:
  - `CareerIntelligencePage.jsx`: Central hub for all 9 real graphical intelligence visualizations.
  - Interactive lightweight SVG/Canvas graph renderers for Career Capability Map, Technology Demand, Opportunity Clusters, and What-If comparison.

---

### DO NOT TOUCH (Strict Boundary Protections)
- **DO NOT** modify authentication token generation or user security configurations.
- **DO NOT** modify Feature 01 recruiter opportunity creation or candidate match endpoints.
- **DO NOT** modify Feature 02 trusted connection consent flow or privacy disclosure rules.
- **DO NOT** delete, overwrite, or mutate Feature 04 evidence templates (`V2__seed_taxonomy_and_templates.sql`).
- **DO NOT** create parallel student or user entities (`Feature03User`, etc.).
- **DO NOT** fabricate skills, random scores, or fake graph nodes.

---

### INTEGRATION POINTS
1. **Feature 01 Integration**:
   - Reads published opportunities (`OpportunityRepository.findPublishedWithSkills`).
   - Checks student opportunity interest (`OpportunityInterestRepository`).
   - Allows students to express interest directly from Discovery and Detail pages.
2. **Feature 02 Integration**:
   - Reflects connection status (`TrustedConnectionRepository`) and protects candidate anonymity until mutual consent.
3. **Feature 04 Integration**:
   - Consumes factual student evidence (`EvidenceRepository`) and attestations (`VerificationRepository`).
   - Recommends specific Feature 04 `EvidenceTemplate` references when guiding students to close capability gaps.

---

### POTENTIAL CONFLICTS & RESOLUTIONS
1. **Flyway Migration Sequencing**:
   - *Conflict*: Modifying already applied migrations can corrupt Flyway checksums.
   - *Resolution*: Keep V1-V6 intact and place any additional tables (like `technology_candidates`) into a clean `V7__feature03_dynamic_technology_candidates.sql`.
2. **Deterministic Match Scoring Consistency**:
   - *Conflict*: Non-deterministic factors (random seeds, floating point drift, unseeded collections) could produce fluctuating match percentages.
   - *Resolution*: All collections are deterministically ordered; all calculations use fixed weighting math with rounding rules. Same inputs strictly yield identical scores.
3. **Graph Rendering Performance & Honesty**:
   - *Conflict*: Complex force-directed graphs can lag or introduce decorative fake data.
   - *Resolution*: Graph nodes and edges are calculated on the Java backend from real database relationships; frontend renders crisp, lightweight SVG visualizations with honest empty states when data is insufficient.
