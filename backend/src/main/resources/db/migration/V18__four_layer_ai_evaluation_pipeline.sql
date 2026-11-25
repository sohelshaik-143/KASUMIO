-- =============================================================================
-- Flyway Migration V18: 4-Layer AI Evaluation Pipeline & Recruiter Overrides
-- =============================================================================

ALTER TABLE question_submissions ADD COLUMN evaluated_score INT NULL;
ALTER TABLE question_submissions ADD COLUMN reviewed_score INT NULL;
ALTER TABLE question_submissions ADD COLUMN review_reason TEXT NULL;
ALTER TABLE question_submissions ADD COLUMN evaluation_layers_json TEXT NULL;

ALTER TABLE assessment_attempts ADD COLUMN final_score INT NULL;
ALTER TABLE assessment_attempts ADD COLUMN release_policy VARCHAR(50) NOT NULL DEFAULT 'IMMEDIATE';
ALTER TABLE assessment_attempts ADD COLUMN release_status VARCHAR(50) NOT NULL DEFAULT 'RELEASED';
