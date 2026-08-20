-- =============================================================================
-- Flyway Migration V8: Feature 03 Enhancement
-- Feedback Engine, Intelligence Tracking, and Gap Analysis Structures
-- =============================================================================

-- 1. Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    opportunity_id BIGINT NOT NULL,
    readiness_state VARCHAR(50) NOT NULL, -- READY, ALMOST_READY, STRETCH, NOT_ELIGIBLE, INSUFFICIENT_EVIDENCE
    evidence_roi VARCHAR(50) NULL, -- HIGH, MEDIUM, LOW
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT uq_rec_student_opp UNIQUE (student_id, opportunity_id)
);

CREATE INDEX idx_rec_student ON recommendations(student_id);

-- 2. Create recommendation_feedback table
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recommendation_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    opportunity_id BIGINT NOT NULL,
    feedback_type VARCHAR(100) NOT NULL, -- RELEVANT, NOT_RELEVANT, WRONG_REQUIREMENT, NOT_ELIGIBLE, etc.
    feedback_text TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_rec FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_opp FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

CREATE INDEX idx_feedback_student ON recommendation_feedback(student_id);

-- 3. Create user_preferences table (For personalized negative signals)
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    preference_key VARCHAR(100) NOT NULL, -- AVOID_ROLE, AVOID_TECH, PREFER_ROLE
    preference_value VARCHAR(255) NOT NULL,
    weight DOUBLE NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pref_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT uq_pref_student_key_val UNIQUE (student_id, preference_key, preference_value)
);

CREATE INDEX idx_user_preferences_student ON user_preferences(student_id);

-- 4. Extend opportunities with detailed requirement text
-- So the LLM logic or other deterministic logic can extract Eligibility vs Capability
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS extracted_requirements TEXT NULL;
