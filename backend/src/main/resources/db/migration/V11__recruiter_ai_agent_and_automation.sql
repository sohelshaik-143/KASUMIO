-- =============================================================================
-- Flyway Migration V11: Recruiter AI Agent & Autonomous Workflow Engine
-- Stores recruiter intents, async automation jobs, evidence-backed candidate recommendations,
-- rate-limiting/anti-spam policies, and compliance audit logs.
-- =============================================================================

CREATE TABLE IF NOT EXISTS recruiter_intents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL,
    raw_intent TEXT NOT NULL,
    extracted_role_title VARCHAR(255) NULL,
    extracted_opportunity_type VARCHAR(50) NOT NULL DEFAULT 'INTERNSHIP',
    extracted_work_type VARCHAR(50) NOT NULL DEFAULT 'REMOTE',
    extracted_location VARCHAR(255) NULL,
    structured_payload TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_intent_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_intent_recruiter ON recruiter_intents(recruiter_id);

CREATE TABLE IF NOT EXISTS recruiter_automation_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL UNIQUE,
    recruiter_id BIGINT NOT NULL,
    opportunity_id BIGINT NULL,
    intent_id BIGINT NULL,
    automation_level VARCHAR(50) NOT NULL DEFAULT 'DELEGATED', -- COPILOT, DELEGATED, POLICY_BOUNDED
    status VARCHAR(50) NOT NULL, -- ANALYZING, READY_FOR_REVIEW, APPROVED, EXECUTING, COMPLETED, FAILED, CANCELLED
    total_candidates_scanned INT NOT NULL DEFAULT 0,
    candidates_matched_count INT NOT NULL DEFAULT 0,
    candidates_shortlisted_count INT NOT NULL DEFAULT 0,
    outreach_sent_count INT NOT NULL DEFAULT 0,
    error_message TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL,
    CONSTRAINT fk_job_intent FOREIGN KEY (intent_id) REFERENCES recruiter_intents(id) ON DELETE SET NULL
);

CREATE INDEX idx_job_recruiter ON recruiter_automation_jobs(recruiter_id);
CREATE INDEX idx_job_status ON recruiter_automation_jobs(status);
CREATE INDEX idx_job_opportunity ON recruiter_automation_jobs(opportunity_id);

CREATE TABLE IF NOT EXISTS recruiter_candidate_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    student_id BIGINT NOT NULL,
    candidate_alias VARCHAR(50) NOT NULL,
    overall_score INT NOT NULL,
    readiness_score INT NOT NULL,
    evidence_strength_score INT NOT NULL,
    evidence_breakdown TEXT NOT NULL,
    why_recommended TEXT NOT NULL,
    personalized_message TEXT NOT NULL,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'APPROVED', -- APPROVED, REJECTED, SKIPPED
    outreach_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED, SKIPPED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_job FOREIGN KEY (job_id) REFERENCES recruiter_automation_jobs(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_rec_job ON recruiter_candidate_recommendations(job_id);
CREATE INDEX idx_rec_student ON recruiter_candidate_recommendations(student_id);
CREATE INDEX idx_rec_approval ON recruiter_candidate_recommendations(approval_status);

CREATE TABLE IF NOT EXISTS recruiter_automation_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL UNIQUE,
    max_daily_connections INT NOT NULL DEFAULT 25,
    min_readiness_threshold INT NOT NULL DEFAULT 50,
    require_verified_evidence BOOLEAN NOT NULL DEFAULT FALSE,
    auto_send_outreach BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_policy_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruiter_action_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL,
    job_id VARCHAR(64) NULL,
    action_type VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_audit_recruiter ON recruiter_action_audit_logs(recruiter_id);
CREATE INDEX idx_audit_job ON recruiter_action_audit_logs(job_id);
