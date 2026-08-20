-- =============================================================================
-- Flyway Migration V9: Feature 04 — Personal Career Action & Adaptive Growth Engine
-- Track action history, action completion linking to evidence, and per-user feedback
-- =============================================================================

-- 1. Create career_action_history table
CREATE TABLE IF NOT EXISTS career_action_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    action_id VARCHAR(255) NOT NULL,
    action_title VARCHAR(255) NOT NULL,
    target_skill_name VARCHAR(100) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RECOMMENDED', -- RECOMMENDED, STARTED, COMPLETED, DISMISSED
    evidence_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_action_hist_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_action_hist_evidence FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE SET NULL
);

CREATE INDEX idx_action_hist_student ON career_action_history(student_id);
CREATE INDEX idx_action_hist_student_status ON career_action_history(student_id, status);

-- 2. Create career_action_feedback table
CREATE TABLE IF NOT EXISTS career_action_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    action_id VARCHAR(255) NOT NULL,
    feedback_type VARCHAR(100) NOT NULL, -- HELPFUL, NOT_HELPFUL, ALREADY_KNOW, TOO_DIFFICULT, NOT_RELEVANT, WRONG_GOAL, ALREADY_COMPLETED, NOT_INTERESTED
    feedback_text TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_fb_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_action_fb_student ON career_action_feedback(student_id);
