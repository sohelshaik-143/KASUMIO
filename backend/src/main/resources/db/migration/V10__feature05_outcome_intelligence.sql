-- =============================================================================
-- Flyway Migration V10: Feature 05 — Evidence -> Outcome Intelligence & Decision Trace
-- Lightweight audit logging of capability transitions, evidence verification, and recalculations
-- =============================================================================

CREATE TABLE IF NOT EXISTS outcome_decision_traces (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    trace_type VARCHAR(100) NOT NULL, -- CAPABILITY_PROMOTION, CAPABILITY_DEMOTION, ACTION_COMPLETED, EVIDENCE_VERIFIED, EVIDENCE_REJECTED, EVIDENCE_DELETED, STALE_EVIDENCE_WARNING
    target_skill_name VARCHAR(100) NOT NULL,
    before_state VARCHAR(50) NOT NULL, -- UNKNOWN, INSUFFICIENT_EVIDENCE, WEAK, MODERATE, STRONG, VERIFIED
    after_state VARCHAR(50) NOT NULL, -- UNKNOWN, INSUFFICIENT_EVIDENCE, WEAK, MODERATE, STRONG, VERIFIED
    evidence_id BIGINT NULL,
    verification_id BIGINT NULL,
    action_id VARCHAR(255) NULL,
    opportunity_impact_count INT NOT NULL DEFAULT 0,
    rule_applied VARCHAR(100) NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trace_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_trace_evidence FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE SET NULL
);

CREATE INDEX idx_trace_student ON outcome_decision_traces(student_id);
CREATE INDEX idx_trace_student_type ON outcome_decision_traces(student_id, trace_type);
CREATE INDEX idx_trace_student_created ON outcome_decision_traces(student_id, created_at DESC);
