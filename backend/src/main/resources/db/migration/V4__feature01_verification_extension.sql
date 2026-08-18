-- =============================================================================
-- KASUMIO V4__feature01_verification_extension.sql
-- Feature 01 Extension: Lightweight Evidence Verification
-- =============================================================================

CREATE TABLE IF NOT EXISTS verification_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    evidence_id BIGINT NOT NULL,
    recruiter_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    recruiter_comment TEXT NULL,
    CONSTRAINT fk_verif_req_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT fk_verif_req_evidence FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
    CONSTRAINT fk_verif_req_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_verif_req_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_opp_evidence_recruiter UNIQUE (opportunity_id, evidence_id, recruiter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_verif_req_recruiter_status ON verification_requests(recruiter_id, status);
CREATE INDEX idx_verif_req_student ON verification_requests(student_id);
