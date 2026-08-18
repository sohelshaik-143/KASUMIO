# KASUMIO — Comprehensive UI/UX Audit & Refactor Specification

**Reference UI Inspiration:** [shadcndashboard](https://github.com/shadcndashboard/shadcndashboard)  
**Refactor Scope:** UI/UX Layer Only. Zero changes to backend, APIs, database, domain logic, authentication, or authorization.

---

## 1. Executive Summary & Audit Matrix

| Category | Component / Route / File | Classification | Rationale & Replacement Target |
| :--- | :--- | :--- | :--- |
| **Routing / App Shell** | `src/App.jsx` | `REFINE` | Refactor shell layout from top-navbar container into responsive left-sidebar + top-header layout. Preserve all 14+ existing routes. |
| **Navigation** | `src/components/common/Navbar.jsx` | `REPLACE_UI_ONLY` | Replaced by `KasumoSidebar.jsx` (left navigation, role-aware, collapsible, mobile drawer) and `KasumoHeader.jsx` (lightweight contextual header with breadcrumb, search, user menu). |
| **Auth Guard** | `src/components/common/ProtectedRoute.jsx` | `KEEP` | Keep intact. Preserves token checking and role verification logic. |
| **Auth Context** | `src/context/AuthContext.jsx` | `DO_NOT_TOUCH` | Keep intact. Preserves session persistence, role attributes (`isStudent`, `isRecruiter`, `isAdmin`), login/register/logout. |
| **Design System** | `src/index.css` & `tailwind.config.js` | `REFINE` | Centralize tokens (slate surfaces, brand gradients, borders, font weights, scrollbars, animations). |
| **Dashboard** | `src/pages/DashboardPage.jsx` | `REFINE` | Modernize layout into Shadcn-style metric cards, real-data activity streams, and quick-action triggers. |
| **Feature 03 Discovery** | `src/pages/student/OpportunityDiscoveryPage.jsx` | `REFINE` | Enhance card grid, filters, search bar, bookmarking, match badges, and real-data metrics. |
| **Feature 03 Details** | `src/pages/student/OpportunityDetailPage.jsx` | `REFINE` | Elevate deterministic match breakdown, multi-dimensional readiness radar/bars, and requirements checklist. |
| **Feature 03 Intelligence** | `src/pages/student/CareerIntelligencePage.jsx` | `REFINE` | Upgrade Capability Map graph, What-If counterfactual simulator, and skill leverage rankings using real API data. |
| **Feature 03 Gaps** | `src/pages/student/GapAnalysisPage.jsx` | `REFINE` | Modernize prioritized technology gap roadmap and category filter pills. |
| **Feature 01 Matched** | `src/pages/student/StudentOpportunitiesPage.jsx` | `REFINE` | Polish evidence-matched opportunity cards and existing interest toggle workflow. |
| **Feature 02 Student Conn** | `src/pages/student/StudentConnectionsPage.jsx` | `REFINE` | Modernize connection status badges, consent flow triggers, and recruiter message previews. |
| **Feature 04 Evidence** | `src/pages/EvidencePage.jsx` | `REFINE` | Polish evidence portfolio grid, template picker modal trigger, and verification badges. |
| **Student Goals** | `src/pages/CareerGoalsPage.jsx` | `REFINE` | Modernize goal cards, target role badges, and creation modal. |
| **Student Profile** | `src/pages/ProfilePage.jsx` | `REFINE` | Refine form inputs, academic metadata fields, and save state indicators. |
| **Recruiter Opps** | `src/pages/recruiter/OpportunitiesPage.jsx` | `REFINE` | Upgrade recruiter opportunity cards, metrics summary, and matched candidate badges. |
| **Recruiter Create Opp**| `src/pages/recruiter/CreateOpportunityPage.jsx` | `REFINE` | Elevate requirements builder, taxonomy skill selector, and draft/publish actions. |
| **Recruiter Opp Details**| `src/pages/recruiter/OpportunityDetailPage.jsx`| `REFINE` | Enhance candidate match table, anonymous evidence inspection modal, and verification request triggers. |
| **Feature 02 Recruiter** | `src/pages/recruiter/RecruiterConnectionsPage.jsx`| `REFINE`| Polish recruiter connection cards, status filters, and disclosed candidate profile modal. |
| **Feature 04 Verification**| `src/pages/VerificationPage.jsx` | `REFINE` | Upgrade verification queue table/cards, filter tabs, and audit review dialog. |
| **Auth Pages** | `src/pages/LoginPage.jsx` & `RegisterPage.jsx` | `REFINE` | Refine auth card aesthetics, brand logo presentation, and form styling. |
| **Modal: Consent** | `src/components/connection/ConnectionConsentModal.jsx` | `REUSE` & `REFINE` | Refine modal surface, toggles, and privacy disclaimer styling while keeping exact consent payload. |
| **Modal: Disclosed** | `src/components/connection/DisclosedProfileModal.jsx` | `REUSE` & `REFINE` | Refine modal surface, student information layout, and revoke action. |
| **Modal: Connect Req** | `src/components/connection/RequestConnectionModal.jsx` | `REUSE` & `REFINE` | Refine modal dialog styling and note textarea. |
| **Modal: Evidence Form**| `src/components/evidence/EvidenceFormModal.jsx` | `REUSE` & `REFINE` | Refine form fields, skill dropdown, validation alerts, and URL input. |
| **Modal: Template Pick**| `src/components/evidence/TemplatePickerModal.jsx` | `REUSE` & `REFINE` | Refine template card layout and guidance previews. |
| **Evidence Card** | `src/components/evidence/EvidenceCard.jsx` | `REUSE` & `REFINE` | Refine card styling, verification status badges, and link buttons. |
| **Common Components** | `Alert.jsx`, `EmptyState.jsx`, `LoadingSpinner.jsx` | `REUSE` & `REFINE` | Polish visuals, icons, and micro-interactions. |
| **API Client & Services** | `src/api/*.js` (10 files) | `DO_NOT_TOUCH` | Keep all API service functions and endpoints exactly as they are. |
| **Backend & DB** | `backend/**` | `DO_NOT_TOUCH` | Zero changes. |

---

## 2. Component Categorization

### KEEP (Unchanged Core Logic)
- `src/context/AuthContext.jsx` — Core authentication state, token storage, and role flags.
- `src/components/common/ProtectedRoute.jsx` — Client-side route protection by role.
- All files in `src/api/` (`authApi.js`, `client.js`, `connectionApi.js`, `discoveryApi.js`, `evidenceApi.js`, `goalApi.js`, `opportunityApi.js`, `orgApi.js`, `skillApi.js`, `studentApi.js`).

### REUSE & REFINE (UI Polish with Full Logic Preservation)
- `src/components/common/Alert.jsx` — Enhanced alert pill styling with icons and dismiss transitions.
- `src/components/common/EmptyState.jsx` — Sleek, technical empty states with clear calls to action.
- `src/components/common/LoadingSpinner.jsx` — Minimalist loading pulse/spinner.
- `src/components/evidence/EvidenceCard.jsx` — Structured evidence cards with verified stamps and provenance tags.
- `src/components/evidence/EvidenceFormModal.jsx` — Clean modal dialog for evidence submission.
- `src/components/evidence/TemplatePickerModal.jsx` — Structured template selection dialog.
- `src/components/connection/ConnectionConsentModal.jsx` — Selective disclosure consent modal.
- `src/components/connection/DisclosedProfileModal.jsx` — Consented candidate details view modal.
- `src/components/connection/RequestConnectionModal.jsx` — Recruiter connection request modal.

### REPLACE_UI_ONLY (New Structural Shell)
- `src/components/common/Navbar.jsx` (top-heavy bar) is replaced by:
  1. `KasumoSidebar.jsx` (left navigation with desktop collapsible mode + mobile drawer)
  2. `KasumoHeader.jsx` (lightweight top context bar with breadcrumb, role badge, quick search, and profile actions)
  3. `KasumoLayout.jsx` (unified app container managing responsive sidebar state)

### DO_NOT_TOUCH
- All Backend code (`backend/src/**`, `pom.xml`, etc.)
- Database schema and seed data
- Evidence template definitions
- Technology taxonomy relationships

### REMOVE / UNUSED
- Top navbar monolith layout in favor of modern left-sidebar application architecture.

---

## 3. Risks & Mitigations

1. **Risk:** Route breakage during layout reorganization.  
   **Mitigation:** Map 100% of existing paths in `App.jsx` (`/`, `/student/*`, `/recruiter/*`, `/evidence`, `/profile`, `/career-goals`, `/verifications`, etc.) directly to the new role-aware sidebar navigation.
2. **Risk:** Loss of contextual actions.  
   **Mitigation:** Retain all page-level contextual actions (e.g., *New Opportunity*, *Add Evidence*, *Express Interest*, *Accept Connection*) within their respective page headers/cards rather than bloating the primary navigation sidebar.
3. **Risk:** Introduction of fake analytics or client-side calculation.  
   **Mitigation:** Strictly render data received from `discoveryApi`, `opportunityApi`, `studentApi`, and `evidenceApi`. Honest empty states will be displayed whenever data is absent.
