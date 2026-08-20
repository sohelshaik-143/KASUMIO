# KASUMO Feature 03 Enhancement Audit

## KEEP
* Existing `User`, `Student`, `Role` architecture.
* Existing Authentication / Spring Security setup.
* Existing Database tables for core systems.
* `Evidence` and `EvidenceTemplate` definitions (never delete).
* `V1` to `V7` Flyway migrations (preserving Feature 01 & Feature 02 functionality).
* Existing `OpportunityInterest` flow (Feature 01).
* Existing `TrustedConnection`, `Consent`, `Disclosure` flow (Feature 02).
* Frontend existing routing, styling, and navigation architecture.

## REUSE
* `Opportunity`, `OpportunitySkill`, `Skill` (already extended by V6 with `subcategory`, `ecosystem`, `canonical_name`, etc.).
* `MatchingEngineService` (can be heavily updated/refactored, but the idea of deterministic evaluation over `Evidence` stays).
* UI components for Opportunity Display (can be extended).
* Existing Evidence flow for "Next Best Action" (directing users to upload Evidence matching templates).

## EXTEND
* **Database (New Flyway V8 Migration):** Add feedback tables (e.g., `recommendation_feedback`, `user_preferences`).
* **Opportunity & Matching:**
  * Add **Eligibility** extraction and separate it from capability.
  * Add **Readiness** states (READY, ALMOST_READY, STRETCH, NOT_ELIGIBLE, INSUFFICIENT_EVIDENCE).
* **Skills/Technologies (Technology Intelligence):**
  * Support aliases and versions dynamically (V6 added `skill_aliases` and `skill_relationships`, which is good, but we need services to intelligently parse and utilize them).
  * Handle unknown technologies explicitly via a review pipeline status.
* **Evidence (Evidence Intelligence):**
  * Strengthen confidence determinism: VERIFIED, STRONG, MODERATE, WEAK, INFERRED, UNKNOWN based on evidence types (projects, resume, etc.).
* **Recommendation Explainability:**
  * Generate detailed "Why this opportunity", "Why not", and "What am I missing" (Gap Priority).
  * Compute **Evidence ROI** (High/Medium/Low) for Next Best Actions.
* **Frontend:**
  * Capability Maps, Technology Relationship Graphs, Gap Priority Visualizations using real data.
  * User Feedback Collection on recommendations (Helpful, Not Relevant, Wrong Requirement, etc.).

## MERGE
* Integrate the new matching, eligibility, capability, and feedback logic into the existing `MatchingEngineService` or break into specialized services (e.g., `CapabilityService`, `GapAnalysisService`, `NextBestActionService`, `FeedbackIntelligenceService`) orchestrating together for the Student Dashboard feed.

## REMOVE
* Remove arbitrary percentage/scoring logic if any exists, replacing it with the strict deterministic gap/readiness states as mandated.

## MISSING
* Separation of Eligibility (location, work mode, education) vs Capability (technical skills).
* Granular Evidence confidence calculation (VERIFIED, STRONG, MODERATE, WEAK).
* Detailed Gap Intelligence with HIGH/MEDIUM/LOW priority reasoning.
* Next Best Action deterministic engine.
* Evidence ROI calculation.
* System to collect and process User Feedback without overriding global knowledge.
* Visualization of Technology Relationships & Capability Evolution.

## CONFLICT
* No direct conflicts observed with Feature 01 or 02 as long as we reuse `OpportunityInterest` and do not bypass `Consent` mechanisms. Must ensure `MatchingEngineService` continues to respect privacy rules and doesn't expose student identities arbitrarily.
